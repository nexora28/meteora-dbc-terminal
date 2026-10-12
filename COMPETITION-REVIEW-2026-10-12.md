# Aegis competition readiness review — 12 October 2026

This assessment predates the subsequent discovery, trading, migration and quality-gate fixes.
See SUBMISSION.md for current verification and submission requirements. The listing's embedded
data was later checked and gives a deadline of 13 October 2026 at 7:59 a.m. Lagos time;
the unreadable countdown uncertainty below reflects the earlier review method.

## Verdict

Aegis now has a credible devnet launch implementation and working token storage. It is not yet a proven end-to-end launchpad or a competitive preset marketplace. The next milestone should make one real launch discoverable and tradable, then demonstrate DAMM v2 graduation. Additional preview presets will not close that gap.

This review supersedes the current-status conclusions in REVIEW.md, while preserving that earlier assessment as history. No application code was changed by this review.

## Competition requirements

Source: https://superteam.fun/earn/listing/meteora-dbc (checked 12 October 2026).

- Prize pool: 20,000 USDC; awards of 10,000 / 5,000 / 3,000 / 1,500 / 500 USDC.
- The listing encourages novel launch mechanics, curve/fee configurations, end-to-end Meteora flows, developer tooling/data streams, and a pay-to-use DBC config marketplace. These are possible directions, not a requirement to implement every idea.
- Judges assess depth of Meteora integration, technical execution, originality/taste, impact potential, and traction/volume. Mainnet usage is preferred; the page does not state that devnet projects are prohibited.
- Closed-source entries must give GitHub user dannxbt read access for judging.
- Winner announcement: 31 October 2026. The readable page shows a syncing countdown; the submission deadline and whether submissions remain open were not independently verified. Do not use the announcement date as a deadline.

## What improved since the first review

| Area | Current evidence | Limit |
| --- | --- | --- |
| DBC launch | Actual SDK createConfigAndPool with a newly generated config; combined transaction | No confirmed wallet-funded launch established |
| Network | Wallet and launch APIs use devnet; server checks genesis hash; explorer links select devnet | No mainnet release |
| Storage | R2 authenticated upload and matching public read passed in the prior session; temporary object deleted | No token metadata objects found during this review |
| Upload protection | Expiring wallet signature, bounded schema, image signature checks, immutable writes, throttling | Throttle is per process; public multi-instance deployment needs a shared limiter |
| Receipts | Mint, config, pool, metadata and signature retained in browser; pending/confirmed states | One browser-local receipt, no launch history or pool discovery |
| Market integrity | Explore explicitly sample-only; missing safety measurements display unknown | Studio still contains fabricated popularity and unsupported claims |
| Regression coverage | Assertion script passed again with a real SDK transaction of 1112/1232 bytes | RPC/storage success paths are mocked; no funded launch/buy/sell/migration proof |

Prior production build and reduced structural TypeScript checks passed. Those previous results are not a new production build or a full strict type-check pass today. Next config still skips lint and type validation during build.

## Current gaps, in priority order

### 1. P1 — No verified launch evidence or discovery flow

The configured R2 bucket returned zero token metadata objects under metadata/ (listing was not truncated). This does not establish that no coin exists anywhere; it establishes that this configured bucket has no stored evidence of a launch. A public mint or transaction signature is needed for a specific on-chain verdict.

Explore queries return only seed pools. Token lookup rejects non-sample addresses. Therefore a successfully created coin will not automatically appear in Explore or the terminal. Receipts are stored only in localStorage under aegis-devnet-launch-receipt and are specific to the browser origin: localhost and 127.0.0.1 have different storage.

Required outcome: verify a real launch using its receipt, then display a validated devnet pool/mint detail page and a minimal creator launch history. A global indexer is not required for the first usable version.

Evidence: src/pages/create-pool.tsx; src/components/Explore/queries.ts; src/pages/token/[tokenId].tsx (all under scaffolds/fun-launch).

### 2. P1 — Native DBC buy/sell is absent

The terminal explicitly displays that trading is unavailable. No frontend quote/swap path exists for ungraduated DBC pools. A launchpad demo currently stops at creation.

Required outcome: SDK-based exact-input buy and sell, correct token decimals/integer amounts, visible fees/minimum output/slippage, wallet review, confirmed receipts and balance refresh. Prove both directions on one pool.

Evidence: src/components/Terminal/index.tsx.

### 3. P1 — Migration is configured, not demonstrated

buildLaunchConfig selects DAMM v2, an 85 SOL threshold, a 1% post-migration pool fee, and 50/50 permanently locked creator/partner LP. These are intended configuration values; no migrated pool or positions were verified.

Meteora's documentation says its keepers run on mainnet and its manual migrator supports devnet. Mainnet keeper eligibility depends on documented quote-token/threshold or verification conditions; an 85 SOL setting alone is not proof of automatic migration. Verify eligibility or implement a supported manual migration flow. Reuse existing CLI migration support rather than writing another migration engine.

Required outcome: a completed DBC pool, migration transaction, resulting DAMM v2 pool and verified LP allocation, plus a documented execution mechanism.

