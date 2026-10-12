import assert from 'node:assert/strict';
import BN from 'bn.js';
import { Connection, Keypair, Transaction } from '@solana/web3.js';
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  DynamicBondingCurveClient,
  DAMM_V2_PROGRAM_ID,
  DAMM_V2_MIGRATION_FEE_ADDRESS,
  deriveDammV2PoolAddress,
  DYNAMIC_BONDING_CURVE_PROGRAM_ID,
} from '@meteora-ag/dynamic-bonding-curve-sdk';
import { buildLaunchConfig } from '../src/lib/server/launch';
import { prepareMigration, migrationRequestSchema } from '../src/lib/server/migration';
import { readLaunchConfig } from '../src/lib/server/discovery';

async function main() {
  const connection = new Connection('https://api.devnet.solana.com');
  const wallet = Keypair.generate();
  const mint = Keypair.generate().publicKey;
  assert(
    !migrationRequestSchema.safeParse({ mint: '../bad', payer: wallet.publicKey.toBase58() })
      .success
  );
  assert(!migrationRequestSchema.safeParse({ mint: mint.toBase58(), payer: 'invalid' }).success);
  assert(
    !migrationRequestSchema.safeParse({
      mint: mint.toBase58(),
      payer: wallet.publicKey.toBase58(),
      dammConfig: 'override',
    }).success
  );
  const params = buildLaunchConfig();
  const config = {
    ...params,
    quoteMint: NATIVE_MINT,
    quoteTokenFlag: 0,
    lockedVestingConfig: params.lockedVesting,
  };
  const pool = {
    publicKey: Keypair.generate().publicKey,
    account: {
      poolState: {
        config: Keypair.generate().publicKey,
        creator: wallet.publicKey,
        baseMint: mint,
        baseVault: Keypair.generate().publicKey,
        quoteVault: Keypair.generate().publicKey,
        quoteReserve: new BN(0),
        isMigrated: 0,
      },
    },
  };
  const state = Object.getPrototypeOf(new DynamicBondingCurveClient(connection, 'confirmed').state);
  const original = {
    mint: state.getPoolByBaseMint,
    pool: state.getPool,
    config: state.getPoolConfig,
  };
  connection.getLatestBlockhash = async () => ({
    blockhash: Keypair.generate().publicKey.toBase58(),
    lastValidBlockHeight: 200,
  });
  connection.getAccountInfo = async () => ({
    owner: DAMM_V2_PROGRAM_ID,
    data: Buffer.alloc(8),
    executable: false,
    lamports: 1,
    rentEpoch: 0,
  });
  try {
    state.getPoolByBaseMint = async () => pool;
    state.getPool = async () => pool.account;
    state.getPoolConfig = async () => config;
    const prepare = () =>
      prepareMigration(connection, mint.toBase58(), wallet.publicKey.toBase58());
    await assert.rejects(prepare(), /threshold/);
    pool.account.poolState.quoteReserve = config.migrationQuoteThreshold;
    const prepared = await prepare();
    const feeConfig = DAMM_V2_MIGRATION_FEE_ADDRESS[2];
    assert(feeConfig);
    const expectedTarget = deriveDammV2PoolAddress(feeConfig, mint, NATIVE_MINT).toBase58();
    assert.equal(prepared.dammPoolAddress, expectedTarget);
    const transaction = Transaction.from(Buffer.from(prepared.transaction, 'base64'));
    assert.equal(transaction.signatures.length, 3);
    assert.equal(transaction.signatures.filter((entry) => entry.signature !== null).length, 2);
    assert(transaction.verifySignatures(false));
    assert(!transaction.verifySignatures());
    const migration = transaction.instructions.find((ix) =>
      ix.programId.equals(DYNAMIC_BONDING_CURVE_PROGRAM_ID)
    )!;
    assert(migration.keys.some((key) => key.pubkey.toBase58() === expectedTarget));
    transaction.partialSign(wallet);
    assert(transaction.verifySignatures());
    const bytes = transaction.serialize();
    assert(bytes.length <= 1232);
    const verified = await readLaunchConfig(
      connection,
      pool.account.poolState.config.toBase58(),
      mint.toBase58()
    );
    assert.equal(verified.dammPoolAddress, expectedTarget);
    assert.equal(verified.dammPoolAccountVerified, true);
    assert.equal(verified.creatorPermanentLockedLiquidityPercentage, 50);
    connection.getAccountInfo = async () => ({
      owner: TOKEN_PROGRAM_ID,
      data: Buffer.alloc(8),
      executable: false,
      lamports: 1,
      rentEpoch: 0,
    });
    assert.equal(
      (
        await readLaunchConfig(
          connection,
          pool.account.poolState.config.toBase58(),
          mint.toBase58()
        )
      ).dammPoolAccountVerified,
      false
    );
    await assert.rejects(prepare(), /configuration is unavailable/);
    connection.getAccountInfo = async (): Promise<null> => null;
    assert.equal(
      (
        await readLaunchConfig(
          connection,
          pool.account.poolState.config.toBase58(),
          mint.toBase58()
        )
      ).dammPoolAccountVerified,
      false
    );
    pool.account.poolState.isMigrated = 1;
    await assert.rejects(prepare(), /already migrated/);
    pool.account.poolState.isMigrated = 0;
    config.migrationOption = 0;
    await assert.rejects(prepare(), /not configured/);
    config.migrationOption = 1;
    config.lockedVestingConfig.cliffUnlockAmount = new BN(1);
    await assert.rejects(prepare(), /Vesting/);
    console.log(
      `Migration checks passed: threshold/vesting/target guards, real SDK instructions, preserved NFT signatures and owner verification; transaction ${bytes.length}/1232 bytes. No migration broadcast.`
    );
  } finally {
    state.getPoolByBaseMint = original.mint;
    state.getPool = original.pool;
    state.getPoolConfig = original.config;
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
