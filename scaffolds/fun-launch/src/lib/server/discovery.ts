import {
  DynamicBondingCurveClient,
  DAMM_V2_MIGRATION_FEE_ADDRESS,
  DAMM_V2_PROGRAM_ID,
  deriveDammV2PoolAddress,
} from '@meteora-ag/dynamic-bonding-curve-sdk';
import { unpackMint, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { z } from 'zod';

export const addressSchema = z.string().refine((value) => {
  try {
    return new PublicKey(value).toBase58() === value;
  } catch {
    return false;
  }
}, 'Invalid address');

const metadataSchema = z.object({ name: z.string().max(32), symbol: z.string().max(10) });

export async function discoverLaunches(
  connection: Connection,
  query: { creator?: string; mint?: string }
) {
  const client = new DynamicBondingCurveClient(connection, 'confirmed');
  const pools = query.mint
    ? [await client.state.getPoolByBaseMint(addressSchema.parse(query.mint))].filter(
        (pool) => pool !== null
      )
    : await client.state.getPoolsByCreator(addressSchema.parse(query.creator));
  return pools.map(({ publicKey, account }) => ({
    mint: account.poolState.baseMint.toBase58(),
    poolAddress: publicKey.toBase58(),
    configAddress: account.poolState.config.toBase58(),
    creator: account.poolState.creator.toBase58(),
    status: account.poolState.isMigrated ? ('migrated' as const) : ('bonding' as const),
    quoteReserve: account.poolState.quoteReserve.toString(),
  }));
}

export async function readLaunchMint(connection: Connection, mint: string) {
  const address = new PublicKey(mint);
  const info = await connection.getAccountInfo(address, 'confirmed');
  if (!info || (!info.owner.equals(TOKEN_PROGRAM_ID) && !info.owner.equals(TOKEN_2022_PROGRAM_ID)))
    throw new Error('Invalid token mint account');
  const account = unpackMint(address, info, info.owner);
  return {
    decimals: account.decimals,
    supply: account.supply.toString(),
    mintAuthority: account.mintAuthority?.toBase58() ?? null,
    freezeAuthority: account.freezeAuthority?.toBase58() ?? null,
  };
}

export async function readLaunchConfig(connection: Connection, address: string, mint?: string) {
  const config = await new DynamicBondingCurveClient(connection, 'confirmed').state.getPoolConfig(
    address
  );
  if (!config) throw new Error('Pool config unavailable');
  const feeConfig =
    config.migrationOption === 1
      ? DAMM_V2_MIGRATION_FEE_ADDRESS[config.migrationFeeOption]
      : undefined;
  const dammPoolAddress =
    feeConfig && mint
      ? deriveDammV2PoolAddress(feeConfig, new PublicKey(mint), config.quoteMint)
      : null;
  const target = dammPoolAddress
    ? await connection.getAccountInfo(dammPoolAddress, 'confirmed')
    : null;
  return {
    quoteMint: config.quoteMint.toBase58(),
    migrationOption: config.migrationOption,
    migrationQuoteThreshold: config.migrationQuoteThreshold.toString(),
    partnerPermanentLockedLiquidityPercentage: config.partnerPermanentLockedLiquidityPercentage,
    creatorPermanentLockedLiquidityPercentage: config.creatorPermanentLockedLiquidityPercentage,
    dammPoolAddress: dammPoolAddress?.toBase58() ?? null,
    dammPoolAccountVerified: Boolean(target?.owner.equals(DAMM_V2_PROGRAM_ID)),
  };
}

export async function readPublishedMetadata(mint: string) {
  // Only fetch our configured bucket, never a caller-supplied or on-chain URI.
  const configured = process.env.R2_PUBLIC_URL;
  if (!configured) return null;
  try {
    const base = new URL(configured);
    if (base.protocol !== 'https:' || base.search || base.hash) return null;
    const url = `${base.toString().replace(/\/$/, '')}/metadata/${addressSchema.parse(mint)}.json`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000), redirect: 'error' });
    if (!response.ok) return null;
    const reader = response.body?.getReader();
    if (!reader) return null;
    let content = '';
    let length = 0;
    const decoder = new TextDecoder();
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        length += chunk.value.length;
        if (length > 16_384) return null;
        content += decoder.decode(chunk.value, { stream: true });
      }
      content += decoder.decode();
    } finally {
      await reader.cancel();
    }
    const parsed = metadataSchema.safeParse(JSON.parse(content));
    return parsed.success ? { ...parsed.data, url } : null;
  } catch {
    return null;
  }
}
