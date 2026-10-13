import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { loadEnvConfig } from '@next/env';
import {
  reserveUploadQuota,
  r2QuotaStore,
  QuotaStore,
  UploadQuotaError,
} from '../src/lib/server/upload-quota';

async function main() {
  if (!process.argv.includes('--live'))
    throw new Error('Pass --live to test configured R2 with isolated temporary quota objects.');
  loadEnvConfig(process.cwd());
  for (const key of ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_ACCOUNT_ID', 'R2_BUCKET'])
    assert(process.env[key] && !process.env[key]!.includes('your_'), `${key} must be configured`);
  const bucket = process.env.R2_BUCKET!;
  const client = new S3Client({
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: 'auto',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  const source = r2QuotaStore(client, bucket);
  const keys = new Set<string>();
  const store: QuotaStore = {
    read: source.read,
    write: async (key, value, etag) => {
      keys.add(key);
      return source.write(key, value, etag);
    },
  };
  const prefix = `limits/verification/${randomUUID()}`;
  const now = Date.now();
  try {
    const results = await Promise.allSettled(
      Array.from({ length: 3 }, () =>
        reserveUploadQuota(store, 'temporary-test-wallet', now, prefix)
      )
    );
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    for (const result of results)
      if (result.status === 'rejected') assert(result.reason instanceof UploadQuotaError);
    await reserveUploadQuota(store, 'temporary-test-wallet', now + 60_001, prefix);
    console.log('Live R2 conditional quota writes and concurrent admission passed.');
  } finally {
    for (const key of keys)
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    client.destroy();
    console.log('Temporary verification objects removed.');
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Quota verification failed');
  process.exitCode = 1;
});
