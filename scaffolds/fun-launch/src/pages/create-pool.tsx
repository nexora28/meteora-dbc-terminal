import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { z } from 'zod';
import Header from '../components/Header';

import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Keypair, Transaction } from '@solana/web3.js';
import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import { toast } from 'sonner';
import { DBC_PRESETS, DBCPreset, PresetSelector, BondingCurveChart } from '@/components/DBCStudio';

// Define the schema for form validation
const poolSchema = z.object({
  tokenName: z.string().min(3, 'Token name must be at least 3 characters'),
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  tokenLogo: z.instanceof(File, { message: 'Token logo is required' }).optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  twitter: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

const inputClassName =
  'w-full rounded-xl border border-neutral-300 dark:border-white/[0.08] bg-white dark:bg-neutral-950/80 p-3 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-all focus:border-primary focus:bg-neutral-50 dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/25 font-sans shadow-sm dark:shadow-none';

interface FormValues {
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: File | undefined;
  website?: string;
  twitter?: string;
}

export default function CreatePool() {
  const router = useRouter();
  const { publicKey, signTransaction } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const [isLoading, setIsLoading] = useState(false);
  const [poolCreated, setPoolCreated] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [selectedPreset, setSelectedPreset] = useState<DBCPreset>(DBC_PRESETS[0]);
  const [assetClass, setAssetClass] = useState<'MEME' | 'EQUITY'>('MEME');
  const [customParams, setCustomParams] = useState({
    initialMcap: 25,
    migrationMcap: 600,
    migrationThreshold: 80,
    startingFee: 10,
    creatorFeeShare: 50,
  });

  useEffect(() => {
    if (router.query.preset && typeof router.query.preset === 'string') {
      const match = DBC_PRESETS.find((p) => p.id === router.query.preset);
      if (match) {
        setSelectedPreset(match);
      }
    }
  }, [router.query.preset]);

  const handleUpdateCustomParam = (key: string, value: number) => {
    setCustomParams((prev) => ({ ...prev, [key]: value }));
  };

  const form = useForm({
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      tokenLogo: undefined,
      website: '',
      twitter: '',
    } as FormValues,
    onSubmit: async ({ value }) => {
      try {
        setIsLoading(true);
        const { tokenLogo } = value;
        if (!tokenLogo) {
          toast.error('Token logo is required');
          return;
        }

        if (!signTransaction) {
          toast.error('Wallet not connected');
          return;
        }

        const reader = new FileReader();

        // Convert file to base64
        const base64File = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(tokenLogo);
        });

        const keyPair = Keypair.generate();

        // Step 1: Upload to R2 and get transaction
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenLogo: base64File,
            mint: keyPair.publicKey.toBase58(),
            tokenName: value.tokenName,
            tokenSymbol: value.tokenSymbol,
            userWallet: address,
            presetId: selectedPreset.id,
            configKey: selectedPreset.configKey,
          }),
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error);
        }

        const { poolTx } = await uploadResponse.json();
        const transaction = Transaction.from(Buffer.from(poolTx, 'base64'));

        // Step 2: Sign with keypair first
        transaction.sign(keyPair);

        // Step 3: Then sign with user's wallet
        const signedTransaction = await signTransaction(transaction);

        // Step 4: Send signed transaction
        const sendResponse = await fetch('/api/send-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signedTransaction: signedTransaction.serialize().toString('base64'),
          }),
        });

        if (!sendResponse.ok) {
          const error = await sendResponse.json();
          throw new Error(error.error);
        }

        const { success } = await sendResponse.json();
        if (success) {
          toast.success('Pool created successfully');
          setPoolCreated(true);
        }
      } catch (error) {
        console.error('Error creating pool:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to create pool');
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = poolSchema.safeParse(value);
        if (!result.success) {
          return result.error.formErrors.fieldErrors;
        }
        return undefined;
      },
    },
  });

  return (
    <>
      <Head>
        <title>Create DBC Pool - Meteora Terminal</title>
        <meta
          name="description"
          content="Deploy a programmable token pool on Meteora DBC with custom bonding curve dynamics."
        />
      </Head>

      <div className="min-h-screen bg-background text-foreground">
        {/* Terminal Header */}
        <Header />

        {/* Cockpit Main Container */}
        <main className="mx-auto w-full max-w-7xl px-3 py-6 md:px-6 md:py-10 space-y-8">
          {/* Header Title & Status */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-200 dark:border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href="/"
                  className="text-xs font-mono text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  TERMINAL
                </Link>
                <span className="text-neutral-400 dark:text-neutral-600 font-mono">/</span>
                <span className="text-xs font-mono text-primary font-semibold">
                  POOL DEPLOYMENT COCKPIT
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Launch On-Chain <span className="text-primary">DBC Pool</span>
              </h1>
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Configure token metadata, assign your bonding curve archetype, and graduate into DAMM v2.
              </p>
            </div>

            {/* Quick Stat Pill */}
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-white/[0.08] bg-white/80 dark:bg-neutral-950/70 p-2.5 font-mono text-xs shadow-sm dark:shadow-none">
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                <span className="text-neutral-400 dark:text-neutral-500">Selected Curve:</span>
                <span className="font-bold text-neutral-900 dark:text-white">{selectedPreset.name}</span>
              </div>
              <div className="h-3 w-px bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex items-center gap-1">
                <span className="text-neutral-400 dark:text-neutral-500">Target:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedPreset.migrationQuoteThresholdSol} SOL
                </span>
              </div>
            </div>
          </div>

          {poolCreated && !isLoading ? (
            <PoolCreationSuccess />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-8"
            >
              {/* Split Screen Cockpit Grid */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
                {/* Left Column: Token Identity & Metadata (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Token Details Card */}
                  <div className="terminal-panel rounded-2xl p-5 sm:p-6 space-y-5">
                    <div className="flex items-center gap-2.5 border-b border-neutral-200 dark:border-white/[0.08] pb-3.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <span className="iconify h-4 w-4 ph--coin-vertical-bold" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Token Identity</h2>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Basic metadata registered on Solana</p>
                      </div>
                    </div>

                    {/* Asset Class Architecture Selector (Stocklana / xStocks vs Meme) */}
                    <div className="flex flex-col gap-2 rounded-xl bg-neutral-100 dark:bg-neutral-950/80 p-3 border border-neutral-200 dark:border-white/[0.06]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Asset Class Architecture
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAssetClass('MEME');
                            const preset = DBC_PRESETS.find((p) => p.id === 'anti-snipe');
                            if (preset) setSelectedPreset(preset);
                          }}
                          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-mono font-bold transition-all ${
                            assetClass === 'MEME'
                              ? 'bg-primary text-white shadow-md shadow-primary/25'
                              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/5'
                          }`}
                        >
                          <span className="iconify h-3.5 w-3.5 ph--lightning-bold" />
                          <span>Meme Fair Launch</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAssetClass('EQUITY');
                            const preset = DBC_PRESETS.find((p) => p.id === 'rwa-equity');
                            if (preset) setSelectedPreset(preset);
                          }}
                          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-mono font-bold transition-all ${
                            assetClass === 'EQUITY'
                              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/5'
                          }`}
                        >
                          <span className="iconify h-3.5 w-3.5 ph--buildings-bold" />
                          <span>xStock / Equity (USDC)</span>
                        </button>
                      </div>

                      {assetClass === 'EQUITY' && (
                        <div className="mt-1 flex items-start gap-2 rounded-lg bg-cyan-100/50 dark:bg-cyan-950/30 border border-cyan-400/30 dark:border-cyan-500/20 p-2.5 text-[11px] text-cyan-800 dark:text-cyan-300">
                          <span className="iconify h-4 w-4 shrink-0 mt-0.5 text-cyan-600 dark:text-cyan-400 ph--info-bold" />
                          <div>
                            <strong className="text-neutral-900 dark:text-white">Stocklana Equity Pair Mode</strong>: Settles in USDC quote token with a flat floor reserve price. Compatible with Ondo RFQ and Backpack Onchain.
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="tokenName"
                          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                        >
                          Token Name*
                        </label>
                        <form.Field name="tokenName">
                          {(field) => (
                            <input
                              id="tokenName"
                              name={field.name}
                              type="text"
                              className={inputClassName}
                              placeholder="e.g. Virtual Horizon"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              required
                              minLength={3}
                            />
                          )}
                        </form.Field>
                      </div>

                      <div>
                        <label
                          htmlFor="tokenSymbol"
                          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                        >
                          Token Symbol (Ticker)*
                        </label>
                        <form.Field name="tokenSymbol">
                          {(field) => (
                            <input
                              id="tokenSymbol"
                              name={field.name}
                              type="text"
                              className={`${inputClassName} font-mono uppercase tracking-wider`}
                              placeholder="e.g. HORIZON"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                              required
                              maxLength={10}
                            />
                          )}
                        </form.Field>
                      </div>

                      {/* Logo Upload Dropzone with Live Preview */}
                      <div>
                        <label
                          htmlFor="tokenLogo"
                          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                        >
                          Token Avatar / Logo*
                        </label>
                        <form.Field name="tokenLogo">
                          {(field) => (
                            <div className="rounded-xl border border-dashed border-neutral-300 dark:border-white/[0.12] bg-neutral-50 dark:bg-neutral-950/50 p-4 text-center transition-all hover:border-primary/50">
                              {logoPreview ? (
                                <div className="flex flex-col items-center gap-2">
                                  <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="h-16 w-16 rounded-full object-cover border-2 border-primary shadow-md"
                                  />
                                  <span className="text-xs text-neutral-700 dark:text-neutral-300 font-mono">
                                    {field.state.value?.name}
                                  </span>
                                  <label
                                    htmlFor="tokenLogo"
                                    className="text-[11px] text-primary hover:underline cursor-pointer"
                                  >
                                    Change image
                                  </label>
                                </div>
                              ) : (
                                <div>
                                  <span className="iconify w-8 h-8 mx-auto mb-2 text-neutral-400 dark:text-neutral-500 ph--cloud-arrow-up-bold" />
                                  <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-3 font-mono">
                                    PNG, JPG, SVG or WEBP (max 2MB)
                                  </p>
                                  <label
                                    htmlFor="tokenLogo"
                                    className="inline-flex cursor-pointer items-center rounded-lg border border-neutral-300 dark:border-white/[0.1] bg-white dark:bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-sm dark:shadow-none"
                                  >
                                    Browse Files
                                  </label>
                                </div>
                              )}
                              <input
                                type="file"
                                id="tokenLogo"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    field.handleChange(file);
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      setLogoPreview(event.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </form.Field>
                      </div>
                    </div>
                  </div>

                  {/* Social Links Card */}
                  <div className="terminal-panel rounded-2xl p-5 sm:p-6 space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-neutral-200 dark:border-white/[0.08] pb-3.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        <span className="iconify h-4 w-4 ph--globe-bold" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Social Telemetry (Optional)</h2>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Embedded in on-chain token metadata</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor="website"
                          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                        >
                          Project Website
                        </label>
                        <form.Field name="website">
                          {(field) => (
                            <input
                              id="website"
                              name={field.name}
                              type="url"
                              className={inputClassName}
                              placeholder="https://yourprotocol.com"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                          )}
                        </form.Field>
                      </div>

                      <div>
                        <label
                          htmlFor="twitter"
                          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                        >
                          Twitter / X Profile
                        </label>
                        <form.Field name="twitter">
                          {(field) => (
                            <input
                              id="twitter"
                              name={field.name}
                              type="url"
                              className={inputClassName}
                              placeholder="https://x.com/yourhandle"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                          )}
                        </form.Field>
                      </div>
                    </div>
                  </div>

                  {/* Pre-flight Technical Checklist */}
                  <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-neutral-100/80 dark:bg-neutral-950/40 p-4 space-y-2.5 font-mono text-[11px]">
                    <div className="text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                      Deployment Pre-Flight Checks
                    </div>
                    <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                      <span>Liquidity Engine</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Meteora DBC v1.5</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                      <span>Graduation Pool</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Meteora DAMM v2</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                      <span>Anti-Snipe Defense</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {selectedPreset.antiSnipeFeeEnabled ? 'Active' : 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Bonding Curve Studio & Visualizer (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Preset Selector */}
                  <div className="terminal-panel rounded-2xl p-5 sm:p-6">
                    <PresetSelector
                      selectedPreset={selectedPreset}
                      onSelectPreset={setSelectedPreset}
                      customParams={customParams}
                      onUpdateCustomParam={handleUpdateCustomParam}
                    />
                  </div>

                  {/* Visualizer Chart */}
                  <BondingCurveChart
                    preset={selectedPreset}
                    customInitialMcap={
                      selectedPreset.id === 'custom-studio' ? customParams.initialMcap : undefined
                    }
                    customMigrationMcap={
                      selectedPreset.id === 'custom-studio' ? customParams.migrationMcap : undefined
                    }
                    customMigrationThreshold={
                      selectedPreset.id === 'custom-studio'
                        ? customParams.migrationThreshold
                        : undefined
                    }
                  />

                  {/* Errors display */}
                  {form.state.errors && form.state.errors.length > 0 && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
                      {form.state.errors.map((error, index) =>
                        Object.entries(error || {}).map(([, value]) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="iconify mt-0.5 h-4 w-4 shrink-0 text-rose-400 ph--warning-circle-bold" />
                            <p className="text-xs font-mono text-rose-300">
                              {Array.isArray(value)
                                ? value.map((v: any) => v.message || v).join(', ')
                                : typeof value === 'string'
                                  ? value
                                  : String(value)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Sticky Launch Action Panel */}
                  <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-white/95 dark:bg-neutral-950/95 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">READY TO INITIALIZE</span>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">{selectedPreset.name}</span>
                      </div>
                    </div>

                    <SubmitButton isSubmitting={isLoading} />
                  </div>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </>
  );
}

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const { publicKey } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();

  if (!publicKey) {
    return (
      <Button
        type="button"
        onClick={() => setShowModal(true)}
        className="h-12 px-6 gap-2 text-sm font-bold bg-primary text-white hover:bg-primary-400 shadow-lg shadow-primary/25"
      >
        <span className="iconify h-4 w-4 ph--wallet-bold" />
        <span>Connect Wallet</span>
      </Button>
    );
  }

  return (
    <Button
      className="flex items-center gap-2 h-12 px-8 text-sm font-bold bg-gradient-to-r from-primary via-primary-500 to-amber-600 text-white shadow-xl shadow-primary/30 hover:opacity-95"
      type="submit"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className="iconify ph--spinner w-5 h-5 animate-spin" />
          <span>Deploying DBC Pool...</span>
        </>
      ) : (
        <>
          <span className="iconify ph--rocket-launch-bold w-5 h-5" />
          <span>Deploy DBC Pool</span>
        </>
      )}
    </Button>
  );
};

const PoolCreationSuccess = () => {
  return (
    <div className="terminal-panel-glow mx-auto max-w-xl rounded-2xl p-8 text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
        <span className="iconify ph--check-circle-bold w-9 h-9" />
      </div>
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white">Pool Deployed Successfully!</h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm mt-2 max-w-md mx-auto leading-relaxed">
          Your token is live on Meteora Dynamic Bonding Curve. Traders can now buy, sell, and build volume
          towards automatic DAMM v2 graduation.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/"
          className="rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-100 dark:bg-neutral-900 px-6 py-3 text-xs font-bold text-neutral-900 dark:text-white transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          View On Explore
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white transition-all hover:bg-primary-400 shadow-lg shadow-primary/20"
        >
          Launch Another Token
        </button>
      </div>
    </div>
  );
};
