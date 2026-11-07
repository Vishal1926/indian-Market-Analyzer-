export interface PricePoint {
  date: string;
  close: number;
  volume: number;
}

export interface StockNewsItem {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  url?: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  impactLevel: 'High Impact' | 'Medium Impact' | 'Monitor';
  priceImpactAnalysis: string;
  expectedMoveRange: string;
}

export interface RiskDimension {
  dimension:
    | 'Market & Volatility Risk'
    | 'Regulatory & Policy Risk'
    | 'Sector & Cyclical Risk'
    | 'Valuation & Earnings Risk';
  score: number; // 1 to 100
  level: 'Low' | 'Moderate' | 'High';
  summary: string;
}

export interface TechnicalSignals {
  rsi14: number;
  sma50: number;
  sma200: number;
  macdSignal: string;
  supportZone: string;
  resistanceZone: string;
}

export interface StockResearchRecord {
  id: string;
  companyName: string;
  nseSymbol: string;
  bseCode: string;
  sector: string;
  marketCapCategory: 'Large Cap' | 'Mid Cap' | 'Small Cap';
  marketCapCr: string;
  currentPrice: number;
  previousClose: number;
  dayChange: number;
  dayChangePercent: number;
  high52Week: number;
  low52Week: number;
  peRatio: number;
  pbRatio: number;
  roePercent: number;
  priceHistory: PricePoint[];
  dataSource: string;
  lastUpdated: string;

  // Upside & Downside Trend
  overallTrend:
    | 'Bullish'
    | 'Moderately Bullish'
    | 'Neutral / Consolidation'
    | 'Moderately Bearish'
    | 'Bearish';
  upsideTarget: number;
  upsidePercent: number;
  upsideDrivers: string[];
  baseTarget: number;
  downsideSupport: number;
  downsidePercent: number;
  downsideTriggers: string[];
  technicalSignals: TechnicalSignals;

  // Top 5 News Catalysts
  newsItems: StockNewsItem[];

  // Risk Profile
  overallRiskScore: number; // 1 to 100
  riskRating: 'Low Risk' | 'Moderate Risk' | 'Elevated Risk' | 'High Risk';
  beta: number;
  annualizedVolatility: number;
  maxDrawdown1Y: number;
  debtToEquity: number;
  riskFactors: RiskDimension[];

  // Research Database Metadata
  inDatabase: boolean;
  analystNotes: string;
  watchlistTag:
    | 'Core Conviction'
    | 'Accumulate on Dips'
    | 'Event Catalyst Watch'
    | 'High Risk / Avoid';
  groundingSources?: { title: string; uri: string }[];
}

export interface ApiPipelineLog {
  step: number;
  name: string;
  endpoint: string;
  status: 'success' | 'fallback' | 'pending';
  latencyMs: number;
  detail: string;
}
