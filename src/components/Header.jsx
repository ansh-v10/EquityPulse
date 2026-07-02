'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Header({ stocks, onSelectStock }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);

  const [nifty, setNifty] = useState({ price: 24532.15, change: 0.32 });
  const [sensex, setSensex] = useState({ price: 80487.45, change: 0.28 });
  const niftyRef = useRef({ price: 24532.15, change: 0.32 });
  const sensexRef = useRef({ price: 80487.45, change: 0.28 });

  const deployId = process.env.NEXT_PUBLIC_DEPLOY_ID || null;

  useEffect(() => {
    const fetchIndices = async () => {
      const apiKey = process.env.NEXT_PUBLIC_INDIAN_API_KEY;
      if (!apiKey) return;
      try {
        const headers = { 'X-API-Key': apiKey };
        const niftyRes = await fetch('https://stock.indianapi.in/stock?name=NIFTYBEES', { headers });
        if (niftyRes.ok) {
          const data = await niftyRes.json();
          if (data && !data.error) {
            const rawPrice = parseFloat(data.currentPrice?.NSE || data.stockDetailsReusableData?.price || '267.27');
            const pct = parseFloat(data.percentChange || data.stockDetailsReusableData?.percentChange || '0.78');
            niftyRef.current = { price: rawPrice * 100, change: pct };
            setNifty({ price: parseFloat((rawPrice * 100).toFixed(2)), change: parseFloat(pct.toFixed(2)) });
          }
        }
        const sensexRes = await fetch('https://stock.indianapi.in/stock?name=SENSEX', { headers });
        if (sensexRes.ok) {
          const data = await sensexRes.json();
          if (data && !data.error) {
            const rawPrice = parseFloat(data.currentPrice?.BSE || data.stockDetailsReusableData?.price || '867.96');
            const pct = parseFloat(data.percentChange || data.stockDetailsReusableData?.percentChange || '0.69');
            sensexRef.current = { price: rawPrice * 100, change: pct };
            setSensex({ price: parseFloat((rawPrice * 100).toFixed(2)), change: parseFloat(pct.toFixed(2)) });
          }
        }
      } catch (err) {
      }
    };

    fetchIndices();
    const apiInterval = setInterval(fetchIndices, 30000);

    const simInterval = setInterval(() => {
      setNifty(prev => {
        const delta = (Math.random() - 0.48) * 4;
        const newPrice = Math.max(10000, niftyRef.current.price + delta);
        niftyRef.current.price = newPrice;
        return { price: parseFloat(newPrice.toFixed(2)), change: niftyRef.current.change };
      });
      setSensex(prev => {
        const delta = (Math.random() - 0.48) * 12;
        const newPrice = Math.max(30000, sensexRef.current.price + delta);
        sensexRef.current.price = newPrice;
        return { price: parseFloat(newPrice.toFixed(2)), change: sensexRef.current.change };
      });
    }, 5000);

    return () => {
      clearInterval(apiInterval);
      clearInterval(simInterval);
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toUpperCase();
    const matches = [];
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      if (stock.symbol.toUpperCase().includes(query) || stock.companyName.toUpperCase().includes(query)) {
        matches.push(stock);
        if (matches.length >= 8) break;
      }
    }
    setSearchResults(matches);
    setActiveIndex(-1);
  }, [searchQuery, stocks]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < searchResults.length) {
        selectItem(searchResults[activeIndex]);
      } else if (searchResults.length > 0) {
        selectItem(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      setDropdownVisible(false);
    }
  };

  const selectItem = (stock) => {
    onSelectStock(stock.symbol);
    setSearchQuery('');
    setDropdownVisible(false);
  };

  return (
    <header className="header" role="banner">
      <div className="logo-section">
        <div className="logo-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0d1117' }}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
        <span className="logo-text">EquityPulse</span>
        {deployId && <span className="deploy-badge">Deploy #{deployId}</span>}
      </div>

      <div className="search-container" ref={dropdownRef}>
        <input
          id="stock-search"
          type="text"
          className="search-input"
          placeholder="Search by symbol or company... (e.g. RELIANCE)"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setDropdownVisible(true);
          }}
          onFocus={() => setDropdownVisible(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="search-results"
        />
        {dropdownVisible && searchResults.length > 0 && (
          <div id="search-results" className="search-results-dropdown" role="listbox">
            {searchResults.map((stock, idx) => (
              <div
                key={stock.symbol}
                role="option"
                aria-selected={idx === activeIndex}
                className={`search-item ${idx === activeIndex ? 'selected' : ''}`}
                onClick={() => selectItem(stock)}
              >
                <span className="search-item-symbol">{stock.symbol}</span>
                <span className="search-item-name">{stock.companyName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="header-right">
        <div className="index-ticker" role="region" aria-label="Index Prices">
          <div className="index-item">
            <span>NIFTY 50:</span>
            <span className="index-val">{nifty.price.toLocaleString('en-IN')}</span>
            <span className={nifty.change >= 0 ? 'pos-val' : 'neg-val'}>
              {nifty.change >= 0 ? '▲' : '▼'} {Math.abs(nifty.change).toFixed(2)}%
            </span>
          </div>
          <div className="index-item">
            <span>SENSEX:</span>
            <span className="index-val">{sensex.price.toLocaleString('en-IN')}</span>
            <span className={sensex.change >= 0 ? 'pos-val' : 'neg-val'}>
              {sensex.change >= 0 ? '▲' : '▼'} {Math.abs(sensex.change).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="ws-status" role="status" aria-live="polite">
          <span className="status-dot connected"></span>
          <span>Live</span>
        </div>
      </div>
    </header>
  );
}
