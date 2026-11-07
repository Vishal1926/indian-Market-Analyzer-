import { StockResearchRecord, PricePoint } from '../types/stock';

function generateSeries(basePrice: number, volatility: number, trendBias: number): PricePoint[] {
  const points: PricePoint[] = [];
  let price = basePrice * (1 - trendBias * 0.06);
  const now = new Date('2026-11-06T15:30:00+05:30');

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 1.4);
    const pseudoRand = Math.sin(i * 1.7 + basePrice * 0.01) * 0.5 + Math.cos(i * 0.9) * 0.5;
    const pctMove = pseudoRand * volatility * 0.012 + (trendBias * 0.002);
    price = Math.max(10, Number((price * (1 + pctMove)).toFixed(2)));
    const volume = Math.round((3500000 + Math.abs(pseudoRand) * 4200000) * (1500 / Math.max(200, basePrice)));
    points.push({
      date: d.toISOString().slice(0, 10),
      close: i === 0 ? basePrice : price,
      volume,
    });
  }
  return points;
}

export const INITIAL_STOCK_DATABASE: StockResearchRecord[] = [
  {
    id: 'RELIANCE',
    companyName: 'Reliance Industries Limited',
    nseSymbol: 'RELIANCE',
    bseCode: '500325',
    sector: 'Energy, Retail & Digital Services',
    marketCapCategory: 'Large Cap',
    marketCapCr: '₹19,68,400 Cr',
    currentPrice: 1452.80,
    previousClose: 1434.50,
    dayChange: 18.30,
    dayChangePercent: 1.28,
    high52Week: 1608.95,
    low52Week: 1215.40,
    peRatio: 26.4,
    pbRatio: 2.35,
    roePercent: 9.8,
    priceHistory: generateSeries(1452.80, 1.15, 0.8),
    dataSource: 'NSE/BSE Institutional Research Database',
    lastUpdated: '2026-11-06T15:30:00+05:30',
    overallTrend: 'Moderately Bullish',
    upsideTarget: 1690.00,
    upsidePercent: 16.33,
    upsideDrivers: [
      'Jio ARPU expansion following tariff hike flow-through and 5G fixed wireless broadband monetisation across Tier-2 cities.',
      'Commissioning of New Energy solar gigafactory modules in Jamnagar reducing captive power costs across O2C complejos.',
      'Operating leverage resurgence in Reliance Retail with footfall efficiency and quick-commerce dark store densification.'
    ],
    baseTarget: 1545.00,
    downsideSupport: 1320.00,
    downsidePercent: -9.14,
    downsideTriggers: [
      'Compression in Singapore complex Gross Refining Margins (GRMs) if global middle distillate cracks soften further.',
      'Higher consolidated capex intensity delaying free cash flow inflection beyond FY27.',
      'Aggressive discounting by competing quick-commerce operators pressuring retail EBITDA margins.'
    ],
    technicalSignals: {
      rsi14: 58.4,
      sma50: 1412.60,
      sma200: 1378.20,
      macdSignal: 'Bullish crossover above zero line',
      supportZone: '₹1,385 – ₹1,410',
      resistanceZone: '₹1,510 – ₹1,545'
    },
    newsItems: [
      {
        id: 'rel-1',
        headline: 'Jio Platforms reports 14.2% YoY jump in quarterly EBITDA as 5G subscriber base crosses 175 million',
        source: 'Economic Times',
        publishedAt: '2 days ago',
        url: 'https://economictimes.indiatimes.com/markets/stocks/news',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'Direct ARPU expansion improves consolidated return on capital employed and strengthens institutional valuation multiples for the telecom vertical.',
        expectedMoveRange: '+2.5% to +4.0%'
      },
      {
        id: 'rel-2',
        headline: 'Reliance New Energy begins commercial trial production at Phase-1 Jamnagar solar PV module line',
        source: 'Mint',
        publishedAt: '4 days ago',
        url: 'https://www.livemint.com/market/stock-market-news',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'Validates execution on the ₹75,000 Cr green energy capex roadmap, addressing street skepticism around new energy valuation re-rating.',
        expectedMoveRange: '+1.8% to +3.2%'
      },
      {
        id: 'rel-3',
        headline: 'Asian refining margins dip 8% sequentially amid higher regional diesel exports',
        source: 'Business Standard',
        publishedAt: '5 days ago',
        url: 'https://www.business-standard.com/markets',
        sentiment: 'Negative',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'Softer O2C refining spreads can cap near-term earnings upgrades, though domestic fuel placement partially offsets export margin pressure.',
        expectedMoveRange: '-1.2% to -2.0%'
      },
      {
        id: 'rel-4',
        headline: 'Reliance Retail expands hyperlocal 30-minute delivery network across 45 additional Indian cities',
        source: 'Moneycontrol',
        publishedAt: '1 week ago',
        url: 'https://www.moneycontrol.com/stocksmarketsindia/',
        sentiment: 'Positive',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'Protects grocery market share against standalone quick-commerce players while leveraging existing store inventory without heavy dark-store cash burn.',
        expectedMoveRange: '+1.0% to +1.8%'
      },
      {
        id: 'rel-5',
        headline: 'Foreign Institutional Investors pare 18 bps stake in oil & gas majors during October reallocation',
        source: 'CNBC-TV18',
        publishedAt: '1 week ago',
        url: 'https://www.cnbctv18.com/market/',
        sentiment: 'Neutral',
        impactLevel: 'Monitor',
        priceImpactAnalysis: 'Domestic Mutual Fund SIP inflows absorbed FII supply near ₹1,400 levels, establishing a strong institutional floor.',
        expectedMoveRange: '-0.5% to +0.5%'
      }
    ],
    overallRiskScore: 32,
    riskRating: 'Low Risk',
    beta: 0.94,
    annualizedVolatility: 18.4,
    maxDrawdown1Y: -14.2,
    debtToEquity: 0.41,
    riskFactors: [
      {
        dimension: 'Market & Volatility Risk',
        score: 30,
        level: 'Low',
        summary: 'Index heavyweight (~9.2% NIFTY 50 weight) with deep institutional liquidity and sub-1.0 beta.'
      },
      {
        dimension: 'Regulatory & Policy Risk',
        score: 38,
        level: 'Moderate',
        summary: 'Exposed to potential windfall tax adjustments on domestic crude/fuel exports and TRAI telecom tariff oversight.'
      },
      {
        dimension: 'Sector & Cyclical Risk',
        score: 42,
        level: 'Moderate',
        summary: 'Petrochemical polymer spreads remain cyclical and sensitive to Chinese industrial demand recovery.'
      },
      {
        dimension: 'Valuation & Earnings Risk',
        score: 24,
        level: 'Low',
        summary: 'Trading near 5-year mean EV/EBITDA with diversified cash flows across telecom, retail, and energy.'
      }
    ],
    inDatabase: true,
    analystNotes: 'Core large-cap compounder. Accumulate in ₹1,390–1,430 zone ahead of telecom listing and new energy commissioning milestones.',
    watchlistTag: 'Core Conviction'
  },
  {
    id: 'TCS',
    companyName: 'Tata Consultancy Services Limited',
    nseSymbol: 'TCS',
    bseCode: '532540',
    sector: 'IT Services & Consulting',
    marketCapCategory: 'Large Cap',
    marketCapCr: '₹14,92,150 Cr',
    currentPrice: 4124.60,
    previousClose: 4088.20,
    dayChange: 36.40,
    dayChangePercent: 0.89,
    high52Week: 4592.25,
    low52Week: 3675.00,
    peRatio: 29.8,
    pbRatio: 14.6,
    roePercent: 51.4,
    priceHistory: generateSeries(4124.60, 1.05, 0.5),
    dataSource: 'NSE/BSE Institutional Research Database',
    lastUpdated: '2026-11-06T15:30:00+05:30',
    overallTrend: 'Moderately Bullish',
    upsideTarget: 4680.00,
    upsidePercent: 13.47,
    upsideDrivers: [
      'Recovery in North American BFSI discretionary tech spend following US Federal Reserve rate cut cycle.',
      'Strong Total Contract Value (TCV) deal pipeline exceeding $9.2B per quarter with rising enterprise cloud modernization.',
      'Industry-leading EBIT margin resilience (24.5%–25.2%) backed by pyramid optimization and lower attrition (12.1%).'
    ],
    baseTarget: 4390.00,
    downsideSupport: 3820.00,
    downsidePercent: -7.39,
    downsideTriggers: [
      'Delayed conversion of large cost-takeout deals into billed revenue if European manufacturing clients freeze IT budgets.',
      'Sharp INR appreciation against USD compressing reported operating margins by 30–40 bps per 1% currency move.',
      'Pricing compression in legacy application maintenance renewals.'
    ],
    technicalSignals: {
      rsi14: 54.8,
      sma50: 4075.00,
      sma200: 3982.40,
      macdSignal: 'Positive momentum above 50-DMA',
      supportZone: '₹3,960 – ₹4,010',
      resistanceZone: '₹4,280 – ₹4,350'
    },
    newsItems: [
      {
        id: 'tcs-1',
        headline: 'TCS signs multi-year $650M core banking transformation deal with leading European financial institution',
        source: 'Economic Times',
        publishedAt: '1 day ago',
        url: 'https://economictimes.indiatimes.com/tech/information-technology',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'Reinforces revenue visibility in Continental Europe and demonstrates strong win rates in large vendor-consolidation mandates.',
        expectedMoveRange: '+2.0% to +3.5%'
      },
      {
        id: 'tcs-2',
        headline: 'US regional banks signal 7% higher IT modernization budget allocation for CY2027',
        source: 'Mint',
        publishedAt: '3 days ago',
        url: 'https://www.livemint.com/industry/infotech',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'BFSI contributes over 31% of TCS revenues; green shoots in US banking discretionary spend directly trigger EPS upgrades.',
        expectedMoveRange: '+1.8% to +2.8%'
      },
      {
        id: 'tcs-3',
        headline: 'TCS declares interim dividend of ₹11 per share; maintains 85%+ free cash flow payout policy',
        source: 'Business Standard',
        publishedAt: '6 days ago',
        url: 'https://www.business-standard.com/companies',
        sentiment: 'Positive',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'High cash conversion and predictable capital return provide downside cushion during global macro volatility.',
        expectedMoveRange: '+0.8% to +1.5%'
      },
      {
        id: 'tcs-4',
        headline: 'UK retail client ramp-down creates 40 bps sequential headwind in regional vertical',
        source: 'Moneycontrol',
        publishedAt: '1 week ago',
        url: 'https://www.moneycontrol.com/news/business/companies/',
        sentiment: 'Negative',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'Client-specific project completion in UK retail tempers near-term constant-currency sequential growth.',
        expectedMoveRange: '-1.0% to -1.7%'
      },
      {
        id: 'tcs-5',
        headline: 'IT sector campus hiring picks up 18% YoY as utilization levels cross 86% across Tier-1 firms',
        source: 'CNBC-TV18',
        publishedAt: '2 weeks ago',
        url: 'https://www.cnbctv18.com/technology/',
        sentiment: 'Positive',
        impactLevel: 'Monitor',
        priceImpactAnalysis: 'Fresher onboarding indicates management confidence in demand pipeline for the upcoming two quarters.',
        expectedMoveRange: '+0.5% to +1.2%'
      }
    ],
    overallRiskScore: 26,
    riskRating: 'Low Risk',
    beta: 0.78,
    annualizedVolatility: 16.2,
    maxDrawdown1Y: -11.8,
    debtToEquity: 0.09,
    riskFactors: [
      {
        dimension: 'Market & Volatility Risk',
        score: 22,
        level: 'Low',
        summary: 'Defensive low-beta balance sheet with zero net debt and ₹45,000+ Cr cash reserves.'
      },
      {
        dimension: 'Regulatory & Policy Risk',
        score: 28,
        level: 'Low',
        summary: 'Localised onshore delivery centers in US/Europe mitigate H-1B visa fee and immigration policy shocks.'
      },
      {
        dimension: 'Sector & Cyclical Risk',
        score: 34,
        level: 'Moderate',
        summary: 'Tied to global enterprise IT spending cycles and enterprise AI transition timelines.'
      },
      {
        dimension: 'Valuation & Earnings Risk',
        score: 28,
        level: 'Low',
        summary: '29.8x P/E is supported by 51% ROE and industry-leading operating cash flow conversion.'
      }
    ],
    inDatabase: true,
    analystNotes: 'Defensive IT anchor with 3.2% dividend + buyback yield and high ROE. Ideal hedge against domestic cyclical slowdowns.',
    watchlistTag: 'Core Conviction'
  },
  {
    id: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    nseSymbol: 'HDFCBANK',
    bseCode: '500180',
    sector: 'Private Sector Banking',
    marketCapCategory: 'Large Cap',
    marketCapCr: '₹13,48,900 Cr',
    currentPrice: 1762.40,
    previousClose: 1741.10,
    dayChange: 21.30,
    dayChangePercent: 1.22,
    high52Week: 1842.00,
    low52Week: 1426.80,
    peRatio: 19.4,
    pbRatio: 2.75,
    roePercent: 16.4,
    priceHistory: generateSeries(1762.40, 1.1, 0.9),
    dataSource: 'NSE/BSE Institutional Research Database',
    lastUpdated: '2026-11-06T15:30:00+05:30',
    overallTrend: 'Bullish',
    upsideTarget: 2050.00,
    upsidePercent: 16.32,
    upsideDrivers: [
      'Steady reduction in Credit-to-Deposit (LDR) ratio toward 92%, unlocking Net Interest Margin (NIM) expansion back to 3.65%+.',
      'Replacement of high-cost erstwhile HDFC Ltd wholesale borrowings with granular retail CASA deposits across 9,000+ branches.',
      'Pristine asset quality with Gross NPA holding at 1.24% and negligible unsecured retail slippage.'
    ],
    baseTarget: 1910.00,
    downsideSupport: 1615.00,
    downsidePercent: -8.36,
    downsideTriggers: [
      'Aggressive RBI repo rate cuts compressing floating-rate loan yields faster than term-deposit repricing.',
      'Slower systemic deposit growth forcing continued reliance on elevated term deposit rates.',
      'Higher opex from rural and semi-urban branch expansion weighing on cost-to-income ratio.'
    ],
    technicalSignals: {
      rsi14: 62.1,
      sma50: 1710.40,
      sma200: 1632.80,
      macdSignal: 'Strong uptrend above 50 & 200 DMA',
      supportZone: '₹1,685 – ₹1,710',
      resistanceZone: '₹1,825 – ₹1,850'
    },
    newsItems: [
      {
        id: 'hdfc-1',
        headline: 'HDFC Bank quarterly retail deposit mobilization hits ₹1.18 Lakh Crore; LDR improves by 280 bps',
        source: 'Mint',
        publishedAt: '2 days ago',
        url: 'https://www.livemint.com/market/stock-market-news',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'Faster-than-expected LDR normalization directly addresses the primary post-merger institutional overhang and supports P/B multiple re-rating.',
        expectedMoveRange: '+2.8% to +4.5%'
      },
      {
        id: 'hdfc-2',
        headline: 'MSCI India Index weight expansion triggers $850M passive foreign inflow into HDFC Bank',
        source: 'Economic Times',
        publishedAt: '4 days ago',
        url: 'https://economictimes.indiatimes.com/markets/stocks/news',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'FII foreign headroom expansion above 25% threshold creates sustained structural buying from global EM trackers.',
        expectedMoveRange: '+2.0% to +3.2%'
      },
      {
        id: 'hdfc-3',
        headline: 'HDB Financial Services IPO valuation pegged at ₹85,000 Crore; value unlocking for parent bank',
        source: 'Moneycontrol',
        publishedAt: '5 days ago',
        url: 'https://www.moneycontrol.com/stocksmarketsindia/',
        sentiment: 'Positive',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'Subsidiary listing meets RBI upper-layer NBFC mandate while crystallizing embedded sum-of-the-parts (SOTP) value.',
        expectedMoveRange: '+1.5% to +2.4%'
      },
      {
        id: 'hdfc-4',
        headline: 'RBI reiterates strict supervisory stance on unsecured personal loans and credit card risk weights',
        source: 'Business Standard',
        publishedAt: '1 week ago',
        url: 'https://www.business-standard.com/finance',
        sentiment: 'Neutral',
        impactLevel: 'Monitor',
        priceImpactAnalysis: 'HDFC Bank deliberately slowed unsecured loan growth over the past 3 quarters, leaving it better insulated than mid-tier peers.',
        expectedMoveRange: '-0.6% to +0.4%'
      },
      {
        id: 'hdfc-5',
        headline: 'Banking system CASA ratio remains under pressure as savers lock in higher fixed-deposit yields',
        source: 'CNBC-TV18',
        publishedAt: '2 weeks ago',
        url: 'https://www.cnbctv18.com/economy/',
        sentiment: 'Negative',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'Elevated cost of funds caps near-term NIM upside until term deposits begin repricing downward.',
        expectedMoveRange: '-1.0% to -1.5%'
      }
    ],
    overallRiskScore: 29,
    riskRating: 'Low Risk',
    beta: 0.98,
    annualizedVolatility: 17.8,
    maxDrawdown1Y: -12.6,
    debtToEquity: 1.12,
    riskFactors: [
      {
        dimension: 'Market & Volatility Risk',
        score: 28,
        level: 'Low',
        summary: 'Highest private bank weighting in NIFTY Bank and NIFTY 50; deep institutional sponsorship.'
      },
      {
        dimension: 'Regulatory & Policy Risk',
        score: 35,
        level: 'Moderate',
        summary: 'Subject to RBI liquidity coverage ratio (LCR) revisions and systemic D-SIB capital buffer norms.'
      },
      {
        dimension: 'Sector & Cyclical Risk',
        score: 32,
        level: 'Low',
        summary: 'Diversified loan book across retail mortgages, corporate working capital, and MSME lending.'
      },
      {
        dimension: 'Valuation & Earnings Risk',
        score: 21,
        level: 'Low',
        summary: 'Trading at 2.75x P/B—nearly 1.2 standard deviations below its 10-year historical valuation average.'
      }
    ],
    inDatabase: true,
    analystNotes: 'Post-merger balance sheet digestion is 80% complete. Attractive risk-reward at 2.75x book value with NIM expansion ahead.',
    watchlistTag: 'Core Conviction'
  },
  {
    id: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    nseSymbol: 'TATAMOTORS',
    bseCode: '500570',
    sector: 'Automobiles (CV, PV & Luxury JLR)',
    marketCapCategory: 'Large Cap',
    marketCapCr: '₹3,18,650 Cr',
    currentPrice: 864.50,
    previousClose: 879.20,
    dayChange: -14.70,
    dayChangePercent: -1.67,
    high52Week: 1179.00,
    low52Week: 792.30,
    peRatio: 10.8,
    pbRatio: 3.42,
    roePercent: 31.8,
    priceHistory: generateSeries(864.50, 1.85, -0.6),
    dataSource: 'NSE/BSE Institutional Research Database',
    lastUpdated: '2026-11-06T15:30:00+05:30',
    overallTrend: 'Neutral / Consolidation',
    upsideTarget: 1040.00,
    upsidePercent: 20.30,
    upsideDrivers: [
      'Demerger of Commercial Vehicles (CV) and Passenger Vehicles + JLR businesses into two separate listed entities unlocking standalone multiples.',
      'JLR net-debt-free balance sheet and rich Range Rover / Defender product mix sustaining 8.5%+ EBIT margins.',
      'Festive recovery in domestic SUV demand supported by new Curvv EV/ICE and Nexon CNG launches.'
    ],
    baseTarget: 935.00,
    downsideSupport: 775.00,
    downsidePercent: -10.35,
    downsideTriggers: [
      'Rising dealer inventory levels and higher marketing incentives in JLR key export markets (China and EU).',
      'Domestic Electric Vehicle (EV) market share competition intensifying with new launches from Mahindra and MG.',
      'Moderation in domestic M&HCV fleet replacement demand if government highway capex slows.'
    ],
    technicalSignals: {
      rsi14: 41.2,
      sma50: 918.50,
      sma200: 954.10,
      macdSignal: 'Consolidating near oversold support zone',
      supportZone: '₹825 – ₹850',
      resistanceZone: '₹920 – ₹945'
    },
    newsItems: [
      {
        id: 'tm-1',
        headline: 'NCLT process for Tata Motors 1:1 CV and PV demerger advances toward H2 completion window',
        source: 'Economic Times',
        publishedAt: '1 day ago',
        url: 'https://economictimes.indiatimes.com/industry/auto',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'Pure-play domestic Commercial Vehicle listing can command 14x–16x EV/EBITDA on par with Ashok Leyland, unlocking SOTP upside.',
        expectedMoveRange: '+3.0% to +5.0%'
      },
      {
        id: 'tm-2',
        headline: 'JLR wholesale volumes recover 9% QoQ after aluminum supplier disruption normalizes in UK plants',
        source: 'Mint',
        publishedAt: '3 days ago',
        url: 'https://www.livemint.com/companies/news',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'JLR generates ~68% of consolidated revenue; production normalization assures full-year EBIT margin guidance of ≥8.5%.',
        expectedMoveRange: '+2.2% to +3.8%'
      },
      {
        id: 'tm-3',
        headline: 'China luxury import auto demand remains soft; European OEMs raise variable dealer incentives',
        source: 'Business Standard',
        publishedAt: '4 days ago',
        url: 'https://www.business-standard.com/markets',
        sentiment: 'Negative',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'Higher customer acquisition costs in China could trim JLR average selling prices (ASPs) by 150–200 bps.',
        expectedMoveRange: '-2.5% to -4.0%'
      },
      {
        id: 'tm-4',
        headline: 'Domestic Passenger Vehicle dealer inventory drops to 32 days following strong Navratri-Diwali retail billing',
        source: 'Moneycontrol',
        publishedAt: '6 days ago',
        url: 'https://www.moneycontrol.com/stocksmarketsindia/',
        sentiment: 'Positive',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'Channel inventory clearance reduces discounting pressure for Q3 and Q4 wholesale dispatches.',
        expectedMoveRange: '+1.2% to +2.0%'
      },
      {
        id: 'tm-5',
        headline: 'PM E-DRIVE electric bus tender allocation of 14,000 units expected next month',
        source: 'CNBC-TV18',
        publishedAt: '1 week ago',
        url: 'https://www.cnbctv18.com/auto/',
        sentiment: 'Positive',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'Payment security mechanism included in PM E-DRIVE resolves state transport utility receivable concerns for Tata Motors CV.',
        expectedMoveRange: '+1.0% to +1.8%'
      }
    ],
    overallRiskScore: 58,
    riskRating: 'Moderate Risk',
    beta: 1.34,
    annualizedVolatility: 27.6,
    maxDrawdown1Y: -26.7,
    debtToEquity: 0.94,
    riskFactors: [
      {
        dimension: 'Market & Volatility Risk',
        score: 64,
        level: 'High',
        summary: 'High-beta cyclical stock (1.34x beta) sensitive to global macro risk-off moves and FII flows.'
      },
      {
        dimension: 'Regulatory & Policy Risk',
        score: 52,
        level: 'Moderate',
        summary: 'Exposed to EU/UK zero-emission vehicle mandates, China luxury import tariffs, and CAFE-III emission norms.'
      },
      {
        dimension: 'Sector & Cyclical Risk',
        score: 68,
        level: 'High',
        summary: 'Global luxury auto and domestic freight cycles are inherently pro-cyclical with high operating leverage.'
      },
      {
        dimension: 'Valuation & Earnings Risk',
        score: 48,
        level: 'Moderate',
        summary: 'Headline 10.8x P/E is inexpensive, but street is pricing in peak JLR margin normalization.'
      }
    ],
    inDatabase: true,
    analystNotes: 'After a 26% correction from 52W highs, risk-reward is turning favorable near ₹840 support ahead of the CV/PV demerger record date.',
    watchlistTag: 'Accumulate on Dips'
  },
  {
    id: 'HAL',
    companyName: 'Hindustan Aeronautics Limited',
    nseSymbol: 'HAL',
    bseCode: '541154',
    sector: 'Aerospace & Defence PSU',
    marketCapCategory: 'Large Cap',
    marketCapCr: '₹2,94,800 Cr',
    currentPrice: 4408.00,
    previousClose: 4322.50,
    dayChange: 85.50,
    dayChangePercent: 1.98,
    high52Week: 5674.75,
    low52Week: 2915.00,
    peRatio: 36.2,
    pbRatio: 9.45,
    roePercent: 26.8,
    priceHistory: generateSeries(4408.00, 1.95, 0.7),
    dataSource: 'NSE/BSE Institutional Research Database',
    lastUpdated: '2026-11-06T15:30:00+05:30',
    overallTrend: 'Bullish',
    upsideTarget: 5250.00,
    upsidePercent: 19.10,
    upsideDrivers: [
      'Record order book crossing ₹1,20,000 Cr (~3.8x trailing revenue) providing multi-year execution visibility through FY30.',
      'GE F404 aero-engine deliveries ramping up, unlocking LCA Tejas Mk1A fighter aircraft deliveries from Nashik & Bengaluru lines.',
      'Follow-on DAC clearances for 97 additional LCA Mk1A jets and 156 Prachand Light Combat Helicopters (LCH).'
    ],
    baseTarget: 4820.00,
    downsideSupport: 3920.00,
    downsidePercent: -11.07,
    downsideTriggers: [
      'Any further supply chain slippage in imported GE F404 engines pushing aircraft delivery recognition into subsequent fiscal quarters.',
      'Moderation in high-margin Repair & Overhaul (ROH) revenue mix as manufacturing share rises.',
      'Valuation multiple sensitivity (36x P/E vs historical 18x–22x range) if defence budget growth moderates.'
    ],
    technicalSignals: {
      rsi14: 60.4,
      sma50: 4295.00,
      sma200: 4140.00,
      macdSignal: 'Bullish breakout above 50-DMA',
      supportZone: '₹4,150 – ₹4,240',
      resistanceZone: '₹4,680 – ₹4,850'
    },
    newsItems: [
      {
        id: 'hal-1',
        headline: 'GE Aerospace dispatches next batch of F404 engines to HAL; Nashik third production line ready for Tejas Mk1A trials',
        source: 'Economic Times',
        publishedAt: '1 day ago',
        url: 'https://economictimes.indiatimes.com/news/defence',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'Resolves the single biggest execution bottleneck that held back HAL manufacturing revenue recognition over the last two quarters.',
        expectedMoveRange: '+3.5% to +5.5%'
      },
      {
        id: 'hal-2',
        headline: 'Cabinet Committee on Security (CCS) reviews ₹62,000 Crore contract for 156 Prachand Light Combat Helicopters',
        source: 'Mint',
        publishedAt: '3 days ago',
        url: 'https://www.livemint.com/news/india',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'Final CCS contract signing adds 50%+ to current order backlog and triggers substantial customer advance inflows.',
        expectedMoveRange: '+2.8% to +4.2%'
      },
      {
        id: 'hal-3',
        headline: 'HAL and GE finalize commercial terms for 80% indigenous technology transfer on F414 engine for Tejas Mk2',
        source: 'Business Standard',
        publishedAt: '5 days ago',
        url: 'https://www.business-standard.com/companies',
        sentiment: 'Positive',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'Establishes long-term sovereign propulsion manufacturing moat and high-margin lifecycle MRO annuity for 25+ years.',
        expectedMoveRange: '+1.5% to +2.5%'
      },
      {
        id: 'hal-4',
        headline: 'PSU Defence index experiences elevated intraday volatility amid profit booking by retail funds',
        source: 'Moneycontrol',
        publishedAt: '1 week ago',
        url: 'https://www.moneycontrol.com/stocksmarketsindia/',
        sentiment: 'Negative',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'High retail and thematic mutual fund ownership creates sharper short-term drawdowns during broader mid/large-cap rotations.',
        expectedMoveRange: '-2.0% to -3.5%'
      },
      {
        id: 'hal-5',
        headline: 'HAL signs export MoU with Southeast Asian air force for Dornier-228 maritime surveillance avionics upgrade',
        source: 'CNBC-TV18',
        publishedAt: '2 weeks ago',
        url: 'https://www.cnbctv18.com/business/',
        sentiment: 'Positive',
        impactLevel: 'Monitor',
        priceImpactAnalysis: 'Gradual diversification into defence exports supports Government of India ₹50,000 Cr defence export target.',
        expectedMoveRange: '+0.8% to +1.4%'
      }
    ],
    overallRiskScore: 52,
    riskRating: 'Moderate Risk',
    beta: 1.42,
    annualizedVolatility: 31.4,
    maxDrawdown1Y: -24.5,
    debtToEquity: 0.0,
    riskFactors: [
      {
        dimension: 'Market & Volatility Risk',
        score: 66,
        level: 'High',
        summary: 'High beta (1.42) with sharp momentum swings typical of PSU defence stocks.'
      },
      {
        dimension: 'Regulatory & Policy Risk',
        score: 35,
        level: 'Moderate',
        summary: 'Single primary customer (Indian Ministry of Defence) means working capital and milestone billing depend on budgetary outlays.'
      },
      {
        dimension: 'Sector & Cyclical Risk',
        score: 48,
        level: 'Moderate',
        summary: 'Supply chain dependence on foreign sub-systems (engines, radars, ejection seats) can cause lumpy quarterly deliveries.'
      },
      {
        dimension: 'Valuation & Earnings Risk',
        score: 59,
        level: 'Moderate',
        summary: 'Trading at 36.2x P/E; requires flawless execution of Tejas Mk1A delivery schedule to sustain premium multiple.'
      }
    ],
    inDatabase: true,
    analystNotes: 'Monopoly sovereign aerospace franchise with ₹26,000+ Cr cash on books. Track monthly GE F404 engine delivery cadence closely.',
    watchlistTag: 'Event Catalyst Watch'
  },
  {
    id: 'BAJFINANCE',
    companyName: 'Bajaj Finance Limited',
    nseSymbol: 'BAJFINANCE',
    bseCode: '500034',
    sector: 'NBFC & Consumer Lending',
    marketCapCategory: 'Large Cap',
    marketCapCr: '₹4,36,200 Cr',
    currentPrice: 7045.00,
    previousClose: 6960.50,
    dayChange: 84.50,
    dayChangePercent: 1.21,
    high52Week: 7824.00,
    low52Week: 6187.50,
    peRatio: 27.6,
    pbRatio: 5.18,
    roePercent: 20.9,
    priceHistory: generateSeries(7045.00, 1.45, 0.4),
    dataSource: 'NSE/BSE Institutional Research Database',
    lastUpdated: '2026-11-06T15:30:00+05:30',
    overallTrend: 'Moderately Bullish',
    upsideTarget: 8200.00,
    upsidePercent: 16.39,
    upsideDrivers: [
      'AUM growth sustaining at 25%–27% YoY led by secured gold loans, commercial lending, and Bajaj Housing Finance scale.',
      'Peak credit cost cycle behind in rural B2C and urban unsecured personal portfolios as collection efficiencies improve.',
      'Cost of funds peaking out; every 25 bps fall in bond market borrowing rates adds ~12–15 bps to NBFC NIMs.'
    ],
    baseTarget: 7620.00,
    downsideSupport: 6450.00,
    downsidePercent: -8.45,
    downsideTriggers: [
      'Elevated Stage-2 and Stage-3 asset provisioning if over-leveraged retail borrowers show stress in Tier-2/3 towns.',
      'Competitive pressure from large private banks in prime consumer durable and two-wheeler financing.',
      'Regulatory scrutiny by RBI on digital lending fees and penal interest charges.'
    ],
    technicalSignals: {
      rsi14: 55.6,
      sma50: 6930.00,
      sma200: 6845.00,
      macdSignal: 'Gradual accumulation above 200-DMA',
      supportZone: '₹6,780 – ₹6,860',
      resistanceZone: '₹7,350 – ₹7,480'
    },
    newsItems: [
      {
        id: 'baf-1',
        headline: 'Bajaj Finance Q2 AUM crosses ₹3.73 Lakh Crore (+28% YoY); new loans booked rise 14% during festive quarter',
        source: 'Mint',
        publishedAt: '2 days ago',
        url: 'https://www.livemint.com/companies/company-results',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'Demonstrates unmatched distribution scale across 4,100+ locations and 92 million customer franchise despite macro credit tightening.',
        expectedMoveRange: '+2.5% to +4.0%'
      },
      {
        id: 'baf-2',
        headline: 'Management guides credit costs to moderate by 15–20 bps in H2 as early-bucket bounce rates decline',
        source: 'Economic Times',
        publishedAt: '4 days ago',
        url: 'https://economictimes.indiatimes.com/industry/banking/finance',
        sentiment: 'Positive',
        impactLevel: 'High Impact',
        priceImpactAnalysis: 'Credit cost uptick was the primary drag on stock valuation over the past two quarters; stabilization triggers institutional re-entry.',
        expectedMoveRange: '+2.2% to +3.5%'
      },
      {
        id: 'baf-3',
        headline: 'Indian 3-year AAA corporate bond yields soften 18 bps on RBI liquidity infusion and global bond index inflows',
        source: 'Business Standard',
        publishedAt: '6 days ago',
        url: 'https://www.business-standard.com/finance',
        sentiment: 'Positive',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'Wholesale bond market accounts for ~45% of Bajaj Finance liabilities; lower bond yields directly reduce incremental borrowing cost.',
        expectedMoveRange: '+1.2% to +2.0%'
      },
      {
        id: 'baf-4',
        headline: 'Credit bureau data flags rising multi-loan inquiries among sub-₹40,000 monthly income borrowers',
        source: 'Moneycontrol',
        publishedAt: '1 week ago',
        url: 'https://www.moneycontrol.com/news/business/',
        sentiment: 'Negative',
        impactLevel: 'Medium Impact',
        priceImpactAnalysis: 'Requires tighter underwriting filters in rural B2C personal loans, slightly moderating high-yield unsecured mix.',
        expectedMoveRange: '-1.5% to -2.4%'
      },
      {
        id: 'baf-5',
        headline: 'Bajaj Finserv App crosses 62 million active installs with 38% digital cross-sell conversion',
        source: 'CNBC-TV18',
        publishedAt: '2 weeks ago',
        url: 'https://www.cnbctv18.com/finance/',
        sentiment: 'Positive',
        impactLevel: 'Monitor',
        priceImpactAnalysis: 'Digital origination lowers opex-to-NII ratio toward 33.0%, cushioning margin pressure.',
        expectedMoveRange: '+0.6% to +1.2%'
      }
    ],
    overallRiskScore: 46,
    riskRating: 'Moderate Risk',
    beta: 1.18,
    annualizedVolatility: 23.4,
    maxDrawdown1Y: -18.4,
    debtToEquity: 3.85,
    riskFactors: [
      {
        dimension: 'Market & Volatility Risk',
        score: 48,
        level: 'Moderate',
        summary: 'High sensitivity to RBI monetary policy announcements and bond yield movements.'
      },
      {
        dimension: 'Regulatory & Policy Risk',
        score: 56,
        level: 'Moderate',
        summary: 'Upper-Layer NBFC under close RBI supervision regarding unsecured consumer credit risk weights and KYC compliance.'
      },
      {
        dimension: 'Sector & Cyclical Risk',
        score: 45,
        level: 'Moderate',
        summary: 'Exposed to household leverage cycles and rural income recovery.'
      },
      {
        dimension: 'Valuation & Earnings Risk',
        score: 36,
        level: 'Low',
        summary: 'At 27.6x P/E and 5.18x P/B, valuation has de-rated meaningfully from historical 8x+ P/B peaks while ROE remains >20%.'
      }
    ],
    inDatabase: true,
    analystNotes: 'Premier Indian consumer finance engine trading at decade-low P/B valuation relative to its 21% ROE profile. Watch credit cost trajectory in Q3.',
    watchlistTag: 'Accumulate on Dips'
  }
];

