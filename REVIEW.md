# Aegis launchpad review — 9 October 2026

## Verdict and scope

The project has a useful product direction and a substantial terminal UI, but the current frontend is not a working end-to-end DBC launchpad. Its central advertised features are disconnected from the on-chain configuration, and all five shipped preset launch paths are blocked on the default devnet deployment.

Reviewed the competition listing, frontend routes and providers, creation and submission APIs, preset definitions, simulation and exports, terminal data sources, wallet setup, build configuration, CI, and the supporting DBC CLI implementation. This is a source review plus local checks and read-only devnet RPC verification; no wallet-funded launch, browser walkthrough, migration, or mainnet transaction was performed. Supporting CLI code was examined for reuse and integration, not exhaustively audited across every protocol.

Competition: https://superteam.fun/earn/listing/meteora-dbc. It evaluates meaningful Meteora integration, technical robustness, originality, impact, and traction. Mainnet usage is a preference, not a stated prerequisite. The listed winner announcement is 31 October 2026; this should not be mistaken for the submission deadline.

## Findings, in priority order

### 1. P0 — All shipped preset launch paths are blocked on default devnet

Evidence: `scaffolds/fun-launch/src/components/DBCStudio/presets.ts` and `src/pages/api/upload.ts:199`.

The launch form always supplies the selected preset's hardcoded config address, so the server's `POOL_CONFIG_KEY` fallback cannot repair the normal UI flow. A read-only `getMultipleAccounts` request to `https://api.devnet.solana.com` returned null for all four syntactically valid preset addresses at slot 509163555. The DAO address contains `0` and throws `Non-base58 character` when constructed with the installed Solana SDK. No frontend config-creation flow exists.

Fix: create real DBC configs for the supported network, validate their account owner and decoded parameters, and use those verified addresses; create a new config for genuinely custom launches. Never mark an undeployed preset deployable.

### 2. P1 — Custom launch settings never reach the chain

Evidence: `src/pages/create-pool.tsx:105–113`, `src/pages/api/upload.ts:204–212`.

The request sends only metadata, wallet, mint, preset ID, and config key. Market caps, threshold, starting fee, creator share, curve mode, and quote token are absent. The API ignores preset ID and calls `creator.createPool` against an existing config. Moving sliders changes presentation, not the deployed economics. Website and Twitter fields are also omitted from metadata.

Fix: use a validated SDK config payload as the single source for preview, export, and deployment. Reuse the existing curve-building approach in `studio/src/lib/dbc/index.ts:56–121`.

### 3. P1 — Network configuration contradicts the advertised devnet experience

Evidence: `src/pages/_app.tsx` hardcodes `env: 'mainnet-beta'`; creation/submission APIs default to devnet; `TerminalHUD.tsx` labels everything devnet. README deployment instructions supply `NEXT_PUBLIC_SOLANA_NETWORK` and `NEXT_PUBLIC_SOLANA_RPC`, neither of which is consumed by this app's network wiring.

The terminal uses Jupiter data and swap services without a coherent devnet configuration or a native DBC pre-graduation trading path. A successful devnet launch would not establish that it can be traded through this terminal.

Fix: select one explicit network across wallet, RPC, explorers, indexed data, and trading. Implement DBC quotes/swaps for ungraduated pools; verify aggregator support separately for migrated pools.

### 4. P1 — Fabricated market activity is silently presented as live data

Evidence: `src/components/Explore/queries.ts`, `seedPools.ts`, and `src/components/TerminalHUD.tsx:4–12`.

Failed or empty responses become sample pools, invented holders, fresh-looking sample trades, and a generic description. Even an unknown token address receives another token's sample metadata. Seed pools include invented addresses, verification flags, volume, and LP burn metrics. TPS is random; slot height is a local increment; priority fee is constant. These fallbacks mask outages and create misleading apparent traction.

Fix: make sample mode explicit and visibly label every sample panel. In live mode, show empty, unavailable, or unknown states. Read network telemetry from RPC and validate token addresses before queries.

### 5. P1 — Missing audit data produces affirmative safety claims

Evidence: `src/components/TokenCard/TokenCard.tsx:143–214`.

Unknown developer holdings become 0%; unknown top-holder concentration becomes 12.4%; missing mint/freeze flags satisfy `!== false` and display revoked/safe; missing sniper count becomes zero. This affects live data too, not only seeded pools.

