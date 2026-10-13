import Head from 'next/head';
import Link from 'next/link';
import Page from '@/components/ui/Page/Page';

const slides = [
  {
    title: 'Aegis',
    subtitle: 'A wallet-reviewed token launch lifecycle on Meteora DBC',
    points: [
      'Create a devnet token, discover its real pool, and review buy/sell quotes in one app.',
      'Prepare manual DAMM v2 graduation when an eligible curve reaches its threshold.',
      'Built for creators who need clear account, fee and confirmation information throughout a launch.',
    ],
  },
  {
    title: 'The problem',
    subtitle: 'A launch should be understandable beyond the creation transaction',
    points: [
      'Creators need to find their token again, inspect pool state and understand what happens next.',
      'Traders need explicit amounts, minimum output, fees and confirmation receipts.',
      'Aegis connects these steps with live devnet account reads and wallet-reviewed transactions.',
    ],
  },
  {
    title: 'Meaningful Meteora integration',
    subtitle: 'DBC is the core of the live product',
    points: [
      'Creates a DBC config and pool together: SOL quote, 1 billion tokens, 6 decimals.',
      'Base fee decays from 99% to 1.25% over 120 slots, with dynamic fees enabled.',
      'Uses SDK buy/sell quotes and swap instructions; the transaction enforces minimum output.',
      '85 SOL graduation target with manual DAMM v2 transaction preparation. Migration and resulting positions are not yet independently verified.',
    ],
  },
  {
    title: 'Execution and evidence',
    subtitle: 'Separate observed behavior from claims',
    points: [
      'Devnet creation, buy and sell for NUI were independently checked: all three transactions finalized without errors. Explorer links are below.',
      'Automated checks cover authorization, transaction signatures, quote math, discovery, migration guards and packet sizes.',
      'Production build, type checks and lint pass. Hosted pages and storage readiness have been smoke tested.',
      'Metadata is signed by the creator and published with immutable storage keys. Wallet priority-fee changes are bounded separately from swap instructions. This is a functional demo, not measured traction.',
    ],
  },
  {
    title: 'What is ours, and what is next',
    subtitle: 'A focused devnet prototype with explicit limits',
    points: [
      'Our contribution: frontend lifecycle, authenticated upload, transaction validation, creator discovery, receipts and regression checks.',
      'Meteora provides the protocols, SDKs and original Invent scaffold.',
      'Shared R2 quotas bound upload attempts across instances. Next: verify graduation and positions, add edge API throttling, and test with additional creators before broader public use.',
      'Studio presets and exports are previews. No paid marketplace, asset backing, compounding, mainnet traction or verified liquidity locks are claimed.',
    ],
  },
  {
    title: 'Try the workflow',
    subtitle: 'No wallet is needed to read this deck or inspect a token by mint',
    points: [
      'Open My launches to look up a mint, or connect a devnet wallet to discover its creator pools.',
      'Create a token with test SOL, then review a small buy and sell on its token page.',
      'Inspect the saved explorer receipts and refresh the pool state. Early launch fees can be very high.',
      'Review the code and setup guide through the public repository. Use test funds only.',
    ],
  },
];

export default function Pitch() {
  return (
    <Page>
      <Head>
        <title>Aegis pitch deck | Meteora DBC</title>
        <meta
          name="description"
          content="Aegis project pitch deck, integration details, evidence and judge walkthrough."
        />
      </Head>
      <main className="mx-auto w-full max-w-5xl space-y-6 px-3 py-6">
        <nav aria-label="Pitch deck" className="flex flex-wrap gap-4 text-sm text-violet-400">
          {slides.map((slide, i) => (
            <a key={slide.title} href={`#slide-${i + 1}`}>
              {i + 1}. {slide.title}
            </a>
          ))}
        </nav>
        {slides.map((slide, i) => (
          <section
            key={slide.title}
            id={`slide-${i + 1}`}
            className="terminal-panel scroll-mt-24 space-y-6 rounded-2xl p-6 sm:p-10"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              Meteora DBC · Devnet prototype · {i + 1}/{slides.length}
            </p>
            {i === 0 ? (
              <h1 className="text-4xl font-bold">{slide.title}</h1>
            ) : (
              <h2 className="text-3xl font-bold">{slide.title}</h2>
            )}
            <p className="text-xl text-neutral-400">{slide.subtitle}</p>
            <ul className="list-disc space-y-4 pl-5 text-base sm:text-lg">
              {slide.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}
        <nav
          aria-label="Project links"
          className="flex flex-wrap gap-5 rounded-xl border border-neutral-700 p-5 text-violet-400 underline"
        >
          <Link href="/create-pool">Launch demo</Link>
          <Link href="/launch/AngiHBZqNhVxk4d9Rqmi37TmCp5zHdRmwY8qPC2tcENa">
            Verified NUI token demo
          </Link>
          <Link href="/my-launches">Find a token</Link>
          <Link href="/docs">Setup and limitations</Link>
          <a
            href="https://github.com/nexora28/meteora-dbc-terminal"
            target="_blank"
            rel="noreferrer"
          >
            Public source code
          </a>
        </nav>
        <section className="terminal-panel space-y-4 rounded-2xl p-6">
          <h2 className="text-2xl font-bold">Finalized devnet evidence</h2>
          <p>
            Checked 13 October 2026. NUI remains on its bonding curve; DAMM v2 graduation and LP
            positions are not verified.
          </p>
          <ul className="space-y-3 text-violet-400 underline">
            <li>
              <a
                href="https://explorer.solana.com/tx/qji4ib8BxRvC87Jri14JTzEWBLzJFFbDg3JyJvDbqWrTppPBkgzRAaFSRSthkPwtR1E5x3ztcTmtqn8TGQ6xfWL?cluster=devnet"
                target="_blank"
                rel="noreferrer"
              >
                Create config and token pool
              </a>
            </li>
            <li>
              <a
                href="https://explorer.solana.com/tx/4NrxphtzxDXVx5xgZyv5rKMJ1CsRFz3j9q9uRn2tBExhN3XhgbnosSeX7UHKBoeCKnvq6ePCECybY8yijnxAcRzM?cluster=devnet"
                target="_blank"
                rel="noreferrer"
              >
                Buy — finalized swap
              </a>
            </li>
            <li>
              <a
                href="https://explorer.solana.com/tx/5cwh2VUXhdD27fJZCMG4bNyjd5CbdVSYGxhDwDqfPNqrK2Rk25k9mrJuR26nf1PjQ6vgmQfuLchaeWNn5CAAuBaP?cluster=devnet"
                target="_blank"
                rel="noreferrer"
              >
                Sell — finalized swap
              </a>
            </li>
          </ul>
        </section>
      </main>
    </Page>
  );
}
