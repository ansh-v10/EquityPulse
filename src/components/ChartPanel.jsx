'use client';

import React from 'react';
import { formatIndianNumber } from '../utils/mockData';

export default function ChartPanel({ selectedStock, onClose }) {
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

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{ fontSize: '24px', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' }}>
            {formatIndianNumber(selectedStock.lastPrice, 'price')}
          </span>
          <span style={{ fontSize: '14px', fontWeight: '500' }} className={isPositive ? 'pos-val' : 'neg-val'}>
            {isPositive ? '▲' : '▼'} {Math.abs(selectedStock.changePercent).toFixed(2)}% ({formatIndianNumber(selectedStock.changeAbsolute)})
          </span>
        </div>

        <div style={{
          height: '240px',
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--text-muted)'
        }}>
          <span style={{ fontSize: '24px' }}>📈</span>
          <span style={{ fontSize: '12px' }}>Lightweight Chart & Indicators</span>
          <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>Planned for next phase</span>
        </div>

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
            <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>RSI (14)</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: '600', color: selectedStock.rsi14 > 70 ? 'var(--negative)' : selectedStock.rsi14 < 30 ? 'var(--positive)' : 'var(--warning)' }}>
                {selectedStock.rsi14}
              </span>
            </div>
            <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '12px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>MACD Signal</span>
              <span style={{ fontWeight: '600', color: selectedStock.macdSignal === 'Bullish' ? 'var(--positive)' : selectedStock.macdSignal === 'Bearish' ? 'var(--negative)' : 'var(--text)' }}>
                {selectedStock.macdSignal}
              </span>
            </div>
            <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '12px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Bollinger Bands</span>
              <span>{selectedStock.bollingerPosition}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
