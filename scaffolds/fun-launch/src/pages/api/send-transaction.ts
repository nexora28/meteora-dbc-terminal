import type { NextApiRequest, NextApiResponse } from 'next';
import { SendTransactionError, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { z } from 'zod';
import { devnetConnection } from '@/lib/server/launch';

const requestSchema = z
  .object({
    signedTransaction: z
      .string()
      .max(1644)
      .regex(/^[A-Za-z0-9+/]+={0,2}$/),
    lastValidBlockHeight: z.number().int().positive(),
  })
  .strict();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const candidate = req.query.signature;
    if (
      typeof candidate !== 'string' ||
      !/^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(candidate) ||
      bs58.decode(candidate).length !== 64
    ) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    try {
      const connection = await devnetConnection();
      const result = (
        await connection.getSignatureStatuses([candidate], { searchTransactionHistory: true })
      ).value[0];
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({
        signature: candidate,
        status: result?.err
          ? 'failed'
          : result?.confirmationStatus === 'confirmed' || result?.confirmationStatus === 'finalized'
            ? 'confirmed'
            : 'pending',
      });
    } catch {
      return res
        .status(503)
        .json({ error: 'Unable to check confirmation; use the devnet explorer' });
    }
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid transaction request' });
  let signature: string | undefined;
  try {
    const raw = Buffer.from(parsed.data.signedTransaction, 'base64');
    if (raw.length > 1232)
      return res.status(400).json({ error: 'Transaction exceeds Solana packet size' });
    const transaction = Transaction.from(raw);
    if (!transaction.verifySignatures() || !transaction.signature || !transaction.recentBlockhash) {
      return res.status(400).json({ error: 'Transaction must have all required signatures' });
    }
    signature = bs58.encode(transaction.signature);
    const connection = await devnetConnection();
    const existing = (
      await connection.getSignatureStatuses([signature], { searchTransactionHistory: true })
    ).value[0];
    if (existing?.err)
      return res
        .status(400)
        .json({ error: 'Transaction failed on chain', signature, status: 'failed' });
    if (
      existing?.confirmationStatus === 'confirmed' ||
      existing?.confirmationStatus === 'finalized'
    ) {
      return res.status(200).json({ signature, status: 'confirmed' });
    }
    if (!existing) {
      if (!(await connection.isBlockhashValid(transaction.recentBlockhash)).value) {
        return res
          .status(400)
          .json({ error: 'Transaction expired. Prepare a new transaction.', status: 'expired' });
      }
      await connection.sendRawTransaction(raw, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });
    }
    const result = await connection.confirmTransaction(
      {
        signature,
        abortSignal: AbortSignal.timeout(20_000),
        blockhash: transaction.recentBlockhash,
        lastValidBlockHeight: parsed.data.lastValidBlockHeight,
      },
      'confirmed'
    );
    if (result.value.err)
      return res
        .status(400)
        .json({ error: 'Transaction failed on chain', signature, status: 'failed' });
    return res.status(200).json({ signature, status: 'confirmed' });
  } catch (error) {
    console.error('Transaction submission failed:', error);
    if (error instanceof SendTransactionError) {
      return res.status(400).json({ signature, status: 'failed', error: error.message });
    }
    // A lost RPC response does not prove that a submitted transaction failed.
    return res.status(signature ? 202 : 400).json({
      signature,
      status: signature ? 'pending' : 'invalid',
      error: error instanceof Error ? error.message : 'Transaction submission failed',
    });
  }
}
