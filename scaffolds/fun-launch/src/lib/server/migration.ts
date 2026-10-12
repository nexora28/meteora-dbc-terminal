import { Connection, PublicKey } from '@solana/web3.js';
import { NATIVE_MINT } from '@solana/spl-token';
import {
  DynamicBondingCurveClient,
  DAMM_V2_MIGRATION_FEE_ADDRESS,
  DAMM_V2_PROGRAM_ID,
  deriveDammV2PoolAddress,
} from '@meteora-ag/dynamic-bonding-curve-sdk';
import { z } from 'zod';
import { addressSchema } from './discovery';

export const migrationRequestSchema = z
  .object({
    mint: addressSchema,
    payer: addressSchema.refine((value) => {
      try {
        return PublicKey.isOnCurve(new PublicKey(value).toBytes());
      } catch {
        return false;
      }
    }),
  })
  .strict();

export async function prepareMigration(connection: Connection, mint: string, payer: string) {
  const client = new DynamicBondingCurveClient(connection, 'confirmed');
  const pool = await client.state.getPoolByBaseMint(mint);
  if (!pool) throw new Error('No DBC pool found');
  const state = pool.account.poolState;
  if (state.isMigrated) throw new Error('This pool has already migrated');
  const config = await client.state.getPoolConfig(state.config);
  if (!config || config.migrationOption !== 1)
    throw new Error('This pool is not configured for DAMM v2');
  if (!config.quoteMint.equals(NATIVE_MINT) || config.tokenType !== 0)
    throw new Error('In-app migration supports SOL-quoted SPL launches only');
  if (state.quoteReserve.lt(config.migrationQuoteThreshold))
    throw new Error('The pool has not reached its graduation threshold');
  if (
    !config.lockedVestingConfig.amountPerPeriod.isZero() ||
    !config.lockedVestingConfig.cliffUnlockAmount.isZero()
  )
    throw new Error('Vesting launches require the official manual migrator');
  const dammConfig = DAMM_V2_MIGRATION_FEE_ADDRESS[config.migrationFeeOption];
  if (!dammConfig) throw new Error('Unsupported DAMM v2 migration fee option');
  const account = await connection.getAccountInfo(dammConfig, 'confirmed');
  if (!account?.owner.equals(DAMM_V2_PROGRAM_ID))
    throw new Error('The DAMM v2 fee configuration is unavailable on devnet');
  const { transaction, firstPositionNftKeypair, secondPositionNftKeypair } =
    await client.migration.migrateToDammV2({
      payer: new PublicKey(payer),
      pool: pool.publicKey,
      dammConfig,
    });
  const latest = await connection.getLatestBlockhash('confirmed');
  transaction.feePayer = new PublicKey(payer);
  transaction.recentBlockhash = latest.blockhash;
  transaction.partialSign(firstPositionNftKeypair, secondPositionNftKeypair);
  const bytes = transaction.serialize({ requireAllSignatures: false, verifySignatures: true });
  if (bytes.length > 1232)
    throw new Error('Migration transaction exceeds packet size; use the official manual migrator');
  return {
    network: 'devnet',
    mint,
    payer,
    poolAddress: pool.publicKey.toBase58(),
    dammPoolAddress: deriveDammV2PoolAddress(
      dammConfig,
      state.baseMint,
      config.quoteMint
    ).toBase58(),
    transaction: bytes.toString('base64'),
    ...latest,
  };
}
