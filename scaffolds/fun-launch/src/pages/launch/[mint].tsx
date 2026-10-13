import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
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
  const solQuote = detail?.config.quoteMint === NATIVE_MINT.toBase58();
  const progress =
    pool?.status === 'migrated'
      ? 100
      : detail && pool && BigInt(detail.config.migrationQuoteThreshold) > BigInt(0)
        ? Math.min(
            100,
            Number(
              (BigInt(pool.quoteReserve) * BigInt(10000)) / BigInt(detail.config.migrationQuoteThreshold)
            ) / 100
          )
        : 0;
  return (
    <>
      <Head>
        <title>{detail?.metadata?.name || 'Token'} Â· Aegis Devnet</title>
      </Head>
      <Header />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 text-foreground">
        <Link className="text-violet-400 underline" href="/my-launches">
          My launches
        </Link>
        <h1 className="text-2xl font-bold">
          {detail?.metadata
            ? `${detail.metadata.name} (${detail.metadata.symbol})`
            : 'Devnet token'}
        </h1>
        <p>Live DBC account data Â· Solana devnet</p>
        {query.isFetching && <p role="status">Reading token and pool accountsâ€¦</p>}
        {query.error instanceof Error && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400"
          >
            {query.error.message}
          </p>
        )}
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
            <section className="terminal-panel space-y-4 rounded-2xl p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-neutral-400">Token supply</p>
                  <p className="text-xl font-semibold">
                    {displayUnits(detail.token.supply, detail.token.decimals)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Curve reserve</p>
                  <p className="text-xl font-semibold">
                    {solQuote
                      ? `${displayUnits(pool.quoteReserve, 9)} SOL`
                      : `${pool.quoteReserve} raw units`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Graduation target</p>
                  <p className="text-xl font-semibold">
                    {solQuote
                      ? `${displayUnits(detail.config.migrationQuoteThreshold, 9)} SOL`
                      : `${detail.config.migrationQuoteThreshold} raw units`}
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bonding curve progress</span>
                <span>{progress}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Bonding curve progress"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 overflow-hidden rounded-full bg-neutral-800"
              >
                <div className="h-full bg-violet-500" style={{ width: `${progress}%` }} />
              </div>
            </section>
            <DBCTrade
              key={pool.mint}
              mint={pool.mint}
              available={pool.status === 'bonding' && solQuote}
              onConfirmed={() => void query.refetch()}
            />
            <details className="terminal-panel rounded-2xl p-5">
              <summary className="cursor-pointer font-semibold">
                Token accounts and authorities
              </summary>
              <dl className="mt-4 space-y-3 text-sm">
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
            </details>
            {detail.metadata ? (
              <p>
                Name and symbol are from this appâ€™s published bucket metadata.{' '}
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
                Published metadata is unavailable in this appâ€™s bucket. The pool account was found
                on devnet.
              </p>
            )}
            <p>
              Graduation threshold:{' '}
              {detail.config.quoteMint === NATIVE_MINT.toBase58()
                ? `${displayUnits(detail.config.migrationQuoteThreshold, 9)} SOL`
                : `${detail.config.migrationQuoteThreshold} raw quote units`}
            </p>
            <p>
              Configured permanent LP allocation after migration: creator{' '}
              {detail.config.creatorPermanentLockedLiquidityPercentage}% Â· partner{' '}
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
