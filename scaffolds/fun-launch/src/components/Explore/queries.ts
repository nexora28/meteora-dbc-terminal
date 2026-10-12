import type { QueryFunctionContext } from '@tanstack/react-query';
import type {
  GetGemsTokenListRequest,
  GetTxsResponse,
  Holder,
  TokenListFilters,
  TokenListTimeframe,
} from './types';
import {
  ALL_SEED_POOLS,
  SEED_POOLS_RECENT,
  SEED_POOLS_GRADUATING,
  SEED_POOLS_GRADUATED,
} from './seedPools';
import type { ExtractQueryData } from '@/types/fancytypes';

export type QueryData<T> = T extends (...args: never[]) => {
  queryFn: (...args: never[]) => Promise<infer R>;
}
  ? R
  : never;
export type GemsTokenListQueryArgs = {
  [list in keyof GetGemsTokenListRequest]: {
    timeframe: TokenListTimeframe;
    filters?: TokenListFilters;
  };
};
export type TokenInfoQueryData = ExtractQueryData<typeof ApeQueries.tokenInfo>;

// Explicit sample data: Jupiter's mainnet indexer is not a devnet launch indexer.
export const ApeQueries = {
  gemsTokenList: (args: GemsTokenListQueryArgs) => ({
    queryKey: ['explore', 'gems', args],
    queryFn: async () => ({
      recent: { pools: SEED_POOLS_RECENT },
      aboutToGraduate: { pools: SEED_POOLS_GRADUATING },
      graduated: { pools: SEED_POOLS_GRADUATED },
      args,
    }),
  }),
  tokenInfo: (args: { id: string }) => ({
    queryKey: ['explore', 'token', args.id, 'info'],
    queryFn: async () => {
      const pool = ALL_SEED_POOLS.find(
        (item) => item.baseAsset.id === args.id || item.id === args.id
      );
      if (!pool)
        throw new Error(
          'No sample data for this token. Inspect devnet launches using the explorer receipt.'
        );
      return { ...pool, bondingCurveId: null as string | null };
    },
  }),
  tokenHolders: (args: { id: string }) => ({
    queryKey: ['explore', 'token', args.id, 'holders'],
    queryFn: async () => ({ holders: [] as Holder[], count: 0, args }),
  }),
  tokenDescription: (args: { id: string }) => ({
    queryKey: ['explore', 'token', args.id, 'description'],
    queryFn: async () => ({
      description: 'Illustrative sample token. These metrics are not on-chain measurements.',
    }),
  }),
  tokenTxs: (args: { id: string }) => ({
    queryKey: ['explore', 'token', args.id, 'txs'],
    queryFn: async (
      _context: QueryFunctionContext
    ): Promise<GetTxsResponse & { args: typeof args }> => ({
      txs: [],
      args,
    }),
    getNextPageParam: (_lastPage: GetTxsResponse): undefined => undefined,
  }),
};
