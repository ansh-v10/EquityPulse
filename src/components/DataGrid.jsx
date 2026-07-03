'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { formatIndianNumber } from '../utils/mockData';

const ROW_HEIGHT = 36;
const OVERSCAN = 10;

export default function DataGrid({
  stocks,
  selectedSymbol,
  onSelectStock,
  watchlist,
  onToggleWatchlist
}) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);

      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const lastScrollTopRef = useRef(0);
  const rafIdRef = useRef(null);

  const onScroll = useCallback((e) => {
    const nextScrollTop = e.currentTarget.scrollTop;
    lastScrollTopRef.current = nextScrollTop;

    if (!rafIdRef.current) {
      rafIdRef.current = window.requestAnimationFrame(() => {
        setScrollTop(lastScrollTopRef.current);
        rafIdRef.current = null;
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedStocks = useMemo(() => {
    if (!sortColumn || !sortDirection) return stocks;

    const sorted = [...stocks].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      if (sortColumn === 'watchlist') {
        aVal = watchlist.has(a.symbol) ? 1 : 0;
        bVal = watchlist.has(b.symbol) ? 1 : 0;
      }

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

    return sorted;
  }, [stocks, sortColumn, sortDirection, watchlist]);

  const totalRows = sortedStocks.length;
  const totalHeight = totalRows * ROW_HEIGHT;

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(totalRows - 1, Math.floor((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN);

  const renderSortIndicator = (columnKey) => {
    if (sortColumn !== columnKey) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    if (highlightedIndex >= sortedStocks.length) {
      setHighlightedIndex(Math.max(0, sortedStocks.length - 1));
    }
  }, [sortedStocks, highlightedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const next = Math.min(prev + 1, sortedStocks.length - 1);
        scrollToRow(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const next = Math.max(prev - 1, 0);
        scrollToRow(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sortedStocks[highlightedIndex]) {
        onSelectStock(sortedStocks[highlightedIndex].symbol);
      }
    } else if (e.key === ' ') {
      e.preventDefault();
      if (sortedStocks[highlightedIndex]) {
        onToggleWatchlist(sortedStocks[highlightedIndex].symbol);
      }
    }
  };

  const scrollToRow = (index) => {
    if (!containerRef.current) return;
    const rowTop = index * ROW_HEIGHT;
    const rowBottom = rowTop + ROW_HEIGHT;
    const currentScrollTop = containerRef.current.scrollTop;
    const currentScrollBottom = currentScrollTop + containerHeight;

    if (rowTop < currentScrollTop) {
      containerRef.current.scrollTop = rowTop;
    } else if (rowBottom > currentScrollBottom) {
      containerRef.current.scrollTop = rowBottom - containerHeight;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sortedStocks, highlightedIndex, onSelectStock, onToggleWatchlist]);

  const visibleRows = useMemo(() => {
    const rows = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const stock = sortedStocks[i];
      if (!stock) continue;

      const isStarred = watchlist.has(stock.symbol);
      const isSelected = selectedSymbol === stock.symbol;
      const isPositive = stock.changePercent >= 0;

      const isRecentUpdate = Date.now() - stock.lastUpdatedTime < 1000;
      const flashClass = isRecentUpdate
        ? (stock.lastPrice > stock.prevPrice ? 'flash-up' : stock.lastPrice < stock.prevPrice ? 'flash-down' : '')
        : '';

      rows.push(
        <div
          key={stock.symbol}
          role="row"
          aria-rowindex={i + 1}
          className={`grid-row ${isSelected ? 'selected' : ''} ${flashClass}`}
          style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
          onClick={() => {
            setHighlightedIndex(i);
            onSelectStock(stock.symbol);
          }}
        >
          <div className="grid-cell col-star" role="gridcell">
            <button
              className={`star-btn ${isStarred ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(stock.symbol);
              }}
              aria-label={isStarred ? `Remove ${stock.symbol} from watchlist` : `Add ${stock.symbol} to watchlist`}
            >
              ★
            </button>
          </div>

          <div className="grid-cell col-symbol sticky-left-0" role="gridcell">
            {stock.symbol}
          </div>

          <div className="grid-cell col-company" role="gridcell" title={stock.companyName}>
            {stock.companyName}
          </div>

          <div className="grid-cell col-sector" role="gridcell">
            <span className="sector-badge" title={stock.sector}>
              {stock.sector}
            </span>
          </div>

          <div className="grid-cell col-ltp tabular-nums" role="gridcell">
            {formatIndianNumber(stock.lastPrice, 'price')}
          </div>

          <div className={`grid-cell col-change-pct tabular-nums ${isPositive ? 'pos-val' : 'neg-val'}`} role="gridcell">
            {isPositive ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
          </div>

          <div className={`grid-cell col-change-val tabular-nums ${isPositive ? 'pos-val' : 'neg-val'}`} role="gridcell">
            {isPositive ? '+' : ''}{formatIndianNumber(stock.changeAbsolute)}
          </div>

          <div className="grid-cell col-volume tabular-nums" role="gridcell">
            {formatIndianNumber(stock.volume, 'volume')}
          </div>

          <div className="grid-cell col-mcap tabular-nums" role="gridcell">
            {formatIndianNumber(stock.marketCap, 'mcap')}
          </div>
        </div>
      );
    }
    return rows;
  }, [sortedStocks, startIndex, endIndex, watchlist, selectedSymbol, highlightedIndex, onSelectStock, onToggleWatchlist]);

  return (
    <div className="grid-panel">
      <div
        ref={containerRef}
        className="grid-scroll-container"
        onScroll={onScroll}
        role="grid"
        aria-label="Stock Screener Results"
        aria-rowcount={totalRows}
        tabIndex="0"
        style={{ outline: 'none' }}
      >
        <div className="grid-table" style={{ height: totalHeight }}>
          
          <div className="grid-header-row" role="row" style={{ height: ROW_HEIGHT }}>
            <div className="grid-header-cell col-star" role="columnheader" aria-sort="none">
              ☆
            </div>
            <div
              className="grid-header-cell col-symbol sticky-left-0 sort-active"
              role="columnheader"
              onClick={() => handleSort('symbol')}
              aria-sort={sortColumn === 'symbol' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Symbol{renderSortIndicator('symbol')}
            </div>
            <div
              className="grid-header-cell col-company"
              role="columnheader"
              onClick={() => handleSort('companyName')}
              aria-sort={sortColumn === 'companyName' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Company{renderSortIndicator('companyName')}
            </div>
            <div
              className="grid-header-cell col-sector"
              role="columnheader"
              onClick={() => handleSort('sector')}
              aria-sort={sortColumn === 'sector' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Sector{renderSortIndicator('sector')}
            </div>
            <div
              className="grid-header-cell col-ltp"
              role="columnheader"
              onClick={() => handleSort('lastPrice')}
              style={{ justifyContent: 'flex-end' }}
              aria-sort={sortColumn === 'lastPrice' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              LTP (₹){renderSortIndicator('lastPrice')}
            </div>
            <div
              className="grid-header-cell col-change-pct"
              role="columnheader"
              onClick={() => handleSort('changePercent')}
              style={{ justifyContent: 'flex-end' }}
              aria-sort={sortColumn === 'changePercent' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Change %{renderSortIndicator('changePercent')}
            </div>
            <div
              className="grid-header-cell col-change-val"
              role="columnheader"
              onClick={() => handleSort('changeAbsolute')}
              style={{ justifyContent: 'flex-end' }}
              aria-sort={sortColumn === 'changeAbsolute' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Change (₹){renderSortIndicator('changeAbsolute')}
            </div>
            <div
              className="grid-header-cell col-volume"
              role="columnheader"
              onClick={() => handleSort('volume')}
              style={{ justifyContent: 'flex-end' }}
              aria-sort={sortColumn === 'volume' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Volume{renderSortIndicator('volume')}
            </div>
            <div
              className="grid-header-cell col-mcap"
              role="columnheader"
              onClick={() => handleSort('marketCap')}
              style={{ justifyContent: 'flex-end' }}
              aria-sort={sortColumn === 'marketCap' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Market Cap{renderSortIndicator('marketCap')}
            </div>
          </div>

          <div className="grid-row-container">
            {visibleRows}
          </div>

        </div>
      </div>
    </div>
  );
}