Fix: render unknown explicitly. Only show revoked authority after a positive verification; do not treat missing measurements as safe measurements.

### 6. P1 — Migration, compounding, and liquidity guarantees exceed implementation

Evidence: `src/components/DBCStudio/DeveloperStackExporter.tsx`, `presets.ts`, frontend API routes, and README. Existing CLI migration logic lives in `studio/src/lib/dbc/index.ts:650` but is not wired into this app.

The frontend does not implement its advertised DBC → DAMM v2 → DLMM pipeline, a migration keeper, compounding operations, or verified permanent LP locking. Its DAO preset names `buildCurveWithCompoundingVault`, which is absent from the installed SDK; mode 3 actually maps to `buildCurveWithLiquidityWeights` in the CLI. The CLI's example LP distribution is 90% withdrawable and 10% permanently locked, so using it unchanged would not support the UI's 100% lock claim. Actual on-chain configs must be decoded before any guarantee is made.

Fix: first deliver and prove DBC → DAMM v2. Configure supported compounding and LP lock options explicitly. Treat DLMM as a separate implemented integration, not an automatic consequence of graduation. Remove unsupported claims of zero slippage, zero impermanent loss, and bot-proof behavior.

### 7. P1 — Simulator does not model the configured bonding curve

Evidence: `src/components/DBCStudio/BondingCurveChart.tsx:35–81`.

The plotted curve uses manually supplied points, simulated price linearly interpolates only the endpoints, progress is inflow divided by threshold, and displayed slippage is progress multiplied by 0.08. The plotted curve and simulated marker can disagree. Token decimals, supply, liquidity segments, actual fee schedule, and trade direction are not used. Custom caps do not rebuild the price curve, and USDC presets still use SOL controls/labels. Fee information is displayed, not simulated through slots.

Fix: derive chart and quotes from the same SDK-built config used for launch, using integer token units and supported quote functions. Label any illustrative chart as an illustration until then.

### 8. P1 — Exporter drops custom settings and is not an executable deployment export

Evidence: `src/pages/studio.tsx:177–180` and `src/components/DBCStudio/DeveloperStackExporter.tsx:4–82`.

Studio passes `customParams`, while the component expects `customInitialMcap`, `customMigrationMcap`, and `customMigrationThreshold`. Its SDK snippet only references a shipped, undeployed config; it does not create that config or include custom economics. JSON output is a UI-specific schema rather than the CLI's DBC configuration. The CLI snippet does not match the commands exposed by this repository, which uses `pnpm studio dbc-create-config` and `dbc-create-pool`. An external package's existence was not verified, so no claim is made that the package itself is nonexistent.

Fix: export real, schema-validated configuration and supported repository commands; run the exported example as a check. Include custom fees and creator share.

### 9. P1 — Upload endpoint permits unauthenticated metadata overwrite and storage abuse

Evidence: `src/pages/api/upload.ts:71–96`, `116–175`.

Wallet and mint are caller-supplied strings with no proof of ownership. Object names depend on the supplied mint, so callers can overwrite existing `metadata/<mint>.json` and image keys if R2 is configured. Validation is only truthiness and a data-URL pattern: it does not restrict allowed image types, decoded size, names, symbols, or valid account inputs before storage operations. No application-level rate limit is present.

Fix: verify a wallet-signed challenge or equivalent ownership proof, validate bounded inputs before upload, restrict image content, prevent overwrite, and limit abuse. Do not log full request bodies on transaction submission.

### 10. P1 — Storage failures silently discard token metadata

Evidence: `src/pages/api/upload.ts:28`, `116–161`.

Absent or failed R2 uploads return generic SOL assets instead of persisting the creator's metadata. The public bucket URL is hardcoded independently of the configured bucket. The resulting on-chain URI can point to unrelated or unavailable metadata while the launch flow reports success.

Fix: require working storage for deployment, configure the public base URL, verify uploaded metadata is retrievable, and fail visibly before signing if persistence fails.

### 11. P2 — Quick-buy buttons do not buy or prefill an amount

Evidence: `src/components/TokenCard/TokenCard.tsx:37–49`, `src/pages/token/[tokenId].tsx`, and `src/components/Terminal/index.tsx:44–48`.

Buttons merely navigate with `?buy=...`; neither the token page nor the plugin initialization consumes that amount. Custom parsing also accepts partial numeric strings and infinity. The advertised one-click execution is absent.

