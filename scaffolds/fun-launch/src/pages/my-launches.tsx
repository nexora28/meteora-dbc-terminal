import { useState } from 'react';
import Link from 'next/link';
import { useWallet, useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { explorerUrl } from '@/lib/launch';
import { PublicKey } from '@solana/web3.js';

type Launch = { mint: string; poolAddress: string; status: string };

export default function MyLaunches() {
  const { publicKey } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const creator = publicKey?.toBase58();
  const [mint, setMint] = useState('');
  const [error, setError] = useState('');
  const query = useQuery({
    queryKey: ['devnet-launches', creator],
    enabled: Boolean(creator),
    retry: false,
    queryFn: async (): Promise<{ launches: Launch[] }> => {
      const response = await fetch(`/api/launches?creator=${creator}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    },
  });
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <h1 className="text-2xl font-bold">My launches · Devnet</h1>
        <p>These pools come from confirmed devnet accounts for your connected creator wallet.</p>
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            try {
              const address = new PublicKey(mint.trim()).toBase58();
              window.location.assign(`/launch/${address}`);
            } catch {
              setError('Enter a valid mint address.');
            }
          }}
        >
          <label htmlFor="lookup-mint" className="block">
            Find a token by mint address
          </label>
          <input
            id="lookup-mint"
            className="w-full rounded border border-neutral-600 bg-background p-3"
            value={mint}
            onChange={(event) => {
              setMint(event.target.value);
              setError('');
            }}
            required
          />
          {error && <p role="alert">{error}</p>}
          <Button type="submit">Find token</Button>
        </form>
        {!creator ? (
          <Button onClick={() => setShowModal(true)}>Connect wallet to find my launches</Button>
        ) : (
          <>
            <p className="break-all text-sm">Creator: {creator}</p>
            <Button onClick={() => void query.refetch()} disabled={query.isFetching}>
              Refresh launches
            </Button>
            {query.isFetching && <p role="status">Reading devnet pools…</p>}
            {query.error instanceof Error && <p role="alert">{query.error.message}</p>}
            {query.data?.launches.length === 0 && (
              <p>
                No pools found for this wallet on devnet. Check the launch receipt; signing the
                upload message alone does not create a coin.
              </p>
            )}
            <ul className="space-y-4">
              {query.data?.launches.map((launch) => (
                <li key={launch.poolAddress} className="rounded-xl border border-neutral-700 p-4">
                  <Link
                    className="break-all text-violet-400 underline"
                    href={`/launch/${launch.mint}`}
                  >
                    {launch.mint}
                  </Link>
                  <p>Status: {launch.status}</p>
                  <a
                    className="text-violet-400 underline"
                    href={explorerUrl('address', launch.poolAddress)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Pool on explorer
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        <Link className="text-violet-400 underline" href="/create-pool">
          Launch a token
        </Link>
      </main>
    </>
  );
}