export const INDIAN_STOCK_DIRECTORY: {
  symbol: string;
  bseCode: string;
  name: string;
  sector: string;
  cap: 'Large Cap' | 'Mid Cap' | 'Small Cap';
}[] = [
  { symbol: 'RELIANCE', bseCode: '500325', name: 'Reliance Industries Limited', sector: 'Energy, Retail & Digital Services', cap: 'Large Cap' },
  { symbol: 'TCS', bseCode: '532540', name: 'Tata Consultancy Services Limited', sector: 'IT Services & Consulting', cap: 'Large Cap' },
  { symbol: 'HDFCBANK', bseCode: '500180', name: 'HDFC Bank Limited', sector: 'Private Sector Banking', cap: 'Large Cap' },
  { symbol: 'TATAMOTORS', bseCode: '500570', name: 'Tata Motors Limited', sector: 'Automobiles (CV, PV & Luxury JLR)', cap: 'Large Cap' },
  { symbol: 'HAL', bseCode: '541154', name: 'Hindustan Aeronautics Limited', sector: 'Aerospace & Defence PSU', cap: 'Large Cap' },
  { symbol: 'BAJFINANCE', bseCode: '500034', name: 'Bajaj Finance Limited', sector: 'NBFC & Consumer Lending', cap: 'Large Cap' },
  { symbol: 'INFY', bseCode: '500209', name: 'Infosys Limited', sector: 'IT Services & Digital Consulting', cap: 'Large Cap' },
  { symbol: 'ICICIBANK', bseCode: '532174', name: 'ICICI Bank Limited', sector: 'Private Sector Banking', cap: 'Large Cap' },
  { symbol: 'BHARTIARTL', bseCode: '532454', name: 'Bharti Airtel Limited', sector: 'Telecommunications & Digital', cap: 'Large Cap' },
  { symbol: 'SBIN', bseCode: '500112', name: 'State Bank of India', sector: 'Public Sector Banking', cap: 'Large Cap' },
  { symbol: 'LT', bseCode: '500510', name: 'Larsen & Toubro Limited', sector: 'Infrastructure, EPC & Heavy Engineering', cap: 'Large Cap' },
  { symbol: 'ITC', bseCode: '500875', name: 'ITC Limited', sector: 'FMCG, Agribusiness & Paperboards', cap: 'Large Cap' },
  { symbol: 'SUNPHARMA', bseCode: '524715', name: 'Sun Pharmaceutical Industries Limited', sector: 'Specialty Pharmaceuticals', cap: 'Large Cap' },
  { symbol: 'ZOMATO', bseCode: '543320', name: 'Eternal Limited (formerly Zomato)', sector: 'Quick Commerce & Food Delivery', cap: 'Large Cap' },
  { symbol: 'TRENT', bseCode: '500251', name: 'Trent Limited', sector: 'Apparel & Fast Fashion Retail (Zudio / Westside)', cap: 'Large Cap' },
  { symbol: 'DIXON', bseCode: '540699', name: 'Dixon Technologies (India) Limited', sector: 'Electronics Manufacturing Services (EMS)', cap: 'Mid Cap' },
  { symbol: 'PERSISTENT', bseCode: '533179', name: 'Persistent Systems Limited', sector: 'Product Engineering & Digital IT', cap: 'Mid Cap' },
  { symbol: 'IRCTC', bseCode: '542830', name: 'Indian Railway Catering and Tourism Corp', sector: 'Travel, Ticketing & Rail Hospitality', cap: 'Mid Cap' }
];
