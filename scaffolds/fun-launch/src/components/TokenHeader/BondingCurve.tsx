import { useTokenInfo } from '@/hooks/queries';
import { formatReadablePercentChange } from '@/lib/format/number';
import { cn } from '@/lib/utils';

type BondingCurveProps = {
  className?: string;
};

export const BondingCurve: React.FC<BondingCurveProps> = ({ className }) => {
  const { data: bondingCurve } = useTokenInfo((data) => data?.bondingCurve);
  const progress = Math.min(100, Math.max(0, bondingCurve ?? 25));
  const isBonded = progress >= 100;

  return (
    <div className={cn('flex flex-col gap-2.5 rounded-xl border border-white/[0.08] bg-neutral-900/60 p-3.5 backdrop-blur-sm', className)}>
      <div className="flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', isBonded ? 'bg-emerald-400' : 'bg-primary')} />
            <span className={cn('relative inline-flex rounded-full h-2 w-2', isBonded ? 'bg-emerald-400' : 'bg-primary')} />
          </span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {isBonded ? 'DLMM MIGRATED' : 'DBC GRADUATION PROGRESS'}
          </span>
        </div>
        <span className={cn('text-xs font-black', isBonded ? 'text-emerald-400' : 'text-primary')}>
          {progress.toFixed(1)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-950 border border-white/[0.05]">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            isBonded
              ? 'bg-gradient-to-r from-emerald-500 to-teal-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'bg-gradient-to-r from-primary via-primary-400 to-amber-400 shadow-[0_0_12px_rgba(255,77,0,0.5)]'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Telemetry rows */}
      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
        <div className="flex flex-col rounded-lg bg-neutral-950/60 p-2 border border-white/[0.03]">
          <span className="text-neutral-500 uppercase">Graduation Target</span>
          <span className="font-bold text-white">$69,000 (~85 SOL)</span>
        </div>
        <div className="flex flex-col rounded-lg bg-neutral-950/60 p-2 border border-white/[0.03]">
          <span className="text-neutral-500 uppercase">Anti-Snipe Armor</span>
          <span className="font-bold text-amber-400">Decaying Fee Shield</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-0.5 border-t border-white/[0.04]">
        <span>Destination: <strong className="text-white">Meteora DLMM v2</strong></span>
        <span className="text-emerald-400">🔒 100% Permanently Locked LP</span>
      </div>
    </div>
  );
};

export const MobileBondingCurve: React.FC<BondingCurveProps> = ({ className }) => {
  return <BondingCurve className={cn('my-2', className)} />;
};
