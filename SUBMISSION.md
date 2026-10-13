# Aegis submission preparation

Updated 13 October 2026 for https://superteam.fun/earn/listing/meteora-dbc.

## Submission fields

- Project name: Aegis
- GitHub: https://github.com/nexora28/meteora-dbc-terminal (public; judges already have read access)
- Website: https://meteora-dbc-terminal.vercel.app
- Required pitch deck or Loom/video presentation: https://meteora-dbc-terminal.vercel.app/pitch
- Required Colosseum submission answer: the owner must answer Yes/No truthfully.
- Optional fields: project X link, Colosseum project link and Colosseum profile link.

The listing's public submission schema was checked on 13 October. GitHub and presentation links
are required; the website is optional. A video is not compulsory when a pitch deck is provided.
Check the logged-in form before submitting; this file does not submit the application.

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

## Verification and remaining evidence

On 13 October the NUI demo token was checked against confirmed devnet account data and transaction
history. Creation, buy and sell are finalized with no transaction errors. The swap token-balance
changes confirm receipt on the buy and a balance decrease on the sell. This demonstrates operation,
not adoption or meaningful trading volume.

- Token: https://meteora-dbc-terminal.vercel.app/launch/AngiHBZqNhVxk4d9Rqmi37TmCp5zHdRmwY8qPC2tcENa
- Pool: `7q8DyTnUtAAg3Mo1TyicMFuw12iXW31svLzaVQawyEDa`
- Config: `2vZzqigZWVq21S1MmZhXYfdk3BQ7kqdfbx8MCE6aND3N`
- [Creation](https://explorer.solana.com/tx/qji4ib8BxRvC87Jri14JTzEWBLzJFFbDg3JyJvDbqWrTppPBkgzRAaFSRSthkPwtR1E5x3ztcTmtqn8TGQ6xfWL?cluster=devnet)
- [Buy](https://explorer.solana.com/tx/4NrxphtzxDXVx5xgZyv5rKMJ1CsRFz3j9q9uRn2tBExhN3XhgbnosSeX7UHKBoeCKnvq6ePCECybY8yijnxAcRzM?cluster=devnet)
- [Sell](https://explorer.solana.com/tx/5cwh2VUXhdD27fJZCMG4bNyjd5CbdVSYGxhDwDqfPNqrK2Rk25k9mrJuR26nf1PjQ6vgmQfuLchaeWNn5CAAuBaP?cluster=devnet)

The pool was still bonding, with 0.098749993 SOL quote reserve against its 85 SOL target. Token supply
was one billion, with mint and freeze authorities revoked. Migration remains unverified.

Local verification on 12 October 2026: repository and frontend type checking passed, including
strict null analysis; ESLint passed with zero
warnings; all four regression suites passed; production build passed with lint and type validation
enabled. The Windows Computer Use helper timed out during discovery after recovery attempts, so
no visual browser walkthrough is claimed. HTTP/API smoke checks are recorded separately below.

Production HTTP smoke checks passed for home, creation, creator discovery, docs, Studio and the
token route. Storage preflight reported ready on devnet. Malformed upload, trade, migration,
transaction and mint-lookup requests returned HTTP 400. These checks do not simulate a connected
wallet or prove browser-extension compatibility.

- [x] Hosted demo: https://meteora-dbc-terminal.vercel.app — server-side R2 credentials and devnet RPC configured; pages, storage readiness, input validation and live RPC discovery verified. Local `.env` excluded from deployment source.
- [x] Funded wallet creates a real token: mint, config, pool and finalized transaction recorded above.
- [ ] Reload and locate the pool using My launches or its mint.
- [x] Confirm one buy and one sell; finalized transaction links recorded above. Quoted fee screenshots were not retained.
- [ ] Complete the curve and confirm DAMM v2 migration; retain its transaction and target pool link.
- [ ] Decode resulting positions before claiming actual LP locks; current app verifies target address
      ownership and displays configured allocations only.
- [x] Prepare a hosted pitch deck; video is an alternative, not an additional listing requirement.
- [x] Repository is public and readable by judges. If made private, grant `dannxbt` read access.
- [x] Verify the listing's published deadline: 13 October 2026 at 7:59 a.m. Lagos time.
- [ ] Check required submission fields and any deadline updates on Superteam before submitting.

The fixed launch threshold is 85 SOL, so a graduation demo needs sufficient devnet funds. The optional
`check-launch.ts --devnet` test attempts a temporary-wallet faucet request and simulates creation
without broadcasting. The latest attempt failed because the public faucet returned an internal
error. Do not report that attempt as a live launch or funded simulation pass.

## Deployment boundary

Uploads use shared R2 conditional-write quotas: one attempt per wallet per minute, ten per wallet
per UTC day, and 100 across the demo per UTC day. Failed preparations consume permits. These quotas
bound authenticated storage writes, not all HTTP/RPC traffic; edge request throttling is still needed
for a wider release. Live R2 concurrency and conditional updates were tested on 13 October using
isolated temporary records, which were removed after verification. Use a production public bucket domain instead
of relying on an R2 development URL for a public release. Check the deployment's RPC and R2 settings,
and test its wallet metadata/explorer links on that domain. The devnet demo is deployed to Vercel;
launch, buy and sell were independently verified from finalized devnet transactions. Migration, verified liquidity positions and
mainnet usage remain unverified.