Sources: https://docs.meteora.ag/developer-guides/dbc; studio/src/lib/dbc/index.ts; src/lib/server/launch.ts.

### 4. P1 — Studio presentation still overstates implementation

- presets.ts includes ratings and claims such as 1,840 and 2,410 launches without verified usage evidence.
- PresetMarketplace calls its configurations battle-tested and verified, and labels them official/community without attribution evidence.
- Every marketplace card offers Deploy Pool, but create-pool always submits SUPPORTED_PRESET and does not implement those other presets. This can take a user from an equity/DAO preview to a different launch configuration.
- DeveloperStackExporter still claims automatic reinvestment, zero impermanent loss, eliminated slippage, and Backpack/Jupiter interoperability not implemented by this frontend.
- The DAO preview names buildCurveWithCompoundingVault, absent from the installed SDK in the earlier review.

Required outcome: remove unsupported metrics/guarantees, label concepts as previews and only expose deploy actions for supported configs. Describe fee decay as a mechanism, not proven bot immunity.

Evidence: src/components/DBCStudio/{presets,PresetMarketplace,DeveloperStackExporter}.tsx (presets is .ts).

### 5. P1 — The product's differentiation remains disconnected

The deployable launch uses one fixed buildCurve configuration. Studio sliders, quote-token choices and other presets do not feed that configuration. BondingCurveChart uses illustrative points, endpoint interpolation and a heuristic slippage calculation. Exporter SDK code references placeholder config keys; its CLI example does not match this repository's commands. Its JSON is a preview schema, not the deployment payload.

Required outcome: one shared validated config used by deploy, SDK quotes/curve preview and an executable export. The smallest distinctive direction is a verifiable DBC configuration studio; a marketplace additionally needs publishing, validated configs, price/licensing, payment and permissioned use. None is established today.

Evidence: src/lib/server/launch.ts; src/components/DBCStudio/{BondingCurveChart,DeveloperStackExporter}.tsx.

### 6. P2 — Quality gates and public deployment need completion

Build ignores frontend lint/type failures. The frontend lint script still uses next lint with Next 15. Regression checks exist but are not explicitly run in CI. CI has a repository type-check job; inspect its actual passing status rather than assuming the build validates types. Current working changes remain uncommitted.

The upload API accepts signed uploads before proving the wallet has launch rent, so signed callers can store metadata without completing a launch. Per-wallet throttling is not a quota against many wallets. Account-bound public storage should have operational limits before exposure.

Required outcome: clean frontend type/lint checks and automated launch assertions, deployment configuration, storage usage limits and a clear development/production separation. Keep signing keys in wallets; do not store wallet private keys on the server.

## Judging assessment

| Criterion | Where Aegis stands | Evidence needed to improve |
| --- | --- | --- |
| Integration depth | Real DBC config/pool builder; reusable migration CLI. Frontend lacks swaps and verified DAMM v2 lifecycle | Create → buy → sell → graduate → verify resulting liquidity |
| Technical execution | Much better validation, storage, network and receipt handling. Still incomplete lifecycle and quality gates | Reproducible wallet demo, strict checks, error-state coverage |
| Originality/taste | Config studio is relevant, but one fixed anti-snipe launch is not yet a distinctive mechanism | Config-to-preview-to-deploy parity and a concrete builder use case |
| Impact | Potential builder tool; no demonstrated stock/RWA integration or paying user workflow | A useful launch setup used by another builder |
| Traction | No verified mainnet usage, real trading volume or external users established | Honest user counts and explorer-backed activity |

These are qualitative readiness judgments, not official scores or a prediction of placement. The listing's submission count does not show competitors' quality; no competitor-by-competitor review was performed.

## Smallest credible submission plan

1. Verify one real devnet launch and remove Studio's misleading claims/deploy links.
2. Make that pool discoverable through a receipt-linked detail page and minimal creator history.
3. Implement and prove native DBC buy/sell with actual quotes and confirmation.
4. Demonstrate DAMM v2 graduation and verified lock/config values using existing migration support.
5. Connect one editable configuration to preview, deployment and runnable export; avoid adding unused presets.
6. Enforce checks, publish a working demo, provide repository access and record an explorer-backed walkthrough. Consider mainnet only after the lifecycle works and deployment limits are in place.

Do not prioritize DLMM, tokenized stocks, a compounding vault, or a paid marketplace before these essentials. They can increase integration scope without fixing today's user journey.

## Verification and boundaries

- Competition page and official DBC/DAMM v2 guides reread today.
- Current launch, submission, token lookup, chart/export, marketplace, terminal and CI source inspected.
- Offline check-launch.ts passed; git diff --check passed.
- Read-only R2 metadata listing returned zero objects; no user objects were modified.
- Full frontend TypeScript checking did not finish or emit diagnostics during this review and was interrupted; no strict type-check pass is claimed.
- No wallet-funded transaction, live migration, mainnet operation, browser-local receipt inspection, competitor demo audit, or new production build performed. No claim of a confirmed token is made.
