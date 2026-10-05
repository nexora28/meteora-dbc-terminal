import React, { useState } from 'react';
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
  const [specsOpen, setSpecsOpen] = useState(false);

  const filters = [
    { id: 'all', label: 'ALL CURVES', icon: 'ph--lightning-bold' },
    { id: 'anti-snipe', label: 'ANTI-SNIPE SHIELD', icon: 'ph--shield-check-bold' },
    { id: 'rwa', label: 'xSTOCK EQUITIES', icon: 'ph--buildings-bold' },
    { id: 'exponential', label: 'EXPONENTIAL HYPE', icon: 'ph--rocket-launch-bold' },
    { id: 'graduated', label: 'METEORA DLMM', icon: 'ph--diamond-bold' },
  ];

  return (
    <div className="relative mb-4 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-950/70 p-4 md:p-5 backdrop-blur-xl">
      {/* Decorative corner crosshairs */}
      <span className="pointer-events-none absolute top-2 left-2 font-mono text-[10px] text-primary/40 select-none">+</span>
      <span className="pointer-events-none absolute top-2 right-2 font-mono text-[10px] text-primary/40 select-none">+</span>
      <span className="pointer-events-none absolute bottom-2 left-2 font-mono text-[10px] text-primary/40 select-none">+</span>
      <span className="pointer-events-none absolute bottom-2 right-2 font-mono text-[10px] text-primary/40 select-none">+</span>

      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-500/10 blur-[70px]" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Compact Clean Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-mono text-[11px] font-bold tracking-wider text-primary uppercase">
                AEGIS DYNAMIC BONDING TERMINAL
              </span>
              <span className="rounded bg-neutral-800/80 px-1.5 py-0.2 font-mono text-[10px] text-neutral-400">
                SOLANA DEVNET
              </span>
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              Launch & Trade <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-300 to-amber-400">Anti-Snipe Curves</span>
            </h1>
            <p className="mt-1 text-xs text-neutral-400 max-w-xl font-sans">
              Next-gen bonding curves with dynamic 99% fee decay shields and automatic Meteora DLMM graduation.
            </p>
          </div>

          {/* Action Buttons & Expandable Specs Trigger */}
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSpecsOpen(!specsOpen)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-mono font-medium transition-all ${
                specsOpen
                  ? 'border-primary/50 bg-primary/15 text-primary shadow-sm shadow-primary/20'
                  : 'border-white/[0.08] bg-neutral-900/80 text-neutral-300 hover:border-white/[0.15] hover:text-white'
              }`}
            >
              <span className="iconify h-3.5 w-3.5 text-primary ph--shield-check-bold" />
              <span>Protocol Specs</span>
              <span
                className={`iconify h-3 w-3 text-neutral-400 transition-transform duration-200 ${
                  specsOpen ? 'rotate-180 text-primary' : ''
                } ph--caret-down-bold`}
              />
            </button>

            <Link
              href="/studio"
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20 hover:border-primary"
            >
              <span className="iconify h-3.5 w-3.5 ph--cpu-bold" />
              <span>Curve Studio</span>
            </Link>

            <Link
              href="/create-pool"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary via-primary-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="iconify h-3.5 w-3.5 ph--plus-circle-bold" />
              <span>Launch Token</span>
            </Link>
          </div>
        </div>

        {/* Collapsible Protocol Specs Drawer (Compact, uncluttered) */}
        {specsOpen && (
          <div className="rounded-xl border border-white/[0.08] bg-neutral-900/70 p-4 backdrop-blur-md animate-in fade-in-50 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="iconify h-4 w-4 text-primary ph--info-bold" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Aegis Engine Quick Specs
                </span>
              </div>
              <Link
                href="/architecture"
                className="flex items-center gap-1 font-mono text-xs font-bold text-primary hover:underline"
              >
                <span>Read Full Institutional Specs & Mathematics</span>
                <span className="iconify h-3 w-3 ph--arrow-right-bold" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="rounded-lg bg-neutral-950/80 p-2.5 border border-white/[0.04]">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Anti-Snipe Defense</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">99% → 1.25%</div>
                <div className="text-[10px] text-neutral-400 font-mono">Decays over 50 slots</div>
              </div>

              <div className="rounded-lg bg-neutral-950/80 p-2.5 border border-white/[0.04]">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Graduation Target</div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">$69,000 MCAP</div>
                <div className="text-[10px] text-emerald-400/80 font-mono">~85 SOL Migration</div>
              </div>

              <div className="rounded-lg bg-neutral-950/80 p-2.5 border border-white/[0.04]">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">LP Custody</div>
                <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">100% Permanently Locked</div>
                <div className="text-[10px] text-cyan-400/80 font-mono">Burned into Meteora DLMM</div>
              </div>

              <div className="rounded-lg bg-neutral-950/80 p-2.5 border border-white/[0.04]">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Asset Classes</div>
                <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">Meme & xStock Equity</div>
                <div className="text-[10px] text-amber-400/80 font-mono">SOL & USDC Quotes</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Matrix & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => onFilterChange?.(f.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium transition-all ${
                  activeFilter === f.id
                    ? 'bg-primary text-white shadow-md shadow-primary/30 font-bold'
                    : 'bg-neutral-900/80 text-neutral-400 hover:bg-neutral-850 hover:text-white border border-white/[0.04]'
                }`}
              >
                <span className={`iconify h-3 w-3 ${f.icon}`} />
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px] md:min-w-[260px]">
            <span className="iconify pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500 ph--magnifying-glass-bold" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search symbol, name, mint..."
              className="w-full rounded-lg border border-white/[0.08] bg-neutral-900/90 py-1.5 pl-9 pr-3 text-xs text-white placeholder-neutral-500 font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
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
