import assert from 'node:assert/strict';
import { Connection, Keypair } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { MintLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import handler from '../src/pages/api/launches';
import { DEVNET_GENESIS_HASH } from '../src/lib/launch';
import { readPublishedMetadata } from '../src/lib/server/discovery';
import { DBC_PRESETS } from '../src/components/DBCStudio/presets';

async function main() {
  const connection = new Connection('https://api.devnet.solana.com');
  const state = Object.getPrototypeOf(new DynamicBondingCurveClient(connection, 'confirmed').state);
  const originals = {
    creator: state.getPoolsByCreator,
    mint: state.getPoolByBaseMint,
    config: state.getPoolConfig,
    genesis: Connection.prototype.getGenesisHash,
    account: Connection.prototype.getAccountInfo,
    fetch: globalThis.fetch,
    url: process.env.R2_PUBLIC_URL,
    rpc: process.env.RPC_URL,
  };
  const mint = Keypair.generate().publicKey;
  const creator = Keypair.generate().publicKey;
  const config = Keypair.generate().publicKey;
  const pool = {
    publicKey: Keypair.generate().publicKey,
    account: {
      poolState: {
        baseMint: mint,
        creator,
        config,
        isMigrated: 0,
        quoteReserve: BigInt('123456789'),
      },
    },
  };
  const call = async (query: Record<string, unknown>, method = 'GET') => {
    const result = { code: 0, body: null as any };
    const response = {
      setHeader() {},
      status(code: number) {
        result.code = code;
        return response;
      },
      json(body: unknown) {
        result.body = body;
        return response;
      },
    };
    await handler({ method, query } as any, response as any);
    return result;
  };
  try {
    process.env.RPC_URL = 'https://api.devnet.solana.com';
    process.env.R2_PUBLIC_URL = 'https://example.com';
    Connection.prototype.getGenesisHash = async () => DEVNET_GENESIS_HASH;
    state.getPoolsByCreator = async (address: string) => {
      assert.equal(address, creator.toBase58());
      return [pool];
    };
    state.getPoolByBaseMint = async (address: string) => {
      assert.equal(address, mint.toBase58());
      return pool;
    };
    state.getPoolConfig = async () => ({
      quoteMint: mint,
      migrationOption: 1,
      migrationFeeOption: 2,
      migrationQuoteThreshold: BigInt('85000000000'),
      partnerPermanentLockedLiquidityPercentage: 50,
      creatorPermanentLockedLiquidityPercentage: 50,
    });
    const data = Buffer.alloc(MintLayout.span);
    MintLayout.encode(
      {
        mintAuthorityOption: 0,
        mintAuthority: creator,
        supply: BigInt('1000000000000000'),
        decimals: 6,
        isInitialized: true,
        freezeAuthorityOption: 0,
        freezeAuthority: creator,
      },
      data
    );
    Connection.prototype.getAccountInfo = async () => ({
      data,
      owner: TOKEN_PROGRAM_ID,
      executable: false,
      lamports: 1,
      rentEpoch: 0,
    });
    globalThis.fetch = async (url, options) => {
      assert.equal(String(url), `https://example.com/metadata/${mint.toBase58()}.json`);
      assert.equal(options?.redirect, 'error');
      return new Response(JSON.stringify({ name: 'Verified Token', symbol: 'TEST' }));
    };
    assert.equal((await call({ mint: '../secret' })).code, 400);
    assert.equal((await call({ creator: [creator.toBase58()] })).code, 400);
    assert.equal((await call({ creator: creator.toBase58(), mint: mint.toBase58() })).code, 400);
    assert.equal((await call({}, 'POST')).code, 405);
    const list = await call({ creator: creator.toBase58() });
    assert.equal(list.code, 200);
    assert.equal(list.body.launches[0].mint, mint.toBase58());
    assert.equal(list.body.launches[0].quoteReserve, '123456789');
    assert.equal(list.body.launches[0].status, 'bonding');
    const detail = await call({ mint: mint.toBase58() });
    assert.equal(detail.code, 200);
    assert.equal(detail.body.metadata.name, 'Verified Token');
    assert.equal(detail.body.token.supply, '1000000000000000');
    assert.equal(detail.body.token.mintAuthority, null);
    assert.equal(detail.body.token.freezeAuthority, null);
    pool.account.poolState.isMigrated = 1;
    assert.equal((await call({ mint: mint.toBase58() })).body.launches[0].status, 'migrated');
    state.getPoolByBaseMint = async (): Promise<null> => null;
    assert.equal((await call({ mint: mint.toBase58() })).code, 404);
    state.getPoolsByCreator = async (): Promise<unknown[]> => [];
    assert.deepEqual((await call({ creator: creator.toBase58() })).body.launches, []);
    state.getPoolsByCreator = async () => {
      throw new Error('RPC unavailable');
    };
    assert.equal((await call({ creator: creator.toBase58() })).code, 503);
    globalThis.fetch = async () => new Response('x'.repeat(16_385));
    assert.equal(await readPublishedMetadata(mint.toBase58()), null);
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ name: 'x', symbol: '<script>', image: 'http://internal' }));
    const metadata = await readPublishedMetadata(mint.toBase58());
    assert.equal(metadata?.symbol, '<script>'); // React renders metadata as text; arbitrary image URLs are not returned.
    assert(!('image' in metadata!));
    globalThis.fetch = async () => new Response('', { status: 404 });
    assert.equal(await readPublishedMetadata(mint.toBase58()), null);
    process.env.R2_PUBLIC_URL = 'invalid-url';
    assert.equal(await readPublishedMetadata(mint.toBase58()), null);
    Connection.prototype.getGenesisHash = async () => 'wrong-network';
    assert.equal((await call({ creator: creator.toBase58() })).code, 503);
    assert(DBC_PRESETS.every((preset) => !('rating' in preset) && !('configKey' in preset)));
    console.log(
      'Discovery checks passed: valid pool/mint data, creator filtering, migration flag, invalid inputs, missing pools, RPC failure, bounded metadata and cluster isolation.'
    );
  } finally {
    state.getPoolsByCreator = originals.creator;
    state.getPoolByBaseMint = originals.mint;
    state.getPoolConfig = originals.config;
    Connection.prototype.getGenesisHash = originals.genesis;
    Connection.prototype.getAccountInfo = originals.account;
    globalThis.fetch = originals.fetch;
    if (originals.url === undefined) delete process.env.R2_PUBLIC_URL;
    else process.env.R2_PUBLIC_URL = originals.url;
    if (originals.rpc === undefined) delete process.env.RPC_URL;
    else process.env.RPC_URL = originals.rpc;
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
