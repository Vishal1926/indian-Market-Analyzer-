import React, { useState } from 'react';
import { Copy, Check, Terminal, Database, Newspaper, ShieldAlert, Activity } from 'lucide-react';
import { ApiPipelineLog } from '../types/stock';

interface ApiIntegrationGuideProps {
  pipelineLogs: ApiPipelineLog[];
  activeSymbol: string;
  onTestSymbol: (symbol: string) => void;
}

interface StepBlueprint {
  stepNumber: string;
  title: string;
  subtitle: string;
  explanation: string;
  indianApiOptions: {
    provider: string;
    endpointExample: string;
    useCase: string;
  }[];
  codeTitle: string;
  code: string;
}

const INTEGRATION_STEPS: StepBlueprint[] = [
  {
    stepNumber: '01',
    title: 'NSE & BSE Symbol Resolution & Master Instrument Mapping',
    subtitle: 'Mapping user input ("Reliance", "TCS", "500325") to standardized NSE (.NS) and BSE (.BO) identifiers',
    explanation:
      'Indian equities trade simultaneously on the National Stock Exchange (NSE, using alphanumeric symbols like RELIANCE, TCS, HDFCBANK) and the Bombay Stock Exchange (BSE, using 6-digit scrip codes like 500325, 532540). Your first API step normalizes free-text user queries into canonical ISIN, NSE Symbol, and BSE Scrip Code identifiers.',
    indianApiOptions: [
      {
        provider: 'Zerodha Kite Connect / Upstox Instruments CSV',
        endpointExample: 'GET https://api.kite.trade/instruments/NSE',
        useCase: 'Daily master dump of all NSE/BSE instrument tokens, lot sizes, and ISIN codes.',
      },
      {
        provider: 'Yahoo Finance Indian Symbol Search',
        endpointExample: 'GET https://query1.finance.yahoo.com/v1/finance/search?q=Reliance+India',
        useCase: 'Instant free-text autocomplete resolving company names to .NS (NSE) and .BO (BSE) tickers.',
      },
      {
        provider: 'NSE India Official Autocomplete',
        endpointExample: 'GET https://www.nseindia.com/api/search/autocomplete?q=RELIANCE',
        useCase: 'Direct exchange symbol lookup (requires session cookie initialization).',
      },
    ],
    codeTitle: 'Step 1 — Server-Side NSE/BSE Symbol Resolver (Node.js / TypeScript)',
    code: `// Resolve any company name or ticker to NSE (.NS) and BSE (.BO) symbols
export async function resolveIndianStockSymbol(userQuery: string) {
  const url = \`https://query1.finance.yahoo.com/v1/finance/search?q=\${encodeURIComponent(
    userQuery + ' India'
  )}&quotesCount=5\`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const data = await response.json();

  // Filter strictly for National Stock Exchange (.NS) or BSE (.BO)
  const match = data.quotes?.find(
    (q: any) => q.symbol?.endsWith('.NS') || q.symbol?.endsWith('.BO')
  );

  const baseSymbol = match ? match.symbol.replace(/\\.(NS|BO)$/i, '') : userQuery.toUpperCase();
  return {
    nseTicker: \`\${baseSymbol}.NS\`,
    bseTicker: \`\${baseSymbol}.BO\`,
    companyName: match?.longname || match?.shortname || baseSymbol
  };
}`,
  },
  {
    stepNumber: '02',
    title: 'Fetching Current Market Price (CMP) & Historical OHLCV Series',
    subtitle: 'Ingesting live NSE/BSE spot price, 52-week range, and 90-day daily candles',
    explanation:
      'Once you have the NSE symbol (e.g. RELIANCE.NS), your backend route fetches the current market price (CMP in ₹), previous close, 52-week high/low, and historical daily OHLCV (Open, High, Low, Close, Volume) series. You then compute technical indicators (14-day RSI, 50-DMA, 200-DMA) to establish quantitative support and resistance bands.',
    indianApiOptions: [
      {
        provider: 'Yahoo Finance v8 Chart API (Active in this App)',
        endpointExample: 'GET https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS?interval=1d&range=3mo',
        useCase: 'Zero-auth server-side JSON feed returning CMP, 52W High/Low, and daily OHLCV arrays for .NS and .BO.',
      },
      {
        provider: 'Upstox Developer API v2 / Angel One SmartAPI',
        endpointExample: 'GET https://api.upstox.com/v2/market-quote/quotes?instrument_key=NSE_EQ|INE002A01018',
        useCase: 'Real-time tick-by-tick Level-2 market depth & intraday candles for Indian retail/quant apps.',
      },
      {
        provider: 'NSE India Equity Quote API',
        endpointExample: 'GET https://www.nseindia.com/api/quote-equity?symbol=RELIANCE',
        useCase: 'Official NSE delivery percentage, VWAP, and circuit limits.',
      },
    ],
    codeTitle: 'Step 2 — Fetching Live NSE Price & Computing Technical Trend Bands',
    code: `export async function fetchNseMarketPriceAndTrend(nseSymbol: string) {
  const endpoint = \`https://query1.finance.yahoo.com/v8/finance/chart/\${nseSymbol}.NS?interval=1d&range=3mo\`;
  const res = await fetch(endpoint, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const json = await res.json();
  const result = json.chart.result[0];

  const currentPrice = result.meta.regularMarketPrice;
  const previousClose = result.meta.chartPreviousClose;
  const high52Week = result.meta.fiftyTwoWeekHigh;
  const low52Week = result.meta.fiftyTwoWeekLow;

  const closes: number[] = result.indicators.quote[0].close.filter(Boolean);
  const sma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, closes.length);

  return {
    currentPrice,
    dayChangePercent: ((currentPrice - previousClose) / previousClose) * 100,
    high52Week,
    low52Week,
    sma50
  };
}`,
  },
  {
    stepNumber: '03',
    title: 'Top 5 Price-Moving News Catalysts & Upside/Downside Scenarios',
    subtitle: 'Combining live web search grounding with structured equity catalyst extraction',
    explanation:
      'Raw news feeds often include irrelevant PR noise. By calling Gemini 3.8 Flash on the backend with Google Search Grounding enabled (tools: [{ googleSearch: {} }]), your pipeline retrieves the latest verified articles from Economic Times, Mint, Moneycontrol, Business Standard, and NSE corporate filings, filters for the top 5 price-inducing catalysts, and quantifies each item’s expected stock price sensitivity.',
    indianApiOptions: [
      {
        provider: 'Gemini API + Google Search Grounding (Active in this App)',
        endpointExample: 'ai.models.generateContent({ model: "gemini-3.8-flash", config: { tools: [{ googleSearch: {} }] } })',
        useCase: 'Fetches live Indian financial news, extracts grounding URLs, and scores upside/downside price impact.',
      },
      {
        provider: 'NSE Corporate Announcements API',
        endpointExample: 'GET https://www.nseindia.com/api/corporate-announcements?index=equities&symbol=TCS',
        useCase: 'Direct SEBI Regulation 30 exchange filings (board meetings, order wins, dividends, M&A).',
      },
      {
        provider: 'Economic Times / Moneycontrol RSS & NewsAPI',
        endpointExample: 'GET https://newsapi.org/v2/everything?q="Reliance Industries"+AND+(NSE+OR+BSE)',
        useCase: 'Headline aggregation across Indian financial publications.',
      },
    ],
    codeTitle: 'Step 3 — Grounded Top 5 News Catalysts & Upside/Downside Target Extraction',
    code: `import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function fetchGroundedCatalystsAndTargets(companyName: string, nseSymbol: string, cmp: number) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: \`Analyze \${companyName} (NSE: \${nseSymbol}, CMP: ₹\${cmp}).
      Fetch the top 5 recent news items that can induce stock price movement,
      compute 12M upside target & downside support, and return structured JSON.\`,
    config: {
      tools: [{ googleSearch: {} }] // Enables real-time web search grounding
    }
  });

  // Extract verified citation links from groundingMetadata
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((c) => c.web)
    .filter(Boolean);

  return { analysis: JSON.parse(response.text || '{}'), sources };
}`,
  },
  {
    stepNumber: '04',
    title: 'Quantitative Stock Risk Engine & Research Database Persistence',
    subtitle: 'Computing 4-factor risk scores and persisting records into your research database',
    explanation:
      'Finally, combine historical price volatility (annualized standard deviation = daily σ × √252) and maximum 1-year drawdown with fundamental risk dimensions (Regulatory/SEBI/RBI policy risk, Sector cyclicality, Valuation P/E premium, and Leverage) into a 1–100 Composite Risk Score, then upsert the record into your database.',
    indianApiOptions: [
      {
        provider: 'Quantitative Volatility & Drawdown Calculator',
        endpointExample: 'σ_annual = stdDev(dailyLogReturns) * Math.sqrt(252)',
        useCase: 'Measures realized NSE price swing intensity and tail-risk drawdown.',
      },
      {
        provider: 'Persistent Research Database API (Active in this App)',
        endpointExample: 'POST /api/database  |  GET /api/database  |  DELETE /api/database/:id',
        useCase: 'Stores full stock research snapshots, custom analyst notes, and conviction tags.',
      },
    ],
    codeTitle: 'Step 4 — Computing Annualized Volatility & Upserting to Research Database',
    code: `// 1. Compute Annualized Volatility (%) from NSE daily closing prices
export function calculateAnnualizedVolatility(closes: number[]): number {
  const dailyReturns = closes.slice(1).map((price, i) => (price - closes[i]) / closes[i]);
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / dailyReturns.length;
  return Number((Math.sqrt(variance) * Math.sqrt(252) * 100).toFixed(1));
}

// 2. Save or update stock profile in your Research Database
export async function saveStockToResearchDatabase(stockRecord: StockResearchRecord) {
  const response = await fetch('/api/database', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stockRecord),
  });
  return response.json();
}`,
  },
];

