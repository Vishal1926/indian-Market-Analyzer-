import React, { useState } from 'react';
import { PricePoint } from '../types/stock';

interface PriceTrendChartProps {
  priceHistory: PricePoint[];
  currentPrice: number;
  upsideTarget: number;
  downsideSupport: number;
  sma50: number;
  nseSymbol: string;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  priceHistory,
  currentPrice,
  upsideTarget,
  downsideSupport,
  sma50,
  nseSymbol,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = priceHistory.length > 1 ? priceHistory : [
    { date: '2026-10-01', close: currentPrice * 0.96, volume: 2100000 },
    { date: '2026-11-06', close: currentPrice, volume: 2500000 },
  ];

  const allValues = [
    ...points.map((p) => p.close),
    upsideTarget,
    downsideSupport,
    sma50,
  ];

  const minVal = Math.min(...allValues) * 0.975;
  const maxVal = Math.max(...allValues) * 1.025;
  const range = Math.max(1, maxVal - minVal);

  const width = 760;
  const height = 270;
  const padLeft = 16;
  const padRight = 92;
  const padTop = 22;
  const padBottom = 28;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const getX = (index: number) =>
    padLeft + (index / Math.max(1, points.length - 1)) * plotWidth;
  const getY = (val: number) =>
    padTop + plotHeight - ((val - minVal) / range) * plotHeight;

  const pathCoordinates = points.map((p, i) => `${getX(i).toFixed(1)},${getY(p.close).toFixed(1)}`);
  const linePath = `M ${pathCoordinates.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(points.length - 1).toFixed(1)},${(padTop + plotHeight).toFixed(1)} L ${padLeft},${(padTop + plotHeight).toFixed(1)} Z`;

  const upsideY = getY(upsideTarget);
  const downsideY = getY(downsideSupport);
  const smaY = getY(sma50);
  const currentY = getY(currentPrice);

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : points[points.length - 1];
  const activeIdx = hoverIndex !== null ? hoverIndex : points.length - 1;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="text-xs font-medium text-slate-500">
            <span>NSE: {nseSymbol}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>30-Session Price Action &amp; Scenario Projection Corridor</span>
          </div>
          <div className="mt-1 flex items-baseline gap-4">
            <span className="text-lg font-semibold text-slate-900 font-mono tabular-nums">
              ₹{activePoint.close.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Session: {activePoint.date} · Vol: {(activePoint.volume / 100000).toFixed(2)}L shares
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-mono tabular-nums">
          <span className="text-emerald-700 font-medium">
            Upside Target: ₹{upsideTarget.toLocaleString('en-IN')}
          </span>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="text-slate-600">
            50-DMA: ₹{sma50.toLocaleString('en-IN')}
          </span>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="text-rose-700 font-medium">
            Downside Support: ₹{downsideSupport.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="mt-4 relative select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-64 overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="priceAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal grid lines */}
          {[0.2, 0.5, 0.8].map((ratio, idx) => {
            const y = padTop + plotHeight * ratio;
            const val = maxVal - range * ratio;
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={width - padRight + 8}
                  y={y + 4}
                  className="fill-slate-400 text-[10px] font-mono"
                >
                  ₹{Math.round(val).toLocaleString('en-IN')}
                </text>
              </g>
            );
          })}

          {/* Upside Target Line */}
          <line
            x1={padLeft}
            y1={upsideY}
            x2={width - padRight}
            y2={upsideY}
            stroke="#15803d"
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />
          <text
            x={width - padRight + 8}
            y={upsideY + 4}
            className="fill-emerald-700 text-[10px] font-mono font-semibold"
          >
            ▲ ₹{Math.round(upsideTarget).toLocaleString('en-IN')}
          </text>

          {/* 50-DMA Reference Line */}
          <line
            x1={padLeft}
            y1={smaY}
            x2={width - padRight}
            y2={smaY}
            stroke="#64748b"
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* Downside Support Line */}
          <line
            x1={padLeft}
            y1={downsideY}
            x2={width - padRight}
            y2={downsideY}
            stroke="#be123c"
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />
          <text
            x={width - padRight + 8}
            y={downsideY + 4}
            className="fill-rose-700 text-[10px] font-mono font-semibold"
          >
            ▼ ₹{Math.round(downsideSupport).toLocaleString('en-IN')}
          </text>

          {/* Historical Area & Price Line */}
          <path d={areaPath} fill="url(#priceAreaGrad)" />
          <path
            d={linePath}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Projection fan from latest point to Upside & Downside targets */}
          <line
            x1={getX(points.length - 1)}
            y1={currentY}
            x2={width - padRight}
            y2={upsideY}
            stroke="#15803d"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.65"
          />
          <line
            x1={getX(points.length - 1)}
            y1={currentY}
            x2={width - padRight}
            y2={downsideY}
            stroke="#be123c"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.65"
          />

          {/* Active hover vertical hairline & marker */}
          <line
            x1={getX(activeIdx)}
            y1={padTop}
            x2={getX(activeIdx)}
            y2={padTop + plotHeight}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <circle
            cx={getX(activeIdx)}
            cy={getY(activePoint.close)}
            r="4.5"
            fill="#0f172a"
            stroke="#ffffff"
            strokeWidth="2"
          />

          {/* Date labels along bottom */}
          <text x={padLeft} y={height - 6} className="fill-slate-400 text-[10px] font-mono">
            {points[0]?.date}
          </text>
          <text
            x={padLeft + plotWidth / 2 - 28}
            y={height - 6}
            className="fill-slate-400 text-[10px] font-mono"
          >
            {points[Math.floor(points.length / 2)]?.date}
          </text>
          <text
            x={width - padRight - 62}
            y={height - 6}
            className="fill-slate-500 text-[10px] font-mono font-medium"
          >
            {points[points.length - 1]?.date}
          </text>

          {/* Interactive hit rectangles */}
          {points.map((_, idx) => {
            const sliceW = plotWidth / points.length;
            return (
              <rect
                key={idx}
                x={padLeft + idx * sliceW}
                y={padTop}
                width={sliceW}
                height={plotHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
