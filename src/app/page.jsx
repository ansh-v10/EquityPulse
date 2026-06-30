'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DataGrid from '../components/DataGrid';
import ChartPanel from '../components/ChartPanel';
import { generateMockStocks } from '../utils/mockData';

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

  useEffect(() => {
    const start = performance.now();
    const data = generateMockStocks(5000);
    const end = performance.now();
    console.log(`Generated 5000 stocks in ${(end - start).toFixed(2)}ms`);

    setStocks(data);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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

  const selectedStockObj = stocks.find(s => s.symbol === selectedSymbol);

  return (
    <div id="app">
      <Header stocks={stocks} onSelectStock={handleSelectStock} />

      <main className="main-layout" id="main-content">
        <Sidebar
          totalCount={5000}
          filteredCount={stocks.length}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {isLoading ? (
          <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <SkeletonGrid />
          </div>
        ) : (
          <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.4s ease-out' }}>
            <style jsx global>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
            <DataGrid
              stocks={stocks}
              selectedSymbol={selectedSymbol}
              onSelectStock={handleSelectStock}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          </div>
        )}

        {selectedSymbol && (
          <ChartPanel selectedStock={selectedStockObj} onClose={handleCloseChart} />
        )}
      </main>
    </div>
  );
}
