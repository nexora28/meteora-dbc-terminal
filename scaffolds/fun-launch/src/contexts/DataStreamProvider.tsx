import { createContext, useContext } from 'react';
import { atomMsgWithListeners } from '@/lib/jotai';
import type { StreamResponse } from './TokenChart/msg';

const [, useDataStreamListener] = atomMsgWithListeners<StreamResponse | null>(null);
export { useDataStreamListener };

type DataStreamContextType = {
  subscribePools: (pools: string[]) => void;
  unsubscribePools: (pools: string[]) => void;
  subscribeRecentTokenList: () => void;
  unsubscribeRecentTokenList: () => void;
  subscribeTxns: (assets: string[]) => void;
  unsubscribeTxns: (assets: string[]) => void;
};
const noop = () => {};
// Sample market panels must not receive mainnet events.
const sampleStream: DataStreamContextType = {
  subscribePools: noop,
  unsubscribePools: noop,
  subscribeRecentTokenList: noop,
  unsubscribeRecentTokenList: noop,
  subscribeTxns: noop,
  unsubscribeTxns: noop,
};
const DataStreamContext = createContext<DataStreamContextType | null>(null);
export const DataStreamProvider = ({ children }: { children: React.ReactNode }) => (
  <DataStreamContext.Provider value={sampleStream}>{children}</DataStreamContext.Provider>
);
export const useDataStream = () => {
  const context = useContext(DataStreamContext);
  if (!context) throw new Error('useDataStream must be used within DataStreamProvider');
  return context;
};
