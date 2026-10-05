import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Page from '@/components/ui/Page/Page';

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<'mechanics' | 'math' | 'pipeline' | 'specs'>('mechanics');

  return (
    <Page>
      <Head>
        <title>Protocol Architecture & Mathematical Specs | Aegis DBC</title>
        <meta
          name="description"
          content="In-depth technical architecture of Aegis Dynamic Bonding Curves: anti-snipe fee decay, linear floor reserves, and Meteora DLMM graduation."
        />
      </Head>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="iconify h-3.5 w-3.5 ph--arrow-left-bold" />
              <span>Aegis Terminal</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Institutional Architecture</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  AEGIS DBC CORE SPECIFICATIONS
                </span>
                <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                  METEORA INVENT v1.5
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">
                Institutional Algorithmic <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-500 to-amber-500">Bonding Engine</span>
              </h1>
              <p className="mt-2 text-xs md:text-sm text-neutral-300 max-w-3xl leading-relaxed">
                Complete technical, economic, and mathematical breakdown of Aegis launch mechanics: multi-segment fee decay, MEV bot neutralization, Stocklana linear reserve pricing, and automated Meteora DLMM v2 liquidity graduation.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/studio"
                className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
              >
                <span className="iconify h-4 w-4 ph--cpu-bold" />
                <span>Test in Simulator</span>
              </Link>
              <Link
                href="/create-pool"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-primary-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span className="iconify h-4 w-4 ph--rocket-launch-bold" />
                <span>Launch Token</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
          {[
            { id: 'mechanics', label: '1. Anti-Snipe Mechanics', icon: 'ph--shield-check-bold' },
            { id: 'math', label: '2. Bonding Curve Equations', icon: 'ph--function-bold' },
            { id: 'pipeline', label: '3. DLMM Liquidity Pipeline', icon: 'ph--git-fork-bold' },
            { id: 'specs', label: '4. Network & Contract Specs', icon: 'ph--terminal-window-bold' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-mono font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white font-bold shadow-md shadow-primary/25'
                  : 'bg-neutral-900/80 text-neutral-300 hover:bg-neutral-850 hover:text-foreground border border-neutral-800'
              }`}
            >
              <span className={`iconify h-3.5 w-3.5 ${tab.icon}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Anti-Snipe Mechanics */}
        {activeTab === 'mechanics' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-rose-500 mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">The Problem: Slot 0 Sniping</span>
                  <span className="iconify h-5 w-5 ph--warning-circle-bold" />
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  On standard Solana bonding curves, MEV searchers use Jito bundles to purchase up to 40% of the token supply in block 0 with minimal slippage, instantly dumping onto retail purchasers in subsequent blocks.
                </p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-primary mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">Aegis Solution: 99% Decay Shield</span>
                  <span className="iconify h-5 w-5 ph--shield-check-bold" />
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  Aegis initializes bonding curves with a dynamic <strong>99% trading fee</strong> on slot 0. MEV bots attempting to frontrun or bundle are penalized 99% of their capital, which routes directly into creator & protocol reserve pools.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">Retail Safe Zone</span>
                  <span className="iconify h-5 w-5 ph--check-circle-bold" />
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  Over the first 50 slots (~20 seconds), trading fees decay linearly from 99% down to 1.25%. Legitimate participants entering past the decay window trade with baseline 1% standard swap fees.
                </p>
              </div>
            </div>

            {/* Visual Decay Timeline */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground mb-4">
                Slot-Based Linear Fee Decay Progression
              </h2>

              <div className="relative overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400">
                      <th className="pb-3 font-semibold">Slot Phase</th>
                      <th className="pb-3 font-semibold">Time Elapsed</th>
                      <th className="pb-3 font-semibold">Dynamic Trading Fee</th>
                      <th className="pb-3 font-semibold">MEV Bot Outcome</th>
                      <th className="pb-3 font-semibold">Fee Destination</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    <tr>
                      <td className="py-3 font-bold text-rose-500">Slot 0 (Genesis)</td>
                      <td className="py-3 text-neutral-400">0.00s</td>
                      <td className="py-3 font-bold text-rose-500">99.00%</td>
                      <td className="py-3 text-neutral-200">Total economic loss (sniper neutralized)</td>
                      <td className="py-3 text-primary font-semibold">Creator Vault + Reserve</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-amber-500">Slot 15</td>
                      <td className="py-3 text-neutral-400">~6.0s</td>
                      <td className="py-3 font-bold text-amber-500">69.50%</td>
                      <td className="py-3 text-neutral-200">Severe penalty for aggressive bots</td>
                      <td className="py-3 text-primary font-semibold">Creator Vault + Reserve</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-cyan-600 dark:text-cyan-400">Slot 35</td>
                      <td className="py-3 text-neutral-400">~14.0s</td>
                      <td className="py-3 font-bold text-cyan-600 dark:text-cyan-400">30.25%</td>
                      <td className="py-3 text-neutral-200">Moderate penalty; high slippage protection</td>
                      <td className="py-3 text-primary font-semibold">Creator Vault + Reserve</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">Slot 50+ (Stable)</td>
                      <td className="py-3 text-neutral-400">~20.0s+</td>
                      <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">1.25%</td>
                      <td className="py-3 text-neutral-200">Standard fair retail trading active</td>
                      <td className="py-3 text-neutral-400">Standard LP fee split</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Equations */}
        {activeTab === 'math' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">Archetype 1</span>
                <h3 className="text-base font-bold text-foreground mt-1 mb-3">Anti-Snipe Fair Launch Curve</h3>
                <div className="rounded-lg bg-neutral-950 p-3 font-mono text-xs text-amber-600 dark:text-amber-300 mb-3 border border-neutral-800">
                  P(s) = P_0 + k · (s / S_max)^1.6
                </div>
                <ul className="text-xs text-neutral-300 space-y-1.5 font-sans">
                  <li>• Initial Market Cap: <strong>$5,000 USD (~6.25 SOL)</strong></li>
                  <li>• Migration Target: <strong>$69,000 USD (~85 SOL)</strong></li>
                  <li>• Quote Mint: <strong>Wrapped SOL (WSOL)</strong></li>
                  <li>• Mathematical curve steepens moderately near graduation to incentivize organic price discovery.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 shadow-sm">
                <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold">Archetype 2</span>
                <h3 className="text-base font-bold text-foreground mt-1 mb-3">Stocklana Tokenized Equity Curve</h3>
                <div className="rounded-lg bg-neutral-950 p-3 font-mono text-xs text-cyan-600 dark:text-cyan-300 mb-3 border border-neutral-800">
                  P(s) = Floor_Price + m · s  (Non-Decaying)
                </div>
                <ul className="text-xs text-neutral-300 space-y-1.5 font-sans">
                  <li>• Initial Valuation: <strong>$100,000 USDC</strong></li>
                  <li>• Migration Target: <strong>$500,000 USDC</strong></li>
                  <li>• Quote Mint: <strong>USDC (Tokenkeg)</strong></li>
                  <li>• Guaranteed linear reserve floor price designed for <code>xTSLA</code>, <code>xNVDA</code>, and asset-backed instruments.</li>
                </ul>
              </div>
            </div>

            {/* Fee Decay Formula */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground mb-2">
                Programmatic Fee Decay Function
              </h3>
              <p className="text-xs text-neutral-300 mb-3">
                Calculated deterministically on-chain per slot without requiring off-chain keepers or oracles:
              </p>
              <div className="rounded-lg bg-neutral-950 p-4 font-mono text-xs text-primary border border-neutral-800">
                F(slot) = max(F_terminal, F_initial - ( (F_initial - F_terminal) · min(1.0, (slot - slot_genesis) / decay_slots) ))
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: DLMM Pipeline */}
        {activeTab === 'pipeline' && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-sm">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground mb-4">
                3-Stage Liquidity Transition Pipeline
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <span className="font-mono text-[10px] font-bold text-primary uppercase">Stage 01</span>
                  <h4 className="text-sm font-bold text-foreground mt-1 mb-2">DBC Bonding Curve</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Tokens trade on programmatic bonding curves with anti-snipe fee shields. All quote reserves accumulate securely in the protocol vault.
                  </p>
                  <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] font-mono text-neutral-200">
                    Threshold: <strong>$69,000 MCAP</strong>
                  </div>
                </div>

                <div className="flex flex-col rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Stage 02</span>
                  <h4 className="text-sm font-bold text-foreground mt-1 mb-2">DAMM v2 Vault</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Upon reaching graduation, reserves enter the Meteora DAMM v2 auto-compounding fee vault, programmatically splitting fees between LP and creator.
                  </p>
                  <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] font-mono text-neutral-200">
                    Split: <strong>80% LP / 20% Creator</strong>
                  </div>
                </div>

                <div className="flex flex-col rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Stage 03</span>
                  <h4 className="text-sm font-bold text-foreground mt-1 mb-2">DLMM Concentrated Liquidity</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    100% of initial LP tokens are permanently burned or locked. Liquidity distributes into dynamic volatility bins for zero-slippage market depth.
                  </p>
                  <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] font-mono text-neutral-200">
                    Lock: <strong>100% Permanent</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Network & Specs */}
        {activeTab === 'specs' && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-sm">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground mb-4">
                Deployment & Program Verification
              </h2>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800 gap-2">
                  <span className="text-neutral-400">Solana Network</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Devnet (Genesis Testnet)</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800 gap-2">
                  <span className="text-neutral-400">Meteora DBC Program ID</span>
                  <span className="font-bold text-foreground select-all">dbcv2Zg3dE5y7VnSmjPzVv9Yk4Vj3p7L7x9</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800 gap-2">
                  <span className="text-neutral-400">Meteora DLMM Program ID</span>
                  <span className="font-bold text-foreground select-all">LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800 gap-2">
                  <span className="text-neutral-400">Core SDK</span>
                  <span className="font-bold text-primary">@meteora-ag/dynamic-bonding-curve-sdk@1.5.11</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
