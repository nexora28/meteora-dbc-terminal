# Aegis submission preparation

Prepared 12 October 2026 for https://superteam.fun/earn/listing/meteora-dbc.

**Deadline:** the listing's embedded published data gives `2026-10-13T06:59:00.000Z`, which is
**13 October 2026 at 7:59 a.m. Africa/Lagos**. This was checked directly in the listing HTML on
12 October. The visible countdown says "Syncing", but the listing data repeats that deadline for
the track. October 31 is the winner announcement. Prioritize a working hosted demo and honest
on-chain evidence before the submission cutoff.

## Product description draft

Aegis is a devnet launchpad prototype built on Meteora Invent. It creates a DBC config and token pool,
stores immutable token metadata, discovers creator pools directly from devnet, supports native SDK
buy/sell quotes and wallet-reviewed transactions, and prepares manual DAMM v2 graduation for eligible
SOL/SPL pools. Receipts expose cluster-correct transaction and account links. Preview markets and
Studio settings are separated from live accounts.

The contribution is the frontend lifecycle, validated transaction preparation, authenticated storage,
creator discovery and regression checks. The underlying protocols, SDKs and scaffold come from
Meteora; attribute them explicitly. Do not claim a paid marketplace, stock backing, compounding,
automated migration, verified position locks, mainnet usage or measured traction.

## Engineering acceptance

Run in `scaffolds/fun-launch`:

```sh
pnpm lint
pnpm type-check
pnpm test
pnpm build
pnpm start
```

The regression suite covers signed upload authorization, bounded input validation, actual SDK launch,
quote/swap and migration instructions, packet sizes, preserved signatures, confirmation error states,
creator/mint discovery, metadata bounds and migration thresholds. RPC account fixtures are stubbed;
these are not funded on-chain proofs. Frontend checks enable strict null analysis and do not ignore
type errors during the build.

## Required live demo evidence — not yet completed

Local verification on 12 October 2026: repository and frontend type checking passed, including
strict null analysis; ESLint passed with zero
warnings; all four regression suites passed; production build passed with lint and type validation
enabled. The Windows Computer Use helper timed out during discovery after recovery attempts, so
no visual browser walkthrough is claimed. HTTP/API smoke checks are recorded separately below.

Production HTTP smoke checks passed for home, creation, creator discovery, docs, Studio and the
token route. Storage preflight reported ready on devnet. Malformed upload, trade, migration,
transaction and mint-lookup requests returned HTTP 400. These checks do not simulate a connected
wallet or prove browser-extension compatibility.

- [ ] Working hosted URL, with server-side R2 credentials and a devnet RPC. Never commit `.env`.
- [ ] Funded wallet creates a real token: retain mint, DBC config/pool and confirmed transaction.
- [ ] Reload and locate the pool using My launches or its mint.
- [ ] Confirm one buy and one sell; capture quoted fees/minimum output and transaction links.
- [ ] Complete the curve and confirm DAMM v2 migration; retain its transaction and target pool link.
- [ ] Decode resulting positions before claiming actual LP locks; current app verifies target address
      ownership and displays configured allocations only.
- [ ] Record a short walkthrough showing real account/transaction evidence. Avoid sample volumes
      or preset illustrations as traction evidence.
- [ ] Provide repository access; for a private repository, the listing asks for read access for
      GitHub user `dannxbt`. No access changes have been made.
- [x] Verify the listing's published deadline: 13 October 2026 at 7:59 a.m. Lagos time.
- [ ] Check required submission fields and any deadline updates on Superteam before submitting.

The fixed launch threshold is 85 SOL, so a graduation demo needs sufficient devnet funds. The optional
`check-launch.ts --devnet` test attempts a temporary-wallet faucet request and simulates creation
without broadcasting. The latest attempt failed because the public faucet returned an internal
error. Do not report that attempt as a live launch or funded simulation pass.

## Deployment boundary

The current upload limiter is local to one server process. Add a shared limiter and storage quotas
before exposing uploads across multiple instances. Use a production public bucket domain instead
of relying on an R2 development URL for a public release. Check the deployment's RPC and R2 settings,
and test its wallet metadata/explorer links on that domain. No deployment or mainnet transaction has
been performed during this preparation.
