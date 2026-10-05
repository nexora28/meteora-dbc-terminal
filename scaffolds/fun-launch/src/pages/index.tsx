import Head from 'next/head';
import Explore from '@/components/Explore';
import Page from '@/components/ui/Page/Page';

export default function Index() {
  return (
    <Page>
      <Head>
        <title>Aegis Launchpad | Meteora Dynamic Bonding Curves</title>
        <meta
          name="description"
          content="Aegis Launchpad: Next-generation Solana launch terminal powered by Meteora Dynamic Bonding Curves with anti-snipe fee shields."
        />
      </Head>
      <Explore />
    </Page>
  );
}
