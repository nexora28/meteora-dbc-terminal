import assert from 'node:assert/strict';
import { createPrivateKey, sign } from 'node:crypto';
import { Connection, Keypair, PublicKey, SendTransactionError, Transaction } from '@solana/web3.js';
import { launchMessage, launchRequestSchema, explorerUrl } from '../src/lib/launch';
import {
  buildLaunchConfig,
  devnetConnection,
  prepareLaunchTransaction,
  verifyUploadSignature,
} from '../src/lib/server/launch';
import upload from '../src/pages/api/upload';
import submit from '../src/pages/api/send-transaction';
import { ApeQueries } from '../src/components/Explore/queries';
import { S3Client } from '@aws-sdk/client-s3';
import { DEVNET_GENESIS_HASH } from '../src/lib/launch';

async function main() {
  const payer = Keypair.generate();
  const mint = Keypair.generate();
  const now = Date.now();
  const request = launchRequestSchema.parse({
    tokenName: 'Test Token',
    tokenSymbol: 'TEST',
    tokenLogo: 'data:image/png;base64,iVBORw0KGgo=',
    mint: mint.publicKey.toBase58(),
    userWallet: payer.publicKey.toBase58(),
    presetId: 'anti-snipe',
    expiresAt: now + 60_000,
  });
  const key = createPrivateKey({
    key: Buffer.concat([
      Buffer.from('302e020100300506032b657004220420', 'hex'),
      Buffer.from(payer.secretKey.subarray(0, 32)),
    ]),
    format: 'der',
    type: 'pkcs8',
  });
  const signature = sign(null, await launchMessage(request), key).toString('base64');
  assert(await verifyUploadSignature(request, signature, now));
  assert(!(await verifyUploadSignature({ ...request, tokenName: 'Tampered' }, signature, now)));
  assert(!(await verifyUploadSignature(request, signature, now + 60_001)));
  assert(!launchRequestSchema.safeParse({ ...request, presetId: 'dao-conviction' }).success);
  assert(!launchRequestSchema.safeParse({ ...request, mint: '../overwrite' }).success);
  assert(!launchRequestSchema.safeParse({ ...request, website: 'javascript:alert(1)' }).success);
  assert(!launchRequestSchema.safeParse({ ...request, configKey: 'override' }).success);
  assert(explorerUrl('tx', 'abc').endsWith('?cluster=devnet'));

  const curve = buildLaunchConfig();
  assert.equal(curve.migrationQuoteThreshold.toString(), '85000000000');
  assert.equal(curve.migrationOption, 1);
  assert.equal(curve.activationType, 0);
  assert.equal(curve.creatorTradingFeePercentage, 50);
  assert.equal(
    curve.partnerPermanentLockedLiquidityPercentage +
      curve.creatorPermanentLockedLiquidityPercentage,
    100
  );
  assert.equal(curve.tokenUpdateAuthority, 1);
  const connection = new Connection('https://api.devnet.solana.com');
  connection.getLatestBlockhash = async () => ({
    blockhash: Keypair.generate().publicKey.toBase58(),
    lastValidBlockHeight: 100,
  });
  // Exercise the same preparation function used by the API, with the real SDK and only RPC stubbed.
  const prepared = await prepareLaunchTransaction(
    connection,
    request,
    'https://example.com/metadata/test.json'
  );
  const transaction = prepared.transaction;
  const browser = Transaction.from(transaction.serialize({ requireAllSignatures: false }));
  browser.partialSign(mint);
  const walletCopy = Transaction.from(browser.serialize({ requireAllSignatures: false }));
  walletCopy.partialSign(payer);
  assert(
    walletCopy.verifySignatures(),
    'Mint and wallet signatures must preserve the server config signature'
  );
  const raw = walletCopy.serialize();
  assert(raw.length <= 1232, `Launch transaction is too large: ${raw.length}`);
  const pool = new PublicKey(prepared.poolAddress);
  const poolInstruction = walletCopy.instructions[2];
  assert(poolInstruction);
  assert(poolInstruction.keys.some((account) => account.pubkey.equals(pool)));
  assert.equal(walletCopy.instructions.length, 3);
  const maximum = await prepareLaunchTransaction(
    connection,
    { ...request, tokenName: 'N'.repeat(32), tokenSymbol: 'S'.repeat(10) },
    'https://example.com/' + 'm'.repeat(108)
  );
  assert(maximum.transaction.serialize({ requireAllSignatures: false }).length <= 1232);
  await assert.rejects(
    prepareLaunchTransaction(connection, request, 'https://example.com/' + 'm'.repeat(109))
  );
  assert(!launchRequestSchema.safeParse({ ...request, tokenName: '🪙'.repeat(16) }).success);

  // Exercise validation and missing-storage paths without external writes or wallet funds.
  const call = async (handler: typeof upload, method: string, body: unknown) => {
    let status = 200;
    let json: any;
    const response = {
      setHeader() {},
      status(code: number) {
        status = code;
        return this;
      },
      json(data: unknown) {
        json = data;
        return this;
      },
    };
    await handler({ method, body, query: {} } as any, response as any);
    return { status, json };
  };
  assert.equal(
    (await call(upload, 'POST', { request, signature: Buffer.alloc(64).toString('base64') }))
      .status,
    401
  );
  assert.equal((await call(upload, 'POST', { ...request, configKey: 'override' })).status, 400);
  const storageKeys = [
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_ACCOUNT_ID',
    'R2_BUCKET',
    'R2_PUBLIC_URL',
  ];
  const saved = storageKeys.map((key) => process.env[key]);
  try {
    for (const key of storageKeys) delete process.env[key];
    assert.equal((await call(upload, 'GET', null)).json.ready, false);
    assert.equal((await call(upload, 'POST', { request, signature })).status, 503);
  } finally {
    storageKeys.forEach((key, index) => {
      if (saved[index] === undefined) delete process.env[key];
      else process.env[key] = saved[index];
    });
  }
  // Exercise the complete API preparation path with in-memory storage and read-only RPC responses.
  const originalSend = S3Client.prototype.send;
  const originalGenesis = Connection.prototype.getGenesisHash;
  const originalAccount = Connection.prototype.getAccountInfo;
  const originalBlockhash = Connection.prototype.getLatestBlockhash;
  const originalFetch = globalThis.fetch;
  const objects = new Map<string, unknown>();
  try {
    storageKeys.forEach((key) => {
      process.env[key] = key === 'R2_PUBLIC_URL' ? 'https://bucket.r2.dev' : 'test';
    });
    Connection.prototype.getGenesisHash = async () => DEVNET_GENESIS_HASH;
    Connection.prototype.getAccountInfo = async () => null;
    Connection.prototype.getLatestBlockhash = connection.getLatestBlockhash;
    S3Client.prototype.send = (async (command: any) => {
      assert.equal(command.input.IfNoneMatch, '*', 'Published metadata must not be overwritable');
      objects.set(command.input.Key, command.input.Body);
      return {};
    }) as any;
    globalThis.fetch = (async (url: string) => {
      const value = objects.get(new URL(url).pathname.slice(1));
      return new Response(String(value), { status: value ? 200 : 404 });
    }) as any;
    const result = await call(upload, 'POST', { request, signature });
    assert.equal(result.status, 200, JSON.stringify(result.json));
    assert.equal(result.json.network, 'devnet');
    assert.equal(result.json.mint, request.mint);
    const uploaded = JSON.parse(String(objects.get(`metadata/${request.mint}.json`)));
    assert.equal(uploaded.name, request.tokenName);
    assert.equal(uploaded.symbol, request.tokenSymbol);
    assert(uploaded.image.endsWith(`${request.mint}.png`));
    const delivered = Transaction.from(Buffer.from(result.json.poolTx, 'base64'));
    delivered.partialSign(mint, payer);
    assert(delivered.verifySignatures());
    assert.equal((await call(upload, 'POST', { request, signature })).status, 429);
  } finally {
    S3Client.prototype.send = originalSend;
    Connection.prototype.getGenesisHash = originalGenesis;
    Connection.prototype.getAccountInfo = originalAccount;
    Connection.prototype.getLatestBlockhash = originalBlockhash;
    globalThis.fetch = originalFetch;
    storageKeys.forEach((key, index) => {
      if (saved[index] === undefined) delete process.env[key];
      else process.env[key] = saved[index];
    });
  }
  const unsigned = new Transaction().add(...transaction.instructions);
  unsigned.feePayer = payer.publicKey;
  unsigned.recentBlockhash = transaction.recentBlockhash;
  assert.equal(
    (
      await call(submit, 'POST', {
        signedTransaction: unsigned.serialize({ requireAllSignatures: false }).toString('base64'),
        lastValidBlockHeight: 100,
      })
    ).status,
    400
  );
  assert.equal((await call(submit, 'GET', null)).status, 400);
  const originalStatuses = Connection.prototype.getSignatureStatuses;
  const originalValid = Connection.prototype.isBlockhashValid;
  const originalRawSend = Connection.prototype.sendRawTransaction;
  const originalErrorLog = console.error;
  try {
    Connection.prototype.getGenesisHash = async () => DEVNET_GENESIS_HASH;
    Connection.prototype.getSignatureStatuses = async () => ({
      context: { slot: 1 },
      value: [{ slot: 1, confirmations: 1, err: null, confirmationStatus: 'confirmed' }],
    });
    const body = { signedTransaction: raw.toString('base64'), lastValidBlockHeight: 100 };
    assert.equal((await call(submit, 'POST', body)).json.status, 'confirmed');
    Connection.prototype.getSignatureStatuses = async () => ({
      context: { slot: 1 },
      value: [null],
    });
    Connection.prototype.isBlockhashValid = async () => ({ context: { slot: 1 }, value: false });
    assert.equal((await call(submit, 'POST', body)).json.status, 'expired');
    Connection.prototype.isBlockhashValid = async () => ({ context: { slot: 1 }, value: true });
    console.error = () => {}; // Expected RPC failures are asserted below.
    Connection.prototype.sendRawTransaction = async () => {
      throw new Error('RPC response lost');
    };
    assert.equal((await call(submit, 'POST', body)).json.status, 'pending');
    Connection.prototype.sendRawTransaction = async () => {
      throw new SendTransactionError({
        action: 'simulate',
        signature: '',
        transactionMessage: 'Insufficient funds',
      });
    };
    assert.equal((await call(submit, 'POST', body)).json.status, 'failed');
  } finally {
    Connection.prototype.getGenesisHash = originalGenesis;
    Connection.prototype.getSignatureStatuses = originalStatuses;
    Connection.prototype.isBlockhashValid = originalValid;
    Connection.prototype.sendRawTransaction = originalRawSend;
    console.error = originalErrorLog;
  }
  await assert.rejects(ApeQueries.tokenInfo({ id: payer.publicKey.toBase58() }).queryFn());
  assert.equal((await ApeQueries.tokenTxs({ id: 'sample' }).queryFn({} as any)).txs.length, 0);
  console.log(
    `Launch checks passed: wallet authorization, validation, config, signatures, receipt links, sample isolation; transaction ${raw.length}/1232 bytes.`
  );
  if (process.argv.includes('--devnet')) {
    const live = await devnetConnection();
    const funding = await live.requestAirdrop(payer.publicKey, 1_000_000_000);
    const latest = await live.getLatestBlockhash('confirmed');
    await live.confirmTransaction(
      { signature: funding, ...latest, abortSignal: AbortSignal.timeout(30_000) },
      'confirmed'
    );
    const launch = await prepareLaunchTransaction(
      live,
      request,
      'https://example.com/metadata/test.json'
    );
    launch.transaction.partialSign(mint, payer);
    const simulation = await live.simulateTransaction(launch.transaction);
    assert.equal(simulation.value.err, null, JSON.stringify(simulation.value.logs));
    console.log(
      `Devnet simulation passed: ${simulation.value.unitsConsumed} compute units. No launch was broadcast.`
    );
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
