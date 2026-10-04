export interface DBCPreset {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  description: string;
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
  migrationTarget: 'DAMM v2' | 'DAMM v1';
  curvePoints: { supplyPercent: number; priceSol: number }[];
}

export const DBC_PRESETS: DBCPreset[] = [
  {
    id: 'anti-snipe',
    name: 'Anti-Snipe Fair Launch',
    tagline: 'Decaying MEV Penalty + Gradual Slope',
    badge: 'Fair Launch',
    badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    description:
      'Protects real buyers from MEV bots with a 25% starting fee decaying over 120 slots. Uses a smooth 2-segment curve to allow organic community accumulation.',
    buildCurveMode: 2,
    curveModeName: 'buildCurveWithTwoSegments',
    initialMarketCapSol: 30,
    migrationMarketCapSol: 550,
    migrationQuoteThresholdSol: 85,
    percentageSupplyOnMigration: 25,
    antiSnipeFeeEnabled: true,
    startingFeePercent: 25,
    endingFeePercent: 1.0,
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
    name: 'RWA & Tokenized Equity',
    tagline: 'High Initial Depth + Low Volatility Discovery',
    badge: 'Institutions & RWA',
    badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    description:
      'Engineered for tokenized stocks, real-world assets, and pre-IPO instruments. Flat initial curve prevents frontrunning, transitioning smoothly into DAMM v2 deep liquidity bins.',
    buildCurveMode: 4,
    curveModeName: 'buildCurveWithMidPrice',
    initialMarketCapSol: 100,
    migrationMarketCapSol: 1200,
    migrationQuoteThresholdSol: 250,
    percentageSupplyOnMigration: 35,
    antiSnipeFeeEnabled: false,
    startingFeePercent: 0.5,
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
      'Low starting valuation with exponential price scaling as bonding supply fills. Maximizes early hype and achieves fast DAMM v2 migration.',
    buildCurveMode: 1,
    curveModeName: 'buildCurveWithMarketCap',
    initialMarketCapSol: 15,
    migrationMarketCapSol: 450,
    migrationQuoteThresholdSol: 60,
    percentageSupplyOnMigration: 20,
    antiSnipeFeeEnabled: true,
    startingFeePercent: 5.0,
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
    id: 'custom-studio',
    name: 'Custom DBC Studio',
    tagline: 'Full Parameter Customization',
    badge: 'Pro Configurator',
    badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    description:
      'Configure every facet of Meteora DBC: curve mode, migration quote thresholds, fee schedules, dynamic volatility fees, and DAMM v2 permanent liquidity locks.',
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
