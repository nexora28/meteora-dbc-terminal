import Head from 'next/head';
import Link from 'next/link';
import Page from '@/components/ui/Page/Page';

export default function ArchitecturePage() {
  return (
    <Page>
      <Head>
        <title>Aegis ? Launch guide and implementation</title>
      </Head>
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <h1 className="text-3xl font-bold">Aegis devnet launch guide</h1>
        <p>
          A Meteora DBC launchpad prototype. Launch, discover and trade a token, then manually
          graduate a completed curve to DAMM v2. No mainnet activity or user volume is claimed.
        </p>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Launch economics</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>One fixed SOL-quoted SPL preset: one billion tokens with six decimals.</li>
            <li>
              Base fee starts at 99% and decays to 1.25% over 120 slots. Dynamic fees are also
              enabled. High early fees are not a guarantee against bots.
            </li>
            <li>
              Graduation threshold: 85 SOL. DAMM v2 migration uses a 1% pool-fee configuration.
            </li>
            <li>
              Creator and partner permanently locked LP allocations are configured at 50% each. The
              launching wallet receives both roles. Individual migrated positions are not yet
              decoded or verified by this app.
            </li>
            <li>
              Metadata is immutable on-chain. Uploaded metadata and logos use immutable R2 object
              keys.
            </li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Try the lifecycle</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Configure R2 and a devnet RPC using the repository README. Connect a wallet funded
              with devnet SOL.
            </li>
            <li>
              <Link className="text-violet-400 underline" href="/create-pool">
                Launch a token
              </Link>
              : sign the expiring upload authorization, then review and sign the config/pool
              transaction. An upload signature alone does not create a token.
            </li>
            <li>
              Follow the receipt to the live token page or open{' '}
              <Link className="text-violet-400 underline" href="/my-launches">
                My launches
              </Link>
              . This queries confirmed creator pools directly from devnet.
            </li>
            <li>
              Review an SDK buy or sell quote, including fees, minimum output and slippage. Sign
              only the reviewed transaction. Quotes expire after 45 seconds.
            </li>
            <li>
              When the on-chain reserve reaches its threshold, review and sign manual DAMM v2
              migration. The payer funds account rent and fees. Check the receipt and resulting pool
              address.
            </li>
          </ol>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Implementation and limits</h2>
          <p>
            The server verifies the RPC genesis hash. Wallet private keys remain in the wallet. The
            server prepares transactions and temporarily signs new config or position-NFT accounts;
            their private keys are never returned.
          </p>
          <p>
            Pending receipts survive reloads for the same wallet, mint and browser origin. Check
            uncertain transactions before retrying. Pool ownership checks do not prove position
            locks.
          </p>
          <p>
            Explore is sample-only. Studio charts and exports are illustrative; custom controls do
            not change deployment. There is no paid preset marketplace, stock backing/redemption,
            DLMM pipeline, compounding vault, or DAMM v2 trading UI.
          </p>
          <p>
            The trade form supports ungraduated SOL/SPL pools. In-app migration supports SOL/SPL
            pools without vesting; the official migrator handles broader flows. Storage throttling
            is per process, so a public deployment across multiple instances needs a shared limiter.
          </p>
          <p>
            Regression checks build real SDK transactions with stubbed RPC accounts. Funded launch,
            buy/sell and graduation still need an explorer-backed devnet demo.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold">Protocol references</h2>
          <a
            className="block text-violet-400 underline"
            href="https://docs.meteora.ag/developer-guides/dbc"
            target="_blank"
            rel="noreferrer"
          >
            Meteora DBC documentation
          </a>
          <a
            className="block text-violet-400 underline"
            href="https://docs.meteora.ag/developer-guides/damm-v2"
            target="_blank"
            rel="noreferrer"
          >
            DAMM v2 documentation
          </a>
          <a
            className="block text-violet-400 underline"
            href="https://migrator.meteora.ag/"
            target="_blank"
            rel="noreferrer"
          >
            Official manual migrator ? select Devnet
          </a>
        </section>
      </main>
    </Page>
  );
}
