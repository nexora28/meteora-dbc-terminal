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
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white/80 dark:bg-neutral-950/80 p-5 md:p-7 shadow-xl dark:shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-600/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-[100px]" />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-400 mb-2">
                <span className="iconify h-3.5 w-3.5 ph--sparkle-bold" />
                Meteora DBC v1.5 Engine
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-4xl">
                Dynamic Bonding <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">Studio</span>
              </h1>
              <p className="mt-1 text-xs md:text-sm text-neutral-400 font-sans">
                Simulate multi-segment DBC curves, test anti-snipe fee decay, and export production SDK configs.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href="/docs">
                <Button variant="outline" className="h-10 px-4 gap-1.5 text-xs font-mono border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white">
                  <span className="iconify h-3.5 w-3.5 text-violet-400 ph--book-open-bold" />
                  Docs & Math ↗
                </Button>
              </Link>
              <Link href={`/create-pool?preset=${selectedPreset.id}`}>
                <Button className="h-10 px-4 gap-2 text-xs md:text-sm font-bold shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 text-white border-0 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <span className="iconify h-4 w-4 ph--rocket-launch-bold" />
                  Launch this Curve
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* View Switcher: Interactive Simulator vs Preset Marketplace */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStudioView('simulator')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs md:text-sm font-mono font-bold transition-all ${
                studioView === 'simulator'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-neutral-900/80 text-neutral-300 hover:text-foreground border border-neutral-800'
              }`}
            >
              <span className="iconify h-4 w-4 ph--cpu-bold" />
              <span>Interactive Curve Simulator</span>
            </button>

            <button
              onClick={() => setStudioView('marketplace')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs md:text-sm font-mono font-bold transition-all ${
                studioView === 'marketplace'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-neutral-900/80 text-neutral-300 hover:text-foreground border border-neutral-800'
              }`}
            >
              <span className="iconify h-4 w-4 ph--storefront-bold" />
              <span>Preset Marketplace</span>
              <span className="rounded bg-cyan-400/20 border border-cyan-400/30 px-1.5 py-0.2 text-[9px] font-bold text-cyan-400">
                POPULAR
              </span>
            </button>
          </div>

          <span className="hidden sm:inline-block font-mono text-[11px] text-neutral-400">
            Current: <strong className="text-foreground">{selectedPreset.name}</strong>
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
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Estimated Creator Revenue</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ~{(selectedPreset.migrationQuoteThresholdSol * (selectedPreset.creatorFeeSharePercent / 100) * 0.05).toFixed(2)}{' '}
                    {selectedPreset.quoteToken}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Decay Slot Window</span>
                  <span className="text-foreground font-semibold">
                    {selectedPreset.decayDurationSlots > 0
                      ? `${selectedPreset.decayDurationSlots} slots (~20s)`
                      : 'None (Linear Floor)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
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
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 md:p-8 space-y-6 backdrop-blur-xl shadow-xl">
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground font-mono uppercase">
              Bonding Curve Archetype Comparison
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-sans">
              Meteora DBC configuration parameters across asset classes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px]">
                  <th className="py-3 pr-4 font-semibold">Preset</th>
                  <th className="py-3 px-4 font-semibold">Target Asset</th>
                  <th className="py-3 px-4 font-semibold">Quote Token</th>
                  <th className="py-3 px-4 font-semibold">Anti-Snipe Armor</th>
                  <th className="py-3 px-4 font-semibold">Target Cap</th>
                  <th className="py-3 pl-4 font-semibold">Migration Vault</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-200">
                {DBC_PRESETS.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPreset(p)}
                    className={`cursor-pointer transition-colors hover:bg-neutral-800/50 ${
                      selectedPreset.id === p.id ? 'bg-primary/10 font-bold text-foreground' : ''
                    }`}
                  >
                    <td className="py-3.5 pr-4 font-bold text-foreground flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          selectedPreset.id === p.id ? 'bg-primary' : 'bg-neutral-400 dark:bg-neutral-600'
                        }`}
                      />
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">
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
                        <span className="text-neutral-400">Linear Floor (0%)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">
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
