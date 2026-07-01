'use client';

import React, { useState } from 'react';

const SECTORS = [
  'Banking & Financial Services',
  'Information Technology',
  'Pharmaceuticals & Healthcare',
  'Consumer Goods / FMCG',
  'Automobile & Auto Components',
  'Metals & Mining',
  'Energy (Oil, Gas, Power)',
  'Real Estate & Construction',
  'Telecom & Media',
  'Infrastructure & Capital Goods',
  'Chemicals & Fertilisers',
  'Others (Textiles, Paper, etc.)'
];

const MCAP_CATEGORIES = ['Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap'];
const INDICES = ['NIFTY 50', 'NIFTY Next 50', 'NIFTY Midcap 100', 'NIFTY Smallcap 250', 'BSE Sensex'];

function DualRangeSlider({ title, min, max, step = 1, value, onChange }) {
  const [minVal, maxVal] = value;

  const handleMinChange = (e) => {
    const v = Math.min(Number(e.target.value), maxVal);
    onChange([v, maxVal]);
  };

  const handleMaxChange = (e) => {
    const v = Math.max(Number(e.target.value), minVal);
    onChange([minVal, v]);
  };

  const handleMinInput = (e) => {
    let v = Number(e.target.value);
    if (isNaN(v)) return;
    v = Math.max(min, Math.min(v, maxVal));
    onChange([v, maxVal]);
  };

  const handleMaxInput = (e) => {
    let v = Number(e.target.value);
    if (isNaN(v)) return;
    v = Math.max(minVal, Math.min(v, max));
    onChange([minVal, v]);
  };

  const leftPct = ((minVal - min) / (max - min)) * 100;
  const rightPct = ((maxVal - min) / (max - min)) * 100;

  return (
    <div className="range-container">
      <div className="range-label-container">
        <span className="range-title">{title}</span>
        <div className="range-values-input">
          <input
            type="number"
            className="range-numeric-input"
            value={minVal}
            min={min}
            max={max}
            step={step}
            onChange={handleMinInput}
          />
          <span className="range-dash">-</span>
          <input
            type="number"
            className="range-numeric-input"
            value={maxVal}
            min={min}
            max={max}
            step={step}
            onChange={handleMaxInput}
          />
        </div>
      </div>
      <div className="dual-slider">
        <div className="slider-track" />
        <div
          className="slider-progress"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          className="slider-input"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          className="slider-input"
        />
      </div>
    </div>
  );
}

function Accordion({ title, children, isOpen, onToggle }) {
  return (
    <div className="accordion-item">
      <button className="accordion-header" onClick={onToggle}>
        <span>{title}</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && <div className="accordion-body">{children}</div>}
    </div>
  );
}

