import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Page from '@/components/ui/Page/Page';
import { Button } from '@/components/ui/button';
import {
  DBC_PRESETS,
  DBCPreset,
  PresetSelector,
  BondingCurveChart,
} from '@/components/DBCStudio';

export default function StudioPage() {
  const [selectedPreset, setSelectedPreset] = useState<DBCPreset>(DBC_PRESETS[0]);
  const [copiedCode, setCopiedCode] = useState(false);

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

  const initialMcap =
    selectedPreset.id === 'custom-studio'
      ? customParams.initialMcap
      : selectedPreset.initialMarketCapSol;
  const migrationMcap =
    selectedPreset.id === 'custom-studio'
      ? customParams.migrationMcap
      : selectedPreset.migrationMarketCapSol;
  const migrationThreshold =
    selectedPreset.id === 'custom-studio'
      ? customParams.migrationThreshold
      : selectedPreset.migrationQuoteThresholdSol;

  // JSON export configuration
  const exportConfigJson = JSON.stringify(
    {
      buildCurveMode: selectedPreset.buildCurveMode,
      curveModeName: selectedPreset.curveModeName,
      initialMarketCapSol: initialMcap,
      migrationMarketCapSol: migrationMcap,
      migrationQuoteThresholdSol: migrationThreshold,
      percentageSupplyOnMigration: selectedPreset.percentageSupplyOnMigration,
      fee: {
        antiSnipeFeeEnabled: selectedPreset.antiSnipeFeeEnabled,
        startingFeePercent:
          selectedPreset.id === 'custom-studio'
            ? customParams.startingFee
            : selectedPreset.startingFeePercent,
        endingFeePercent: selectedPreset.endingFeePercent,
        decayDurationSlots: selectedPreset.feeDecayDurationSlots,
        dynamicFeeEnabled: selectedPreset.dynamicFee,
        creatorTradingFeeSharePercent: selectedPreset.creatorFeeSharePercent,
      },
      migration: {
        target: selectedPreset.migrationTarget,
        permanentLockedLiquidityPercentage: 100,
      },
    },
    null,
    2
  );

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(exportConfigJson);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <Page>
      <Head>
        <title>Meteora DBC Studio & Preset Marketplace</title>
        <meta
          name="description"
          content="Simulate and design custom Meteora Dynamic Bonding Curves with anti-sniper fee schedules and DAMM v2 migration."
        />
      </Head>

      <div className="mx-auto w-full max-w-6xl space-y-10 py-6 md:py-10">
        {/* Hero Section */}
        <div className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-925 to-neutral-950 p-6 md:p-10 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
                <span className="iconify h-4 w-4 ph--sparkle-bold" />
                Meteora Invent Hackathon Track
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Dynamic Bonding Curve <span className="text-primary">Studio</span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-neutral-400 leading-relaxed">
                Break free from static bonding curves. Model and launch assets with multi-segment
                curves, decaying anti-snipe fees, RWA floor protections, and automatic migration
                into concentrated Meteora DAMM v2 pools.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/create-pool?preset=${selectedPreset.id}`}>
                <Button className="w-full sm:w-auto h-12 px-6 gap-2 text-base font-semibold shadow-lg shadow-primary/20">
                  <span className="iconify h-5 w-5 ph--rocket-bold" />
                  Launch with This Curve
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-neutral-800/80 pt-6 sm:grid-cols-4">
            <div>
              <div className="text-xs text-neutral-500 font-medium">Curve Primitive</div>
              <div className="mt-1 text-sm md:text-base font-bold text-neutral-100">
                Meteora DBC (v1.5)
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 font-medium">Anti-MEV Defense</div>
              <div className="mt-1 text-sm md:text-base font-bold text-emerald-400">
                Slot-Decay Base Fee
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 font-medium">Graduation Target</div>
              <div className="mt-1 text-sm md:text-base font-bold text-cyan-400">
                DAMM v2 Liquidity
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 font-medium">Curve Customization</div>
              <div className="mt-1 text-sm md:text-base font-bold text-purple-400">
                Up to 16 Segments
              </div>
            </div>
          </div>
        </div>

        {/* Studio Grid: Selector + Simulator */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Preset Selector Panel */}
          <div className="lg:col-span-6 rounded-2xl border border-neutral-850 bg-neutral-925 p-6 space-y-6">
            <PresetSelector
              selectedPreset={selectedPreset}
              onSelectPreset={setSelectedPreset}
              customParams={customParams}
              onUpdateCustomParam={handleUpdateCustomParam}
            />

            <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
              <span className="text-xs text-neutral-400">Ready to deploy this curve configuration?</span>
              <Link href={`/create-pool?preset=${selectedPreset.id}`}>
                <Button size="sm" className="gap-1.5 font-semibold">
                  <span>Create Pool</span>
                  <span className="iconify h-4 w-4 ph--arrow-right-bold" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Real-time Interactive Visualizer Panel */}
          <div className="lg:col-span-6 space-y-6">
            <BondingCurveChart
              preset={selectedPreset}
              customInitialMcap={initialMcap}
              customMigrationMcap={migrationMcap}
              customMigrationThreshold={migrationThreshold}
            />

            {/* Developer Config Export Box */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="iconify h-4 w-4 text-primary ph--code-bold" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Meteora DBC Config Payload
                  </span>
                </div>
                <button
                  onClick={handleCopyConfig}
                  className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-800"
                >
                  <span className="iconify h-3.5 w-3.5 ph--copy-bold" />
                  <span>{copiedCode ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="max-h-48 overflow-y-auto rounded-lg bg-neutral-900/60 p-3 font-mono text-[11px] text-neutral-300">
                {exportConfigJson}
              </pre>
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="rounded-2xl border border-neutral-850 bg-neutral-925 p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Bonding Curve Archetype Comparison
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              How different Meteora DBC configurations perform under live market pressure.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="py-3 pr-4 font-semibold">Preset</th>
                  <th className="py-3 px-4 font-semibold">Ideal Asset Class</th>
                  <th className="py-3 px-4 font-semibold">Curve Shape</th>
                  <th className="py-3 px-4 font-semibold">Anti-Snipe Fee</th>
                  <th className="py-3 px-4 font-semibold">Target Mcap</th>
                  <th className="py-3 pl-4 font-semibold">Graduation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                {DBC_PRESETS.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPreset(p)}
                    className={`cursor-pointer transition-colors hover:bg-neutral-900/50 ${
                      selectedPreset.id === p.id ? 'bg-primary/5 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 pr-4 font-bold text-white flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          selectedPreset.id === p.id ? 'bg-primary' : 'bg-neutral-600'
                        }`}
                      />
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">
                      {p.id === 'rwa-equity'
                        ? 'Tokenized Stocks & RWAs'
                        : p.id === 'anti-snipe'
                          ? 'Community Fair Launch'
                          : p.id === 'exponential-degen'
                            ? 'High-Hype Memecoins'
                            : 'Custom Tailored'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-neutral-400">{p.curveModeName}</td>
                    <td className="py-3.5 px-4">
                      {p.antiSnipeFeeEnabled ? (
                        <span className="text-emerald-400 font-medium">
                          {p.startingFeePercent}% → {p.endingFeePercent}%
                        </span>
                      ) : (
                        <span className="text-neutral-500">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-100">
                      {p.migrationMarketCapSol} SOL
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
