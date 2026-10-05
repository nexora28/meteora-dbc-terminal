import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Page from '@/components/ui/Page/Page';
import { Button } from '@/components/ui/button';
import {
  BondingCurveChart,
  PresetSelector,
  PresetMarketplace,
  DeveloperStackExporter,
  DBC_PRESETS,
  DBCPreset,
} from '@/components/DBCStudio';

export default function StudioPage() {
  const [selectedPreset, setSelectedPreset] = useState<DBCPreset>(DBC_PRESETS[0]);
  const [studioView, setStudioView] = useState<'simulator' | 'marketplace'>('simulator');
  const [customParams, setCustomParams] = useState({
    initialMcap: 25,
    migrationMcap: 600,
    migrationThreshold: 80,
    startingFee: 10,
    creatorFeeShare: 50,
  });

  const handleUpdateCustomParam = (key: string, value: number) => {
    setCustomParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectMarketplacePreset = (preset: DBCPreset) => {
    setSelectedPreset(preset);
    setStudioView('simulator');
  };

  return (
    <Page>
      <Head>
        <title>Aegis Curve Studio & Preset Marketplace | Meteora DBC</title>
        <meta
          name="description"
          content="Simulate and design custom Meteora Dynamic Bonding Curves with anti-sniper fee schedules, Stocklana equity pair support, and DAMM v2 migration."
        />
      </Head>

      <div className="mx-auto w-full max-w-6xl space-y-8 py-6 md:py-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white/80 dark:bg-neutral-950/80 p-6 md:p-10 shadow-xl dark:shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/15 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-[90px]" />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
                <span className="iconify h-4 w-4 ph--sparkle-bold" />
                Meteora Superteam Earn Track ($20,000 USDC)
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white md:text-5xl">
                Dynamic Bonding <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-500 to-amber-500">Studio</span>
              </h1>
              <p className="mt-3 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                The institutional algorithmic playground for Meteora DBC. Model multi-segment curves, simulate 99% anti-snipe fee decay, launch USDC-settled Stocklana equities, and export production SDK payloads.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href={`/create-pool?preset=${selectedPreset.id}`}>
                <Button className="w-full sm:w-auto h-11 px-5 gap-2 text-sm font-bold shadow-lg shadow-primary/25 bg-primary text-white hover:bg-primary-500">
                  <span className="iconify h-4 w-4 ph--rocket-launch-bold" />
                  Launch this Curve
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-neutral-200 dark:border-white/[0.06] pt-6 sm:grid-cols-4 font-mono text-xs">
            <div>
              <div className="text-neutral-500 dark:text-neutral-400 text-[10px] uppercase">DBC Engine</div>
              <div className="mt-1 font-bold text-neutral-900 dark:text-white">Meteora DBC v1.5</div>
            </div>
            <div>
              <div className="text-neutral-500 dark:text-neutral-400 text-[10px] uppercase">Bot Protection</div>
              <div className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">Slot Decay (99% → 1%)</div>
            </div>
            <div>
              <div className="text-neutral-500 dark:text-neutral-400 text-[10px] uppercase">Asset Class Support</div>
              <div className="mt-1 font-bold text-cyan-600 dark:text-cyan-400">Memes, xStocks & RWAs</div>
            </div>
            <div>
              <div className="text-neutral-500 dark:text-neutral-400 text-[10px] uppercase">Graduation Pool</div>
              <div className="mt-1 font-bold text-primary">DLMM & DAMM v2 Locked</div>
            </div>
          </div>
        </div>

        {/* View Switcher: Interactive Simulator vs Preset Marketplace */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStudioView('simulator')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs md:text-sm font-mono font-bold transition-all ${
                studioView === 'simulator'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-neutral-100 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/5'
              }`}
            >
              <span className="iconify h-4 w-4 ph--cpu-bold" />
              <span>Interactive Curve Simulator</span>
            </button>

            <button
              onClick={() => setStudioView('marketplace')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs md:text-sm font-mono font-bold transition-all ${
                studioView === 'marketplace'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-neutral-100 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/5'
              }`}
            >
              <span className="iconify h-4 w-4 ph--storefront-bold" />
              <span>Preset Marketplace</span>
              <span className="rounded bg-amber-400/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                POPULAR
              </span>
            </button>
          </div>

          <span className="hidden sm:inline-block font-mono text-[11px] text-neutral-500">
            Current: <strong className="text-neutral-900 dark:text-white">{selectedPreset.name}</strong>
          </span>
        </div>

        {/* Main View Area */}
        {studioView === 'marketplace' ? (
          <PresetMarketplace onSelectPreset={handleSelectMarketplacePreset} />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* Left 5 cols: Preset & Parameter Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="terminal-panel rounded-2xl p-5 sm:p-6">
                <PresetSelector
                  selectedPreset={selectedPreset}
                  onSelectPreset={setSelectedPreset}
                  customParams={customParams}
                  onUpdateCustomParam={handleUpdateCustomParam}
                />
              </div>

              {/* Economic Summary */}
              <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.06] bg-neutral-100/80 dark:bg-neutral-950/40 p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Estimated Creator Revenue</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ~{(selectedPreset.migrationQuoteThresholdSol * (selectedPreset.creatorFeeSharePercent / 100) * 0.05).toFixed(2)}{' '}
                    {selectedPreset.quoteToken}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Decay Slot Window</span>
                  <span className="text-neutral-900 dark:text-white">
                    {selectedPreset.decayDurationSlots > 0
                      ? `${selectedPreset.decayDurationSlots} slots (~20s)`
                      : 'None (Linear Floor)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Graduation Target</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">{selectedPreset.migrationTarget}</span>
                </div>
              </div>
            </div>

            {/* Right 7 cols: Curve Visualizer & Live Inflow Scrubber */}
            <div className="lg:col-span-7 space-y-6">
              <BondingCurveChart
                preset={selectedPreset}
                customInitialMcap={
                  selectedPreset.id === 'custom-studio' ? customParams.initialMcap : undefined
                }
                customMigrationMcap={
                  selectedPreset.id === 'custom-studio' ? customParams.migrationMcap : undefined
                }
                customMigrationThreshold={
                  selectedPreset.id === 'custom-studio' ? customParams.migrationThreshold : undefined
                }
              />
            </div>
          </div>
        )}

        {/* Developer Multi-Stack Code & CLI Exporter */}
        <DeveloperStackExporter
          preset={selectedPreset}
          customParams={selectedPreset.id === 'custom-studio' ? customParams : undefined}
        />

        {/* Feature Comparison Matrix */}
        <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white/80 dark:bg-neutral-950/70 p-6 md:p-8 space-y-6 backdrop-blur-xl shadow-xl">
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-neutral-900 dark:text-white font-mono uppercase">
              Bonding Curve Archetype Comparison
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-sans">
              Comparing how Meteora DBC configurations perform across different market conditions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-white/[0.06] text-neutral-500 dark:text-neutral-400 uppercase text-[10px]">
                  <th className="py-3 pr-4 font-semibold">Preset</th>
                  <th className="py-3 px-4 font-semibold">Target Asset</th>
                  <th className="py-3 px-4 font-semibold">Quote Token</th>
                  <th className="py-3 px-4 font-semibold">Anti-Snipe Armor</th>
                  <th className="py-3 px-4 font-semibold">Target Cap</th>
                  <th className="py-3 pl-4 font-semibold">Migration Vault</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/[0.04] text-neutral-700 dark:text-neutral-300">
                {DBC_PRESETS.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPreset(p)}
                    className={`cursor-pointer transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900/60 ${
                      selectedPreset.id === p.id ? 'bg-primary/10 font-bold text-neutral-900 dark:text-white' : ''
                    }`}
                  >
                    <td className="py-3.5 pr-4 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          selectedPreset.id === p.id ? 'bg-primary' : 'bg-neutral-400 dark:bg-neutral-600'
                        }`}
                      />
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300">
                      {p.badge}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-cyan-600 dark:text-cyan-400">
                      {p.quoteToken}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.antiSnipeFeeEnabled ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {p.startingFeePercent}% → {p.endingFeePercent}%
                        </span>
                      ) : (
                        <span className="text-neutral-500">Linear Floor (0%)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                      {p.migrationMarketCapSol} {p.quoteToken}
                    </td>
                    <td className="py-3.5 pl-4 font-semibold text-primary">{p.migrationTarget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Page>
  );
}
