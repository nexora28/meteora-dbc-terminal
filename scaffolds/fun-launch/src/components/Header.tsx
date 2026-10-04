import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import Link from 'next/link';
import { Button } from './ui/button';
import { CreatePoolButton } from './CreatePoolButton';
import { ThemeToggle } from './ThemeToggle';
import { useMemo } from 'react';
import { shortenAddress } from '@/lib/utils';
import { TerminalHUD } from './TerminalHUD';

export const Header = () => {
  const { setShowModal } = useUnifiedWalletContext();

  const { disconnect, publicKey } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const handleConnectWallet = () => {
    setShowModal(true);
  };

  return (
    <>
      <TerminalHUD />
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 md:h-16 md:px-6">
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary-500 to-amber-600 text-white shadow-lg shadow-primary/25">
                <span className="iconify h-5 w-5 ph--lightning-bold" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-white text-base md:text-lg">
                    METEORA <span className="text-primary font-black">DBC</span>
                  </span>
                  <span className="rounded bg-primary/15 px-1.5 py-0.2 text-[9px] font-bold text-primary uppercase">
                    Launch
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono tracking-wider">
                  DYNAMIC BONDING TERMINAL
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                Explore Pools
              </Link>
              <Link
                href="/studio"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <span className="iconify h-3.5 w-3.5 ph--sparkle-bold" />
                <span>DBC Studio</span>
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold">
                  PRO
                </span>
              </Link>
            </nav>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/studio"
              className="flex md:hidden items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary"
            >
              <span className="iconify h-3.5 w-3.5 ph--sparkle-bold" />
              <span>Studio</span>
            </Link>
            <CreatePoolButton />
          {address ? (
            <Button variant="secondary" onClick={() => disconnect()}>
              <span className="iconify h-4 w-4 ph--wallet-bold" />
              {shortenAddress(address)}
            </Button>
          ) : (
            <Button
              onClick={() => {
                handleConnectWallet();
              }}
            >
              <span className="hidden md:block">Connect Wallet</span>
              <span className="block md:hidden">Connect</span>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
