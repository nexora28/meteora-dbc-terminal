# 🌌 Meteora DBC Launch Terminal & Algorithmic Curve Studio

> **Institutional-grade token launch terminal and curve simulator powered by Meteora's Dynamic Bonding Curve (DBC) protocol.**  
> Built for the **$20,000 USDC Superteam Earn Bounty: Best Use of Meteora's Dynamic Bonding Curve**.

[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-14F195?logo=solana&logoColor=black)](https://solana.com)
[![Meteora DBC SDK](https://img.shields.io/badge/Meteora-DBC%20SDK-black?logo=react&logoColor=white)](https://meteora.ag)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ⚡ Problem & Thesis

Current bonding curve launchpads (such as pump.fun or raydium standard bonding) suffer from three critical economic flaws:
1. **Predatory MEV Sniping on Slot 0**: Snipers bundle transactions on the genesis slot to buy massive token allocations with zero price impact, dumping onto retail traders seconds later.
2. **Post-Graduation Liquidity Chasm**: When tokens hit graduation, traditional AMM pools lack capital efficiency, leading to volatile slippage and fractured liquidity.
3. **Rigid One-Size-Fits-All Curves**: Memecoins, tokenized equities (xStocks), and DAO governance tokens are forced into identical bonding equations.

**Meteora DBC Launch Terminal** solves this by leveraging Meteora's Dynamic Bonding Curve protocol to provide:
- **Algorithmic Anti-Snipe Fee Decay**: Genesis transactions incur a **99% trading fee** that safely decays down to 1.25% across the first 50 slots, penalizing MEV bots and redirecting fees to protocol & creator reserves.
- **Stocklana xStock & Tokenized Equity Mode**: Zero-decay, linear reserve floor price paired with USDC and pegged to Ondo RFQ reference rates for asset-backed tokens (`xTSLA`, `xNVDA`, `xAAPL`).
- **Full Stack Liquidity Pipeline**: Smooth automatic transition from **DBC Bonding** ➔ **DAMM v2 Auto-Compounding Vault** ➔ **DLMM Concentrated Liquidity** with 100% permanently locked LP.
- **Interactive Visual Simulator & Preset Marketplace**: Test, simulate, and export code and CLI commands in 1 click before spending a single lamport on-chain.

---

## 🛠️ Architecture & Features

```
                    STAGE 1: DBC BONDING CURVE
     ┌─────────────────────────────────────────────────────────┐
     │  • Anti-Snipe Fee Decay: 99% ➔ 1.25% (over 50 slots)    │
     │  • Asset Classes: Meme Fair Launch (SOL) vs xStock (USDC)│
     │  • Real-Time Dynamic Slippage & Price Impact Analytics  │
     └────────────────────────────┬────────────────────────────┘
                                  │
                  Threshold Reached: $69,000 MCAP (~85 SOL)
                                  ▼
                    STAGE 2: METEORA DAMM v2 VAULT
     ┌─────────────────────────────────────────────────────────┐
     │  • Auto-Compounding Protocol & Creator Fees             │
     │  • Automated Fee-Splitting (80% LP / 20% Creator)       │
     └────────────────────────────┬────────────────────────────┘
                                  │
                                  ▼
                 STAGE 3: DLMM CONCENTRATED LIQUIDITY
     ┌─────────────────────────────────────────────────────────┐
     │  • 100% Permanently Burned / Locked LP                  │
     │  • High-Efficiency Dynamic Volatility Fee Bins          │
     └─────────────────────────────────────────────────────────┘
```

### 1. Preset Marketplace & Curve Simulator (`/studio`)
- **Interactive SVG Curve Visualizer**: Live calculation of token price (SOL/USDC) vs Market Capitalization.
- **Inflow Scrubber**: Test varying levels of buy volume to simulate price impact and calculate exact progress toward DLMM graduation.
- **Curated Archetypes**:
  - `Anti-Snipe Fair Launch` (99% Decay, SOL quote, Meme)
  - `Stocklana Tokenized Equity` (0% Decay, USDC quote, Linear Floor Reserve)
  - `Exponential Hype Curve` (Aggressive upward price discovery)
  - `DAO Conviction & Compounding Vault` (Low decay, high creator yield)
- **Developer Multi-Stack Exporter**: 1-click generation of TypeScript SDK integration snippets (`@meteora-ag/dynamic-bonding-curve-sdk`), Meteora Invent CLI commands, and raw JSON configurations.

### 2. High-Converting Launch Cockpit (`/create-pool`)
- Dual-mode asset selector: **Meme Fair Launch** vs **Stocklana Tokenized Equity (xStocks)**.
- Live avatar image preview and zero-capital fallback upload support.
- Real-time parameter breakdown (Initial Price, Target MCAP, Migration Threshold, Starting Fee).
- Instant Solana Devnet pool creation via Phantom / Solflare wallet adapters.

### 3. Obsidian Cyber-Terminal (`/`)
- Live Solana Devnet HUD ticker displaying TPS, current slot height, prioritized μLamport gas, and DBC engine status.
- High-density terminal view categorizing pools into **New Launches (Active Anti-Snipe Decay)**, **About to Graduate**, and **Graduated to DLMM**.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js >= 20
- pnpm >= 9

```bash
# Clone the repository
git clone https://github.com/nexora28/meteora-dbc-terminal.git
cd meteora-dbc-terminal/scaffolds/fun-launch

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Zero-Capital Cloud Deployment (Vercel)

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import `meteora-dbc-terminal`.
4. Configure Project Settings:
   - **Root Directory**: `scaffolds/fun-launch`
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build`
5. Click **Deploy**.

---

## 🏆 Bounty Evaluation Checklist

- [x] **Novel Bonding Curve Models**: Implemented 99% linearly decaying anti-snipe curves and flat linear floor price equity curves.
- [x] **Asset Class Diversification**: First-class support for `xStocks` (Tokenized Equities paired with USDC) and Memecoins (SOL).
- [x] **Full-Stack Lifecycle**: Complete pipeline visualization from DBC ➔ DAMM v2 Auto-Compounding ➔ DLMM Liquidity Lock.
- [x] **Developer Tooling**: Built-in interactive preset marketplace, JSON exporter, and TypeScript/CLI code generators.
- [x] **Zero-Capital Production**: Graceful fallbacks for public Solana Devnet RPC and metadata generation.