Fix: validate a finite positive amount, pass it into a reviewed trade form, and describe the action accurately. Wallet authorization and slippage controls remain necessary.

### 12. P2 — Successful launches have no usable transaction receipt

Evidence: `src/pages/create-pool.tsx:146–150` and `PoolCreationSuccess`.

The server returns a signature, but the frontend keeps only a boolean. The generated mint is not retained for the receipt. Success links to generic Explore, whose indexer is not integrated with the devnet launch. Users and judges cannot follow the created mint or transaction from the result screen.

Fix: retain mint, pool address, signature, and network; link directly to the token and cluster-correct explorer. Handle delayed confirmation separately from a confirmed failure to avoid duplicate retries.

### 13. P2 — WebSocket reconnect lifecycle can stop live updates or reopen after unmount

Evidence: `src/contexts/DataStreamProvider.tsx:197–212`; `next.config.ts` enables React Strict Mode.

Cleanup sets `shouldReconnect` false, but setup never resets it. Strict Mode's setup/cleanup/setup cycle leaves reconnection disabled. Conversely, an already-started reconnect delay calls `init()` without checking the flag again after the delay, allowing a reconnect after unmount. Incoming messages are parsed without validation and transaction history grows without a bound.

Fix: reset lifecycle state on setup, cancel scheduled reconnects or recheck after waiting, validate messages, and cap retained records.

### 14. P2 — Quality checks do not enforce a working frontend

Evidence: `next.config.ts` skips both lint and type validation; `src/pages/studio.tsx:179` has a concrete prop contract mismatch. The frontend has no dedicated test script or executable launch-flow tests discovered in its source tree. Existing validator binaries and account fixtures are infrastructure, not evidence that the new frontend behavior passes tests.

Fix: make frontend type checking mandatory and add focused checks for preset validity, config round-trip, quote/preview parity, unknown safety data, and one devnet create/buy/sell/graduation flow. Do not infer correctness from a production build configured to ignore type errors.

## Competition fit

| Criterion | Assessment |
| --- | --- |
| Meteora integration | Real SDK dependency and create-pool call; substantial reusable CLI support. Core differentiation is not yet deployed by the frontend. |
| Technical execution | Clear blockers in preset accounts, configuration wiring, network consistency, and data integrity. |
| Originality and taste | Studio plus reusable launch presets is a relevant direction. A preset catalog alone does not prove a marketplace or new launch mechanism. |
| Impact | Requires a working use case and reliable exports. USDC pairing and a stock ticker do not establish backing, redemption, price tethering, or Ondo/Backpack integration. |
| Traction | Sample volumes and preset ratings/launch counts are not evidence. No verified usage evidence was established in this review. |

## Recommended implementation order

1. Choose devnet consistently; replace preset placeholders with decoded, verified configs and remove silent sample data from live mode.
2. Connect one supported preset and custom settings to actual config creation; persist metadata and return a verifiable receipt.
3. Implement native DBC buy/sell and quote-derived simulation; prove a real launch through DAMM v2 migration with explicit fee and LP lock configuration.
4. Make SDK/CLI exports executable, fix type checking, and add a small set of regression checks for these flows.
5. Record an honest demo with explorer evidence. Add another asset-class integration or paid preset marketplace only after the core flow works.

The shortest credible submission is a working DBC launch/configuration studio with verifiable DAMM v2 graduation. More UI modules will not resolve the current integration gaps.

## Verification

- Confirmed all preset address outcomes with the installed `@solana/web3.js` constructor.
- Confirmed installed SDK exports: buildCurve, buildCurveWithCustomSqrtPrices, buildCurveWithLiquidityWeights, buildCurveWithMarketCap, buildCurveWithMidPrice, buildCurveWithTwoSegments.
- Confirmed the four valid preset addresses have no accounts on public devnet at RPC slot 509163555.
- Attempted `pnpm build`, `pnpm exec tsc --noEmit`, direct TypeScript checking, and lint. Build reached optimized compilation, reporting that type validation and lint are skipped and that the workspace root was inferred from a parent `package-lock.json`. The checks stopped making observable progress and were interrupted; no build, type-check, or lint pass is claimed. The exporter prop mismatch was verified directly against the source contract, not from compiler output.
- No launch transactions or financial operations were sent. No application code was changed by this review.
