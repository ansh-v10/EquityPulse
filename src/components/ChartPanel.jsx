'use client';

import React, { useState, useMemo } from 'react';
import { formatIndianNumber, getOHLCV } from '../utils/mockData';
import TechnicalChart from './TechnicalChart';

export default function ChartPanel({ selectedStock, onClose }) {
  const [timeframe, setTimeframe] = useState('1M');
  const [activeIndicators, setActiveIndicators] = useState({
    SMA20: false,
    SMA50: false,
    SMA200: false,
    EMA12: false,
    EMA26: false,
    BB: false,
    RSI: false,
    VOL: false
  });

  const toggleIndicator = (ind) => {
    setActiveIndicators(prev => ({
      ...prev,
      [ind]: !prev[ind]
    }));
  };

  const clearAllIndicators = () => {
    setActiveIndicators({
      SMA20: false,
      SMA50: false,
      SMA200: false,
      EMA12: false,
      EMA26: false,
      BB: false,
      RSI: false,
      VOL: false
    });
  };

  const rawOhlcv = useMemo(() => {
    if (!selectedStock) return [];
    return getOHLCV(
      selectedStock.symbol,
      selectedStock.lastPrice,
      selectedStock.beta,
      selectedStock.volume
    );
  }, [selectedStock]);

  const aggregatedOhlcv = useMemo(() => {
    if (rawOhlcv.length === 0) return [];

    const data = rawOhlcv.map(d => ({
      ...d,
      time: Math.round(new Date(d.time).getTime() / 1000)
    }));

    if (timeframe === '1D') {
      const lastBar = data[data.length - 1];
      const hourly = [];
      let prevClose = lastBar.open;
      for (let i = 0; i < 78; i++) {
        const change = (Math.random() - 0.5) * 0.003;
        const close = parseFloat((prevClose * (1 + change)).toFixed(2));
        const open = prevClose;
        hourly.push({
          time: lastBar.time - (78 - i) * 3600,
          open,
          high: parseFloat((Math.max(open, close) * (1 + Math.random() * 0.002)).toFixed(2)),
          low: parseFloat((Math.min(open, close) * (1 - Math.random() * 0.002)).toFixed(2)),
          close,
          volume: Math.round(lastBar.volume / 78)
        });
        prevClose = close;
      }
      return hourly;
    }

    if (timeframe === '1W') return data.slice(-7);
    if (timeframe === '1M') return data.slice(-20);
    if (timeframe === '3M') return data.slice(-60);
    return data;
  }, [rawOhlcv, timeframe]);

  if (!selectedStock) {
    return (
      <aside className="chart-panel" style={{ justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
          Select a stock from the grid to view detailed chart and fundamentals.
        </p>
      </aside>
    );
  }

  const isPositive = selectedStock.changePercent >= 0;

  return (
    <aside className="chart-panel" aria-label="Stock details panel">
      <div className="chart-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' }}>
              {selectedStock.symbol}
            </span>
            <span className="sector-badge">{selectedStock.sector}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedStock.companyName}
          </div>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 16px 8px 16px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{ fontSize: '24px', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' }}>
            {formatIndianNumber(selectedStock.lastPrice, 'price')}
          </span>
          <span style={{ fontSize: '14px', fontWeight: '500' }} className={isPositive ? 'pos-val' : 'neg-val'}>
            {isPositive ? '▲' : '▼'} {Math.abs(selectedStock.changePercent).toFixed(2)}% ({formatIndianNumber(selectedStock.changeAbsolute)})
          </span>
        </div>

        <div className="chart-timeframes">
          {['1D', '1W', '1M', '3M', '1Y'].map(tf => (
            <button
              key={tf}
              className={`chart-timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="chart-indicators-toolbar">
          {['SMA20', 'SMA50', 'SMA200', 'EMA12', 'EMA26', 'BB', 'RSI', 'VOL'].map(ind => (
            <button
              key={ind}
              className={`chart-toolbar-btn ${activeIndicators[ind] ? 'active' : ''}`}
              onClick={() => toggleIndicator(ind)}
            >
              {ind}
            </button>
          ))}
          <button className="chart-toolbar-btn" onClick={clearAllIndicators}>
            All Off
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <TechnicalChart
            ohlcvData={aggregatedOhlcv}
            timeframe={timeframe}
            activeIndicators={activeIndicators}
          />
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Key Financials
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              backgroundColor: 'var(--surface-2)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Market Cap</span>
                <span style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                  {formatIndianNumber(selectedStock.marketCap, 'mcap')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>P/E Ratio</span>
                <span style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                  {selectedStock.pe ? selectedStock.pe.toFixed(1) : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>P/B Ratio</span>
                <span style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                  {selectedStock.pb.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Div. Yield</span>
                <span style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                  {selectedStock.dividendYield.toFixed(2)}%
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ROE</span>
                <span style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'JetBrains Mono', marginTop: '2px', color: selectedStock.roe > 15 ? 'var(--positive)' : selectedStock.roe < 0 ? 'var(--negative)' : 'var(--text)' }}>
                  {selectedStock.roe.toFixed(2)}%
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ROCE</span>
                <span style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                  {selectedStock.roce.toFixed(2)}%
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Debt to Equity</span>
                <span style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                  {selectedStock.debtToEquity.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Promoter Holding</span>
                <span style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                  {selectedStock.promoterHolding.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Technical Ratings
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backgroundColor: 'var(--surface-2)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>RSI (14)</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: '600', color: selectedStock.rsi14 > 70 ? 'var(--negative)' : selectedStock.rsi14 < 30 ? 'var(--positive)' : 'var(--warning)' }}>
                  {selectedStock.rsi14}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>MACD Signal</span>
                <span style={{ fontWeight: '600', color: selectedStock.macdSignal === 'Bullish' ? 'var(--positive)' : selectedStock.macdSignal === 'Bearish' ? 'var(--negative)' : 'var(--text)' }}>
                  {selectedStock.macdSignal}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bollinger Bands</span>
                <span>{selectedStock.bollingerPosition}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
