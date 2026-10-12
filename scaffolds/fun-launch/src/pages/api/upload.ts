import type { NextApiRequest, NextApiResponse } from 'next';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PublicKey } from '@solana/web3.js';
import { z } from 'zod';
import { launchRequestSchema, MAX_LOGO_BYTES } from '@/lib/launch';
import {
  devnetConnection,
  prepareLaunchTransaction,
  verifyUploadSignature,
} from '@/lib/server/launch';

export const config = { api: { bodyParser: { sizeLimit: '3mb' } } };
const requestSchema = z
  .object({ request: launchRequestSchema, signature: z.string().max(88) })
  .strict();
// ponytail: per-process throttle; use a shared limiter before deploying multiple instances.
const recentUploads = new Map<string, number>();
const storageKeys = [
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_ACCOUNT_ID',
  'R2_BUCKET',
  'R2_PUBLIC_URL',
];
const hasStorage = () => {
  if (!storageKeys.every((key) => process.env[key] && !process.env[key]?.includes('your_')))
    return false;
  try {
    const url = new URL(process.env.R2_PUBLIC_URL!);
    return url.protocol === 'https:' && !url.search && !url.hash;
  } catch {
    return false;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      ready: hasStorage(),
      network: 'devnet',
      error: hasStorage()
        ? null
        : 'Token storage is not configured. Set the R2 credentials, bucket and R2_PUBLIC_URL.',
    });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid request' });
  const { request, signature } = parsed.data;
  try {
    if (!(await verifyUploadSignature(request, signature))) {
      return res.status(401).json({ error: 'Invalid or expired wallet authorization' });
    }
    const image = Buffer.from(
      request.tokenLogo.slice(request.tokenLogo.indexOf(',') + 1),
      'base64'
    );
    const contentType = request.tokenLogo.slice(5, request.tokenLogo.indexOf(';'));
    const validImage =
      contentType === 'image/png'
        ? image.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))
        : contentType === 'image/jpeg'
          ? image.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))
          : image.subarray(0, 4).toString() === 'RIFF' &&
            image.subarray(8, 12).toString() === 'WEBP';
    if (!validImage || image.length > MAX_LOGO_BYTES) {
      return res
        .status(400)
        .json({ error: 'Upload a PNG, JPEG or WebP image no larger than 2 MB' });
    }
    if (!hasStorage()) {
      return res.status(503).json({
        error: 'Token storage is not configured. Set the R2 credentials, bucket and R2_PUBLIC_URL.',
      });
    }
    const publicUrl = new URL(process.env.R2_PUBLIC_URL!);
    if (publicUrl.protocol !== 'https:' || publicUrl.search || publicUrl.hash) {
      return res.status(503).json({ error: 'R2_PUBLIC_URL must be a public HTTPS bucket URL' });
    }
    const now = Date.now();
    for (const [wallet, time] of recentUploads)
      if (now - time >= 60_000) recentUploads.delete(wallet);
    if (recentUploads.has(request.userWallet) || recentUploads.size >= 5000) {
      return res.status(429).json({ error: 'Please wait a minute before uploading another token' });
    }
    recentUploads.set(request.userWallet, now);
    const connection = await devnetConnection();
    const mint = new PublicKey(request.mint);
    if (await connection.getAccountInfo(mint))
      return res.status(409).json({ error: 'Mint already exists' });
    const r2 = new S3Client({
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const baseUrl = publicUrl.toString().replace(/\/$/, '');
    const imageKey = `images/${request.mint}.${contentType.split('/')[1]}`;
    const metadataKey = `metadata/${request.mint}.json`;
    const metadataUrl = `${baseUrl}/${metadataKey}`;
    if (new TextEncoder().encode(metadataUrl).length > 128) {
      return res
        .status(503)
        .json({ error: 'Public metadata URL is too long; use a shorter bucket domain' });
    }
    // Immutable keys prevent replays from replacing already published token metadata.
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: imageKey,
        Body: image,
        ContentType: contentType,
        IfNoneMatch: '*',
      })
    );
    const metadata = {
      name: request.tokenName,
      symbol: request.tokenSymbol,
      image: `${baseUrl}/${imageKey}`,
      extensions: { website: request.website, twitter: request.twitter },
    };
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: metadataKey,
        Body: JSON.stringify(metadata),
        ContentType: 'application/json',
        IfNoneMatch: '*',
      })
    );
    const published = await fetch(metadataUrl, {
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
    if (!published.ok || JSON.stringify(await published.json()) !== JSON.stringify(metadata)) {
      throw new Error('Uploaded metadata is not publicly retrievable; check R2_PUBLIC_URL');
    }
    // Prepare after publishing so storage latency does not age the wallet's blockhash.
    const fresh = await prepareLaunchTransaction(connection, request, metadataUrl);
    return res.status(200).json({
      poolTx: fresh.transaction.serialize({ requireAllSignatures: false }).toString('base64'),
      mint: request.mint,
      configAddress: fresh.configAddress,
      poolAddress: fresh.poolAddress,
      metadataUrl,
      blockhash: fresh.blockhash,
      lastValidBlockHeight: fresh.lastValidBlockHeight,
      network: 'devnet',
    });
  } catch (error) {
    console.error('Launch preparation failed:', error);
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Launch preparation failed' });
  }
}
