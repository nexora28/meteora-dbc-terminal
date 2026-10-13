# Aegis devnet launchpad

A Meteora DBC launchpad prototype built on Meteora Invent for the
[Superteam DBC competition](https://superteam.fun/earn/listing/meteora-dbc).

## Current launch flow

The `/create-pool` page supports **Anti-Snipe Fair Launch** on Solana **devnet**. It creates a new
DBC config and pool in one transaction rather than relying on undeployed preset addresses.

- SOL quote; 1 billion tokens with 6 decimals.
- Base fee decays from 99% to 1.25% over 120 slots; dynamic fees are enabled.
- Graduation threshold: 85 SOL. Migration is configured for DAMM v2 with a 1% pool fee.
- Post-migration LP allocation: 50% permanently locked creator LP and 50% permanently locked partner
  LP.
- Creator, partner fee claimer, and leftover receiver all use the launching wallet.
- Metadata update authority is immutable.

The wallet signs an expiring metadata-upload authorization, then reviews and signs the launch
transaction. Logos and metadata are persisted to R2 with immutable object keys. The app checks
public metadata retrieval before requesting the launch signature.

The receipt includes the mint, pool, config, metadata URL, and cluster-correct transaction link.
Uncertain confirmation stays pending and can be checked again; it is never reported as a successful
launch.

## What is still a preview

Explore cards and their metrics are explicitly **sample data**. Mainnet streaming and Jupiter swaps
are disabled in this devnet build. There is no global devnet Explore indexer.

The live `/launch/<mint>` page supports native DBC exact-input buy/sell for ungraduated SPL tokens
quoted in SOL. Connect a wallet, review an SDK quote with fees and minimum output, then explicitly
sign and submit. Amounts use integer token units, quotes expire after 45 seconds, and pending trade
receipts survive reloads for the same wallet/mint/browser origin. Wallet balances are read with each
quote; completed or migrated curves reject DBC swaps. Token 2022, non-SOL quotes,
first-swap-minimum-fee configs and DAMM v2 trading are not supported by this form. Funded buy/sell
is not yet verified. `/my-launches` reads DBC pools for the connected creator wallet from devnet.
Receipts link to `/launch/<mint>`, which reads pool, config and mint accounts. Name and symbol are
loaded only from this app's configured public bucket; missing metadata does not hide an existing
pool. No global Explore indexer is implemented. RPC failures are reported separately from a missing
pool.

Other presets and studio curves are illustrative previews; they cannot be deployed from the launch
page. Migration execution is manual, and no DLMM pipeline or compounding vault is implemented by
this frontend.

The live token page exposes DAMM v2 graduation once the on-chain quote reserve reaches its
configured threshold. The first in-app path supports SOL/SPL pools without locked vesting; other
flows link to Meteora's official manual migrator. The backend checks the canonical DAMM v2 fee
account, builds the SDK migration transaction and partially signs the two new position NFTs. The
wallet signs as payer. Private NFT keys are never returned. Pending receipts survive reloads, and
the page checks whether an account exists at the derived target address and is owned by DAMM v2.
Configured LP percentages are displayed separately; individual DAMM position balances and locks are
not decoded or verified. No funded graduation has been verified yet.

Unknown safety measurements are displayed as unknown.

## Run locally

From the repository root:

```sh
pnpm install
```

Copy `scaffolds/fun-launch/.env.example` to `scaffolds/fun-launch/.env` and configure:

```dotenv
RPC_URL=https://api.devnet.solana.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ACCOUNT_ID=...
R2_BUCKET=...
R2_PUBLIC_URL=https://your-public-bucket.r2.dev
```

Enable public reads for the bucket and grant the R2 credentials write access to it. Use a public
bucket URL short enough that `<base-url>/metadata/<mint>.json` fits within 128 bytes. Do not put
credentials in `NEXT_PUBLIC_*` variables.

The backend verifies the RPC genesis hash and refuses another cluster. `POOL_CONFIG_KEY` and the
previous `NEXT_PUBLIC_SOLANA_*` deployment variables are not required for this flow.

```sh
cd scaffolds/fun-launch
pnpm dev
```

Open `http://localhost:3000/create-pool`, connect Phantom or Solflare, and obtain devnet SOL from
[Solana Faucet](https://faucet.solana.com). Missing storage settings disable launch before any
wallet signature is requested.

## Verification

Run the assertion-based check using the already-installed Studio TypeScript runner, from the
repository root:

```sh
pnpm --filter @meteora-invent/studio exec tsx --tsconfig ../scaffolds/fun-launch/tsconfig.json ../scaffolds/fun-launch/scripts/check-launch.ts
pnpm --filter @meteora-invent/studio exec tsx --tsconfig ../scaffolds/fun-launch/tsconfig.json ../scaffolds/fun-launch/scripts/check-discovery.ts
pnpm --filter @meteora-invent/studio exec tsx --tsconfig ../scaffolds/fun-launch/tsconfig.json ../scaffolds/fun-launch/scripts/check-trade.ts
pnpm --filter @meteora-invent/studio exec tsx --tsconfig ../scaffolds/fun-launch/tsconfig.json ../scaffolds/fun-launch/scripts/check-migration.ts
```

It checks wallet authorization and tampering, expiry, request validation, actual SDK configuration
and instruction construction, packet-size boundaries, preserved signatures, missing-storage errors,
receipt links, and sample-data isolation. It makes no network calls by default.

Append `--devnet` to request test SOL for a temporary wallet and simulate the launch without
broadcasting it. This optional check requires a working public faucet; its failure must not be
counted as a live launch verification.

From `scaffolds/fun-launch`, run `pnpm lint`, `pnpm type-check`, `pnpm test`, then `pnpm build`.
Lint treats warnings as failures, and production builds enforce lint and TypeScript validation.
CI has a dedicated launchpad job for these checks. Passing these checks does not replace a funded
devnet walkthrough; the regression suite stubs RPC accounts and never broadcasts trades or migration.

Uploads use shared R2 conditional-write quotas: one attempt per wallet per minute, ten per wallet
per UTC day and 100 across the demo per UTC day. Failed preparations consume permits. Quota reads
or writes failing prevent uploads. This bounds authenticated storage writes across instances;
edge throttling for all API traffic remains a prerequisite for a broader public release.

To verify real R2 quota concurrency with isolated temporary objects (removed afterwards), run
`node ../../studio/node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.json scripts/check-storage-quota.ts --live`
from this frontend directory. The local `.env` must contain working R2 read/write/delete credentials.

## Hosted demo

https://meteora-dbc-terminal.vercel.app

Pitch deck: https://meteora-dbc-terminal.vercel.app/pitch
Verified token demo: https://meteora-dbc-terminal.vercel.app/launch/AngiHBZqNhVxk4d9Rqmi37TmCp5zHdRmwY8qPC2tcENa

Vercel hosts the devnet demo with server-side R2 credentials. Production pages, storage readiness,
malformed request rejection and live devnet discovery have been checked. A funded wallet launch,
buy/sell and migration walkthrough remains required. Deploy from the repository root with
`vercel deploy --prod`; the Vercel GitHub integration must be connected for automatic deployments.

## Attribution

Built on the Meteora Invent toolkit and `@meteora-ag/dynamic-bonding-curve-sdk`. Package license:
ISC.
