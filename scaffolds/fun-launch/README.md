# 🛡️ Aegis DBC Launch Terminal & Algorithmic Curve Studio

> **Institutional-grade token launchpad, dynamic bonding simulator, and preset marketplace powered by Meteora DBC v1.5.**  
> Built for the **$20,000 USDC Superteam Earn Bounty: Best Use of Meteora's Dynamic Bonding Curve**.

[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-14F195?logo=solana&logoColor=black)](https://solana.com)
[![Meteora DBC SDK](https://img.shields.io/badge/Meteora-DBC%20SDK%20v1.5-black?logo=react&logoColor=white)](https://meteora.ag)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Jupiter Plugin](https://img.shields.io/badge/Jupiter-Integrated%20Terminal-orange?logo=solana&logoColor=white)](https://jup.ag)

---

## ⚡ The Problem: Why Current Launchpads Fail

Standard bonding curve launchpads (Pump.fun, Moonshot, standard Raydium curves) suffer from 3 systemic economic flaws:

1. **Predatory MEV Sniping on Slot 0:** Snipers bundle transactions into block 0, buying massive token allocations with zero fee penalty or price impact, and dumping on retail minutes later.
2. **One-Size-Fits-All Rigid Curves:** Memecoins, tokenized equities (xStocks), and DAO governance tokens are forced into identical, inflexible equations.
3. **Liquidity Fracturing Post-Graduation:** Tokens migrating to standard AMMs experience massive impermanent loss, high slippage, and zero ongoing yield compounding for creators.

---

## 💡 The Aegis Solution: Powered by Meteora DBC

Aegis solves this by unleashing the unexploited superpowers of **Meteora Dynamic Bonding Curves (DBC)**:

- 🛡️ **Anti-Snipe Fee Shield (99% → 1% Decay):** Slot 0 transactions incur a 99% trading fee that decays linearly over 120 slots (~20 seconds). MEV snipers pay an overwhelming penalty, and extracted fees go straight into protocol & creator reserves.
- 📈 **Stocklana Mode (xStocks & Tokenized RWAs):** Zero-decay linear reserve floor paired with **USDC** rather than SOL, specifically optimized for asset-backed equities (`xTSLA`, `xNVDA`, `xAAPL`) with zero impermanent loss risk.
- 🏦 **Automated 3-Stage Liquidity Pipeline:** 
  $$\text{DBC Dynamic Bonding} \longrightarrow \text{DAMM v2 Auto-Compounding Vault} \longrightarrow \text{DLMM Concentrated Liquidity}$$
  Liquidity is permanently burned and locked, while dynamic fee bins eliminate slippage for secondary trading.
- 🎛️ **Algorithmic Curve Studio & Preset Marketplace:** Interactive visual sandbox allowing developers and launchpad operators to model mathematical slopes, simulate inflow scrubbers, and export production TypeScript SDK payloads in 1 click.
- 🔄 **Integrated Jupiter DEX Terminal:** Full trading support for any migrated token across Raydium, Meteora DLMM, and Orca directly on the token detail page.

---

## 🏗️ 3-Stage Architecture Pipeline

```
              STAGE 1: METEORA DBC BONDING CURVE
┌─────────────────────────────────────────────────────────────────┐
│ • Anti-Snipe Fee Decay: 99% ➔ 1% (over 120 slots)               │
│ • Settlement Quotes: Native SOL or USDC (for Equities/RWAs)     │
│ • Mathematical Model: Customizable Exponential or Linear Slopes │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                 Migration Threshold Reached (~85 SOL / $69K)
                                 ▼
              STAGE 2: METEORA DAMM v2 AUTO-VAULT
┌─────────────────────────────────────────────────────────────────┐
│ • 100% Permanently Locked Liquidity Pool                        │
│ • Creator Dynamic Yield Accrual (Custom 50/50 Fee Split)        │
│ • Continuous Floor Deepening via Auto-Compounding Yield         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
            STAGE 3: DLMM v2 CONCENTRATED LIQUIDITY
┌─────────────────────────────────────────────────────────────────┐
│ • Zero Slippage Volatility Bins                                 │
│ • Full Jupiter Routing & Backpack Onchain Integration           │
│ • Institutional Secondary Market Depth                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎛️ Core Modules

### 1. Explore Terminal (`/`) — Axiom / GMGN Degen Terminal Grade
- **Real-Time Solana Devnet HUD:** Live block slot height, TPS monitor, μLamport gas estimator, and DBC engine status.
- **On-Chain Security & Risk Forensics Strip (Per-Card):**
  - **Dev Wallet Retention (`DEV`):** Color-coded dev balance percentage (0% emerald, ≤5% cyan, ≤12% amber, >12% high-risk rose).
  - **Top 10 Concentration (`TOP10`):** Instant whale dump exposure check.
  - **Mint & Freeze Authority Badges:** `MINT ✓` & `FRZ ✓` verification badges (revocation confirmation).
  - **Sniper / Insider Detector:** Slot 0 bundle detector counter (`0s`).
- **Dynamic Anti-Snipe Fee Decay Radar:**
  - Real-time radar ping showing current decaying fee: `ANTI-SNIPE DECAY: 8.4% ➔ 1.0%` with remaining slots countdown (`~400ms` per slot).
  - Displays `METEORA DLMM ACTIVE: Dynamic 0.25% - 2% fee` upon graduation.
- **Fast 1-Click Buy Execution Suite:**
  - Preset quick-buy chips: `0.1 SOL`, `0.5 SOL`, and `1.0 SOL`.
  - Inline custom amount input: type any SOL amount and hit `BUY` without modal redirects.
- **Three-Tier Density Columns:**
  - `New Pools`: Active bonding pools within the anti-snipe decay window.
  - `Graduating Soon`: Pools above 70% threshold nearing AMM migration.
  - `Migrated / Bonded`: Permanent DLMM pools with locked liquidity.
- **Adaptive Light/Dark Cyberpunk Aesthetics:** High contrast semantic tokens designed for trading desks.

### 2. Algorithmic Curve Studio (`/studio`)
- **Interactive SVG Curve Visualizer:** Dynamic plotting of Token Price vs. Market Capitalization.
- **Dynamic SOL Inflow Scrubber:** Test simulated capital inflows (0 to 150 SOL) to observe exact price impact, fee decay state, and graduation timing.
- **Curated Archetype Presets:**
  - `Anti-Snipe Fair Launch` (99% → 1% decay, SOL quote)
  - `Stocklana Tokenized Equity` (0% decay, USDC quote, linear floor)
  - `Exponential Hype Curve` (Steep price discovery)
  - `DAO Treasury / Low Volatility` (Floor reserve stability)
  - `Custom Studio` (Fine-tune initial cap, migration target, starting fee, and creator share)
- **Developer Multi-Stack Exporter:** Generates ready-to-run TypeScript SDK snippets (`@meteora-ag/dynamic-bonding-curve-sdk`), Meteora Invent CLI commands, and raw JSON configurations.

### 3. Launchpad Cockpit (`/create-pool`)
- Dual-path launch wizard: **Meme / Community Launch** vs **Stocklana Tokenized Equity**.
- Anti-snipe decay configuration with creator royalty allocation.
- Solana Devnet one-click deployment via Phantom or Solflare.

### 4. Mathematical Architecture Specs (`/architecture`)
- Interactive specification book covering:
  - Virtual reserve math ($k = x \cdot y$)
  - Anti-sniper slot decay fee formula:
    $$f(s) = \max\left(f_{\min}, f_{\max} - \frac{s - s_0}{\Delta s} \cdot (f_{\max} - f_{\min})\right)$$
  - DAMM v2 fee compounding mechanics
  - DLMM concentrated liquidity bin transitions

---

## 🎥 2-Minute Demo Video Walkthrough & Script (Voiceover Ready)

> **Pro Tip for Recording:** You **do NOT need to be on camera** or show your face. Record your screen using **OBS Studio**, **Loom**, or **Windows Game Bar** (`Win + G`), then paste this exact script into a free AI voiceover tool (such as **ElevenLabs**, **Clipchamp**, or **CapCut**).

```text
[0:00 - 0:25] THE HOOK & THE AXIOM-STYLE TERMINAL
Screen: Show the Explore Terminal (http://localhost:3000) on Solana Devnet. Hover over the cards, showing the live HUD, the security forensics strip, and theme toggle.
Voiceover:
"This is Aegis: an institutional-grade Solana launch terminal and algorithmic curve simulator powered by Meteora's Dynamic Bonding Curves. Traditional launchpads like Pump.fun are riddled with slot-zero MEV snipers and rigid, one-size-fits-all curves. Aegis turns the tables by pairing the speed and risk forensics of terminals like Axiom and GMGN with Meteora's mathematical fee decay."

[0:25 - 0:50] ON-CHAIN SECURITY FORENSICS & ANTI-SNIPE DECAY
Screen: Zoom in on a Token Card. Hover over DEV hold %, TOP10, MINT/FRZ badges, and the live Anti-Snipe Decay radar. Show the 0.1, 0.5, 1.0 SOL pills and inline input.
Voiceover:
"Notice how every token card comes loaded with on-chain risk telemetry: Dev retention %, Top 10 concentration, and verified mint and freeze authority revocations. Best of all, check out our live Anti-Snipe Decay radar: displaying the starting 20% penalty decaying in real-time down to 1% across active Solana slots, protecting retail from predatory front-runners. And traders can execute instantly with one-click SOL pills or direct inline buys."

[0:50 - 1:20] THE CURVE STUDIO & INFLOW SCRUBBER
Screen: Click 'Curve Studio' in the header. Drag the 'Simulate SOL Inflow' scrubber back and forth to show the SVG curve react in real time.
Voiceover:
"What makes Meteora DBC truly revolutionary is its mathematical flexibility. In our Curve Studio, creators model and stress-test custom bonding curves before touching mainnet. As I scrub simulated SOL inflows, our visualizer recalculates market cap, price impact, and fee decay live on screen."

[1:20 - 1:40] PRESET MARKETPLACE & STOCKLANA EQUITIES
Screen: Click the 'Stocklana Tokenized Equity' preset card. Scroll down to show the Archetype Comparison table and Developer Exporter tabs.
Voiceover:
"We provide four battle-tested presets out of the box—from Anti-Snipe memecoins to Stocklana mode for tokenized real-world equities settled in USDC. And for builders, our multi-stack exporter generates ready-to-run TypeScript SDK snippets and Meteora Invent CLI commands in one click."

[1:40 - 2:00] GRADUATION PIPELINE & BOUNTY CONCLUSION
Screen: Navigate to the graduated pools column or click into a token page to show the DLMM floor and Jupiter swap terminal.
Voiceover:
"Upon hitting graduation, liquidity migrates automatically into Meteora DAMM v2 auto-compounding vaults and DLMM concentrated bins—with 100% of LP permanently burned and locked. Aegis proves that bonding curves can be bot-proof, mathematically expressive, and institutional-ready. Built with Meteora DBC for the Superteam Earn Bounty. Thank you!"
```

---

## 🧪 Testing on Solana Devnet (Judge's 60-Second Quickstart)

Judges can test the entire platform on **Solana Devnet** with zero real capital:

1. **Set Wallet Network:** Open Phantom or Solflare ➔ Settings ➔ Developer Settings ➔ Enable **Solana Devnet**.
2. **Get Free Test SOL:** Request devnet SOL from the official faucet:  
   👉 [https://faucet.solana.com](https://faucet.solana.com)
3. **Visit Live Terminal:** Navigate to the live deployment or run locally:
   ```bash
   pnpm dev
   ```
4. **Test the Studio:** Visit `/studio` to simulate bonding curves and export TypeScript payloads.
5. **Create a Pool:** Visit `/create-pool`, select the **Anti-Snipe Armor** preset, and test on-chain deployment.

---

## 💻 Local Development Setup

```bash
# Clone the repository
git clone https://github.com/nexora28/meteora-dbc-terminal.git
cd meteora-dbc-terminal/scaffolds/fun-launch

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env

# Run development server with Turbopack
pnpm dev

# Run production build check
pnpm build
```

---

## 📦 Zero-Capital Deployment to Vercel

Aegis is optimized for zero-capital, 1-click deployment on Vercel's free tier:

1. Push your repository to GitHub (`https://github.com/nexora28/meteora-dbc-terminal`).
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the `meteora-dbc-terminal` repository.
4. Set the **Root Directory** to `scaffolds/fun-launch`.
5. Set Framework Preset to **Next.js**.
6. Add Environment Variables:
   - `NEXT_PUBLIC_SOLANA_NETWORK=devnet`
   - `NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com`
7. Click **Deploy**.

---

## 📄 License & Attribution

- Built on the open-source **Meteora Invent** toolkit.
- Program SDK: `@meteora-ag/dynamic-bonding-curve-sdk` (v1.5.11).
- License: [MIT](LICENSE).
