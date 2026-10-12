import '@/styles/globals.css';
import { Adapter, UnifiedWalletProvider, WalletAdapterNetwork } from '@jup-ag/wallet-adapter';
import type { AppProps } from 'next/app';
import { ThemeProvider, useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWindowWidthListener } from '@/lib/device';
import { LAUNCH_NETWORK } from '@/lib/launch';

function AppProviders({ Component, pageProps }: AppProps) {
  const { resolvedTheme } = useTheme();
  const metadataOrigin =
    typeof window === 'undefined' ? 'http://127.0.0.1:3000' : window.location.origin;

  const wallets: Adapter[] = useMemo(() => {
    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
    ].filter((item) => item && item.name && item.icon) as Adapter[];
  }, []);

  const queryClient = useMemo(() => new QueryClient(), []);

  useWindowWidthListener();

  const walletTheme = resolvedTheme === 'light' ? 'light' : 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <UnifiedWalletProvider
        wallets={wallets}
        config={{
          env: LAUNCH_NETWORK,
          autoConnect: false,
          metadata: {
            name: 'Meteora DBC Studio',
            description: 'Meteora Dynamic Bonding Curve Studio on Solana',
            url: metadataOrigin,
            iconUrls: [`${metadataOrigin}/favicon.ico`],
          },
          theme: walletTheme,
          lang: 'en',
        }}
      >
        <Toaster theme={walletTheme} richColors closeButton />
        <Component {...pageProps} />
      </UnifiedWalletProvider>
    </QueryClientProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <AppProviders {...props} />
    </ThemeProvider>
  );
}
