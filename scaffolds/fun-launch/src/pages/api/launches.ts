import type { NextApiRequest, NextApiResponse } from 'next';
import {
  addressSchema,
  discoverLaunches,
  readLaunchMint,
  readLaunchConfig,
  readPublishedMetadata,
} from '@/lib/server/discovery';
import { devnetConnection } from '@/lib/server/launch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { creator, mint } = req.query;
  if (Boolean(creator) === Boolean(mint) || !addressSchema.safeParse(creator ?? mint).success)
    return res.status(400).json({ error: 'Provide one valid creator or mint address' });
  try {
    const connection = await devnetConnection();
    const launches = await discoverLaunches(connection, {
      creator: typeof creator === 'string' ? creator : undefined,
      mint: typeof mint === 'string' ? mint : undefined,
    });
    if (typeof mint === 'string') {
      const launch = launches[0];
      if (!launch)
        return res.status(404).json({
          error: 'No DBC pool found for this mint on devnet. Check your launch transaction.',
        });
      const [token, metadata, config] = await Promise.all([
        readLaunchMint(connection, mint),
        readPublishedMetadata(mint),
        readLaunchConfig(connection, launch.configAddress, mint),
      ]);
      return res.status(200).json({ network: 'devnet', launches, token, metadata, config });
    }
    return res.status(200).json({ network: 'devnet', launches });
  } catch {
    return res
      .status(503)
      .json({ error: 'Unable to read devnet pool data. Retry or check the explorer.' });
  }
}
