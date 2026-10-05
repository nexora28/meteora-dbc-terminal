import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from './ui/button';
import { CreatePoolButton } from './CreatePoolButton';
import { ThemeToggle } from './ThemeToggle';
import { useMemo, useState, useRef, useEffect } from 'react';
import { shortenAddress } from '@/lib/utils';
import { TerminalHUD } from './TerminalHUD';

export const Header = () => {
  const { setShowModal } = useUnifiedWalletContext();
  const { disconnect, publicKey } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [router.asPath]);

  const handleConnectWallet = () => {
    setShowModal(true);
  };

  return (
    <>
      <TerminalHUD />
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-white/[0.08] bg-white/90 dark:bg-neutral-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 md:h-16 md:px-6">
          {/* Logo Section */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary-500 to-amber-600 text-white shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                <span className="iconify h-5 w-5 ph--shield-check-bold" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-neutral-900 dark:text-white text-base md:text-lg">
                    AEGIS <span className="text-primary font-black">DBC</span>
                  </span>
                  <span className="rounded bg-primary/15 border border-primary/30 px-1.5 py-0.2 text-[9px] font-mono font-bold text-primary uppercase">
                    v1.5
                  </span>
                </div>
                <span className="text-[9px] md:text-[10px] text-neutral-500 dark:text-neutral-400 font-mono tracking-wider">
                  DYNAMIC BONDING ENGINE
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  router.pathname === '/'
                    ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white font-bold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Explore Terminal
              </Link>
              <Link
                href="/studio"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  router.pathname === '/studio'
                    ? 'bg-primary/15 text-primary font-bold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span className="iconify h-3.5 w-3.5 ph--cpu-bold" />
                <span>Curve Studio</span>
              </Link>

              {/* Dropdown Menu Trigger Button */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
                    menuOpen
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-neutral-200 dark:border-white/[0.08] bg-neutral-100/80 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-850 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                >
                  <span className="iconify h-3.5 w-3.5 text-primary ph--circles-four-bold" />
                  <span>Protocol & Tools</span>
                  <span
                    className={`iconify h-3 w-3 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ${
                      menuOpen ? 'rotate-180 text-primary' : ''
                    } ph--caret-down-bold`}
                  />
                </button>

                {/* Dropdown Flyout Card */}
                {menuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-neutral-200 dark:border-white/[0.1] bg-white/95 dark:bg-neutral-950/95 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-black/10 dark:ring-black/50 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-2 py-1.5 border-b border-neutral-100 dark:border-white/[0.06] mb-1">
                      <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400">
                        Aegis Protocol Ecosystem
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <Link
                        href="/architecture"
                        className="flex items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-white/[0.06] group"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <span className="iconify h-4 w-4 ph--shield-check-bold" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>Protocol Architecture</span>
                            <span className="rounded bg-primary/20 px-1 py-0.2 text-[8px] font-mono text-primary uppercase">
                              Specs
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-sans mt-0.5 leading-snug">
                            Anti-snipe fee decay formulas, linear equity curves, and DLMM graduation.
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="/studio"
                        className="flex items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-white/[0.06] group"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                          <span className="iconify h-4 w-4 ph--chart-line-up-bold" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-900 dark:text-white">Curve Simulator</div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-sans mt-0.5 leading-snug">
                            Interactive SVG bonding visualizer and dynamic SOL inflow scrubber.
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="/studio"
                        className="flex items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-white/[0.06] group"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                          <span className="iconify h-4 w-4 ph--storefront-bold" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-900 dark:text-white">Preset Marketplace</div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-sans mt-0.5 leading-snug">
                            1-click deployment for Anti-Snipe, Stocklana xStock, and Hype curves.
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="/studio"
                        className="flex items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-white/[0.06] group"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                          <span className="iconify h-4 w-4 ph--code-bold" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-900 dark:text-white">Developer Stack Exporter</div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-sans mt-0.5 leading-snug">
                            Export TypeScript SDK code snippets and Meteora Invent CLI commands.
                          </div>
                        </div>
                      </Link>

                      <div className="border-t border-neutral-100 dark:border-white/[0.06] my-1" />

                      <a
                        href="https://docs.meteora.ag"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/[0.04] hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        <span>Meteora DLMM Docs</span>
                        <span className="iconify h-3 w-3 ph--arrow-square-out-bold text-neutral-400" />
                      </a>

                      <a
                        href="https://explorer.solana.com/?cluster=devnet"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/[0.04] hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        <span>Solana Devnet Explorer</span>
                        <span className="iconify h-3 w-3 ph--arrow-square-out-bold text-neutral-400" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile Dropdown Menu Trigger */}
            <div className="relative md:hidden" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center rounded-lg border border-neutral-200 dark:border-white/[0.08] bg-neutral-100 dark:bg-neutral-900 p-2 text-neutral-800 dark:text-white"
                aria-label="Toggle menu"
              >
                <span className="iconify h-4 w-4 ph--dots-nine-bold" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-neutral-200 dark:border-white/[0.1] bg-white/95 dark:bg-neutral-950/95 p-2 shadow-2xl backdrop-blur-2xl z-50">
                  <div className="flex flex-col gap-1 text-xs">
                    <Link
                      href="/"
                      className="rounded-lg px-3 py-2 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.06] font-semibold"
                    >
                      Explore Terminal
                    </Link>
                    <Link
                      href="/architecture"
                      className="rounded-lg px-3 py-2 text-primary hover:bg-neutral-100 dark:hover:bg-white/[0.06] font-semibold flex items-center justify-between"
                    >
                      <span>Protocol Architecture</span>
                      <span className="iconify h-3.5 w-3.5 ph--shield-check-bold" />
                    </Link>
                    <Link
                      href="/studio"
                      className="rounded-lg px-3 py-2 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.06] font-semibold"
                    >
                      Curve Studio
                    </Link>
                    <Link
                      href="/create-pool"
                      className="rounded-lg px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-neutral-100 dark:hover:bg-white/[0.06] font-semibold"
                    >
                      + Launch Token
                    </Link>
                  </div>
                </div>
              )}
            </div>

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
