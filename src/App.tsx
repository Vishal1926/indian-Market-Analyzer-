import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  BookmarkCheck,
  BookmarkPlus,
  ExternalLink,
  Trash2,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from 'lucide-react';
import { StockResearchRecord, ApiPipelineLog } from './types/stock';
import { INITIAL_STOCK_DATABASE, INDIAN_STOCK_DIRECTORY } from './data/seedStocks';
import { PriceTrendChart } from './components/PriceTrendChart';
import { RiskProfilePanel } from './components/RiskProfilePanel';
import { ApiIntegrationGuide } from './components/ApiIntegrationGuide';

type ActiveSection = 'terminal' | 'database' | 'risk' | 'blueprint';

export default function App() {
  const [database, setDatabase] = useState<StockResearchRecord[]>(INITIAL_STOCK_DATABASE);
  const [activeStock, setActiveStock] = useState<StockResearchRecord>(INITIAL_STOCK_DATABASE[0]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('terminal');

  // Database filtering state
  const [dbFilterTag, setDbFilterTag] = useState<string>('ALL');
  const [dbSearchQuery, setDbSearchQuery] = useState<string>('');

  // Editable analyst thesis & conviction tag for the active stock
  const [notesDraft, setNotesDraft] = useState<string>(INITIAL_STOCK_DATABASE[0].analystNotes);
  const [tagDraft, setTagDraft] = useState<StockResearchRecord['watchlistTag']>(
    INITIAL_STOCK_DATABASE[0].watchlistTag
  );

  // Live API pipeline execution logs
  const [pipelineLogs, setPipelineLogs] = useState<ApiPipelineLog[]>([
    {
      step: 1,
      name: 'NSE / BSE Symbol Resolution',
      endpoint: 'GET /v1/finance/search?q=RELIANCE',
      status: 'success',
      latencyMs: 24,
      detail: 'NSE/BSE Master Symbol Directory (RELIANCE.NS / 500325.BO)',
    },
    {
      step: 2,
      name: 'NSE/BSE Live Price & OHLCV Telemetry',
      endpoint: 'GET /v8/finance/chart/RELIANCE.NS?interval=1d&range=3mo',
      status: 'success',
      latencyMs: 68,
      detail: 'Fetched CMP ₹1,452.80, RSI(14)=58.4, 30-day OHLCV series',
    },
    {
      step: 3,
      name: 'Google Search Grounding & News Catalyst Engine',
      endpoint: 'POST @google/genai (gemini-3.8-flash + googleSearch)',
      status: 'success',
      latencyMs: 410,
      detail: 'Synthesized 5 price-moving news catalysts, upside/downside targets, and 4-factor risk profile',
    },
    {
      step: 4,
      name: 'Quantitative Risk & Research Schema Validation',
      endpoint: 'Internal Risk Engine (Volatility, Beta, 4-Factor Scoring)',
      status: 'success',
      latencyMs: 11,
      detail: 'Computed Composite Risk Score 32/100 (Low Risk) & Annualized Volatility 18.4%',
    },
  ]);

  // Load saved database from backend on mount
  useEffect(() => {
    fetch('/api/database')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.stocks) && data.stocks.length > 0) {
          setDatabase(data.stocks);
          setActiveStock(data.stocks[0]);
          setNotesDraft(data.stocks[0].analystNotes);
          setTagDraft(data.stocks[0].watchlistTag);
        }
      })
      .catch(() => {
        // Fallback to initial seed database
      });
  }, []);

  // Sync draft notes when switching activeStock
  useEffect(() => {
    setNotesDraft(activeStock.analystNotes);
    setTagDraft(activeStock.watchlistTag);
  }, [activeStock.id, activeStock.analystNotes, activeStock.watchlistTag]);

  const handleAnalyzeStock = async (queryOverride?: string) => {
    const query = (queryOverride !== undefined ? queryOverride : searchInput).trim();
    if (!query) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/stocks/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch Indian stock research telemetry.');
      }

      const data = await response.json();
      if (data.stock) {
        setActiveStock(data.stock);
        if (Array.isArray(data.pipelineLogs)) {
          setPipelineLogs(data.pipelineLogs);
        }
        setSearchInput(data.stock.nseSymbol);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Unable to reach NSE/BSE research backend. Displaying cached research record.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    const updatedStock: StockResearchRecord = {
      ...activeStock,
      analystNotes: notesDraft,
      watchlistTag: tagDraft,
      inDatabase: true,
      lastUpdated: new Date().toISOString(),
    };

    setActiveStock(updatedStock);

    try {
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStock),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.stocks)) {
          setDatabase(data.stocks);
        }
      } else {
        setDatabase((prev) => {
          const exists = prev.some((item) => item.id === updatedStock.id);
          return exists
            ? prev.map((item) => (item.id === updatedStock.id ? updatedStock : item))
            : [updatedStock, ...prev];
        });
      }
      setSaveFeedback(`Saved ${updatedStock.nseSymbol} to Research Database`);
      setTimeout(() => setSaveFeedback(null), 2600);
    } catch {
      setDatabase((prev) => {
        const exists = prev.some((item) => item.id === updatedStock.id);
        return exists
          ? prev.map((item) => (item.id === updatedStock.id ? updatedStock : item))
          : [updatedStock, ...prev];
      });
      setSaveFeedback(`Saved ${updatedStock.nseSymbol} locally`);
      setTimeout(() => setSaveFeedback(null), 2600);
    }
  };

  const handleDeleteFromDatabase = async (id: string) => {
    try {
      const res = await fetch(`/api/database/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.stocks)) {
          setDatabase(data.stocks);
        }
      } else {
        setDatabase((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      setDatabase((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'NSE Symbol',
      'BSE Code',
      'Company Name',
      'Sector',
      'CMP (INR)',
      'Day Change (%)',
      'Upside Target (INR)',
      'Upside (%)',
      'Downside Support (INR)',
      'Downside (%)',
      'Risk Score (1-100)',
      'Risk Rating',
      'Beta',
      'Volatility (%)',
      'Conviction Tag',
      'Analyst Notes',
    ];

    const rows = database.map((s) => [
      s.nseSymbol,
      s.bseCode,
      `"${s.companyName.replace(/"/g, '""')}"`,
      `"${s.sector.replace(/"/g, '""')}"`,
      s.currentPrice,
      s.dayChangePercent,
      s.upsideTarget,
      s.upsidePercent,
      s.downsideSupport,
      s.downsidePercent,
      s.overallRiskScore,
      s.riskRating,
      s.beta,
      s.annualizedVolatility,
      `"${s.watchlistTag}"`,
      `"${(s.analystNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nse_bse_equity_research_db_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredDatabase = useMemo(() => {
    return database.filter((item) => {
      const matchesTag = dbFilterTag === 'ALL' || item.watchlistTag === dbFilterTag;
      const q = dbSearchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.nseSymbol.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q) ||
        item.bseCode.toLowerCase().includes(q);
      return matchesTag && matchesQuery;
    });
  }, [database, dbFilterTag, dbSearchQuery]);

  const isSavedInDb = useMemo(
    () => database.some((s) => s.nseSymbol.toUpperCase() === activeStock.nseSymbol.toUpperCase()),
    [database, activeStock.nseSymbol]
  );

  // Position of current price within 52-week range (0% to 100%)
  const range52Percent = useMemo(() => {
    const span = Math.max(1, activeStock.high52Week - activeStock.low52Week);
    return Math.min(100, Math.max(2, ((activeStock.currentPrice - activeStock.low52Week) / span) * 100));
  }, [activeStock.currentPrice, activeStock.high52Week, activeStock.low52Week]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: [Brand title, one line] — [4 nav links, single-line] — [1 primary action] */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-8">
        <a
          href="#terminal"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('terminal');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display"
        >
          DalalStreet Quant
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#terminal"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('terminal');
            }}
            className={`hover:text-slate-900 hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'terminal' ? 'text-slate-900 underline font-semibold' : ''
            }`}
          >
            Research Terminal
          </a>
          <a
            href="#database"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('database');
            }}
            className={`hover:text-slate-900 hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'database' ? 'text-slate-900 underline font-semibold' : ''
            }`}
          >
            Research Database ({database.length})
          </a>
          <a
            href="#risk"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('risk');
            }}
            className={`hover:text-slate-900 hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'risk' ? 'text-slate-900 underline font-semibold' : ''
            }`}
          >
            Risk Matrix
          </a>
          <a
            href="#blueprint"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('blueprint');
            }}
            className={`hover:text-slate-900 hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'blueprint' ? 'text-slate-900 underline font-semibold' : ''
            }`}
          >
            API Integration Guide
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Search & Live NSE/BSE Ingestion Bar */}
        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="text-xs font-medium text-slate-500">
                <span>National Stock Exchange (NSE)</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Bombay Stock Exchange (BSE)</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Live Equity Research Engine</span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 balance">
                Indian Equity Intelligence &amp; Research Database
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Enter any NSE symbol, BSE scrip code, or Indian company name to fetch its current market
                price, upside/downside trend corridor, top 5 price-inducing news catalysts, and multi-factor
                risk score.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyzeStock();
              }}
              className="flex-1 max-w-xl w-full"
            >
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search stock name or NSE/BSE ticker (e.g., Reliance, TCS, HDFCBANK, HAL, Zomato)..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Fetching NSE/BSE...</span>
                    </>
                  ) : (
                    <span>Fetch Stock Research</span>
                  )}
                </button>
              </div>

              {/* Quick NSE Ticker Selector Controls */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 mr-1">Quick Tickers:</span>
                {INDIAN_STOCK_DIRECTORY.slice(0, 10).map((item) => {
                  const isCurrent = activeStock.nseSymbol.toUpperCase() === item.symbol;
                  return (
                    <button
                      key={item.symbol}
                      type="button"
                      onClick={() => {
                        setSearchInput(item.symbol);
                        const existing = database.find((d) => d.nseSymbol === item.symbol);
                        if (existing) {
                          setActiveStock(existing);
                        } else {
                          handleAnalyzeStock(item.symbol);
                        }
                      }}
                      className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item.symbol}
                    </button>
                  );
                })}
              </div>
            </form>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              {errorMessage}
            </div>
          )}

          {/* Mobile & Workspace Section Switcher */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'terminal', label: '1. Live Stock Research' },
                  { id: 'database', label: `2. Saved Database (${database.length})` },
                  { id: 'risk', label: '3. Portfolio Risk Matrix' },
                  { id: 'blueprint', label: '4. Step-by-Step API Guide' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSection === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-mono tabular-nums">
              <span>Telemetry Source: {activeStock.dataSource}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Updated: {new Date(activeStock.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </section>

        {/* SECTION 1: LIVE STOCK RESEARCH TERMINAL */}
        {activeSection === 'terminal' && (
          <div className="space-y-8">
            {/* Active Stock Header & 4-Column Quantitative KPI Strip */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                  {/* Zero-Pill Metadata Discipline: Clean unboxed text with middot separators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                    <span className="font-semibold text-slate-800">NSE: {activeStock.nseSymbol}</span>
                    <span aria-hidden="true">·</span>
                    <span>BSE: {activeStock.bseCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeStock.marketCapCategory} ({activeStock.marketCapCr})</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-sans">{activeStock.sector}</span>
                  </div>

                  <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900">
                    {activeStock.companyName}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-mono tabular-nums">
                    <span>P/E: {activeStock.peRatio.toFixed(1)}x</span>
                    <span aria-hidden="true">·</span>
                    <span>P/B: {activeStock.pbRatio.toFixed(2)}x</span>
                    <span aria-hidden="true">·</span>
                    <span>ROE: {activeStock.roePercent.toFixed(1)}%</span>
                    <span aria-hidden="true">·</span>
                    <span>Trend Stance: {activeStock.overallTrend}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {saveFeedback && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{saveFeedback}</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAnalyzeStock(activeStock.nseSymbol)}
                    disabled={isAnalyzing}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>Refresh Live Quote &amp; News</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToDatabase}
                    className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSavedInDb ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Update in Research Database</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Save to Research Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 4-Column Quantitative KPI Strip: 1. Current Market Price | 2. Upside Trend Target | 3. Downside Support | 4. Stock Risk Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Current Market Price */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      1. Current Market Price (NSE Spot)
                    </div>
                    <div className="mt-2 flex items-baseline gap-2.5 font-mono tabular-nums">
                      <span className="text-2xl font-bold text-slate-900">
                        ₹{activeStock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span
                        className={`text-xs font-semibold flex items-center ${
                          activeStock.dayChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {activeStock.dayChange >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                        )}
                        {activeStock.dayChange >= 0 ? '+' : ''}
                        {activeStock.dayChange.toFixed(2)} ({activeStock.dayChange >= 0 ? '+' : ''}
                        {activeStock.dayChangePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70">
                    <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500">
                      <span>52W Low: ₹{activeStock.low52Week.toLocaleString('en-IN')}</span>
                      <span>52W High: ₹{activeStock.high52Week.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mt-1.5 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full"
                        style={{ width: `${range52Percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Upside Trend & Target */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>2. Upside Trend Scenario (12M)</span>
                      <TrendingUp className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2.5 font-mono tabular-nums">
                      <span className="text-2xl font-bold text-emerald-700">
                        ₹{activeStock.upsideTarget.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700">
                        +{activeStock.upsidePercent.toFixed(2)}% Upside
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-600 font-mono tabular-nums flex justify-between">
                    <span>Base Case: ₹{activeStock.baseTarget.toLocaleString('en-IN')}</span>
                    <span>Resistance: {activeStock.technicalSignals.resistanceZone}</span>
                  </div>
                </div>

                {/* 3. Downside Trend & Support */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>3. Downside Risk Floor</span>
                      <TrendingDown className="w-4 h-4 text-rose-700" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2.5 font-mono tabular-nums">
                      <span className="text-2xl font-bold text-rose-700">
                        ₹{activeStock.downsideSupport.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-semibold text-rose-700">
                        {activeStock.downsidePercent.toFixed(2)}% Risk
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-600 font-mono tabular-nums flex justify-between">
                    <span>Support: {activeStock.technicalSignals.supportZone}</span>
                    <span>50-DMA: ₹{activeStock.technicalSignals.sma50.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* 4. Stock Risk Score */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      4. Composite Risk Assessment
                    </div>
                    <div className="mt-2 flex items-baseline gap-2.5 font-mono tabular-nums">
                      <span className="text-2xl font-bold text-slate-900">
                        {activeStock.overallRiskScore}/100
                      </span>
                      <span
                        className={`text-xs font-semibold font-sans ${
                          activeStock.overallRiskScore < 38
                            ? 'text-emerald-700'
                            : activeStock.overallRiskScore < 62
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {activeStock.riskRating}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-600 font-mono tabular-nums flex justify-between">
                    <span>Beta: {activeStock.beta.toFixed(2)}x</span>
                    <span>Ann. Vol: {activeStock.annualizedVolatility.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Price Trajectory Chart + Upside/Downside Drivers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <PriceTrendChart
                  priceHistory={activeStock.priceHistory}
                  currentPrice={activeStock.currentPrice}
                  upsideTarget={activeStock.upsideTarget}
                  downsideSupport={activeStock.downsideSupport}
                  sma50={activeStock.technicalSignals.sma50}
                  nseSymbol={activeStock.nseSymbol}
                />

                {/* Upside vs Downside Trend Breakdown */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        <span>Scenario Tree &amp; Technical Structure</span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span>RSI(14): {activeStock.technicalSignals.rsi14}</span>
                      </div>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        Upside Catalysts vs. Downside Risk Triggers
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-600">
                      {activeStock.technicalSignals.macdSignal}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Upside Drivers */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 pb-2 border-b border-slate-100">
                        <span>BULLISH UPSIDE DRIVERS</span>
                        <span className="font-mono tabular-nums">
                          Target: ₹{activeStock.upsideTarget.toLocaleString('en-IN')} (+{activeStock.upsidePercent.toFixed(1)}%)
                        </span>
                      </div>
                      <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                        {activeStock.upsideDrivers.map((driver, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-mono font-semibold text-emerald-700 shrink-0">
                              0{idx + 1}.
                            </span>
                            <span>{driver}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Downside Triggers */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-rose-800 pb-2 border-b border-slate-100">
                        <span>BEARISH DOWNSIDE TRIGGERS</span>
                        <span className="font-mono tabular-nums">
                          Floor: ₹{activeStock.downsideSupport.toLocaleString('en-IN')} ({activeStock.downsidePercent.toFixed(1)}%)
                        </span>
                      </div>
                      <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                        {activeStock.downsideTriggers.map((trigger, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-mono font-semibold text-rose-700 shrink-0">
                              0{idx + 1}.
                            </span>
                            <span>{trigger}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Quantitative Risk Profile + Analyst Database Note Editor */}
              <div className="lg:col-span-5 space-y-6">
                <RiskProfilePanel stock={activeStock} />

                {/* Analyst Research Note & Conviction Persistence Box */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Research Database Record
                      </div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Analyst Conviction &amp; Thesis Notes
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      {isSavedInDb ? 'Stored in DB' : 'Unsaved Draft'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Watchlist Classification
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          'Core Conviction',
                          'Accumulate on Dips',
                          'Event Catalyst Watch',
                          'High Risk / Avoid',
                        ] as const
                      ).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setTagDraft(tag)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border text-left transition-colors whitespace-nowrap truncate cursor-pointer ${
                            tagDraft === tag
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Institutional Thesis &amp; Price Trigger Notes
                    </label>
                    <textarea
                      rows={3}
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Add your target entry price, earnings catalyst notes, or stop-loss thesis..."
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900 leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveToDatabase}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    {isSavedInDb
                      ? `Save Updated Thesis for ${activeStock.nseSymbol}`
                      : `Add ${activeStock.nseSymbol} to Research Database`}
                  </button>
                </div>
              </div>
            </div>

            {/* TOP 5 PRICE-MOVING NEWS ITEMS */}
            <section className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    <span>Catalyst &amp; Event Attribution</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>NSE: {activeStock.nseSymbol}</span>
                  </div>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Top 5 Recent News Items Inducing Stock Price Movement
                  </h3>
                </div>
                <div className="text-xs text-slate-500">
                  Ranked by expected institutional volume &amp; price sensitivity
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {activeStock.newsItems.slice(0, 5).map((news, index) => (
                  <article key={news.id} className="py-5 first:pt-4 last:pb-1">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="space-y-1.5 max-w-4xl">
                        {/* Unboxed metadata line per Zero-Pill Discipline */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono font-semibold text-slate-900">
                            0{index + 1}.
                          </span>
                          <span className="font-semibold text-slate-800">{news.source}</span>
                          <span aria-hidden="true">·</span>
                          <span>{news.publishedAt}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`font-semibold ${
                              news.sentiment === 'Positive'
                                ? 'text-emerald-700'
                                : news.sentiment === 'Negative'
                                ? 'text-rose-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {news.sentiment} Catalyst
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-slate-700">{news.impactLevel}</span>
                        </div>

                        <h4 className="text-base font-semibold text-slate-900 leading-snug">
                          {news.url ? (
                            <a
                              href={news.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline inline-flex items-center gap-1.5"
                            >
                              <span>{news.headline}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </a>
                          ) : (
                            news.headline
                          )}
                        </h4>

                        <p className="text-sm text-slate-600 leading-relaxed">
                          <strong className="font-medium text-slate-800">
                            Price Impact Mechanism:
                          </strong>{' '}
                          {news.priceImpactAnalysis}
                        </p>
                      </div>

                      <div className="lg:text-right shrink-0 pt-1">
                        <div className="text-[11px] text-slate-500">Expected Price Sensitivity</div>
                        <div
                          className={`mt-0.5 text-sm font-mono tabular-nums font-bold ${
                            news.sentiment === 'Positive'
                              ? 'text-emerald-700'
                              : news.sentiment === 'Negative'
                              ? 'text-rose-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {news.expectedMoveRange}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {activeStock.groundingSources && activeStock.groundingSources.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    Live Web Grounding Sources:
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                    {activeStock.groundingSources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-slate-900 underline inline-flex items-center gap-1"
                      >
                        <span>{src.title}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* SECTION 2: SAVED RESEARCH DATABASE & SCREENER */}
        {activeSection === 'database' && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="text-xs font-medium text-slate-500">
                  <span>Persistent NSE &amp; BSE Repository</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>{database.length} Covered Equities</span>
                </div>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Indian Stock Market Research Database
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={dbSearchQuery}
                    onChange={(e) => setDbSearchQuery(e.target.value)}
                    placeholder="Filter symbol, company, sector..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {['ALL', 'Core Conviction', 'Accumulate on Dips', 'Event Catalyst Watch'].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setDbFilterTag(tag)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          dbFilterTag === tag
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tag === 'ALL' ? 'All Saved' : tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {filteredDatabase.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-sm text-slate-600">
                  No stocks in your research database match the selected filter criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDbFilterTag('ALL');
                    setDbSearchQuery('');
                  }}
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg cursor-pointer"
                >
                  Reset Database Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                      <th className="py-3 pr-4">NSE / BSE Ticker</th>
                      <th className="py-3 px-4">Company &amp; Sector</th>
                      <th className="py-3 px-4 text-right">CMP (₹)</th>
                      <th className="py-3 px-4 text-right">12M Upside</th>
                      <th className="py-3 px-4 text-right">Downside Floor</th>
                      <th className="py-3 px-4 text-right">Risk Score</th>
                      <th className="py-3 px-4">Conviction &amp; Lead Catalyst</th>
                      <th className="py-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredDatabase.map((stock) => (
                      <tr
                        key={stock.id}
                        className="hover:bg-slate-50/90 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveStock(stock);
                          setActiveSection('terminal');
                        }}
                      >
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900">
                            {stock.nseSymbol}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500">
                            BSE: {stock.bseCode}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{stock.companyName}</div>
                          <div className="text-[11px] text-slate-500">
                            {stock.sector} · {stock.marketCapCr}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                          <div className="font-semibold text-slate-900">
                            ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          <div
                            className={`text-[11px] ${
                              stock.dayChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {stock.dayChange >= 0 ? '+' : ''}
                            {stock.dayChangePercent.toFixed(2)}%
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                          <div className="font-semibold text-emerald-700">
                            ₹{stock.upsideTarget.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-emerald-700">
                            +{stock.upsidePercent.toFixed(1)}%
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                          <div className="font-semibold text-rose-700">
                            ₹{stock.downsideSupport.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-rose-700">
                            {stock.downsidePercent.toFixed(1)}%
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                          <div className="font-semibold text-slate-900">
                            {stock.overallRiskScore}/100
                          </div>
                          <div
                            className={`text-[11px] font-sans ${
                              stock.overallRiskScore < 38
                                ? 'text-emerald-700'
                                : stock.overallRiskScore < 62
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {stock.riskRating}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-800">{stock.watchlistTag}</div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {stock.newsItems[0]?.headline || stock.analystNotes}
                          </div>
                        </td>

                        <td
                          className="py-3.5 pl-4 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveStock(stock);
                                setActiveSection('terminal');
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-900 hover:text-white rounded transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFromDatabase(stock.id)}
                              title="Remove from Research Database"
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: CROSS-PORTFOLIO RISK VS. UPSIDE MATRIX */}
        {activeSection === 'risk' && (
          <section className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="pb-5 border-b border-slate-100 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    <span>Cross-Sectional Risk vs. Return Tradeoff</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>NSE / BSE Coverage Universe</span>
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Quantitative Risk-Reward Comparison Matrix
                  </h2>
                </div>
                <div className="text-xs text-slate-500">
                  Click any stock row to open its full 4-factor risk and catalyst report
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                      <th className="py-3 pr-4">Stock</th>
                      <th className="py-3 px-4 text-right">Composite Risk</th>
                      <th className="py-3 px-4 text-right">Beta (NIFTY)</th>
                      <th className="py-3 px-4 text-right">Ann. Volatility</th>
                      <th className="py-3 px-4 text-right">1Y Max Drawdown</th>
                      <th className="py-3 px-4 text-right">Debt / Equity</th>
                      <th className="py-3 px-4 text-right">Upside / Downside Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-mono tabular-nums">
                    {database.map((s) => {
                      const rewardRiskRatio = (
                        s.upsidePercent / Math.max(1, Math.abs(s.downsidePercent))
                      ).toFixed(2);
                      return (
                        <tr
                          key={s.id}
                          onClick={() => {
                            setActiveStock(s);
                            setActiveSection('terminal');
                          }}
                          className="hover:bg-slate-50 cursor-pointer"
                        >
                          <td className="py-3.5 pr-4 font-sans">
                            <span className="font-mono font-bold text-slate-900">
                              {s.nseSymbol}
                            </span>
                            <span className="mx-1.5 text-slate-300">·</span>
                            <span className="text-slate-600">{s.companyName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-bold text-slate-900">{s.overallRiskScore}/100</span>
                            <span className="ml-2 font-sans text-[11px] text-slate-500">
                              ({s.riskRating})
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-800">
                            {s.beta.toFixed(2)}x
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-800">
                            {s.annualizedVolatility.toFixed(1)}%
                          </td>
                          <td className="py-3.5 px-4 text-right text-rose-700">
                            {s.maxDrawdown1Y.toFixed(1)}%
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-800">
                            {s.debtToEquity.toFixed(2)}x
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                            {rewardRiskRatio}x
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: STEP-BY-STEP API INTEGRATION GUIDE */}
        {activeSection === 'blueprint' && (
          <ApiIntegrationGuide
            pipelineLogs={pipelineLogs}
            activeSymbol={activeStock.nseSymbol}
            onTestSymbol={(sym) => {
              setSearchInput(sym);
              handleAnalyzeStock(sym);
              setActiveSection('terminal');
            }}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-5 mt-12">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>DalalStreet Quant — Indian Equity Research Database (NSE &amp; BSE)</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>For institutional and educational equity research workflows</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#blueprint"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('blueprint');
              }}
              className="hover:text-slate-900 underline"
            >
              Step-by-Step API Integration Documentation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
