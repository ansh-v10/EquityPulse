'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DataGrid from '../components/DataGrid';
import ChartPanel from '../components/ChartPanel';
import { generateMockStocks } from '../utils/mockData';

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
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [watchlist, setWatchlist] = useState(new Set());
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    const data = generateMockStocks(5000);
    setStocks(data);
    setFilteredStocks(data);

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
    if (stocks.length === 0) return;

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

    setFilteredStocks(results);
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

  const getActiveChips = () => {
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
  };

  const activeChips = getActiveChips();
  const selectedStockObj = stocks.find(s => s.symbol === selectedSymbol);

  return (
    <div id="app">
      <Header stocks={stocks} onSelectStock={handleSelectStock} />

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
