import React from 'react';
import Link from 'next/link';

type ExploreHeroProps = {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
};

export const ExploreHero: React.FC<ExploreHeroProps> = ({
  searchQuery = '',
  onSearchChange,
  activeFilter = 'all',
  onFilterChange,
}) => {
  const filters = [
    { id: 'all', label: 'ALL CURVES', icon: 'ph--lightning-bold' },
    { id: 'anti-snipe', label: 'ANTI-SNIPE', icon: 'ph--shield-check-bold' },
    { id: 'rwa', label: 'xSTOCKS & RWA', icon: 'ph--buildings-bold' },
    { id: 'exponential', label: 'HYPE CURVES', icon: 'ph--rocket-launch-bold' },
    { id: 'graduated', label: 'METEORA DLMM', icon: 'ph--diamond-bold' },
  ];

  return (
    <div className="relative mb-3 w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 p-3.5 md:p-4 backdrop-blur-xl shadow-lg">
      <div className="flex flex-col gap-3">
        {/* Sleek Minimalist Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-indigo-500/25">
              <span className="iconify h-5 w-5 ph--shield-check-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm md:text-base font-bold tracking-tight text-foreground uppercase">
                  Aegis Terminal
                </span>
                <span className="flex items-center gap-1 rounded bg-violet-500/10 border border-violet-500/25 px-1.5 py-0.2 font-mono text-[9px] font-bold text-violet-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                  DBC v1.5
                </span>
                <span className="rounded bg-neutral-800 px-1.5 py-0.2 font-mono text-[9px] text-neutral-300">
                  DEVNET
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 font-sans">
                Bot-proof fair launches with 99% anti-snipe fee decay & permanent Meteora DLMM migration.
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link
              href="/docs"
              className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs font-mono font-medium text-neutral-200 transition-all hover:bg-neutral-800 hover:text-foreground"
            >
              <span className="iconify h-3.5 w-3.5 text-violet-400 ph--book-open-bold" />
              <span>Docs & Math ↗</span>
            </Link>

            <Link
              href="/studio"
              className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-mono font-bold text-violet-400 transition-all hover:bg-violet-500/20"
            >
              <span className="iconify h-3.5 w-3.5 ph--cpu-bold" />
              <span>Simulator</span>
            </Link>

            <Link
              href="/create-pool"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="iconify h-3.5 w-3.5 ph--plus-circle-bold" />
              <span>Launch</span>
            </Link>
          </div>
        </div>

        {/* Filter Matrix & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 border-t border-neutral-800 pt-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => onFilterChange?.(f.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono transition-all ${
                  activeFilter === f.id
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30 font-bold'
                    : 'bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 hover:text-foreground border border-neutral-800'
                }`}
              >
                <span className={`iconify h-3 w-3 ${f.icon}`} />
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] md:min-w-[260px]">
            <span className="iconify pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 ph--magnifying-glass-bold" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Filter symbol, name, mint..."
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-1 pl-9 pr-3 text-xs text-foreground placeholder-neutral-400 font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground"
              >
                <span className="iconify h-3 w-3 ph--x-bold" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreHero;
