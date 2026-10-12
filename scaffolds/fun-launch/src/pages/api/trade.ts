import type { NextApiRequest, NextApiResponse } from 'next';
import { tradeRequestSchema } from '@/lib/trade';
import { devnetConnection } from '@/lib/server/launch';
import { prepareTrade } from '@/lib/server/trade';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const parsed = tradeRequestSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: 'Enter valid addresses, amount and slippage (0.01–5%)' });
  try {
    return res.status(200).json(await prepareTrade(await devnetConnection(), parsed.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const expected =
      /^(No DBC pool|This pool has migrated|Trading currently supports|First-swap|The curve is complete|Enter a positive|Use at most|Amount is outside|Insufficient token balance|Insufficient SOL balance|Trade output rounds|Trade transaction exceeds|Insufficient Liquidity)/.test(
        message
      );
    return res
      .status(expected ? 400 : 503)
      .json({
        error: expected ? message : 'Unable to read or quote this devnet pool. Retry shortly.',
      });
  }
}
