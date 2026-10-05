import React from 'react';
import { DBCPreset, DBC_PRESETS } from './presets';

interface PresetSelectorProps {
  selectedPreset: DBCPreset;
  onSelectPreset: (preset: DBCPreset) => void;
  customParams: {
    initialMcap: number;
    migrationMcap: number;
    migrationThreshold: number;
    startingFee: number;
    creatorFeeShare: number;
  };
  onUpdateCustomParam: (key: string, value: number) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  customParams,
  onUpdateCustomParam,
}) => {
  const getPresetIcon = (id: string) => {
    switch (id) {
      case 'anti-snipe':
        return 'ph--shield-check-bold';
      case 'rwa-equity':
        return 'ph--buildings-bold';
      case 'exponential-degen':
        return 'ph--fire-bold';
      case 'dao-conviction':
        return 'ph--bank-bold';
      default:
        return 'ph--faders-bold';
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <span className="iconify h-4 w-4 ph--squares-four-bold" />
            </div>
            <h2 className="text-base md:text-lg font-bold tracking-tight text-foreground font-mono uppercase">
              Bonding Curve Archetypes
            </h2>
          </div>
          <span className="rounded-full border border-neutral-800 bg-neutral-900/80 px-2.5 py-0.5 font-mono text-[10px] text-neutral-300">
            DBC v1.5
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-1 font-sans">
          Select a curve archetype or customize parameters below.
        </p>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DBC_PRESETS.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          const icon = getPresetIcon(preset.id);

          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group relative cursor-pointer rounded-xl border p-3.5 transition-all duration-200 ${
                isSelected
                  ? 'border-violet-500/80 bg-gradient-to-b from-violet-500/[0.12] to-indigo-500/[0.04] shadow-[0_0_25px_-5px_rgba(139,92,246,0.3)] ring-1 ring-violet-500/40'
                  : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-violet-500 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-300 group-hover:text-foreground'
                    }`}
                  >
                    <span className={`iconify h-4 w-4 ${icon}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {preset.name}
                    </h3>
                    <span className={`inline-block rounded-full border px-2 py-0.2 text-[9px] font-mono font-semibold uppercase ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                  </div>
                </div>

                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                    isSelected ? 'border-violet-500 bg-gradient-to-r from-violet-600 to-cyan-500' : 'border-neutral-700'
                  }`}
                >
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </div>

              <div className="mt-2">
                <p className="text-[11px] text-neutral-300 font-sans">{preset.tagline}</p>
              </div>

              {/* Key specs pill */}
              <div className="mt-3.5 flex items-center justify-between border-t border-neutral-800 pt-2.5 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-neutral-800/80 px-1.5 py-0.5 text-[9px] font-bold text-neutral-200 uppercase border border-neutral-700">
                    {preset.quoteToken} PAIR
                  </span>
                  <span className="text-neutral-400 text-[10px]">
                    Cap: <strong className="text-foreground">{preset.migrationMarketCapSol} {preset.quoteToken}</strong>
                  </span>
                </div>
                <span className="text-neutral-400 text-[10px]">
                  Target: <strong className="text-emerald-600 dark:text-emerald-400">{preset.migrationQuoteThresholdSol} {preset.quoteToken}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Pro Parameters (Only shown when Custom Studio is selected) */}
      {selectedPreset.id === 'custom-studio' && (
        <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-5 space-y-4 shadow-sm dark:shadow-[0_0_30px_-8px_rgba(168,85,247,0.2)]">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="iconify h-4 w-4 text-purple-400 ph--sliders-bold" />
              <div>
                <h4 className="text-sm font-bold text-foreground">Custom Curve Engine Parameters</h4>
                <p className="text-[11px] text-purple-300/80">Fine-tune curve slope & fee schedules</p>
              </div>
            </div>
            <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-300">
              INTERACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="flex justify-between font-mono text-xs mb-1.5">
                <span className="text-neutral-500 dark:text-neutral-400">Starting Valuation</span>
                <span className="font-bold text-primary">{customParams.initialMcap} SOL</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={customParams.initialMcap}
                onChange={(e) => onUpdateCustomParam('initialMcap', Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono text-xs mb-1.5">
                <span className="text-neutral-500 dark:text-neutral-400">Migration Valuation</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{customParams.migrationMcap} SOL</span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="50"
                value={customParams.migrationMcap}
                onChange={(e) => onUpdateCustomParam('migrationMcap', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono text-xs mb-1.5">
                <span className="text-neutral-500 dark:text-neutral-400">DAMM v2 Migration Threshold</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{customParams.migrationThreshold} SOL</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="5"
                value={customParams.migrationThreshold}
                onChange={(e) => onUpdateCustomParam('migrationThreshold', Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono text-xs mb-1.5">
                <span className="text-neutral-500 dark:text-neutral-400">Anti-Snipe Starting Fee</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{customParams.startingFee}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="99"
                step="1"
                value={customParams.startingFee}
                onChange={(e) => onUpdateCustomParam('startingFee', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
