import React, { useState } from 'react';
import Link from 'next/link';
import { DBCPreset, DBC_PRESETS } from './presets';

interface PresetMarketplaceProps {
  onSelectPreset: (preset: DBCPreset) => void;
}

export const PresetMarketplace: React.FC<PresetMarketplaceProps> = ({ onSelectPreset }) => {
  const [filter, setFilter] = useState<'ALL' | 'MEME' | 'EQUITY' | 'DEGEN' | 'DAO'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPresets = DBC_PRESETS.filter((p) => {
    if (filter === 'ALL') return p.id !== 'custom-studio';
    return p.assetClass === filter;
  });

  const handleCopyPresetJson = (preset: DBCPreset) => {
    const payload = {
      presetId: preset.id,
      name: preset.name,
      buildCurveMode: preset.buildCurveMode,
      quoteToken: preset.quoteToken,
      initialMarketCapSol: preset.initialMarketCapSol,
      migrationMarketCapSol: preset.migrationMarketCapSol,
      migrationQuoteThresholdSol: preset.migrationQuoteThresholdSol,
      fee: {
        antiSnipeFeeEnabled: preset.antiSnipeFeeEnabled,
        startingFeePercent: preset.startingFeePercent,
        endingFeePercent: preset.endingFeePercent,
        decayDurationSlots: preset.feeDecayDurationSlots,
        creatorFeeSharePercent: preset.creatorFeeSharePercent,
      },
      migrationTarget: preset.migrationTarget,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(preset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200 dark:border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="iconify h-5 w-5 text-amber-500 ph--storefront-bold" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground font-mono uppercase">
              DBC Config Preset Marketplace
            </h2>
            <span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
              OFFICIAL & COMMUNITY
            </span>
          </div>
          <p className="mt-1 text-xs md:text-sm text-neutral-300 font-sans">
            Battle-tested algorithmic launchpad parameters verified for maximum liquidity depth, bot protection, and fee accrual.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {(['ALL', 'MEME', 'EQUITY', 'DEGEN', 'DAO'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filter === cat
                  ? 'bg-primary text-white font-bold shadow-md shadow-primary/30'
                  : 'bg-neutral-900/80 text-neutral-300 hover:text-foreground border border-neutral-800'
              }`}
            >
              {cat === 'EQUITY' ? 'xSTOCKS & RWA' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Marketplace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPresets.map((preset) => {
          return (
            <div
              key={preset.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 backdrop-blur-xl transition-all duration-200 hover:border-primary/40 hover:bg-neutral-800/80 shadow-lg hover:shadow-primary/5"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-col">
                    <span className={`inline-block w-fit rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold uppercase mb-1.5 ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {preset.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    <span>{preset.rating || '4.9 ★'}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-200 font-medium">{preset.tagline}</p>
                <p className="text-xs text-neutral-300 mt-2 line-clamp-3 leading-relaxed font-sans">
                  {preset.description}
                </p>

                {/* Metrics Table */}
                <div className="my-4 grid grid-cols-3 gap-2 rounded-xl bg-neutral-900/60 p-2.5 font-mono text-[11px] border border-neutral-800">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block">Settlement</span>
                    <strong className="text-foreground">{preset.quoteToken}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block">Target Cap</span>
                    <strong className="text-foreground">{preset.migrationMarketCapSol} {preset.quoteToken}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block">Creator Yield</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{preset.royaltyYield || '50% Share'}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 border-t border-neutral-800 pt-3.5 mt-2">
                <button
                  type="button"
                  onClick={() => handleCopyPresetJson(preset)}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs font-mono text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-foreground"
                >
                  <span className="iconify h-3.5 w-3.5 ph--code-bold" />
                  <span>{copiedId === preset.id ? 'Copied JSON!' : 'Copy Config'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectPreset(preset)}
                    className="flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-mono font-bold text-primary transition-colors hover:bg-primary/20"
                  >
                    <span>Simulate</span>
                    <span className="iconify h-3.5 w-3.5 ph--play-bold" />
                  </button>

                  <Link href={`/create-pool?preset=${preset.id}`}>
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-mono font-bold text-white shadow-md shadow-primary/30 transition-all hover:bg-primary-500"
                    >
                      <span>Deploy Pool</span>
                      <span className="iconify h-3.5 w-3.5 ph--arrow-right-bold" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