export default function Sidebar({
  totalCount,
  filteredCount,
  isCollapsed,
  onToggleCollapse,
  filters,
  onFilterChange,
  onApplyPreset,
  onClearAll
}) {
  const [openSections, setOpenSections] = useState({
    fundamentals: true,
    marketData: false,
    classification: false,
    technical: false,
    custom: false
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCheckboxChange = (filterKey, item, isChecked) => {
    const list = [...filters[filterKey]];
    if (isChecked) {
      if (!list.includes(item)) {
        list.push(item);
      }
    } else {
      const idx = list.indexOf(item);
      if (idx > -1) {
        list.splice(idx, 1);
      }
    }
    onFilterChange(filterKey, list);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, val]) => {
    if (key === 'watchlistOnly' || key === 'recentlyUpdated') return val === true;
    if (Array.isArray(val)) {
      if (key === 'sectors' || key === 'marketCapCategories' || key === 'indexMemberships') {
        return val.length > 0;
      }
      const defaults = {
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
        rsi14: [0, 100],
        atr: [0, 500]
      };
      const defVal = defaults[key];
      return defVal && (val[0] !== defVal[0] || val[1] !== defVal[1]);
    }
    return val !== 'All';
  });

  return (
    <aside className={`filter-sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Filter sidebar">
      <div className="sidebar-header">
        {!isCollapsed && <span className="sidebar-title">Filters</span>}
        <button
          className="close-btn"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          {isCollapsed ? '➡️' : '⬅️'}
        </button>
      </div>

      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RECORDS FOUND</span>
              {hasActiveFilters && (
                <button className="clear-all-btn" onClick={onClearAll}>
                  Clear All
                </button>
              )}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' }}>
              {filteredCount.toLocaleString()} / {totalCount.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PRESET SCREENERS</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginTop: '8px' }}>
              <button className="option-button" onClick={() => onApplyPreset('Value Stocks')}>Value</button>
              <button className="option-button" onClick={() => onApplyPreset('Growth Momentum')}>Growth</button>
              <button className="option-button" onClick={() => onApplyPreset('Large Cap Quality')}>Quality</button>
              <button className="option-button" onClick={() => onApplyPreset('Technical Breakout')}>Breakout</button>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <Accordion
              title="Fundamentals"
              isOpen={openSections.fundamentals}
              onToggle={() => toggleSection('fundamentals')}
            >
              <DualRangeSlider
                title="Market Cap (Cr)"
                min={0}
                max={500000}
                step={500}
                value={filters.marketCap}
                onChange={(val) => onFilterChange('marketCap', val)}
              />
              <DualRangeSlider
                title="P/E Ratio"
                min={-100}
                max={500}
                step={0.5}
                value={filters.pe}
                onChange={(val) => onFilterChange('pe', val)}
              />
              <DualRangeSlider
                title="P/B Ratio"
                min={0}
                max={100}
                step={0.1}
                value={filters.pb}
                onChange={(val) => onFilterChange('pb', val)}
              />
              <DualRangeSlider
                title="Dividend Yield (%)"
                min={0}
                max={25}
                step={0.1}
                value={filters.dividendYield}
                onChange={(val) => onFilterChange('dividendYield', val)}
              />
              <DualRangeSlider
                title="EPS (₹)"
                min={-500}
                max={5000}
                step={1}
                value={filters.eps}
                onChange={(val) => onFilterChange('eps', val)}
              />
              <DualRangeSlider
                title="ROE (%)"
                min={-100}
                max={200}
                step={0.5}
                value={filters.roe}
                onChange={(val) => onFilterChange('roe', val)}
              />
              <DualRangeSlider
                title="ROCE (%)"
                min={-100}
                max={200}
                step={0.5}
                value={filters.roce}
                onChange={(val) => onFilterChange('roce', val)}
              />
              <DualRangeSlider
                title="Debt-to-Equity"
                min={0}
                max={10}
                step={0.05}
                value={filters.debtToEquity}
                onChange={(val) => onFilterChange('debtToEquity', val)}
              />
              <DualRangeSlider
                title="Current Ratio"
                min={0}
                max={20}
                step={0.1}
                value={filters.currentRatio}
                onChange={(val) => onFilterChange('currentRatio', val)}
              />
              <DualRangeSlider
                title="Promoter Holding (%)"
                min={0}
                max={100}
                step={1}
                value={filters.promoterHolding}
                onChange={(val) => onFilterChange('promoterHolding', val)}
              />
              <DualRangeSlider
                title="Revenue Growth YoY (%)"
                min={-100}
                max={500}
                step={1}
                value={filters.revenueGrowthYoY}
                onChange={(val) => onFilterChange('revenueGrowthYoY', val)}
              />
              <DualRangeSlider
                title="Profit Growth YoY (%)"
                min={-100}
                max={1000}
                step={1}
                value={filters.profitGrowthYoY}
                onChange={(val) => onFilterChange('profitGrowthYoY', val)}
              />
            </Accordion>

            <Accordion
              title="Market Data"
              isOpen={openSections.marketData}
              onToggle={() => toggleSection('marketData')}
            >
              <DualRangeSlider
                title="LTP (₹)"
                min={0}
                max={500000}
                step={10}
                value={filters.lastPrice}
                onChange={(val) => onFilterChange('lastPrice', val)}
              />
              <DualRangeSlider
                title="52-Week High Proximity (%)"
                min={0}
                max={100}
                step={1}
                value={filters.week52HighProximity}
                onChange={(val) => onFilterChange('week52HighProximity', val)}
              />
              <DualRangeSlider
                title="52-Week Low Proximity (%)"
                min={0}
                max={100}
                step={1}
                value={filters.week52LowProximity}
                onChange={(val) => onFilterChange('week52LowProximity', val)}
              />
              <DualRangeSlider
                title="Average Volume (20D)"
                min={0}
                max={100000000}
                step={1000}
                value={filters.avgVolume20D}
                onChange={(val) => onFilterChange('avgVolume20D', val)}
              />
              <DualRangeSlider
                title="Beta"
                min={-2}
                max={5}
                step={0.05}
                value={filters.beta}
                onChange={(val) => onFilterChange('beta', val)}
              />
              <DualRangeSlider
                title="Day Change (%)"
                min={-20}
                max={20}
                step={0.1}
                value={filters.dayChange}
                onChange={(val) => onFilterChange('dayChange', val)}
              />
            </Accordion>

            <Accordion
              title="Classification"
              isOpen={openSections.classification}
              onToggle={() => toggleSection('classification')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>SECTOR</span>
                  <div className="checkbox-list">
                    {SECTORS.map((sector) => (
                      <label key={sector} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={filters.sectors.includes(sector)}
                          onChange={(e) => handleCheckboxChange('sectors', sector, e.target.checked)}
                        />
                        {sector}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>MARKET CAP CATEGORY</span>
                  <div className="checkbox-list">
                    {MCAP_CATEGORIES.map((cat) => (
                      <label key={cat} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={filters.marketCapCategories.includes(cat)}
                          onChange={(e) => handleCheckboxChange('marketCapCategories', cat, e.target.checked)}
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>INDEX MEMBERSHIP</span>
                  <div className="checkbox-list">
                    {INDICES.map((idx) => (
                      <label key={idx} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={filters.indexMemberships.includes(idx)}
                          onChange={(e) => handleCheckboxChange('indexMemberships', idx, e.target.checked)}
                        />
                        {idx}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Accordion>

            <Accordion
              title="Technical"
              isOpen={openSections.technical}
              onToggle={() => toggleSection('technical')}
            >
              <DualRangeSlider
                title="RSI (14)"
                min={0}
                max={100}
                step={1}
                value={filters.rsi14}
                onChange={(val) => onFilterChange('rsi14', val)}
              />

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>MACD SIGNAL</span>
                <div className="option-list">
                  {['All', 'Bullish', 'Bearish', 'Neutral'].map((opt) => (
                    <button
                      key={opt}
                      className={`option-button ${filters.macdSignal === opt ? 'active' : ''}`}
                      onClick={() => onFilterChange('macdSignal', opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>PRICE VS SMA 50</span>
                <div className="option-list">
                  {['All', 'Above', 'Below'].map((opt) => (
                    <button
                      key={opt}
                      className={`option-button ${filters.priceVsSma50 === opt ? 'active' : ''}`}
                      onClick={() => onFilterChange('priceVsSma50', opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>PRICE VS SMA 200</span>
                <div className="option-list">
                  {['All', 'Above', 'Below'].map((opt) => (
                    <button
                      key={opt}
                      className={`option-button ${filters.priceVsSma200 === opt ? 'active' : ''}`}
                      onClick={() => onFilterChange('priceVsSma200', opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>BOLLINGER POSITION</span>
                <div className="option-list">
                  {['All', 'Above', 'Within', 'Below'].map((opt) => (
                    <button
                      key={opt}
                      className={`option-button ${filters.bollingerPosition === opt ? 'active' : ''}`}
                      onClick={() => onFilterChange('bollingerPosition', opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <DualRangeSlider
                title="ATR"
                min={0}
                max={500}
                step={0.5}
                value={filters.atr}
                onChange={(val) => onFilterChange('atr', val)}
              />

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>VOLUME VS 20D AVG</span>
                <div className="option-list">
                  {['All', 'Below', 'Above', '2x', '3x'].map((opt) => (
                    <button
                      key={opt}
                      className={`option-button ${filters.volumeVsAvg === opt ? 'active' : ''}`}
                      onClick={() => onFilterChange('volumeVsAvg', opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </Accordion>

            <Accordion
              title="Custom"
              isOpen={openSections.custom}
              onToggle={() => toggleSection('custom')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="toggle-item">
                  <span style={{ color: 'var(--text)' }}>Watchlist Only</span>
                  <span className="switch">
                    <input
                      type="checkbox"
                      checked={filters.watchlistOnly}
                      onChange={(e) => onFilterChange('watchlistOnly', e.target.checked)}
                    />
                    <span className="slider-switch" />
                  </span>
                </label>

                <label className="toggle-item">
                  <span style={{ color: 'var(--text)' }}>Recently Updated (30s)</span>
                  <span className="switch">
                    <input
                      type="checkbox"
                      checked={filters.recentlyUpdated}
                      onChange={(e) => onFilterChange('recentlyUpdated', e.target.checked)}
                    />
                    <span className="slider-switch" />
                  </span>
                </label>
              </div>
            </Accordion>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: '20px' }}>
          <div title="Filter System" style={{ cursor: 'pointer', fontSize: '16px' }} onClick={onToggleCollapse}>🔍</div>
          <div title="Presets" style={{ cursor: 'pointer', fontSize: '16px' }} onClick={onToggleCollapse}>📊</div>
          <div title="Active Count" style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: 'var(--accent)', fontWeight: '600' }}>
            {filteredCount > 1000 ? `${(filteredCount / 1000).toFixed(1)}k` : filteredCount}
          </div>
        </div>
      )}
    </aside>
  );
}
