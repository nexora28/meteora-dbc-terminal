import Head from 'next/head';
import Explore from '@/components/Explore';
import Page from '@/components/ui/Page/Page';
import Link from 'next/link';

export default function Index() {
  return (
    <Page>
      <Head>
        <title>Aegis Launchpad | Meteora Dynamic Bonding Curves</title>
        <meta
          name="description"
          content="Launch, discover and trade a devnet DBC token, then manually graduate an eligible pool to DAMM v2."
        />
      </Head>
      <section className="mx-auto mb-5 w-full max-w-5xl space-y-3 rounded-xl border border-violet-500/30 p-5">
        <h1 className="text-2xl font-bold">Aegis · Meteora DBC launchpad</h1>
        <p>
          Launch a token on devnet, find its real pool, review buy/sell quotes and manually graduate
          an eligible curve to DAMM v2.
        </p>
        <nav className="flex flex-wrap gap-5" aria-label="Launchpad workflow">
          <Link className="text-violet-400 underline" href="/create-pool">
            Launch a token
          </Link>
          <Link className="text-violet-400 underline" href="/my-launches">
            My launches and trading
          </Link>
          <Link className="text-violet-400 underline" href="/docs">
            Guide and limitations
          </Link>
          <Link
            className="text-violet-400 underline"
            href="/launch/AngiHBZqNhVxk4d9Rqmi37TmCp5zHdRmwY8qPC2tcENa"
          >
            View verified demo token
          </Link>
        </nav>
        <Link className="text-violet-400 underline" href="/pitch">
          Project pitch and judge walkthrough
        </Link>
        <p className="text-sm text-neutral-400">
          NUI is a devnet test token with verified creation, buy and sell transactions. Use My
          launches for your own accounts. Sample markets are separate previews below.
        </p>
      </section>
      <details className="mx-auto w-full max-w-5xl rounded-xl border border-neutral-700 p-5">
        <summary className="cursor-pointer font-semibold">
          Explore sample markets — preview only
        </summary>
        <div className="mt-4">
          <Explore />
        </div>
      </details>
    </Page>
  );
}
