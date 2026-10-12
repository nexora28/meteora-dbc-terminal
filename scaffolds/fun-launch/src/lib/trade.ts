import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';
import { z } from 'zod';

export const tradeRequestSchema = z
  .object({
    mint: z.string().refine((value) => {
      try {
        return new PublicKey(value).toBase58() === value;
      } catch {
        return false;
      }
    }),
    owner: z.string().refine((value) => {
      try {
        return PublicKey.isOnCurve(new PublicKey(value).toBytes());
      } catch {
        return false;
      }
    }),
    side: z.enum(['buy', 'sell']),
    amount: z
      .string()
      .max(40)
      .regex(/^(0|[1-9]\d*)(\.\d+)?$/),
    slippageBps: z.number().int().min(1).max(500),
  })
  .strict();
export type TradeRequest = z.infer<typeof tradeRequestSchema>;

export function tokenUnits(value: string, decimals: number) {
  if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(value) || value.length > 40)
    throw new Error('Enter a positive decimal amount');
  const [whole, fraction = ''] = value.split('.');
  if (fraction.length > decimals) throw new Error(`Use at most ${decimals} decimal places`);
  const units = new BN(whole + fraction.padEnd(decimals, '0'));
  if (units.isZero() || units.gt(new BN('18446744073709551615')))
    throw new Error('Amount is outside token limits');
  return units;
}

export function displayUnits(value: string, decimals: number) {
  const padded = value.padStart(decimals + 1, '0');
  return decimals
    ? `${padded.slice(0, -decimals)}.${padded.slice(-decimals)}`.replace(/\.?0+$/, '')
    : padded;
}

export const preparedTradeSchema = z.object({
  network: z.literal('devnet'),
  mint: z.string(),
  owner: z.string(),
  side: z.enum(['buy', 'sell']),
  poolAddress: z.string(),
  amountIn: z.string().regex(/^\d+$/),
  outputAmount: z.string().regex(/^\d+$/),
  minimumAmountOut: z.string().regex(/^\d+$/),
  fee: z.string().regex(/^\d+$/),
  inputDecimals: z.number().int().min(0).max(9),
  outputDecimals: z.number().int().min(0).max(9),
  feeDecimals: z.number().int().min(0).max(9),
  feeToken: z.enum(['SOL', 'token']),
  solBalance: z.string().regex(/^\d+$/),
  tokenBalance: z.string().regex(/^\d+$/),
  tokenDecimals: z.number().int().min(0).max(9),
  transaction: z.string().max(1644),
  blockhash: z.string(),
  lastValidBlockHeight: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
});
export type PreparedTrade = z.infer<typeof preparedTradeSchema>;
