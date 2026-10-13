import assert from 'node:assert/strict';
import BN from 'bn.js';
import bs58 from 'bs58';
import {
  Connection,
  Keypair,
  Transaction,
  Message,
  ComputeBudgetProgram,
  SystemProgram,
} from '@solana/web3.js';
import { verifyReviewedTransaction } from '../src/lib/wallet-transaction';
import {
  AccountLayout,
  MintLayout,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import {
  DynamicBondingCurveClient,
  getMigrationThresholdPrice,
  DYNAMIC_BONDING_CURVE_PROGRAM_ID,
} from '@meteora-ag/dynamic-bonding-curve-sdk';
import { buildLaunchConfig } from '../src/lib/server/launch';
import { prepareTrade } from '../src/lib/server/trade';
import {
  tokenUnits,
  displayUnits,
  tradeRequestSchema,
  preparedTradeSchema,
} from '../src/lib/trade';

async function main() {
  assert.equal(tokenUnits('0.000000001', 9).toString(), '1');
  assert.equal(tokenUnits('9007199254.740993', 6).toString(), '9007199254740993');
  assert.equal(displayUnits('1000000000', 9), '1');
  assert.equal(displayUnits('100000', 6), '0.1');
  assert.equal(displayUnits('0', 9), '0');
  for (const value of [
    '0',
    '-1',
    'Infinity',
    '1e3',
    '1.2junk',
    '01',
    '0.0000000001',
    '18446744073709551616',
  ])
    assert.throws(() => tokenUnits(value, 9));
  const wallet = Keypair.generate();
  const mint = Keypair.generate().publicKey;
  const request = {
    owner: wallet.publicKey.toBase58(),
    mint: mint.toBase58(),
    side: 'buy' as 'buy' | 'sell',
    amount: '1',
    slippageBps: 100,
  };
  assert(!tradeRequestSchema.safeParse({ ...request, slippageBps: 10000 }).success);
  assert(!tradeRequestSchema.safeParse({ ...request, minimumAmountOut: '0' }).success);
  const connection = new Connection('https://api.devnet.solana.com');
  connection.getSlot = async () => 121;
  connection.getBalance = async () => 10_000_000_000;
  connection.getLatestBlockhash = async () => ({
    blockhash: Keypair.generate().publicKey.toBase58(),
    lastValidBlockHeight: 200,
  });
  const configParams = buildLaunchConfig();
  const config = {
    ...configParams,
    quoteMint: NATIVE_MINT,
    migrationSqrtPrice: getMigrationThresholdPrice(
      configParams.migrationQuoteThreshold,
      configParams.sqrtStartPrice,
      configParams.curve
    ),
    poolFees: {
      ...configParams.poolFees,
      dynamicFee: { ...configParams.poolFees.dynamicFee!, initialized: 1 },
    },
  };
  const state = {
    config: Keypair.generate().publicKey,
    creator: wallet.publicKey,
    baseMint: mint,
    baseVault: Keypair.generate().publicKey,
    quoteVault: Keypair.generate().publicKey,
    isMigrated: 0,
    poolType: 0,
    sqrtPrice: config.sqrtStartPrice,
    quoteReserve: new BN(0),
    baseReserve: new BN(0),
    activationPoint: new BN(0),
    volatilityTracker: {
      lastUpdateTimestamp: new BN(0),
      sqrtPriceReference: config.sqrtStartPrice,
      volatilityAccumulator: new BN(0),
      volatilityReference: new BN(0),
      padding: [] as number[],
    },
  };
  const pool = { publicKey: Keypair.generate().publicKey, account: { poolState: state } };
  const client = new DynamicBondingCurveClient(connection, 'confirmed');
  const prototype = Object.getPrototypeOf(client.state);
  const originals = {
    mint: prototype.getPoolByBaseMint,
    pool: prototype.getPool,
    config: prototype.getPoolConfig,
  };
  const mintBytes = Buffer.alloc(MintLayout.span);
  MintLayout.encode(
    {
      mintAuthorityOption: 0,
      mintAuthority: wallet.publicKey,
      supply: BigInt('1000000000000000'),
      decimals: 6,
      isInitialized: true,
      freezeAuthorityOption: 0,
      freezeAuthority: wallet.publicKey,
    },
    mintBytes
  );
  const tokenBytes = Buffer.alloc(AccountLayout.span);
  AccountLayout.encode(
    {
      mint,
      owner: wallet.publicKey,
      amount: BigInt('1000000000000'),
      delegateOption: 0,
      delegate: wallet.publicKey,
      state: 1,
      isNativeOption: 0,
      isNative: BigInt(0),
      delegatedAmount: BigInt(0),
      closeAuthorityOption: 0,
      closeAuthority: wallet.publicKey,
    },
    tokenBytes
  );
  connection.getAccountInfo = async (address) =>
    address.equals(mint) || address.equals(getAssociatedTokenAddressSync(mint, wallet.publicKey))
      ? {
          data: address.equals(mint) ? mintBytes : tokenBytes,
          owner: TOKEN_PROGRAM_ID,
          executable: false,
          lamports: 1,
          rentEpoch: 0,
        }
      : null;
  try {
    prototype.getPoolByBaseMint = async () => pool;
    prototype.getPool = async () => pool.account;
    prototype.getPoolConfig = async () => config;
    const buy = preparedTradeSchema.parse(await prepareTrade(connection, request));
    assert.equal(buy.side, 'buy');
    assert.equal(buy.feeToken, 'SOL');
    assert(new BN(buy.minimumAmountOut).lt(new BN(buy.outputAmount)));
    const expected = client.pool.swapQuote({
      virtualPool: pool.account as any,
      config: config as any,
      swapBaseForQuote: false,
      amountIn: new BN('1000000000'),
      slippageBps: 100,
      hasReferral: false,
      currentPoint: new BN(121),
      eligibleForFirstSwapWithMinFee: false,
    });
    assert.equal(buy.minimumAmountOut, expected.minimumAmountOut.toString());
    const tx = Transaction.from(Buffer.from(buy.transaction, 'base64'));
    assert(tx.instructions.some((ix) => ix.programId.equals(DYNAMIC_BONDING_CURVE_PROGRAM_ID)));
    const swap = tx.instructions.find((ix) =>
      ix.programId.equals(DYNAMIC_BONDING_CURVE_PROGRAM_ID)
    )!;
    assert.equal(new BN(swap.data.subarray(8, 16), 'le').toString(), buy.amountIn);
    assert.equal(new BN(swap.data.subarray(16, 24), 'le').toString(), buy.minimumAmountOut);
    const reviewedBytes = tx.serialize({ requireAllSignatures: false });
    tx.partialSign(wallet);
    verifyReviewedTransaction(reviewedBytes, tx);
    // Some wallets recompile legacy account indices without changing operations.
    const message = tx.compileMessage();
    const last = message.accountKeys.length - 1;
    // Only exchange two read-only unsigned accounts so permissions are unchanged.
    const readOnlyStart = message.accountKeys.length - message.header.numReadonlyUnsignedAccounts;
    const a = readOnlyStart;
    const b = last;
    assert(a < b);
    const map = (index: number) => (index === a ? b : index === b ? a : index);
    const keys = [...message.accountKeys];
    [keys[a], keys[b]] = [keys[b]!, keys[a]!];
    const rebuilt = Transaction.populate(
      new Message({
        header: message.header,
        accountKeys: keys,
        recentBlockhash: message.recentBlockhash,
        instructions: message.instructions.map((ix) => ({
          ...ix,
          programIdIndex: map(ix.programIdIndex),
          accounts: ix.accounts.map(map),
        })),
      }),
      Array.from({ length: message.header.numRequiredSignatures }, () =>
        bs58.encode(new Uint8Array(64))
      )
    );
    rebuilt.partialSign(wallet);
    assert(
      !rebuilt.serializeMessage().equals(tx.serializeMessage()),
      'Fixture must change wire account ordering'
    );
    verifyReviewedTransaction(reviewedBytes, rebuilt);
    const tampered = Transaction.from(reviewedBytes);
    tampered.instructions[0]!.data[0] = tampered.instructions[0]!.data[0]! ^ 1;
    tampered.partialSign(wallet);
    assert.throws(() => verifyReviewedTransaction(reviewedBytes, tampered), /changed/);
    const unsigned = Transaction.from(reviewedBytes);
    assert.throws(() => verifyReviewedTransaction(reviewedBytes, unsigned), /signature/);
    const withPriorityFee = Transaction.from(reviewedBytes);
    withPriorityFee.instructions.unshift(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 })
    );
    withPriorityFee.partialSign(wallet);
    verifyReviewedTransaction(reviewedBytes, withPriorityFee, true);
    assert.throws(
      () => verifyReviewedTransaction(reviewedBytes, withPriorityFee),
      /instruction count/
    );
    const excessive = Transaction.from(reviewedBytes);
    excessive.instructions.unshift(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10_000_000 })
    );
    excessive.partialSign(wallet);
    assert.throws(() => verifyReviewedTransaction(reviewedBytes, excessive, true), /exceeds/);
    const changedSwap = Transaction.from(reviewedBytes);
    const changedInstruction = changedSwap.instructions.find((ix) =>
      ix.programId.equals(DYNAMIC_BONDING_CURVE_PROGRAM_ID)
    )!;
    changedInstruction.data[8] = changedInstruction.data[8]! ^ 1;
    changedSwap.partialSign(wallet);
    assert.throws(
      () => verifyReviewedTransaction(reviewedBytes, changedSwap, true),
      /swap instruction/
    );
    const extraTransfer = Transaction.from(reviewedBytes);
    extraTransfer.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: 1,
      })
    );
    extraTransfer.partialSign(wallet);
    assert.throws(
      () => verifyReviewedTransaction(reviewedBytes, extraTransfer, true),
      /instruction count/
    );
    const newBlockhash = Transaction.from(reviewedBytes);
    newBlockhash.recentBlockhash = Keypair.generate().publicKey.toBase58();
    newBlockhash.partialSign(wallet);
    assert.throws(() => verifyReviewedTransaction(reviewedBytes, newBlockhash, true), /blockhash/);
    assert(tx.verifySignatures());
    assert(tx.serialize().length <= 1232);
    // Move the fixture through the actual SDK buy quote before quoting a sell.
    state.sqrtPrice = expected.nextSqrtPrice;
    state.quoteReserve = expected.actualInputAmount;
    const sell = preparedTradeSchema.parse(
      await prepareTrade(connection, { ...request, side: 'sell', amount: '100' })
    );
    assert.equal(sell.side, 'sell');
    assert.equal(sell.outputDecimals, 9);
    assert(new BN(sell.outputAmount).gt(new BN(0)));
    const sellTx = Transaction.from(Buffer.from(sell.transaction, 'base64'));
    sellTx.partialSign(wallet);
    assert(sellTx.verifySignatures());
    await assert.rejects(
      prepareTrade(connection, { ...request, side: 'sell', amount: '1000001' }),
      /Insufficient token balance/
    );
    await assert.rejects(
      prepareTrade(connection, { ...request, amount: '11' }),
      /Insufficient SOL/
    );
    state.isMigrated = 1;
    await assert.rejects(prepareTrade(connection, request), /migrated/);
    state.isMigrated = 0;
    state.quoteReserve = config.migrationQuoteThreshold;
    await assert.rejects(prepareTrade(connection, request), /complete/);
    state.quoteReserve = new BN(0);
    state.sqrtPrice = config.sqrtStartPrice;
    connection.getSlot = async () => 0;
    const early = await prepareTrade(connection, request);
    assert.equal(early.fee, '990000000');
    assert.equal(early.feeToken, 'SOL');
    console.log(
      'Trade checks passed: exact amounts, real SDK buy/sell quotes and instructions, minimum output, fee units, signatures, balances and graduation guards. No trades broadcast.'
    );
  } finally {
    prototype.getPoolByBaseMint = originals.mint;
    prototype.getPool = originals.pool;
    prototype.getPoolConfig = originals.config;
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
