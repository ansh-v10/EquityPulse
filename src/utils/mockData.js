export function normalRandom(mean = 0, stdDev = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
}

export function formatIndianNumber(n, type = 'number') {
  if (n === null || n === undefined || isNaN(n)) return '—';

  if (type === 'price') {
    return '₹' + n.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (type === 'volume') {
    if (n >= 10000000) {
      return (n / 10000000).toFixed(2) + 'Cr';
    } else if (n >= 100000) {
      return (n / 100000).toFixed(2) + 'L';
    } else if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K';
    }
    return n.toString();
  }

  if (type === 'mcap') {
    if (n >= 100000) {
      return '₹' + (n / 100000).toFixed(2) + 'L Cr';
    }
    return '₹' + Math.round(n).toLocaleString('en-IN') + ' Cr';
  }

  return n.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });
}

const SECTOR_CONFIGS = {
  'Banking & Financial Services': { count: 750, avgPE: 18.5, avgBeta: 1.10, industries: ['Private Banks', 'Public Banks', 'NBFCs', 'Asset Management', 'Insurance'] },
  'Information Technology': { count: 600, avgPE: 25.0, avgBeta: 0.85, industries: ['Software Services', 'IT Consulting', 'BPO/KPO', 'Product Software'] },
  'Pharmaceuticals & Healthcare': { count: 500, avgPE: 30.0, avgBeta: 0.70, industries: ['Formulations', 'APIs', 'Hospitals', 'Diagnostics', 'Medical Devices'] },
  'Consumer Goods / FMCG': { count: 400, avgPE: 35.0, avgBeta: 0.60, industries: ['Personal Care', 'Packaged Foods', 'Beverages', 'Household Products', 'Tobacco'] },
  'Automobile & Auto Components': { count: 350, avgPE: 22.0, avgBeta: 1.05, industries: ['Passenger Vehicles', 'Commercial Vehicles', 'Two Wheelers', 'Auto Parts', 'Tyres'] },
  'Metals & Mining': { count: 300, avgPE: 12.0, avgBeta: 1.40, industries: ['Steel', 'Aluminum', 'Copper', 'Coal Mining', 'Iron Ore'] },
  'Energy (Oil, Gas, Power)': { count: 300, avgPE: 14.0, avgBeta: 0.95, industries: ['Refining', 'Gas Distribution', 'Power Generation', 'Renewable Energy', 'Transmission'] },
  'Real Estate & Construction': { count: 350, avgPE: 20.0, avgBeta: 1.30, industries: ['Residential Developer', 'Commercial Developer', 'EPC Contractors', 'Cement', 'Building Materials'] },
  'Telecom & Media': { count: 200, avgPE: 28.0, avgBeta: 0.90, industries: ['Telecom Operators', 'Broadcasting', 'Publishing', 'DTH Services', 'Ad Agencies'] },
  'Infrastructure & Capital Goods': { count: 400, avgPE: 18.0, avgBeta: 1.15, industries: ['Ports & Tollways', 'Airports', 'Heavy Machinery', 'Electrical Equipment', 'Industrial Consumables'] },
  'Chemicals & Fertilisers': { count: 350, avgPE: 22.0, avgBeta: 0.80, industries: ['Specialty Chemicals', 'Agrochemicals', 'Petrochemicals', 'Fertilisers', 'Dyes & Pigments'] },
  'Others (Textiles, Paper, etc.)': { count: 500, avgPE: 16.0, avgBeta: 1.00, industries: ['Textiles', 'Paper & Pulp', 'Packaging', 'Sugar', 'Gems & Jewellery', 'Trading Houses'] }
};

