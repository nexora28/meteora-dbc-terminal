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
    { id: 'anti-snipe', label: 'ANTI-SNIPE (FEE DECAY)', icon: 'ph--shield-check-bold' },
    { id: 'rwa', label: 'RWA & FLOOR SECURED', icon: 'ph--buildings-bold' },
    { id: 'exponential', label: 'EXPONENTIAL HYPETRAIN', icon: 'ph--rocket-launch-bold' },
    { id: 'graduated', label: 'METEORA DLMM', icon: 'ph--diamond-bold' },
  ];

  return (
    <div className="relative mb-4 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-950/70 p-4 md:p-6 backdrop-blur-xl">
      {/* Decorative corner crosshairs */}
      <span className="pointer-events-none absolute top-2 left-2 font-mono text-[10px] text-primary/40 select-none">+</span>
      <span className="pointer-events-none absolute top-2 right-2 font-mono text-[10px] text-primary/40 select-none">+</span>
      <span className="pointer-events-none absolute bottom-2 left-2 font-mono text-[10px] text-primary/40 select-none">+</span>
      <span className="pointer-events-none absolute bottom-2 right-2 font-mono text-[10px] text-primary/40 select-none">+</span>

      {/* Background glow mesh */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top telemetry & Protocol Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-mono text-[11px] font-semibold tracking-wider text-primary uppercase">
              METEORA DYNAMIC BONDING CURVE (DBC) PROTOCOL
            </span>
            <span className="rounded bg-neutral-800/80 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">
              v1.4 DEVNET
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>FEE DECAY: <strong className="text-white">ACTIVE</strong></span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>GRADUATION: <strong className="text-white">$69K MCAP</strong></span>
            </div>
          </div>
        </div>

        {/* Main Content & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Institutional Algorithmic <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-300 to-amber-400">Bonding Curves</span>
            </h1>
            <p className="mt-2 text-xs md:text-sm text-neutral-400 leading-relaxed font-sans">
              Deploy custom programmatic fee curves that extinguish MEV snipers with decaying fees, enforce floor prices for real assets, and automatically migrate permanent liquidity to Meteora DLMM v2.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              href="/create-pool"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-primary-500 to-amber-600 px-5 py-2.5 text-xs md:text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="iconify h-4 w-4 ph--plus-circle-bold" />
              <span>Launch Dynamic Token</span>
            </Link>
            <Link
              href="/studio"
              className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-xs md:text-sm font-bold text-primary transition-all duration-200 hover:bg-primary/20 hover:border-primary"
            >
              <span className="iconify h-4 w-4 ph--cpu-bold" />
              <span>DBC Studio Simulator</span>
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-mono font-black text-primary uppercase">
                Interactive
              </span>
            </Link>
          </div>
        </div>

        {/* Protocol Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[10px] font-mono tracking-wider uppercase">Anti-Snipe Defense</span>
              <span className="iconify h-3.5 w-3.5 text-primary ph--shield-check-bold" />
            </div>
            <div className="text-base md:text-lg font-bold font-mono text-white">99% → 1%</div>
            <div className="text-[10px] text-neutral-400 font-mono">Decays over initial 50 slots</div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[10px] font-mono tracking-wider uppercase">Graduation Destination</span>
              <span className="iconify h-3.5 w-3.5 text-emerald-400 ph--diamond-bold" />
            </div>
            <div className="text-base md:text-lg font-bold font-mono text-white">Meteora DLMM</div>
            <div className="text-[10px] text-emerald-400/90 font-mono">100% Permanently locked LP</div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[10px] font-mono tracking-wider uppercase">Floor Price Security</span>
              <span className="iconify h-3.5 w-3.5 text-cyan-400 ph--chart-line-up-bold" />
            </div>
            <div className="text-base md:text-lg font-bold font-mono text-white">Guaranteed</div>
            <div className="text-[10px] text-cyan-400/90 font-mono">RWA Linear Reserve Backing</div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[10px] font-mono tracking-wider uppercase">Available Presets</span>
              <span className="iconify h-3.5 w-3.5 text-amber-400 ph--sliders-horizontal-bold" />
            </div>
            <div className="text-base md:text-lg font-bold font-mono text-white">4 Architectures</div>
            <div className="text-[10px] text-amber-400/90 font-mono">Fully mathematically tested</div>
          </div>
        </div>

        {/* Filter Matrix & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
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
          <div className="relative min-w-[240px] md:min-w-[280px]">
            <span className="iconify pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500 ph--magnifying-glass-bold" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search by symbol, name, or mint..."
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
