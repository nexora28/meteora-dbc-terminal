import React, { useState } from 'react';
import { DBCPreset } from './presets';

interface BondingCurveChartProps {
  preset: DBCPreset;
  customInitialMcap?: number;
  customMigrationMcap?: number;
  customMigrationThreshold?: number;
}

export const BondingCurveChart: React.FC<BondingCurveChartProps> = ({
  preset,
  customInitialMcap,
  customMigrationMcap,
  customMigrationThreshold,
}) => {
  const [viewMode, setViewMode] = useState<'price' | 'mcap'>('price');
  const [simulatedBuySol, setSimulatedBuySol] = useState<number>(10);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const initialMcap = customInitialMcap ?? preset.initialMarketCapSol;
  const migrationMcap = customMigrationMcap ?? preset.migrationMarketCapSol;
  const migrationThreshold = customMigrationThreshold ?? preset.migrationQuoteThresholdSol;

  // Chart dimensions
  const width = 600;
  const height = 240;
  const padding = { top: 28, right: 35, bottom: 42, left: 68 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const points = preset.curvePoints;

  // Values based on view mode
  const getYValue = (p: { supplyPercent: number; priceSol: number }) => {
    if (viewMode === 'mcap') {
      return initialMcap + ((migrationMcap - initialMcap) * p.supplyPercent) / 100;
    }
    return p.priceSol;
  };

  const values = points.map(getYValue);
  const maxValue = Math.max(...values) * 1.15;
  const minValue = 0;

  // Coordinate mapping
  const getX = (supplyPercent: number) => padding.left + (supplyPercent / 100) * graphWidth;
  const getY = (val: number) =>
    padding.top + graphHeight - ((val - minValue) / (maxValue - minValue)) * graphHeight;

  // Build SVG path
  const pathD = points.reduce((acc, point, index) => {
    const x = getX(point.supplyPercent);
    const y = getY(getYValue(point));
    if (index === 0) return `M ${x} ${y}`;

    const prev = points[index - 1];
    const prevX = getX(prev.supplyPercent);
    const prevY = getY(getYValue(prev));
    const cp1x = prevX + (x - prevX) / 2;
    const cp1y = prevY;
    const cp2x = prevX + (x - prevX) / 2;
    const cp2y = y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
  }, '');

  // Fill area path
  const firstX = getX(points[0].supplyPercent);
  const lastX = getX(points[points.length - 1].supplyPercent);
  const bottomY = padding.top + graphHeight;
  const areaD = `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

  // Simulation calculations
  const simProgressPercent = Math.min(100, Math.max(0, (simulatedBuySol / migrationThreshold) * 100));
  const simCurrentPrice =
    points[0].priceSol +
    ((points[points.length - 1].priceSol - points[0].priceSol) * (simProgressPercent / 100));
  const simCurrentMcap =
    initialMcap + ((migrationMcap - initialMcap) * simProgressPercent) / 100;
  const simSlippage = (simProgressPercent * 0.08).toFixed(2);

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];
  const activePrice = activePoint.priceSol;
  const activeMcap =
    initialMcap + ((migrationMcap - initialMcap) * activePoint.supplyPercent) / 100;

  return (
    <div className="terminal-panel rounded-2xl p-5 md:p-6 shadow-2xl space-y-4">
      {/* Terminal Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30">
            <span className="iconify h-4 w-4 ph--chart-line-up-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-tight">
                Meteora Bonding Curve Visualizer
              </h3>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${preset.badgeColor}`}>
                {preset.curveModeName}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Live mathematical simulation with DAMM v2 liquidity graduation
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-950 p-1">
          <button
            onClick={() => setViewMode('price')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              viewMode === 'price'
                ? 'bg-primary text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Token Price
          </button>
          <button
            onClick={() => setViewMode('mcap')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              viewMode === 'mcap'
                ? 'bg-primary text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Market Cap
          </button>
        </div>
      </div>

      {/* SVG Canvas with Neon Glow */}
      <div className="relative w-full overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-950/70 p-3 backdrop-blur-md">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ maxHeight: '240px' }}
        >
          <defs>
            <linearGradient id="neonOrangeArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#ff4d00" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ff4d00" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="neonOrangeStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff8533" />
              <stop offset="60%" stopColor="#ff4d00" />
              <stop offset="100%" stopColor="#ff1a00" />
            </linearGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ff4d00" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + graphHeight * pct;
            return (
              <line
                key={`grid-h-${i}`}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#1f2937"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            );
          })}

          {/* Migration Target Line */}
          <line
            x1={lastX}
            y1={padding.top}
            x2={lastX}
            y2={bottomY}
            stroke="#10b981"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text
            x={lastX - 6}
            y={padding.top + 10}
            textAnchor="end"
            className="fill-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider"
          >
            {preset.migrationTarget} Migration ({migrationThreshold} SOL)
          </text>

          {/* Area fill */}
          <path d={areaD} fill="url(#neonOrangeArea)" />

          {/* Curve stroke with neon glow */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#neonOrangeStroke)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#neonGlow)"
          />

          {/* Interactive Simulation Marker */}
          {(() => {
            const simX = getX(simProgressPercent);
            const simY = getY(
              viewMode === 'mcap'
                ? simCurrentMcap
                : simCurrentPrice
            );

            return (
              <g>
                <line
                  x1={simX}
                  y1={padding.top}
                  x2={simX}
                  y2={bottomY}
                  stroke="#38bdf8"
                  strokeDasharray="2 2"
                  strokeWidth="1.5"
                />
                <circle
                  cx={simX}
                  cy={simY}
                  r={6}
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="animate-pulse"
                />
              </g>
            );
          })()}

          {/* Data Points */}
          {points.map((pt, idx) => {
            const cx = getX(pt.supplyPercent);
            const cy = getY(getYValue(pt));
            const isHovered = hoverIndex === idx;

            return (
              <g
                key={`pt-${idx}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#ff4d00' : '#0b0f17'}
                  stroke={isHovered ? '#ffffff' : '#ff7733'}
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {[0, 25, 50, 75, 100].map((val) => (
            <text
              key={`x-lbl-${val}`}
              x={getX(val)}
              y={height - 12}
              textAnchor="middle"
              className="fill-neutral-400 font-mono text-[9px]"
            >
              {val}% sold
            </text>
          ))}

          {/* Y-axis labels */}
          <text
            x={padding.left - 8}
            y={getY(maxValue * 0.95)}
            textAnchor="end"
            className="fill-neutral-400 font-mono text-[9px]"
          >
            {viewMode === 'mcap'
              ? `${(maxValue * 0.95).toFixed(0)} SOL`
              : `${(maxValue * 0.95).toFixed(5)} SOL`}
          </text>
          <text
            x={padding.left - 8}
            y={getY(maxValue * 0.5)}
            textAnchor="end"
            className="fill-neutral-400 font-mono text-[9px]"
          >
            {viewMode === 'mcap'
              ? `${(maxValue * 0.5).toFixed(0)} SOL`
              : `${(maxValue * 0.5).toFixed(5)} SOL`}
          </text>
          <text
            x={padding.left - 8}
            y={bottomY}
            textAnchor="end"
            className="fill-neutral-400 font-mono text-[9px]"
          >
            0
          </text>
        </svg>

        {/* Live HUD telemetry readouts */}
        <div className="mt-3 flex flex-wrap items-center justify-between border-t border-white/[0.06] pt-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-neutral-400">
              Simulated Inflow: <strong className="text-cyan-300">{simulatedBuySol} SOL</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-neutral-400">
              Est. Price: <strong className="text-white">{simCurrentPrice.toFixed(6)} SOL</strong>
            </span>
            <span className="text-neutral-400">
              Valuation: <strong className="text-emerald-400">{simCurrentMcap.toFixed(1)} SOL</strong>
            </span>
            <span className="text-neutral-400">
              Slippage: <strong className="text-amber-400">~{simSlippage}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Scrubber */}
      <div className="rounded-xl border border-white/[0.06] bg-neutral-950/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="iconify h-4 w-4 text-cyan-400 ph--sliders-horizontal-bold" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Meteora Inflow Simulator
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[5, 25, 50, 80].map((amt) => (
              <button
                key={amt}
                onClick={() => setSimulatedBuySol(Math.min(amt, migrationThreshold))}
                className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold transition-colors ${
                  simulatedBuySol === amt
                    ? 'bg-cyan-500 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                +{amt} SOL
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
            <span>Pool Fill Progress</span>
            <span className="text-cyan-400 font-bold">{simProgressPercent.toFixed(1)}% to Graduation</span>
          </div>
          <input
            type="range"
            min="1"
            max={migrationThreshold}
            step="1"
            value={simulatedBuySol}
            onChange={(e) => setSimulatedBuySol(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-neutral-800"
          />
        </div>
      </div>

      {/* Dynamic Telemetry Specs */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-neutral-950/50 p-3">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Anti-Snipe Shield</span>
            <span className="iconify h-3.5 w-3.5 text-emerald-400 ph--shield-check-bold" />
          </div>
          <div className="mt-1 font-mono text-xs font-bold text-white">
            {preset.antiSnipeFeeEnabled ? (
              <span className="text-emerald-400">
                {preset.startingFeePercent}% → {preset.endingFeePercent}% ({preset.feeDecayDurationSlots} slots)
              </span>
            ) : (
              <span className="text-neutral-500">None (Standard)</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-neutral-950/50 p-3">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Volatility Engine</span>
            <span className="iconify h-3.5 w-3.5 text-cyan-400 ph--wave-sine-bold" />
          </div>
          <div className="mt-1 font-mono text-xs font-bold text-white">
            {preset.dynamicFee ? (
              <span className="text-cyan-400">Active Dynamic Fees</span>
            ) : (
              <span className="text-neutral-500">Static Base Fee</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-neutral-950/50 p-3">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Creator Yield Share</span>
            <span className="iconify h-3.5 w-3.5 text-primary ph--hand-coins-bold" />
          </div>
          <div className="mt-1 font-mono text-xs font-bold text-primary">
            {preset.creatorFeeSharePercent}% of Pool Volume
          </div>
        </div>
      </div>
    </div>
  );
};
