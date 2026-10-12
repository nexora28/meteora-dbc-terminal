import { createPublicKey, verify } from 'node:crypto';
import { ComputeBudgetProgram, Connection, Keypair, PublicKey } from '@solana/web3.js';
import { NATIVE_MINT } from '@solana/spl-token';
import {
  buildCurve,
  deriveDbcPoolAddress,
  DynamicBondingCurveClient,
} from '@meteora-ag/dynamic-bonding-curve-sdk';
import { DEVNET_GENESIS_HASH, LaunchRequest, launchMessage } from '../launch';

export async function devnetConnection() {
  const configured = process.env.RPC_URL?.trim();
  const url =
    !configured || configured === 'your_rpc_url' ? 'https://api.devnet.solana.com' : configured;
  if (new URL(url).protocol !== 'https:') throw new Error('RPC_URL must use HTTPS');
  const connection = new Connection(url, {
    commitment: 'confirmed',
    disableRetryOnRateLimit: true,
  });
  if ((await connection.getGenesisHash()) !== DEVNET_GENESIS_HASH) {
    throw new Error('RPC_URL must point to Solana devnet');
  }
  return connection;
}

export async function verifyUploadSignature(
  request: LaunchRequest,
  signature: string,
  now = Date.now()
) {
  if (request.expiresAt <= now || request.expiresAt > now + 5 * 60_000) return false;
  const bytes = Buffer.from(signature, 'base64');
  if (bytes.length !== 64 || bytes.toString('base64') !== signature) return false;
  const key = createPublicKey({
    key: Buffer.concat([
      Buffer.from('302a300506032b6570032100', 'hex'),
      new PublicKey(request.userWallet).toBuffer(),
    ]),
    format: 'der',
    type: 'spki',
  });
  return verify(null, await launchMessage(request), key, bytes);
}

export function buildLaunchConfig() {
  return buildCurve({
    percentageSupplyOnMigration: 25,
    migrationQuoteThreshold: 85,
    token: {
      totalTokenSupply: 1_000_000_000,
      tokenBaseDecimal: 6,
      tokenQuoteDecimal: 9,
      tokenType: 0,
      tokenAuthorityOption: 1,
      leftover: 0,
    },
    fee: {
      baseFeeParams: {
        baseFeeMode: 0,
        feeSchedulerParam: {
          startingFeeBps: 9900,
          endingFeeBps: 125,
          numberOfPeriod: 120,
          totalDuration: 120,
        },
      },
      dynamicFeeEnabled: true,
      collectFeeMode: 0,
      creatorTradingFeePercentage: 50,
      poolCreationFee: 0,
      enableFirstSwapWithMinFee: false,
    },
    migration: {
      migrationOption: 1,
      migrationFeeOption: 2,
      migrationFee: { feePercentage: 0, creatorFeePercentage: 0 },
    },
    liquidityDistribution: {
      partnerLiquidityPercentage: 0,
      creatorLiquidityPercentage: 0,
      partnerPermanentLockedLiquidityPercentage: 50,
      creatorPermanentLockedLiquidityPercentage: 50,
    },
    lockedVesting: {
      totalLockedVestingAmount: 0,
      numberOfVestingPeriod: 0,
      cliffUnlockAmount: 0,
      totalVestingDuration: 0,
      cliffDurationFromMigrationTime: 0,
    },
    activationType: 0,
  });
}

export async function prepareLaunchTransaction(
  connection: Connection,
  request: LaunchRequest,
  metadataUrl: string
) {
  // Keeps the combined transaction within the 1232-byte packet limit, including maximum-length names.
  if (new TextEncoder().encode(metadataUrl).length > 128)
    throw new Error('Public metadata URL must fit in 128 bytes; use a shorter bucket domain');
  const config = Keypair.generate();
  const mint = new PublicKey(request.mint);
  const payer = new PublicKey(request.userWallet);
  const client = new DynamicBondingCurveClient(connection, 'confirmed');
  const transaction = await client.partner.createConfigAndPool({
    ...buildLaunchConfig(),
    config: config.publicKey,
    quoteMint: NATIVE_MINT,
    payer,
    feeClaimer: payer,
    leftoverReceiver: payer,
    preCreatePoolParam: {
      baseMint: mint,
      name: request.tokenName,
      symbol: request.tokenSymbol,
      uri: metadataUrl,
      poolCreator: payer,
    },
  });
  transaction.instructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }));
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  transaction.feePayer = payer;
  transaction.recentBlockhash = blockhash;
  transaction.partialSign(config);
  return {
    transaction,
    configAddress: config.publicKey.toBase58(),
    poolAddress: deriveDbcPoolAddress(NATIVE_MINT, mint, config.publicKey).toBase58(),
    blockhash,
    lastValidBlockHeight,
  };
}
