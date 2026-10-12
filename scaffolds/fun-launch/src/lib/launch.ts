import { PublicKey } from '@solana/web3.js';
import { z } from 'zod';

export const LAUNCH_NETWORK = 'devnet' as const;
export const DEVNET_GENESIS_HASH = 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG';
export const SUPPORTED_PRESET = 'anti-snipe';
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const publicKey = z.string().refine((value) => {
  try {
    return PublicKey.isOnCurve(new PublicKey(value).toBytes());
  } catch {
    return false;
  }
}, 'Invalid wallet or mint address');
const socialUrl = z
  .string()
  .trim()
  .max(200)
  .refine((value) => {
    if (!value) return true;
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, 'Use an HTTP or HTTPS URL')
  .default('');

export const launchRequestSchema = z
  .object({
    tokenName: z
      .string()
      .trim()
      .min(3)
      .max(32)
      .refine(
        (value) => new TextEncoder().encode(value).length <= 32,
        'Token name must fit in 32 UTF-8 bytes'
      ),
    tokenSymbol: z
      .string()
      .trim()
      .min(1)
      .max(10)
      .regex(/^[A-Z0-9]+$/),
    tokenLogo: z
      .string()
      .max(4 * Math.ceil(MAX_LOGO_BYTES / 3) + 40)
      .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/),
    website: socialUrl,
    twitter: socialUrl,
    mint: publicKey,
    userWallet: publicKey,
    presetId: z.literal(SUPPORTED_PRESET),
    expiresAt: z.number().int().positive(),
  })
  .strict();

export type LaunchRequest = z.infer<typeof launchRequestSchema>;
export const launchReceiptSchema = z.object({
  mint: publicKey,
  poolAddress: z.string().refine((value) => {
    try {
      new PublicKey(value);
      return true;
    } catch {
      return false;
    }
  }),
  configAddress: publicKey,
  signature: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{64,88}$/),
  metadataUrl: z
    .string()
    .url()
    .refine((value) => new URL(value).protocol === 'https:'),
  status: z.enum(['confirmed', 'pending']),
});
export type LaunchReceipt = z.infer<typeof launchReceiptSchema>;

export const transactionReceiptSchema = z.object({
  signature: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{64,88}$/),
  status: z.enum(['pending', 'confirmed']),
});
export type TransactionReceipt = z.infer<typeof transactionReceiptSchema>;

export async function launchMessage(request: LaunchRequest) {
  const bytes = new TextEncoder().encode(JSON.stringify(launchRequestSchema.parse(request)));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', Uint8Array.from(bytes));
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
  return new TextEncoder().encode(
    `Aegis devnet metadata upload\nWallet: ${request.userWallet}\nMint: ${request.mint}\nExpires: ${request.expiresAt}\nSHA-256: ${hash}\nThis message does not authorize a transfer.`
  );
}

export function explorerUrl(kind: 'address' | 'tx', value: string) {
  return `https://explorer.solana.com/${kind}/${encodeURIComponent(value)}?cluster=${LAUNCH_NETWORK}`;
}