export function generateMockStocks(totalCount = 5000) {
  const stocks = [];
  const symbolMap = new Set();

  const sectorPool = [];
  for (const [sectorName, config] of Object.entries(SECTOR_CONFIGS)) {
    for (let i = 0; i < config.count; i++) {
      sectorPool.push(sectorName);
    }
  }

  for (let i = sectorPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sectorPool[i], sectorPool[j]] = [sectorPool[j], sectorPool[i]];
  }

  const mcapCategories = [];
  for (let i = 0; i < 100; i++) mcapCategories.push({ cat: 'Large Cap', minMcap: 50000, maxMcap: 2000000 });
  for (let i = 0; i < 400; i++) mcapCategories.push({ cat: 'Mid Cap', minMcap: 10000, maxMcap: 49999 });
  for (let i = 0; i < 1500; i++) mcapCategories.push({ cat: 'Small Cap', minMcap: 1000, maxMcap: 9999 });
  for (let i = 0; i < 3000; i++) mcapCategories.push({ cat: 'Micro Cap', minMcap: 50, maxMcap: 999 });

  const symbolPrefixes = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'BHARTIARTL', 'SBI', 'LIC', 'LICI', 'ITC',
    'HINDUNILVR', 'LT', 'BAJFINANCE', 'HCLTECH', 'MARUTI', 'SUNPHARMA', 'ADANIENT', 'KOTAKBANK',
    'TITAN', 'AXISBANK', 'ULTRACEMCO', 'ONGC', 'NTPC', 'TATASTEEL', 'COALINDIA', 'ASIANPAINT',
    'M&M', 'JIOFIN', 'ADANIPORTS', 'POWERGRID', 'BAJAJFINSV', 'WIPRO', 'ADANIPOWER', 'HINDALCO',
    'JSWSTEEL', 'GRASIM', 'IOC', 'LTIM', 'INDUSINDBK', 'NESTLEIND', 'TECHM', 'TATACOMM', 'CIPLA',
    'DRREDDY', 'ADANIGREEN', 'BEL', 'BPCL', 'TATAMOTORS', 'SBILIFE', 'TRENT', 'DLF', 'EICHERMOT',
    'INDIGO', 'HAL', 'ZOMATO', 'DMART', 'SIEMENS', 'ABB', 'HAVELLS', 'GAIL', 'PNB', 'CANBK',
    'SHRIRAMFIN', 'UNIONBANK', 'VBL', 'COLPAL', 'TVSMOTOR', 'HEROMOTOCO', 'APOLLOHOSP', 'PIDILITIND',
    'POLYCAB', 'OBEROIRLTY', 'PHOENIXLTD', 'BRITANNIA', 'DABUR', 'GODREJCP', 'MARICO', 'DIVISLAB',
    'LUPIN', 'AUROPHARMA', 'BIOCON', 'AMBUJACEM', 'ACC', 'JSWENERGY', 'TATACHEM', 'UPL', 'SAIL',
    'NMDC', 'MAXHEALTH', 'FORTIS', 'TATAELXSI', 'PERSISTENT', 'KPITTECH', 'COFORGE', 'MPHASIS',
    'DIXON', 'KAYNES', 'IRFC', 'RVNL', 'IRCON', 'HUDCO', 'NHPC', 'SJVN', 'RECLTD', 'PFC',
    'GMRINFRA', 'GICRE', 'NIACL', 'CHOLAHLDNG', 'MUTHOOTFIN', 'MANAPPURAM', 'BANDHANBNK',
    'IDFCFIRSTB', 'FEDERALBNK', 'YESBANK', 'J&KBANK', 'BOB', 'CENTRALBK', 'IOB', 'MAHABANK'
  ];

  for (let i = 0; i < totalCount; i++) {
    const sector = sectorPool[i];
    const mcapInfo = mcapCategories[i];
    const config = SECTOR_CONFIGS[sector];

    let symbol = '';
    if (i < symbolPrefixes.length) {
      symbol = symbolPrefixes[i];
    } else {
      const basePrefix = symbolPrefixes[i % symbolPrefixes.length];
      const suffix = Math.floor(i / symbolPrefixes.length).toString().padStart(3, '0');
      symbol = `${basePrefix}${suffix}`;
    }

    if (symbolMap.has(symbol)) {
      symbol = `${symbol}_${i}`;
    }
    symbolMap.add(symbol);

    const companyName = `${symbol.replace(/\d+/g, '')} ${mcapInfo.cat === 'Large Cap' ? 'Industries' : mcapInfo.cat === 'Mid Cap' ? 'Technologies' : mcapInfo.cat === 'Small Cap' ? 'India' : 'Enterprises'} Ltd.`;
    const industry = config.industries[Math.floor(Math.random() * config.industries.length)];

    const marketCap = Math.round(mcapInfo.minMcap + Math.random() * (mcapInfo.maxMcap - mcapInfo.minMcap));

    let beta = config.avgBeta;
    if (mcapInfo.cat === 'Large Cap') {
      beta = 0.5 + Math.random() * 0.7;
    } else if (mcapInfo.cat === 'Micro Cap') {
      beta = 0.3 + Math.random() * 2.2;
    } else {
      beta = 0.4 + Math.random() * 1.6;
    }
    beta = parseFloat(beta.toFixed(2));

    let promoterHolding = 50;
    if (mcapInfo.cat === 'Large Cap') {
      promoterHolding = 40 + Math.random() * 35;
    } else if (mcapInfo.cat === 'Micro Cap') {
      promoterHolding = 20 + Math.random() * 70;
    } else {
      promoterHolding = 30 + Math.random() * 50;
    }
    promoterHolding = parseFloat(promoterHolding.toFixed(2));

    const revenueGrowthYoY = parseFloat(normalRandom(12, 10).toFixed(2));
    const profitGrowthYoY = parseFloat((revenueGrowthYoY * (0.8 + Math.random() * 0.6) + normalRandom(2, 5)).toFixed(2));

    let pe = null;
    const basePE = config.avgPE;
    if (revenueGrowthYoY > 25) {
      pe = parseFloat((20 + Math.random() * 60).toFixed(1));
    } else if (revenueGrowthYoY < 5) {
      if (Math.random() < 0.15) {
        pe = null;
      } else {
        pe = parseFloat((5 + Math.random() * 10).toFixed(1));
      }
    } else {
      pe = parseFloat(normalRandom(basePE, basePE * 0.25).toFixed(1));
      if (pe !== null && pe < 0) pe = Math.abs(pe);
    }

    let debtToEquity = 0.5;
    if (sector === 'Banking & Financial Services') {
      debtToEquity = parseFloat((5.0 + Math.random() * 10.0).toFixed(2));
    } else if (sector === 'Information Technology' || sector === 'Consumer Goods / FMCG') {
      debtToEquity = parseFloat((Math.random() * 0.5).toFixed(2));
    } else if (sector === 'Infrastructure & Capital Goods' || sector === 'Real Estate & Construction') {
      debtToEquity = parseFloat((0.5 + Math.random() * 1.5).toFixed(2));
    } else {
      debtToEquity = parseFloat(Math.max(0, normalRandom(0.6, 0.4)).toFixed(2));
    }

    let lastPrice = 10;
    if (mcapInfo.cat === 'Large Cap') {
      lastPrice = parseFloat((500 + Math.random() * 19500).toFixed(2));
    } else if (mcapInfo.cat === 'Mid Cap') {
      lastPrice = parseFloat((150 + Math.random() * 4850).toFixed(2));
    } else {
      lastPrice = parseFloat((10 + Math.random() * 990).toFixed(2));
    }

    const changePercent = parseFloat(normalRandom(0.05, 1.8).toFixed(2));
    const previousClose = parseFloat((lastPrice / (1 + changePercent / 100)).toFixed(2));
    const changeAbsolute = parseFloat((lastPrice - previousClose).toFixed(2));

    const dayOpen = parseFloat((previousClose * (1 + normalRandom(0, 0.5) / 100)).toFixed(2));
    const dayHigh = parseFloat((Math.max(lastPrice, dayOpen) * (1 + Math.abs(normalRandom(0, 0.4)) / 100)).toFixed(2));
    const dayLow = parseFloat((Math.min(lastPrice, dayOpen) * (1 - Math.abs(normalRandom(0, 0.4)) / 100)).toFixed(2));

    let avgVolume20D = Math.round(marketCap * (1000 + Math.random() * 5000));
    if (mcapInfo.cat === 'Micro Cap') {
      avgVolume20D = Math.round(5000 + Math.random() * 95000);
    }
    const volMultiplier = 1.0 + Math.abs(changePercent) * 0.3 + Math.random() * 0.5;
    const volume = Math.round(avgVolume20D * volMultiplier);

    const week52High = parseFloat((lastPrice * (1.0 + Math.random() * 0.5)).toFixed(2));
    const week52Low = parseFloat((lastPrice * (0.5 + Math.random() * 0.4)).toFixed(2));

    const pb = parseFloat((1.0 + Math.random() * 15.0).toFixed(2));
    const dividendYield = parseFloat((Math.random() < 0.3 ? 0 : Math.random() * 6).toFixed(2));
    const eps = pe ? parseFloat((lastPrice / pe).toFixed(2)) : parseFloat(normalRandom(10, 20).toFixed(2));
    const roe = parseFloat(normalRandom(12, 8).toFixed(2));
    const roce = parseFloat((roe * (0.9 + Math.random() * 0.4) + Math.random() * 3).toFixed(2));
    const currentRatio = parseFloat((0.5 + Math.random() * 3.5).toFixed(2));

    let rsi14 = 50;
    if (changePercent > 1.5) {
      rsi14 = Math.round(50 + Math.random() * 45);
    } else if (changePercent < -1.5) {
      rsi14 = Math.round(5 + Math.random() * 45);
    } else {
      rsi14 = Math.round(30 + Math.random() * 40);
    }

    const sma50 = parseFloat((lastPrice * (0.9 + Math.random() * 0.2)).toFixed(2));
    const sma200 = parseFloat((lastPrice * (0.8 + Math.random() * 0.3)).toFixed(2));

    const atr = parseFloat((lastPrice * (0.01 + Math.random() * 0.04)).toFixed(2));

    let macdSignal = 'Neutral';
    const macdRand = Math.random();
    if (macdRand < 0.33) macdSignal = 'Bullish';
    else if (macdRand < 0.66) macdSignal = 'Bearish';

    let bollingerPosition = 'Within';
    const bbRand = Math.random();
    if (bbRand < 0.15) bollingerPosition = 'Above';
    else if (bbRand < 0.30) bollingerPosition = 'Below';

    let volumeVsAvg = 'Below';
    const volRatio = volume / avgVolume20D;
    if (volRatio > 3.0) volumeVsAvg = '3x';
    else if (volRatio > 2.0) volumeVsAvg = '2x';
    else if (volRatio > 1.0) volumeVsAvg = 'Above';

    const indexMembership = [];
    if (mcapInfo.cat === 'Large Cap') {
      const idxRand = Math.random();
      if (idxRand < 0.4) indexMembership.push('NIFTY 50', 'BSE Sensex');
      else if (idxRand < 0.7) indexMembership.push('NIFTY 50');
      else indexMembership.push('BSE Sensex');
    } else if (mcapInfo.cat === 'Mid Cap') {
      const idxRand = Math.random();
      if (idxRand < 0.5) indexMembership.push('NIFTY Next 50');
      else indexMembership.push('NIFTY Midcap 100');
    } else if (mcapInfo.cat === 'Small Cap') {
      if (Math.random() < 0.6) indexMembership.push('NIFTY Smallcap 250');
    }

    stocks.push({
      symbol,
      companyName,
      sector,
      industry,
      marketCapCategory: mcapInfo.cat,
      indexMembership,
      lastPrice,
      previousClose,
      dayOpen,
      dayHigh,
      dayLow,
      changePercent,
      changeAbsolute,
      volume,
      avgVolume20D,
      week52High,
      week52Low,
      marketCap,
      pe,
      pb,
      dividendYield,
      eps,
      roe,
      roce,
      debtToEquity,
      currentRatio,
      promoterHolding,
      revenueGrowthYoY,
      profitGrowthYoY,
      rsi14,
      sma50,
      sma200,
      beta,
      atr,
      macdSignal,
      bollingerPosition,
      volumeVsAvg,
      inWatchlist: false,
      lastUpdated: Date.now(),
      prevPrice: lastPrice,
      lastUpdatedTime: 0
    });
  }

  return stocks;
}

