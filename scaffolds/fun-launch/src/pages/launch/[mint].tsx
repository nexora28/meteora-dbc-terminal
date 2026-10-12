import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { explorerUrl } from '@/lib/launch';
import DBCTrade from '@/components/DBCTrade';
import DBCMigration from '@/components/DBCMigration';
import { displayUnits } from '@/lib/trade';
import { NATIVE_MINT } from '@solana/spl-token';

type Detail = {
  launches: {
    mint: string;
    poolAddress: string;
    configAddress: string;
    creator: string;
    status: string;
    quoteReserve: string;
  }[];
  config: {
    quoteMint: string;
    migrationOption: number;
    migrationQuoteThreshold: string;
    partnerPermanentLockedLiquidityPercentage: number;
    creatorPermanentLockedLiquidityPercentage: number;
    dammPoolAddress: string | null;
    dammPoolAccountVerified: boolean;
  };
  token: {
    decimals: number;
    supply: string;
    mintAuthority: string | null;
    freezeAuthority: string | null;
  };
  metadata: { name: string; symbol: string; url: string } | null;
};

export default function LaunchDetail() {
  const router = useRouter();
  const mint = typeof router.query.mint === 'string' ? router.query.mint : undefined;
  const query = useQuery({
    queryKey: ['devnet-launch', mint],
    enabled: Boolean(mint),
    retry: false,
    queryFn: async (): Promise<Detail> => {
      const response = await fetch(`/api/launches?mint=${encodeURIComponent(mint!)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    },
  });
  const detail = query.data;
  const pool = detail?.launches[0];
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl space-y-5 p-6">
        <Link className="text-violet-400 underline" href="/my-launches">
          My launches
        </Link>
        <h1 className="text-2xl font-bold">
          {detail?.metadata
            ? `${detail.metadata.name} (${detail.metadata.symbol})`
            : 'Devnet token'}
        </h1>
        <p>Live DBC account data · Solana devnet</p>
        {query.isFetching && <p role="status">Reading token and pool accounts…</p>}
        {query.error instanceof Error && <p role="alert">{query.error.message}</p>}
        <Button onClick={() => void query.refetch()} disabled={!mint || query.isFetching}>
          Refresh status
        </Button>
        {mint && (
          <a
            className="block break-all text-violet-400 underline"
            href={explorerUrl('address', mint)}
            target="_blank"
            rel="noreferrer"
          >
            Mint: {mint}
          </a>
        )}
        {detail && pool && (
          <>
            <p>
              Status:{' '}
              <strong>{pool.status === 'migrated' ? 'DBC reports migrated' : 'Bonding'}</strong>
            </p>
            <dl className="space-y-3">
              {(
                [
                  ['Pool', pool.poolAddress],
                  ['Config', pool.configAddress],
                  ['Creator', pool.creator],
                  ['Quote mint', detail.config.quoteMint],
                ] as const
              ).map(([label, address]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>
                    <a
                      className="break-all text-violet-400 underline"
                      href={explorerUrl('address', address)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {address}
                    </a>
                  </dd>
                </div>
              ))}
              <div>
                <dt>Token decimals</dt>
                <dd>{detail.token.decimals}</dd>
              </div>
              <div>
                <dt>Supply (raw token units)</dt>
                <dd>{detail.token.supply}</dd>
              </div>
              <div>
                <dt>Quote reserve (raw token units)</dt>
                <dd>{pool.quoteReserve}</dd>
              </div>
              <div>
                <dt>Mint authority</dt>
                <dd className="break-all">{detail.token.mintAuthority ?? 'Revoked'}</dd>
              </div>
              <div>
                <dt>Freeze authority</dt>
                <dd className="break-all">{detail.token.freezeAuthority ?? 'Revoked'}</dd>
              </div>
            </dl>
            {detail.metadata ? (
              <p>
                Name and symbol are from this app’s published bucket metadata.{' '}
                <a
                  className="text-violet-400 underline"
                  href={detail.metadata.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View metadata
                </a>
              </p>
            ) : (
              <p>
                Published metadata is unavailable in this app’s bucket. The pool account was found
                on devnet.
              </p>
            )}
            <DBCTrade
              mint={pool.mint}
              available={
                pool.status === 'bonding' && detail.config.quoteMint === NATIVE_MINT.toBase58()
              }
              onConfirmed={() => void query.refetch()}
            />
            <p>
              Graduation threshold:{' '}
              {detail.config.quoteMint === NATIVE_MINT.toBase58()
                ? `${displayUnits(detail.config.migrationQuoteThreshold, 9)} SOL`
                : `${detail.config.migrationQuoteThreshold} raw quote units`}
            </p>
            <p>
              Configured permanent LP allocation after migration: creator{' '}
              {detail.config.creatorPermanentLockedLiquidityPercentage}% · partner{' '}
              {detail.config.partnerPermanentLockedLiquidityPercentage}%. These are configuration
              values, not verified position balances.
            </p>
            {detail.config.migrationOption === 1 && (
              <DBCMigration
                mint={pool.mint}
                migrated={pool.status === 'migrated'}
                eligible={
                  pool.status !== 'migrated' &&
                  BigInt(pool.quoteReserve) >= BigInt(detail.config.migrationQuoteThreshold)
                }
                target={detail.config.dammPoolAddress}
                verified={detail.config.dammPoolAccountVerified}
                onConfirmed={() => void query.refetch()}
              />
            )}
            <p>
              Migration status does not verify the resulting DAMM v2 pool or its liquidity locks.
            </p>
          </>
        )}
      </main>
    </>
  );
}
