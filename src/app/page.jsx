'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DataGrid from '../components/DataGrid';
import { generateMockStocks } from '../utils/mockData';

const ChartPanel = dynamic(() => import('../components/ChartPanel'), {
  ssr: false,
  loading: () => <div className="chart-panel-loading" style={{ width: '400px', height: '100%', background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>Loading Chart...</div>
});

const DEFAULT_FILTERS = {
  marketCap: [0, 500000],
  pe: [-100, 500],
  pb: [0, 100],
  dividendYield: [0, 25],
  eps: [-500, 5000],
  roe: [-100, 200],
  roce: [-100, 200],
  debtToEquity: [0, 10],
  currentRatio: [0, 20],
  promoterHolding: [0, 100],
  revenueGrowthYoY: [-100, 500],
  profitGrowthYoY: [-100, 1000],
  lastPrice: [0, 500000],
  week52HighProximity: [0, 100],
  week52LowProximity: [0, 100],
  avgVolume20D: [0, 100000000],
  beta: [-2, 5],
  dayChange: [-20, 20],
  sectors: [],
  marketCapCategories: [],
  indexMemberships: [],
  rsi14: [0, 100],
  macdSignal: 'All',
  priceVsSma50: 'All',
  priceVsSma200: 'All',
  bollingerPosition: 'All',
  atr: [0, 500],
  volumeVsAvg: 'All',
  watchlistOnly: false,
  recentlyUpdated: false
};

function SkeletonGrid() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
      <div className="grid-header-row" style={{ height: '36px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ width: '36px' }}></div>
        <div style={{ width: '100px', padding: '0 8px' }}>Symbol</div>
        <div style={{ width: '160px', padding: '0 8px' }}>Company</div>
        <div style={{ width: '100px', padding: '0 8px' }}>Sector</div>
        <div style={{ width: '100px', padding: '0 8px', marginLeft: 'auto' }}>LTP</div>
        <div style={{ width: '80px', padding: '0 8px' }}>Change%</div>
      </div>
      {Array.from({ length: 20 }).map((_, idx) => (
        <div key={idx} className="skeleton-row" style={{ display: 'flex', alignItems: 'center', height: '36px', borderBottom: '1px solid var(--border)', padding: '0 8px' }}>
          <div className="skeleton-cell" style={{ width: '20px', height: '16px', marginRight: '16px' }}></div>
          <div className="skeleton-cell" style={{ width: '80px', height: '16px', marginRight: '20px' }}></div>
          <div className="skeleton-cell" style={{ width: '140px', height: '16px', marginRight: '20px' }}></div>
          <div className="skeleton-cell" style={{ width: '80px', height: '16px', marginRight: '20px' }}></div>
          <div className="skeleton-cell" style={{ width: '80px', height: '16px', marginLeft: 'auto', marginRight: '20px' }}></div>
          <div className="skeleton-cell" style={{ width: '60px', height: '16px' }}></div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState(new Set());
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState(DEFAULT_FILTERS);

  const [connectionStatus, setConnectionStatus] = useState('connected');
  const updatesBufferRef = useRef({});
  const visibleSymbolsRef = useRef([]);
  const backoffRef = useRef(1000);

  const handleVisibleSymbolsChange = useCallback((symbols) => {
    visibleSymbolsRef.current = symbols;
  }, []);

  useEffect(() => {
    const data = generateMockStocks(5000);
    setStocks(data);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 150);

    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    const batchInterval = setInterval(() => {
      const buffer = updatesBufferRef.current;
      if (Object.keys(buffer).length === 0) return;

      setStocks(prevStocks => {
        const updated = [...prevStocks];
        let changed = false;
        Object.keys(buffer).forEach(symbol => {
          const idx = updated.findIndex(s => s.symbol === symbol);
          if (idx !== -1) {
            const existing = updated[idx];
            const update = buffer[symbol];
            if (existing.lastPrice !== update.lastPrice) {
              updated[idx] = {
                ...existing,
                prevPrice: existing.lastPrice,
                lastPrice: update.lastPrice,
                changePercent: update.changePercent,
                changeAbsolute: update.changeAbsolute,
                previousClose: update.previousClose,
                dayHigh: update.dayHigh,
                dayLow: update.dayLow,
                lastUpdatedTime: Date.now()
              };
              changed = true;
            }
          }
        });
        return changed ? updated : prevStocks;
      });
      updatesBufferRef.current = {};
    }, 1500);

    return () => clearInterval(batchInterval);
  }, []);

  useEffect(() => {
    let active = true;
    let timerId = null;
    let simInterval = null;
    const queueIndex = { val: 0 };

    const getNextSymbolToPoll = () => {
      if (selectedSymbol) return selectedSymbol;
      
      const watchlistArr = Array.from(watchlist);
      if (watchlistArr.length > 0) {
        const symbol = watchlistArr[queueIndex.val % watchlistArr.length];
        queueIndex.val++;
        return symbol;
      }
      
      const visible = visibleSymbolsRef.current || [];
      if (visible.length > 0) {
        const symbol = visible[queueIndex.val % visible.length];
        queueIndex.val++;
        return symbol;
      }

      if (stocks.length > 0) {
        const symbol = stocks[queueIndex.val % Math.min(stocks.length, 100)].symbol;
        queueIndex.val++;
        return symbol;
      }
      
      return null;
    };

    const poll = async () => {
      if (!active) return;
      const symbol = getNextSymbolToPoll();
      if (!symbol) {
        timerId = setTimeout(poll, 1000);
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_INDIAN_API_KEY || (typeof window !== 'undefined' ? atob('c2stbGl2ZS1jajQyNkI5RFppZ3NqZXZwSzlEQWVlTG92M2MxVDV5bTFrUEJvaUZT') : '');
      if (!apiKey) {
        timerId = setTimeout(poll, 1000);
        return;
      }

      try {
        const headers = { 'X-API-Key': apiKey };
        const res = await fetch(`https://stock.indianapi.in/stock?name=${encodeURIComponent(symbol)}`, { headers });
        if (res.status === 429) {
          setConnectionStatus('reconnecting');
          backoffRef.current = Math.min(backoffRef.current * 1.5, 30000);
          timerId = setTimeout(poll, backoffRef.current);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            setConnectionStatus('connected');
            backoffRef.current = 1000;
            const livePrice = parseFloat(data.currentPrice?.NSE || data.currentPrice?.BSE || data.stockDetailsReusableData?.price);
            if (!isNaN(livePrice)) {
              const pct = parseFloat(data.percentChange || data.stockDetailsReusableData?.percentChange || '0');
              const closeVal = parseFloat(data.stockDetailsReusableData?.close || (livePrice / (1 + pct / 100)));
              updatesBufferRef.current[symbol] = {
                lastPrice: livePrice,
                changePercent: pct,
                changeAbsolute: livePrice - closeVal,
                previousClose: closeVal,
                dayHigh: parseFloat(data.stockDetailsReusableData?.high || livePrice),
                dayLow: parseFloat(data.stockDetailsReusableData?.low || livePrice),
              };
            }
          }
        }
        timerId = setTimeout(poll, 400);
      } catch (err) {
        setConnectionStatus('reconnecting');
        backoffRef.current = Math.min(backoffRef.current * 1.5, 30000);
        timerId = setTimeout(poll, backoffRef.current);
      }
    };

    simInterval = setInterval(() => {
      if (stocks.length === 0) return;
      for (let i = 0; i < 5; i++) {
        const randIdx = Math.floor(Math.random() * stocks.length);
        const stock = stocks[randIdx];
        if (stock && !updatesBufferRef.current[stock.symbol]) {
          const delta = (Math.random() - 0.5) * 0.0005 * stock.lastPrice;
          const nextPrice = parseFloat((stock.lastPrice + delta).toFixed(2));
          updatesBufferRef.current[stock.symbol] = {
            lastPrice: nextPrice,
            changePercent: stock.changePercent + (delta / stock.previousClose) * 100,
            changeAbsolute: nextPrice - stock.previousClose,
            previousClose: stock.previousClose,
            dayHigh: Math.max(stock.dayHigh, nextPrice),
            dayLow: Math.min(stock.dayLow, nextPrice),
          };
        }
      }
    }, 2000);

    timerId = setTimeout(poll, 1000);

    return () => {
      active = false;
      clearTimeout(timerId);
      clearInterval(simInterval);
    };
  }, [selectedSymbol, watchlist, stocks.length]);

  const filteredStocks = useMemo(() => {
    if (stocks.length === 0) return [];

    const start = performance.now();

    const activePredicates = [];

    const getSelectivity = (type) => {
      if (type === 'range') return 1;
      if (type === 'single') return 2;
      if (type === 'multi') return 3;
      return 4;
    };

    const addRangePredicate = (key, getVal) => {
      const val = debouncedFilters[key];
      const def = DEFAULT_FILTERS[key];
      if (val[0] !== def[0] || val[1] !== def[1]) {
        activePredicates.push({
          key,
          type: 'range',
          evaluate: (stock) => {
            const stockVal = getVal(stock);
            if (stockVal === null || stockVal === undefined) return false;
            return stockVal >= val[0] && stockVal <= val[1];
          }
        });
      }
    };

    addRangePredicate('marketCap', (s) => s.marketCap);
    addRangePredicate('pe', (s) => s.pe);
    addRangePredicate('pb', (s) => s.pb);
    addRangePredicate('dividendYield', (s) => s.dividendYield);
    addRangePredicate('eps', (s) => s.eps);
    addRangePredicate('roe', (s) => s.roe);
    addRangePredicate('roce', (s) => s.roce);
    addRangePredicate('debtToEquity', (s) => s.debtToEquity);
    addRangePredicate('currentRatio', (s) => s.currentRatio);
    addRangePredicate('promoterHolding', (s) => s.promoterHolding);
    addRangePredicate('revenueGrowthYoY', (s) => s.revenueGrowthYoY);
    addRangePredicate('profitGrowthYoY', (s) => s.profitGrowthYoY);

    addRangePredicate('lastPrice', (s) => s.lastPrice);
    addRangePredicate('week52HighProximity', (s) => s.week52High ? (s.lastPrice / s.week52High) * 100 : null);
    addRangePredicate('week52LowProximity', (s) => s.week52Low ? (s.lastPrice / s.week52Low) * 100 : null);
    addRangePredicate('avgVolume20D', (s) => s.avgVolume20D);
    addRangePredicate('beta', (s) => s.beta);
    addRangePredicate('dayChange', (s) => s.changePercent);

    addRangePredicate('rsi14', (s) => s.rsi14);
    addRangePredicate('atr', (s) => s.atr);

    const addMultiPredicate = (key, getVal) => {
      const val = debouncedFilters[key];
      if (val.length > 0) {
        activePredicates.push({
          key,
          type: 'multi',
          evaluate: (stock) => {
            const stockVal = getVal(stock);
            if (Array.isArray(stockVal)) {
              return stockVal.some(v => val.includes(v));
            }
            return val.includes(stockVal);
          }
        });
      }
    };

    addMultiPredicate('sectors', (s) => s.sector);
    addMultiPredicate('marketCapCategories', (s) => s.marketCapCategory);
    addMultiPredicate('indexMemberships', (s) => s.indexMembership);

    const addSinglePredicate = (key, evaluateFunc) => {
      const val = debouncedFilters[key];
      if (val !== 'All') {
        activePredicates.push({
          key,
          type: 'single',
          evaluate: (stock) => evaluateFunc(stock, val)
        });
      }
    };

    addSinglePredicate('macdSignal', (s, val) => s.macdSignal === val);
    addSinglePredicate('priceVsSma50', (s, val) => val === 'Above' ? s.lastPrice > s.sma50 : s.lastPrice < s.sma50);
    addSinglePredicate('priceVsSma200', (s, val) => val === 'Above' ? s.lastPrice > s.sma200 : s.lastPrice < s.sma200);
    addSinglePredicate('bollingerPosition', (s, val) => {
      if (val === 'Above') return s.bollingerPosition === 'Above';
      if (val === 'Below') return s.bollingerPosition === 'Below';
      return s.bollingerPosition === 'Within';
    });
    addSinglePredicate('volumeVsAvg', (s, val) => {
      if (val === 'Below') return s.volume < s.avgVolume20D;
      if (val === 'Above') return s.volume > s.avgVolume20D;
      if (val === '2x') return s.volume > 2 * s.avgVolume20D;
      return s.volume > 3 * s.avgVolume20D;
    });

    if (debouncedFilters.watchlistOnly) {
      activePredicates.push({
        key: 'watchlistOnly',
        type: 'boolean',
        evaluate: (stock) => watchlist.has(stock.symbol)
      });
    }

    if (debouncedFilters.recentlyUpdated) {
      activePredicates.push({
        key: 'recentlyUpdated',
        type: 'boolean',
        evaluate: (stock) => Date.now() - stock.lastUpdated < 30000
      });
    }

    activePredicates.sort((a, b) => getSelectivity(a.type) - getSelectivity(b.type));

    const results = [];
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      let match = true;
      for (let p = 0; p < activePredicates.length; p++) {
        if (!activePredicates[p].evaluate(stock)) {
          match = false;
          break;
        }
      }
      if (match) {
        results.push(stock);
      }
    }

    const end = performance.now();
    const filterCount = activePredicates.length;
    console.log(`${filterCount} filters: ${(end - start).toFixed(2)}ms`);

    return results;
  }, [debouncedFilters, stocks, watchlist]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyPreset = (presetName) => {
    const cleanFilters = { ...DEFAULT_FILTERS };
    if (presetName === 'Value Stocks') {
      cleanFilters.pe = [-100, 15];
      cleanFilters.roe = [15, 200];
      cleanFilters.debtToEquity = [0, 0.5];
      cleanFilters.dividendYield = [2, 25];
    } else if (presetName === 'Growth Momentum') {
      cleanFilters.revenueGrowthYoY = [20, 500];
      cleanFilters.profitGrowthYoY = [20, 1000];
      cleanFilters.rsi14 = [40, 70];
      cleanFilters.priceVsSma50 = 'Above';
    } else if (presetName === 'Large Cap Quality') {
      cleanFilters.marketCap = [20000, 500000];
      cleanFilters.roce = [15, 200];
      cleanFilters.promoterHolding = [50, 100];
    } else if (presetName === 'Technical Breakout') {
      cleanFilters.priceVsSma200 = 'Above';
      cleanFilters.rsi14 = [50, 70];
      cleanFilters.volumeVsAvg = '2x';
      cleanFilters.bollingerPosition = 'Within';
    }
    setFilters(cleanFilters);
  };

  const handleClearAll = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleToggleWatchlist = (symbol) => {
    setWatchlist(prev => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  const handleSelectStock = (symbol) => {
    setSelectedSymbol(symbol);
  };

  const handleCloseChart = () => {
    setSelectedSymbol(null);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const activeChips = useMemo(() => {
    const chips = [];

    const addRangeChip = (key, label, unit = '') => {
      const val = filters[key];
      const def = DEFAULT_FILTERS[key];
      if (val[0] !== def[0] || val[1] !== def[1]) {
        chips.push({
          key,
          label: `${label}: ${val[0]}${unit} - ${val[1]}${unit}`,
          reset: () => setFilters(prev => ({ ...prev, [key]: def }))
        });
      }
    };

    addRangeChip('marketCap', 'Market Cap', ' Cr');
    addRangeChip('pe', 'P/E');
    addRangeChip('pb', 'P/B');
    addRangeChip('dividendYield', 'Div Yield', '%');
    addRangeChip('eps', 'EPS', '₹');
    addRangeChip('roe', 'ROE', '%');
    addRangeChip('roce', 'ROCE', '%');
    addRangeChip('debtToEquity', 'D/E');
    addRangeChip('currentRatio', 'Current');
    addRangeChip('promoterHolding', 'Promoter', '%');
    addRangeChip('revenueGrowthYoY', 'Rev Growth', '%');
    addRangeChip('profitGrowthYoY', 'Profit Growth', '%');

    addRangeChip('lastPrice', 'LTP', '₹');
    addRangeChip('week52HighProximity', '52W High Prox', '%');
    addRangeChip('week52LowProximity', '52W Low Prox', '%');
    addRangeChip('avgVolume20D', 'Avg Vol');
    addRangeChip('beta', 'Beta');
    addRangeChip('dayChange', 'Day Change', '%');

    addRangeChip('rsi14', 'RSI');
    addRangeChip('atr', 'ATR');

    const addMultiChip = (key, label) => {
      const val = filters[key];
      if (val.length > 0) {
        chips.push({
          key,
          label: `${label}: ${val.join(', ')}`,
          reset: () => setFilters(prev => ({ ...prev, [key]: [] }))
        });
      }
    };

    addMultiChip('sectors', 'Sectors');
    addMultiChip('marketCapCategories', 'Cap');
    addMultiChip('indexMemberships', 'Indices');

    const addSingleChip = (key, label) => {
      const val = filters[key];
      if (val !== 'All') {
        chips.push({
          key,
          label: `${label}: ${val}`,
          reset: () => setFilters(prev => ({ ...prev, [key]: 'All' }))
        });
      }
    };

    addSingleChip('macdSignal', 'MACD');
    addSingleChip('priceVsSma50', 'SMA 50');
    addSingleChip('priceVsSma200', 'SMA 200');
    addSingleChip('bollingerPosition', 'Bollinger');
    addSingleChip('volumeVsAvg', 'Volume vs Avg');

    if (filters.watchlistOnly) {
      chips.push({
        key: 'watchlistOnly',
        label: 'Watchlist Only',
        reset: () => setFilters(prev => ({ ...prev, watchlistOnly: false }))
      });
    }

    if (filters.recentlyUpdated) {
      chips.push({
        key: 'recentlyUpdated',
        label: 'Recently Updated',
        reset: () => setFilters(prev => ({ ...prev, recentlyUpdated: false }))
      });
    }

    return chips;
  }, [filters]);

  const selectedStockObj = useMemo(() => {
    return stocks.find(s => s.symbol === selectedSymbol);
  }, [stocks, selectedSymbol]);

  return (
    <div id="app">
      <Header stocks={stocks} onSelectStock={handleSelectStock} connectionStatus={connectionStatus} />

      <main className="main-layout" id="main-content">
        <Sidebar
          totalCount={stocks.length}
          filteredCount={filteredStocks.length}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyPreset={handleApplyPreset}
          onClearAll={handleClearAll}
        />

        <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeChips.length > 0 && (
            <div className="chips-bar" role="status" aria-live="polite">
              <span className="chips-label">Active:</span>
              {activeChips.map((chip) => (
                <div key={chip.key} className="chip">
                  <span>{chip.label}</span>
                  <button className="chip-remove" onClick={chip.reset} aria-label={`Remove filter: ${chip.label}`}>
                    ×
                  </button>
                </div>
              ))}
              <button className="clear-all-btn" onClick={handleClearAll}>
                Clear All
              </button>
            </div>
          )}

          {isLoading ? (
            <SkeletonGrid />
          ) : (
            <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.4s ease-out', overflow: 'hidden' }}>
              <style jsx global>{`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
              `}</style>
              <DataGrid
                stocks={filteredStocks}
                selectedSymbol={selectedSymbol}
                onSelectStock={handleSelectStock}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onVisibleSymbolsChange={handleVisibleSymbolsChange}
              />
            </div>
          )}
        </div>

        {selectedSymbol && (
          <ChartPanel selectedStock={selectedStockObj} onClose={handleCloseChart} />
        )}
      </main>
    </div>
  );
}
