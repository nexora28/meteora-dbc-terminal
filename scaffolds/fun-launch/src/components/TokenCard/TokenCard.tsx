import React from 'react';

import { Pool, TokenListTimeframe } from '../Explore/types';

import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/Skeleton';
import { TrenchesPoolTokenIcon } from '../TokenIcon/TokenIcon';
import { Copyable } from '../ui/Copyable';
import CopyIconSVG from '@/icons/CopyIconSVG';
import { TokenAge } from '../TokenAge';
import { TokenSocials } from '../TokenSocials';
import { TokenCardMcapMetric, TokenCardVolumeMetric } from './TokenCardMetric';
import Link from 'next/link';

type TokenCardProps = {
  pool: Pool;
  timeframe: TokenListTimeframe;
  rowRef: (element: HTMLElement | null, poolId: string) => void;
};

export const TokenCard: React.FC<TokenCardProps> = ({ pool, timeframe, rowRef }) => {
  const stats = pool.baseAsset[`stats${timeframe}`];
  const bondingProgress = Math.min(100, Math.max(0, pool.baseAsset.bondingCurve ?? (pool as any).bondingCurve ?? 24));
  const isBonded = bondingProgress >= 100;

  const archetypeTag = React.useMemo(() => {
    if (isBonded) {
      return { label: 'DLMM BONDED', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    }
    if (bondingProgress >= 70) {
      return { label: 'GRADUATING', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' };
    }
    return { label: 'ANTI-SNIPE DECAY', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
  }, [bondingProgress, isBonded]);

  const handleQuickBuy = (e: React.MouseEvent, solAmount: number) => {
    e.stopPropagation();
    e.preventDefault();
    window.location.href = `/token/${pool.baseAsset.id}?buy=${solAmount}`;
  };

  return (
    <div
      ref={(el) => rowRef(el, pool.id)}
      data-pool-id={pool.id}
      className="group relative m-2 flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-xs backdrop-blur-sm transition-all duration-200 hover:border-violet-500/40 hover:bg-neutral-850 hover:shadow-lg hover:shadow-indigo-500/10"
    >
      {/* 1st row: Icon + Info + Mcap */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="overflow-hidden rounded-xl border border-neutral-800 group-hover:border-violet-500/40 transition-colors">
            <TrenchesPoolTokenIcon width={46} height={46} pool={pool} />
          </div>
          <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-[9px]">
            ⚡
          </span>
        </div>

        {/* Title, Ticker, and Address */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="truncate font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {pool.baseAsset.symbol}
              </span>
              <span className={cn('rounded px-1.5 py-0.2 font-mono text-[9px] font-bold border uppercase shrink-0', archetypeTag.color)}>
                {archetypeTag.label}
              </span>
            </div>

            {/* Market Cap */}
            <div className="shrink-0 font-mono font-bold text-foreground">
              <TokenCardMcapMetric mcap={pool.baseAsset.mcap} />
            </div>
          </div>

          <div className="flex items-center justify-between text-neutral-400">
            <div className="flex items-center gap-1 text-[11px] truncate z-10">
              <span className="truncate text-neutral-300">{pool.baseAsset.name}</span>
              <Copyable
                name="Address"
                copyText={pool.baseAsset.id}
                className="z-[2] flex items-center text-neutral-400 duration-300 hover:text-foreground"
              >
                {(copied) => (
                  copied ? (
                    <span className="iconify h-3 w-3 text-primary ph--check-bold" />
                  ) : (
                    <CopyIconSVG className="h-3 w-3 opacity-60 hover:opacity-100" width={11} height={11} />
                  )
                )}
              </Copyable>
            </div>

            {/* 24h Volume */}
            <div className="shrink-0 font-mono text-[11px]">
              <TokenCardVolumeMetric buyVolume={stats?.buyVolume} sellVolume={stats?.sellVolume} />
            </div>
          </div>
        </div>
      </div>

      {/* 2nd row: Bonding Curve Progress bar */}
      <div className="flex flex-col gap-1 rounded-lg bg-neutral-950/60 p-2 border border-neutral-800">
        <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
          <span className="flex items-center gap-1">
            <span className="text-violet-400 font-bold">DBC CURVE:</span>
            <span>{isBonded ? 'GRADUATED TO METEORA DLMM' : `${bondingProgress.toFixed(1)}% PROGRESS`}</span>
          </span>
          <span className="text-neutral-400">TARGET: $69K</span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isBonded
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400'
            )}
            style={{ width: `${bondingProgress}%` }}
          />
        </div>
      </div>

      {/* 3rd row: Age, Socials, and Quick Buy Chips */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2 text-neutral-400">
          <TokenAge className="font-mono text-[10px] text-neutral-400" date={pool.createdAt} />
          <TokenSocials className="z-[2]" token={pool.baseAsset} />
        </div>

        {/* Quick Buy Action Pills */}
        <div className="z-[2] flex items-center gap-1">
          <button
            onClick={(e) => handleQuickBuy(e, 0.1)}
            className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-200 transition-all hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 hover:text-white border border-neutral-700"
            title="Quick buy 0.1 SOL"
          >
            0.1 SOL
          </button>
          <button
            onClick={(e) => handleQuickBuy(e, 0.5)}
            className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-200 transition-all hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 hover:text-white border border-neutral-700"
            title="Quick buy 0.5 SOL"
          >
            0.5 SOL
          </button>
        </div>
      </div>

      {/* Main card navigation link */}
      <Link
        className="absolute inset-0 cursor-pointer rounded-xl"
        href={`/token/${pool.baseAsset.id}`}
      />
    </div>
  );
};

type TokenCardSkeletonProps = React.ComponentPropsWithoutRef<'div'>;

export const TokenCardSkeleton: React.FC<TokenCardSkeletonProps> = ({ className, ...props }) => (
  <div className={cn('border-b border-neutral-925 py-3 pl-1.5 pr-2 text-xs', className)} {...props}>
    <div className="flex items-center">
      {/* Icon */}
      <div className="shrink-0 pl-2 pr-4">
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>

      {/* Info */}
      <div className="flex w-full flex-col gap-2 overflow-hidden">
        {/* 1st row */}
        <div className="flex w-full items-center justify-between gap-1">
          {/* Left side: Symbol, Name, Icons, Metrics */}
          <div className="flex flex-col gap-1 overflow-hidden">
            {/* Symbol/Name/Icons */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-5 w-16" /> {/* Symbol */}
            </div>
            {/* Metrics */}
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Right side: Quickbuy */}
          <div className="shrink-0">
            <Skeleton className="h-6 w-6 rounded-full lg:w-12" />
          </div>
        </div>

        {/* 2nd row */}
        <div className="flex w-full items-center justify-between">
          {/* Left side: Age, Socials */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-10" />
          </div>

          {/* Right side: Volume, MC */}
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-5 w-10" /> {/* V */}
            <Skeleton className="h-5 w-10" /> {/* MC */}
          </div>
        </div>
      </div>
    </div>
  </div>
);