export const ApiIntegrationGuide: React.FC<ApiIntegrationGuideProps> = ({
  pipelineLogs,
  activeSymbol,
  onTestSymbol,
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const currentBlueprint = INTEGRATION_STEPS[selectedStep];

  return (
    <div className="space-y-8">
      {/* Live Pipeline Telemetry Inspector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-medium text-slate-500">
              <span>Live Backend Execution Trace</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Active Ticker: NSE:{activeSymbol}</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Real-Time NSE / BSE API Pipeline Trace
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">Test Live Pipeline:</span>
            {['INFY', 'ICICIBANK', 'ZOMATO', 'LT'].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => onTestSymbol(sym)}
                className="px-3 py-1.5 text-xs font-mono font-medium bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Fetch {sym}.NS
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Step</th>
                <th className="py-2.5 px-4">Integration Stage</th>
                <th className="py-2.5 px-4">Executed Endpoint / SDK Route</th>
                <th className="py-2.5 px-4">Payload Result</th>
                <th className="py-2.5 pl-4 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {pipelineLogs.map((log) => (
                <tr key={log.step} className="hover:bg-slate-50/80">
                  <td className="py-3 pr-4 font-mono tabular-nums font-semibold text-slate-900">
                    0{log.step}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                    {log.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {log.endpoint}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {log.detail}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono tabular-nums font-medium text-emerald-700 whitespace-nowrap">
                    {log.latencyMs} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step-by-Step Interactive Architecture Guide */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="max-w-3xl">
          <div className="text-xs font-medium text-slate-500">
            <span>Architecture &amp; Implementation Guide</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>End-to-End Indian Stock Market Data Engineering</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Step-by-Step Guide: Integrating NSE &amp; BSE APIs into Your Research Database
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            To build a reliable Indian stock market research database that fetches the{' '}
            <strong className="font-semibold text-slate-900">Current Market Price (CMP)</strong>,{' '}
            <strong className="font-semibold text-slate-900">Upside &amp; Downside Trend</strong>,{' '}
            <strong className="font-semibold text-slate-900">Top 5 Price-Moving News Items</strong>, and{' '}
            <strong className="font-semibold text-slate-900">Multi-Factor Stock Risk</strong>, your backend
            orchestrates four sequential stages. Select any stage below to inspect the API providers and copy the
            server-side integration code.
          </p>
        </div>

        {/* Interactive Step Selector Tabs */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {INTEGRATION_STEPS.map((s, idx) => {
            const isSelected = selectedStep === idx;
            const Icon =
              idx === 0 ? Terminal : idx === 1 ? Activity : idx === 2 ? Newspaper : Database;
            return (
              <button
                key={s.stepNumber}
                type="button"
                onClick={() => setSelectedStep(idx)}
                className={`text-left p-4 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-semibold ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    STEP {s.stepNumber}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                  />
                </div>
                <div className="mt-2 text-sm font-semibold leading-snug">
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Detail View */}
        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="text-xs font-mono font-semibold text-slate-500">
                STAGE {currentBlueprint.stepNumber} ARCHITECTURE
              </div>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                {currentBlueprint.title}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {currentBlueprint.subtitle}
              </p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {currentBlueprint.explanation}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-slate-900">
                Recommended Indian Market API Endpoints for Stage {currentBlueprint.stepNumber}:
              </div>
              {currentBlueprint.indianApiOptions.map((opt) => (
                <div
                  key={opt.provider}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1"
                >
                  <div className="text-xs font-semibold text-slate-900">
                    {opt.provider}
                  </div>
                  <div className="text-[11px] font-mono text-slate-700 break-all">
                    {opt.endpointExample}
                  </div>
                  <p className="text-xs text-slate-600">{opt.useCase}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
                <span className="text-xs font-mono text-slate-300">
                  {currentBlueprint.codeTitle}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentBlueprint.code, selectedStep)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedIndex === selectedStep ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
                <code>{currentBlueprint.code}</code>
              </pre>
            </div>

            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong className="font-semibold text-slate-900">
                  Production Security Note:
                </strong>{' '}
                Always execute NSE/BSE market data calls and Gemini Search Grounding requests on your backend server (
                <code className="font-mono text-slate-800">server.ts</code>) rather than directly in the browser. This
                avoids browser CORS blocks from <code className="font-mono text-slate-800">nseindia.com</code> and
                keeps your API credentials protected.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
