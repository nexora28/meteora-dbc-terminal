'use client';

import { useQueryClient } from '@tanstack/react-query';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { categorySortBy, categorySortDir, createPoolSorter } from '@/components/Explore/pool-utils';
import { ApeQueries, GemsTokenListQueryArgs, QueryData } from '@/components/Explore/queries';
import { ExploreTab, TokenListSortByField, normalizeSortByField } from '@/components/Explore/types';
import { TokenCardList } from '@/components/TokenCard/TokenCardList';
import { useExploreGemsTokenList } from '@/hooks/useExploreGemsTokenList';
import { EXPLORE_FIXED_TIMEFRAME, useExplore } from '@/contexts/ExploreProvider';
import { Pool } from '@/contexts/types';
import { isHoverableDevice, useBreakpoint } from '@/lib/device';
import { PausedIndicator } from './PausedIndicator';
import { cn } from '@/lib/utils';

type ExploreColumnProps = {
  tab: ExploreTab;
};

export const ColumnMeta: Record<
  ExploreTab,
  {
    title: string;
    sub: string;
    badge: string;
    dotColor: string;
    badgeColor: string;
    icon: string;
  }
> = {
  [ExploreTab.NEW]: {
    title: 'NEW POOLS',
    sub: 'Anti-Snipe Fee Decay Active',
    badge: 'DECAY 99%→1%',
    dotColor: 'bg-cyan-400',
    badgeColor: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/25',
    icon: 'ph--lightning-bold',
  },
  [ExploreTab.GRADUATING]: {
    title: 'GRADUATING SOON',
    sub: '>70% Threshold to Migration',
    badge: 'MOMENTUM',
    dotColor: 'bg-violet-400',
    badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
    icon: 'ph--fire-bold',
  },
  [ExploreTab.GRADUATED]: {
    title: 'MIGRATED / BONDED',
    sub: '100% Permanently Locked Meteora LP',
    badge: 'METEORA DLMM',
    dotColor: 'bg-emerald-400',
    badgeColor: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25',
    icon: 'ph--check-circle-bold',
  },
};

export const ExploreColumn: React.FC<ExploreColumnProps> = ({ tab }) => {
  const { pausedTabs, setTabPaused, request } = useExplore();
  const isPaused = pausedTabs[tab];
  const setIsPaused = useCallback(
    (paused: boolean) => setTabPaused(tab, paused),
    [setTabPaused, tab]
  );
  const meta = ColumnMeta[tab] || {
    title: ExploreTabTitleMap[tab] || 'POOLS',
    sub: 'Dynamic Bonding Curve',
    badge: 'LIVE',
    dotColor: 'bg-primary',
    badgeColor: 'bg-primary/10 text-primary border-primary/25',
    icon: 'ph--activity-bold',
  };

  return (
    // Fill the viewport below the header + page gutters on desktop
    <div className="flex flex-col h-full lg:h-[calc(100vh-130px)] bg-neutral-950/40">
      {/* Desktop Column Header */}
      <div className="flex items-center justify-between px-3.5 py-3 max-lg:hidden border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2 w-2">
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', meta.dotColor)} />
            <span className={cn('relative inline-flex rounded-full h-2 w-2', meta.dotColor)} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-xs font-bold tracking-wider text-foreground uppercase">{meta.title}</h2>
              <span className={cn('rounded px-1.5 py-0.5 font-mono text-[9px] font-bold border', meta.badgeColor)}>
                {meta.badge}
              </span>
            </div>
            <span className="text-[10px] text-neutral-300 font-mono">{meta.sub}</span>
          </div>
        </div>
        {isPaused && <PausedIndicator />}
      </div>

      {/* List */}
      <div className="relative flex-1 text-xs h-full">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-3 bg-gradient-to-b from-neutral-950 to-transparent" />
        <TokenCardListContainer
          tab={tab}
          request={request}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
        />
      </div>
    </div>
  );
};

type TokenCardListContainerProps = {
  tab: ExploreTab;
  request: Required<GemsTokenListQueryArgs>;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
};

const timeframe = EXPLORE_FIXED_TIMEFRAME;

const TokenCardListContainer: React.FC<TokenCardListContainerProps> = memo(
  ({ tab, request, isPaused, setIsPaused }) => {
    const queryClient = useQueryClient();
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === 'md' || breakpoint === 'sm' || breakpoint === 'xs';

    const listRef = useRef<HTMLDivElement>(null);

    const { data: currentData, status } = useExploreGemsTokenList((data) => data[tab]);

    const [snapshotData, setSnapshotData] = useState<Pool[]>();

    const handleMouseEnter = useCallback(() => {
      if (!isHoverableDevice() || status !== 'success') {
        return;
      }

      // When clicking elements (copyable) it triggers mouse enter again
      // We don't want to re-snapshot data if already paused
      if (!isPaused) {
        setSnapshotData(currentData?.pools);
      }
      setIsPaused(true);
    }, [currentData?.pools, isPaused, setIsPaused, status]);

    const handleMouseLeave = useCallback(() => {
      if (!isHoverableDevice()) return;

      setIsPaused(false);
    }, [setIsPaused]);

    // Mutate the args so stream sorts by timeframe
    useEffect(() => {
      queryClient.setQueriesData(
        {
          type: 'active',
          queryKey: ApeQueries.gemsTokenList(request).queryKey,
        },
        (prev?: QueryData<typeof ApeQueries.gemsTokenList>) => {
          const prevPools = prev?.[tab]?.pools;
          if (!prevPools) return;

          const pools = [...prevPools];

          // Re-sort
          const sortDir = categorySortDir(tab);
          let sortBy: TokenListSortByField | undefined;
          const defaultSortBy = categorySortBy(tab, timeframe);
          if (defaultSortBy) {
            sortBy = normalizeSortByField(defaultSortBy);
          }
          if (sortBy) {
            const sorter = createPoolSorter(
              {
                sortBy,
                sortDir,
              },
              timeframe
            );
            pools.sort(sorter);
          }

          return {
            ...prev,
            [tab]: {
              ...prev[tab],
              pools,
            },
            args: {
              ...prev?.args,
              timeframe,
            },
          };
        }
      );
    }, [queryClient, tab, request]);

    const handleScroll = useCallback(() => {
      if (!isMobile || !listRef.current) return;

      const top = listRef.current.getBoundingClientRect().top;

      if (top <= 0) {
        // Only snapshot on initial pause
        if (!isPaused) {
          setSnapshotData(currentData?.pools);
        }
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    }, [currentData?.pools, isPaused, setIsPaused, isMobile]);

    // Handle scroll pausing on mobile
    useEffect(() => {
      if (!isMobile) return;

      // Initial check
      handleScroll();

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        setIsPaused(false);
      };
    }, [isMobile, setIsPaused, handleScroll]);

    // Map snapshot data to current data for most recent updated data
    const displayData = isPaused
      ? snapshotData?.map((snapshotPool) => {
          const current = currentData?.pools.find(
            (p) => p.baseAsset.id === snapshotPool.baseAsset.id
          );
          if (current) {
            return current;
          }
          return snapshotPool;
        })
      : currentData?.pools;

    return (
      <TokenCardList
        ref={listRef}
        data={displayData}
        status={status}
        timeframe={timeframe}
        trackPools
        className="lg:h-0 lg:min-h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
  }
);

TokenCardListContainer.displayName = 'TokenCardListContainer';