const ohlcvCache = new Map();

export function getOHLCV(symbol, startPrice, beta, avgVolume) {
  if (ohlcvCache.has(symbol)) {
    return ohlcvCache.get(symbol);
  }
  const data = generateOHLCV(startPrice, 252, beta * 0.02, avgVolume);
  ohlcvCache.set(symbol, data);
  return data;
}

export function generateOHLCV(startPrice, days = 252, volatility = 0.02, avgVolume = 1000000) {
  const ohlcv = [];
  let prevClose = startPrice;
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - Math.round(days * 1.55));
  
  while (ohlcv.length < days) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dailyReturn = normalRandom(0.0002, volatility);
      const close = parseFloat((prevClose * (1 + dailyReturn)).toFixed(2));
      const open = prevClose;
      const intraday1 = parseFloat((open * (1 + normalRandom(0, volatility * 0.5))).toFixed(2));
      const intraday2 = parseFloat((close * (1 + normalRandom(0, volatility * 0.5))).toFixed(2));
      const high = parseFloat((Math.max(open, close, intraday1, intraday2) * (1 + Math.abs(normalRandom(0, 1)) * 0.003)).toFixed(2));
      const low = parseFloat((Math.min(open, close, intraday1, intraday2) * (1 - Math.abs(normalRandom(0, 1)) * 0.003)).toFixed(2));
      const volMultiplier = 1.0 + Math.abs(dailyReturn) * 15.0 + Math.random() * 0.5;
      const volume = Math.round(avgVolume * volMultiplier);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      ohlcv.push({
        time: dateStr,
        open,
        high,
        low,
        close,
        volume
      });
      
      prevClose = close;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return ohlcv;
}

