type CurvePoint = { supplyPercent: number; priceSol: number };
export interface DBCPreset {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  description: string;
  assetClass: 'MEME' | 'EQUITY' | 'DEGEN' | 'DAO' | 'CUSTOM';
  quoteToken: 'SOL' | 'USDC';
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
  migrationTarget: 'DAMM v2';
  curvePoints: [CurvePoint, ...CurvePoint[]];
}

export const DBC_PRESETS: [DBCPreset, ...DBCPreset[]] = [
  {
    id: 'anti-snipe',
    name: 'Anti-Snipe Fair Launch',
    tagline: 'Early trading fee decay',
    badge: 'Meme Fair Launch',
    badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    description:
      'The supported devnet launch starts at a 99% base fee and decays to 1.25% over 120 slots. This does not guarantee protection from bots.',
    assetClass: 'MEME',
    quoteToken: 'SOL',
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
    migrationTarget: 'DAMM v2',
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
    tagline: 'Illustrative USDC quote concept',
    badge: 'Tokenized Stock & RWA',
    badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    description:
      'Preview of a USDC-quoted launch. No stock backing, redemption, price tether or external asset integration is implemented.',
    assetClass: 'EQUITY',
    quoteToken: 'USDC',
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
    migrationTarget: 'DAMM v2',
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
      'Illustrative curve with a low starting price and steeper later prices. Deployment and graduation are not implemented for this preview.',
    assetClass: 'DEGEN',
    quoteToken: 'SOL',
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
    migrationTarget: 'DAMM v2',
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
    name: 'DAO Liquidity Concept',
    tagline: 'Illustrative DAO liquidity allocation',
    badge: 'DAO & Governance',
    badgeColor: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
    description:
      'Preview of DAO-oriented launch settings. Compounding and fee reinvestment are not implemented.',
    assetClass: 'DAO',
    quoteToken: 'SOL',
    buildCurveMode: 3,
    curveModeName: 'buildCurveWithLiquidityWeights',
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
      'Explore illustrative curve and fee settings. Custom parameters are not connected to deployment.',
    assetClass: 'CUSTOM',
    quoteToken: 'SOL',
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
    migrationTarget: 'DAMM v2',
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
