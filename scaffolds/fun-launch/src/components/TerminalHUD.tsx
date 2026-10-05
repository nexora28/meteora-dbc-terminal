import React, { useEffect, useState } from 'react';

export const TerminalHUD: React.FC = () => {
  const [tps, setTps] = useState(2438);
  const [slot, setSlot] = useState(328491820);

  useEffect(() => {
    const interval = setInterval(() => {
      setTps((prev) => 2400 + Math.floor(Math.random() * 80));
      setSlot((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full border-b border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-[11px] font-mono backdrop-blur-md text-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Engine & Network */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-foreground">SOLANA DEVNET</span>
          </div>

          <span className="text-neutral-500">|</span>

          <div className="flex items-center gap-1 text-neutral-400">
            <span>TPS:</span>
            <span className="font-semibold text-foreground">{tps.toLocaleString()}</span>
          </div>

          <span className="text-neutral-500">|</span>

          <div className="flex items-center gap-1 text-neutral-400">
            <span>SLOT:</span>
            <span className="font-semibold text-foreground">{slot.toLocaleString()}</span>
          </div>

          <span className="hidden text-neutral-500 sm:inline">|</span>

          <div className="hidden items-center gap-1 text-neutral-400 sm:flex">
            <span>PRIORITY FEE:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">100k μLamports</span>
          </div>
        </div>

        {/* Right: Meteora DBC Program Engine */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-bold tracking-wider">AEGIS · METEORA DBC</span>
          </div>

          <div className="hidden rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 md:inline-block">
            DAMM v2 POOLS ACTIVE
          </div>
        </div>
      </div>
    </div>
  );
};
