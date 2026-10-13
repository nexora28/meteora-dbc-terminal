import { createHash } from 'node:crypto';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class UploadQuotaError extends Error {}
type RecordValue = { day: string; count: number; lastAt: number };
export type QuotaStore = {
  read: (key: string) => Promise<{ value: RecordValue; etag: string } | null>;
  write: (key: string, value: RecordValue, etag?: string) => Promise<boolean>;
};
const status = (error: unknown) =>
  (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;

export function r2QuotaStore(client: S3Client, bucket: string): QuotaStore {
  return {
    async read(key) {
      try {
        const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        if (!result.Body || !result.ETag || !result.ContentLength || result.ContentLength > 1024)
          throw new Error('Invalid upload quota record');
        const value = JSON.parse(await result.Body.transformToString()) as RecordValue;
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(value.day) ||
          !Number.isSafeInteger(value.count) ||
          value.count < 0 ||
          !Number.isSafeInteger(value.lastAt)
        )
          throw new Error('Invalid upload quota record');
        return { value, etag: result.ETag };
      } catch (error) {
        if (status(error) === 404) return null;
        throw error;
      }
    },
    async write(key, value, etag) {
      try {
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: JSON.stringify(value),
            ContentType: 'application/json',
            CacheControl: 'no-store',
            ...(etag ? { IfMatch: etag } : { IfNoneMatch: '*' }),
          })
        );
        return true;
      } catch (error) {
        if (status(error) === 412 || status(error) === 409) return false;
        throw error;
      }
    },
  };
}

// Conditional writes serialize admissions across server instances. Failed preparations consume
// a permit too: limits bound attempted storage writes, rather than successful on-chain launches.
export async function reserveUploadQuota(
  store: QuotaStore,
  wallet: string,
  now = Date.now(),
  prefix = 'limits/v1'
) {
  const day = new Date(now).toISOString().slice(0, 10);
  const hash = createHash('sha256').update(wallet).digest('hex');
  for (const [key, limit, cooldown] of [
    [`${prefix}/wallet/${hash}.json`, 10, true],
    [`${prefix}/days/${day}.json`, 100, false],
  ] as const) {
    let admitted = false;
    for (let attempt = 0; attempt < 4; attempt++) {
      const old = await store.read(key);
      const count = old?.value.day === day ? old.value.count : 0;
      if (cooldown && old && now - old.value.lastAt < 60_000)
        throw new UploadQuotaError('Please wait a minute before uploading another token');
      if (count >= limit)
        throw new UploadQuotaError(
          cooldown
            ? 'Wallet daily upload limit reached. Retry after midnight UTC.'
            : 'Demo daily upload limit reached. Retry after midnight UTC.'
        );
      if (await store.write(key, { day, count: count + 1, lastAt: now }, old?.etag)) {
        admitted = true;
        break;
      }
    }
    if (!admitted) throw new UploadQuotaError('Uploads are busy. Please retry in a minute.');
  }
}
