import type { NextApiRequest, NextApiResponse } from 'next';
import { devnetConnection } from '@/lib/server/launch';
import { migrationRequestSchema, prepareMigration } from '@/lib/server/migration';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const parsed = migrationRequestSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: 'Provide valid mint and payer addresses' });
  try {
    return res
      .status(200)
      .json(await prepareMigration(await devnetConnection(), parsed.data.mint, parsed.data.payer));
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const expected =
      /^(No DBC|This pool|In-app migration|The pool has not|Vesting launches|Unsupported DAMM|The DAMM v2 fee|Migration transaction exceeds)/.test(
        message
      );
    return res
      .status(expected ? 400 : 503)
      .json({
        error: expected
          ? message
          : 'Unable to prepare migration. Retry or use the official migrator.',
      });
  }
}
