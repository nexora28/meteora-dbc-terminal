export interface DBCPreset {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  description: string;
  assetClass: 'MEME' | 'EQUITY' | 'DEGEN' | 'DAO' | 'CUSTOM';
  quoteToken: 'SOL' | 'USDC';
  configKey: string;
  buildCurveMode: number;
  curveModeName: string;
  initialMarketCapSol: number;
  migrationMarketCapSol: number;
  migrationQuoteThresholdSol: number;
  percentageSupplyOnMigration: number;
  antiSnipeFeeEnabled: boolean;
  startingFeePercent: number;
  endingFeePercent: number;
  feeDecayDurationSlots: number;
  dynamicFee: boolean;
  creatorFeeSharePercent: number;
  migrationTarget: 'DAMM v2' | 'DLMM v2';
  rating?: string;
  royaltyYield?: string;
  curvePoints: { supplyPercent: number; priceSol: number }[];
}

export const DBC_PRESETS: DBCPreset[] = [
  {
    id: 'anti-snipe',
    name: 'Anti-Snipe Fair Launch',
    tagline: 'Decaying MEV Penalty + Gradual Slope',
    badge: 'Meme Fair Launch',
    badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    description:
      'Protects retail buyers from MEV bots with a 99% starting fee decaying over 120 slots down to 1.25%. Frontrunners forfeit fees to creator pool.',
    assetClass: 'MEME',
    quoteToken: 'SOL',
    configKey: 'F72k1sY5Zk6Vw4fP3zR6L3sX4pY2nN1b2a3c4d5e6f7g',
    buildCurveMode: 2,
    curveModeName: 'buildCurveWithTwoSegments',
    initialMarketCapSol: 30,
    migrationMarketCapSol: 550,
    migrationQuoteThresholdSol: 85,
    percentageSupplyOnMigration: 25,
    antiSnipeFeeEnabled: true,
    startingFeePercent: 99.0,
    endingFeePercent: 1.25,
    feeDecayDurationSlots: 120,
    dynamicFee: true,
    creatorFeeSharePercent: 50,
    migrationTarget: 'DLMM v2',
    rating: '4.95 ★ (1,840 launches)',
    royaltyYield: '50% Permanent LP Fees',
    curvePoints: [
      { supplyPercent: 0, priceSol: 0.00003 },
      { supplyPercent: 20, priceSol: 0.000055 },
      { supplyPercent: 40, priceSol: 0.00009 },
      { supplyPercent: 60, priceSol: 0.00016 },
      { supplyPercent: 80, priceSol: 0.00029 },
      { supplyPercent: 100, priceSol: 0.00055 },
    ],
  },
  {
    id: 'rwa-equity',
    name: 'xStock & Tokenized Equity (Stocklana)',
    tagline: 'USDC-Paired Linear Floor + Ondo/Backpack Tether',
    badge: 'Tokenized Stock & RWA',
    badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    description:
      'Engineered for tokenized equities (xTSLA, xNVDA), real-world assets, and pre-IPO instruments. Flat floor price reserve backed by USDC eliminates speculative dumps.',
    assetClass: 'EQUITY',
    quoteToken: 'USDC',
    configKey: 'EqTY1sY5Zk6Vw4fP3zR6L3sX4pY2nN1b2a3c4d5e6f8h',
    buildCurveMode: 4,
    curveModeName: 'buildCurveWithMidPrice',
    initialMarketCapSol: 100,
    migrationMarketCapSol: 1200,
    migrationQuoteThresholdSol: 250,
    percentageSupplyOnMigration: 35,
    antiSnipeFeeEnabled: false,
    startingFeePercent: 0.35,
    endingFeePercent: 0.25,
    feeDecayDurationSlots: 0,
    dynamicFee: true,
    creatorFeeSharePercent: 70,
    migrationTarget: 'DLMM v2',
    rating: '5.0 ★ (Institutional Grade)',
    royaltyYield: '70% Institutional Yield',
    curvePoints: [
      { supplyPercent: 0, priceSol: 0.0001 },
      { supplyPercent: 20, priceSol: 0.00012 },
      { supplyPercent: 40, priceSol: 0.00018 },
      { supplyPercent: 60, priceSol: 0.00035 },
      { supplyPercent: 80, priceSol: 0.00075 },
      { supplyPercent: 100, priceSol: 0.0012 },
    ],
  },
  {
    id: 'exponential-degen',
    name: 'Exponential Hype Curve',
    tagline: 'Low Entry + Aggressive Hockey-Stick Growth',
    badge: 'High Momentum',
    badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    description:
      'Low starting entry with parabolic scaling as bonding supply fills. Accelerates early buy pressure and achieves rapid Meteora DLMM graduation.',
    assetClass: 'DEGEN',
    quoteToken: 'SOL',
    configKey: 'Hyp31sY5Zk6Vw4fP3zR6L3sX4pY2nN1b2a3c4d5e6f9j',
    buildCurveMode: 1,
    curveModeName: 'buildCurveWithMarketCap',
    initialMarketCapSol: 15,
    migrationMarketCapSol: 450,
    migrationQuoteThresholdSol: 60,
    percentageSupplyOnMigration: 20,
    antiSnipeFeeEnabled: true,
    startingFeePercent: 15.0,
    endingFeePercent: 1.5,
    feeDecayDurationSlots: 60,
    dynamicFee: false,
    creatorFeeSharePercent: 50,
    migrationTarget: 'DLMM v2',
    rating: '4.85 ★ (2,410 launches)',
    royaltyYield: 'Fast Graduation (60 SOL)',
    curvePoints: [
      { supplyPercent: 0, priceSol: 0.000015 },
      { supplyPercent: 20, priceSol: 0.000028 },
      { supplyPercent: 40, priceSol: 0.000065 },
      { supplyPercent: 60, priceSol: 0.00014 },
      { supplyPercent: 80, priceSol: 0.00027 },
      { supplyPercent: 100, priceSol: 0.00045 },
    ],
  },
  {
    id: 'dao-conviction',
    name: 'DAO Conviction & Compounding Vault',
    tagline: 'Meteora DAMM v2 Auto-Compounding Liquidity',
    badge: 'DAO & Governance',
    badgeColor: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
    description:
      'Tokens graduate into a compounding DAMM v2 liquidity vault. 100% of trading fees automatically reinvest into deepening the liquidity floor permanently.',
    assetClass: 'DAO',
    quoteToken: 'SOL',
    configKey: 'DaoC1sY5Zk6Vw4fP3zR6L3sX4pY2nN1b2a3c4d5e6f0k',
    buildCurveMode: 3,
    curveModeName: 'buildCurveWithCompoundingVault',
    initialMarketCapSol: 50,
    migrationMarketCapSol: 800,
    migrationQuoteThresholdSol: 120,
    percentageSupplyOnMigration: 30,
    antiSnipeFeeEnabled: true,
    startingFeePercent: 5.0,
    endingFeePercent: 1.0,
    feeDecayDurationSlots: 200,
    dynamicFee: true,
    creatorFeeSharePercent: 80,
    migrationTarget: 'DAMM v2',
    rating: '4.92 ★ (Protocol Treasury)',
    royaltyYield: '100% Compounding Vault',
    curvePoints: [
      { supplyPercent: 0, priceSol: 0.00005 },
      { supplyPercent: 20, priceSol: 0.00008 },
      { supplyPercent: 40, priceSol: 0.00014 },
      { supplyPercent: 60, priceSol: 0.00025 },
      { supplyPercent: 80, priceSol: 0.00045 },
      { supplyPercent: 100, priceSol: 0.0008 },
    ],
  },
  {
    id: 'custom-studio',
    name: 'Custom Algorithmic Studio',
    tagline: 'Bespoke Curve Equation & Volatility Multipliers',
    badge: 'Pro Configurator',
    badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    description:
      'Configure every facet of Meteora DBC: curve modes, migration quote thresholds, decaying fee curves, and dynamic bin liquidity distribution.',
    assetClass: 'CUSTOM',
    quoteToken: 'SOL',
    configKey: 'Cust1sY5Zk6Vw4fP3zR6L3sX4pY2nN1b2a3c4d5e6f1m',
    buildCurveMode: 0,
    curveModeName: 'buildCurve',
    initialMarketCapSol: 25,
    migrationMarketCapSol: 600,
    migrationQuoteThresholdSol: 80,
    percentageSupplyOnMigration: 25,
    antiSnipeFeeEnabled: true,
    startingFeePercent: 10.0,
    endingFeePercent: 1.0,
    feeDecayDurationSlots: 100,
    dynamicFee: true,
    creatorFeeSharePercent: 50,
    migrationTarget: 'DLMM v2',
    rating: 'Developer Pro Tool',
    royaltyYield: 'Customizable Yield',
    curvePoints: [
      { supplyPercent: 0, priceSol: 0.000025 },
      { supplyPercent: 20, priceSol: 0.000045 },
      { supplyPercent: 40, priceSol: 0.000085 },
      { supplyPercent: 60, priceSol: 0.00017 },
      { supplyPercent: 80, priceSol: 0.00032 },
      { supplyPercent: 100, priceSol: 0.0006 },
    ],
  },
];
