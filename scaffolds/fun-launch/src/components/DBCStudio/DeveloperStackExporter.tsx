import React, { useState } from 'react';
import { DBCPreset } from './presets';

interface DeveloperStackExporterProps {
  preset: DBCPreset;
  customInitialMcap?: number;
  customMigrationMcap?: number;
  customMigrationThreshold?: number;
}

export const DeveloperStackExporter: React.FC<DeveloperStackExporterProps> = ({
  preset,
  customInitialMcap,
  customMigrationMcap,
  customMigrationThreshold,
}) => {
  const [activeTab, setActiveTab] = useState<'sdk' | 'cli' | 'json' | 'pipeline'>('pipeline');
  const [copied, setCopied] = useState(false);

  const initialMcap = customInitialMcap ?? preset.initialMarketCapSol;
  const migrationMcap = customMigrationMcap ?? preset.migrationMarketCapSol;
  const migrationThreshold = customMigrationThreshold ?? preset.migrationQuoteThresholdSol;

  // 1. TypeScript SDK Snippet
  const sdkSnippet = `import { Connection, PublicKey } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const client = new DynamicBondingCurveClient(connection, 'confirmed');

// Initialize Dynamic Bonding Curve with ${preset.name}
async function deployDBCPool(userWalletPublicKey: PublicKey, baseMint: PublicKey) {
  const poolTx = await client.creator.createPool({
    config: new PublicKey('${preset.configKey}'),
    baseMint: baseMint,
    name: "My Dynamic Asset",
    symbol: "MDA",
    uri: "https://arweave.net/metadata.json",
    payer: userWalletPublicKey,
    poolCreator: userWalletPublicKey,
  });

  return poolTx;
}`;

  // 2. Meteora Invent CLI Snippet
  const cliSnippet = `# 1. Install Meteora Invent CLI
npm install -g @meteora-ag/invent-cli

# 2. Deploy DBC Pool on Solana Devnet with Preset "${preset.id}"
meteora-invent pool create \\
  --network devnet \\
  --config "${preset.configKey}" \\
  --name "My Dynamic Asset" \\
  --symbol "MDA" \\
  --quote "${preset.quoteToken.toLowerCase()}" \\
  --curve-mode ${preset.buildCurveMode} \\
  --anti-snipe-decay ${preset.antiSnipeFeeEnabled ? preset.feeDecayDurationSlots : 0}`;

  // 3. JSON Config
  const jsonSnippet = JSON.stringify(
    {
      presetId: preset.id,
      name: preset.name,
      buildCurveMode: preset.buildCurveMode,
      curveModeName: preset.curveModeName,
      quoteToken: preset.quoteToken,
      initialMarketCapSol: initialMcap,
      migrationMarketCapSol: migrationMcap,
      migrationQuoteThresholdSol: migrationThreshold,
      percentageSupplyOnMigration: preset.percentageSupplyOnMigration,
      feeSchedule: {
        antiSnipeFeeEnabled: preset.antiSnipeFeeEnabled,
        startingFeePercent: preset.startingFeePercent,
        endingFeePercent: preset.endingFeePercent,
        decayDurationSlots: preset.feeDecayDurationSlots,
        dynamicFee: preset.dynamicFee,
        creatorTradingFeeSharePercent: preset.creatorFeeSharePercent,
      },
      migrationTarget: preset.migrationTarget,
      permanentLockedLiquidityPercentage: 100,
    },
    null,
    2
  );

  const getCurrentSnippet = () => {
    switch (activeTab) {
      case 'sdk':
        return sdkSnippet;
      case 'cli':
        return cliSnippet;
      case 'json':
        return jsonSnippet;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-neutral-950/80 p-5 md:p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 dark:border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="iconify h-4 w-4 text-primary ph--terminal-window-bold" />
            <h3 className="text-sm md:text-base font-bold text-neutral-900 dark:text-white font-mono uppercase tracking-wider">
              Developer Tooling & Migration Pipeline
            </h3>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-sans mt-0.5">
            Production integration contracts for Meteora DBC, DAMM v2, and DLMM v2.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              activeTab === 'pipeline'
                ? 'bg-primary text-white font-bold shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/5'
            }`}
          >
            ⚡ Stack Flow
          </button>
          <button
            onClick={() => setActiveTab('sdk')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              activeTab === 'sdk'
                ? 'bg-primary text-white font-bold shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/5'
            }`}
          >
            TypeScript SDK
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              activeTab === 'cli'
                ? 'bg-primary text-white font-bold shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/5'
            }`}
          >
            Invent CLI
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              activeTab === 'json'
                ? 'bg-primary text-white font-bold shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/5'
            }`}
          >
            JSON Spec
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'pipeline' ? (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1: DBC Bonding */}
            <div className="rounded-xl border border-neutral-200 dark:border-white/[0.08] bg-neutral-50 dark:bg-neutral-900/60 p-4 space-y-2 relative overflow-hidden shadow-sm dark:shadow-none">
              <span className="absolute top-2 right-2 font-mono text-xs font-bold text-primary/60 dark:text-primary/40">STAGE 01</span>
              <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase">
                <span className="iconify h-4 w-4 ph--chart-line-up-bold" />
                <span>DBC Bonding Phase</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                Algorithmic price discovery using <strong>{preset.curveModeName}</strong>. 
                {preset.antiSnipeFeeEnabled ? ' Decays starting 99% fee over 120 slots to neutralize bot snipers.' : ' Enforces flat reserve floor price for asset stability.'}
              </p>
              <div className="rounded bg-white dark:bg-neutral-950 p-2 font-mono text-[10px] text-neutral-700 dark:text-neutral-400 border border-neutral-200 dark:border-white/5">
                Cap: {initialMcap} → {migrationMcap} {preset.quoteToken}
              </div>
            </div>

            {/* Step 2: DAMM v2 Compounding */}
            <div className="rounded-xl border border-cyan-400/30 dark:border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/20 p-4 space-y-2 relative overflow-hidden shadow-sm dark:shadow-none">
              <span className="absolute top-2 right-2 font-mono text-xs font-bold text-cyan-600/60 dark:text-cyan-400/40">STAGE 02</span>
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-mono text-xs font-bold uppercase">
                <span className="iconify h-4 w-4 ph--arrows-clockwise-bold" />
                <span>DAMM v2 Auto-Vault</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                Upon reaching <strong>{migrationThreshold} {preset.quoteToken}</strong> threshold, liquidity migrates automatically. Dynamic fee revenue accrues directly into creator royalties and reinvests into deepening the floor.
              </p>
              <div className="rounded bg-white dark:bg-neutral-950 p-2 font-mono text-[10px] text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 dark:border-cyan-500/20">
                100% Permanently Locked Liquidity
              </div>
            </div>

            {/* Step 3: DLMM Concentrated Liquidity */}
            <div className="rounded-xl border border-emerald-400/30 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2 relative overflow-hidden shadow-sm dark:shadow-none">
              <span className="absolute top-2 right-2 font-mono text-xs font-bold text-emerald-600/60 dark:text-emerald-400/40">STAGE 03</span>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold uppercase">
                <span className="iconify h-4 w-4 ph--diamond-bold" />
                <span>DLMM v2 Concentration</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                Concentrated liquidity bins eliminate slippage for high-volume secondary market trading. Full interoperability with Jupiter Aggregator routing and Backpack Onchain.
              </p>
              <div className="rounded bg-white dark:bg-neutral-950 p-2 font-mono text-[10px] text-emerald-700 dark:text-emerald-400 border border-emerald-400/30 dark:border-emerald-500/20">
                Zero Impermanent Loss Floor
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md border border-neutral-300 dark:border-white/[0.1] bg-white dark:bg-neutral-900/90 px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-300 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white z-10 shadow-sm"
          >
            <span className="iconify h-3.5 w-3.5 ph--copy-bold" />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>
          <pre className="max-h-64 overflow-y-auto rounded-xl bg-neutral-900 p-4 font-mono text-xs text-neutral-100 border border-neutral-800 leading-relaxed">
            {getCurrentSnippet()}
          </pre>
        </div>
      )}
    </div>
  );
};
