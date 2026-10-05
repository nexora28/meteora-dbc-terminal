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

### 1. Explore Terminal (`/`)
- **Real-Time Solana Devnet HUD:** Live block slot height, TPS monitor, μLamport gas estimator, and DBC engine status.
- **Three-Tier Density Columns:**
  - `New Pools`: Active bonding pools within the anti-snipe decay window.
  - `Graduating Soon`: Pools above 70% threshold nearing AMM migration.
  - `Migrated / Bonded`: Permanent DLMM pools with locked liquidity.
- **Quick-Buy Chips & Bonding Progress Bars:** Instant execution and live liquidity tracking.
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
[0:00 - 0:25] THE HOOK & THE EXPLORE TERMINAL
Screen: Show the Explore Terminal (http://localhost:3000) on Solana Devnet. Toggle light and dark mode in the top right.
Voiceover:
"This is Aegis: the institutional-grade launch terminal and curve simulator powered by Meteora's Dynamic Bonding Curve protocol. Traditional launchpads like Pump.fun suffer from slot-zero bot sniping and rigid, one-size-fits-all curves. Aegis changes that. On our Explore Terminal, every pool is categorized across its bonding lifecycle: from active anti-snipe decay, to nearing graduation, to permanently locked Meteora DLMM pools."

[0:25 - 0:55] THE CURVE STUDIO & INFLOW SCRUBBER
Screen: Click 'Curve Studio' in the header. Drag the 'Simulate SOL Inflow' slider back and forth to show the price curve animating.
Voiceover:
"What makes Meteora DBC truly powerful is its mathematical flexibility. In the Aegis Curve Studio, creators and developers can model custom curves before deploying. Watch what happens as I scrub the simulated SOL inflow: the SVG visualizer updates price impact in real time, calculating fee schedules and graduation thresholds dynamically."

[0:55 - 1:25] PRESETS & STOCKLANA EQUITIES
Screen: Click on 'Stocklana Tokenized Equity' preset card, then scroll down to the Archetype Comparison table.
Voiceover:
"We've pre-engineered four battle-tested archetypes. For memecoins, our Anti-Snipe Armor charges bots a 99% fee on slot zero, decaying to 1% over 120 slots. For real-world assets and equities, our Stocklana mode uses USDC settlement and a flat reserve floor to eliminate impermanent loss. And with our Preset Marketplace, deploying any curve is a single click."

[1:25 - 1:45] DEVELOPER EXPORTER & CLI INTEGRATION
Screen: Scroll down to the 'Developer Tooling & Migration Pipeline' section. Click 'TypeScript SDK', 'Invent CLI', and 'Copy Code'.
Voiceover:
"Aegis isn't just a launchpad—it's a developer workbench. Teams can export copy-pasteable TypeScript SDK code and Meteora Invent CLI commands directly from the UI, cutting smart contract deployment time from days to seconds."

[1:45 - 2:05] LAUNCHING ON DEVNET
Screen: Click 'Launch this Curve' or navigate to /create-pool. Show the form with the selected preset loaded.
Voiceover:
"When a creator is ready to launch, our cockpit sets up the token mint, metadata, and bonding parameters on Solana Devnet. Upon hitting graduation, liquidity migrates automatically into Meteora DAMM v2 auto-compounding vaults and DLMM concentrated bins—with 100% of liquidity permanently burned and locked."

[2:05 - 2:20] SUMMARY & METEORA BOUNTY
Screen: Return to the home screen showing the live HUD ticker.
Voiceover:
"Aegis proves that bonding curves can be bot-proof, mathematically expressive, and institutional-ready. Built with Meteora DBC v1.5 for the Superteam Earn Bounty. Thank you."
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
