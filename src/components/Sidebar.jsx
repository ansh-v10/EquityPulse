'use client';

import React, { useState } from 'react';

export function DualRangeSlider({ title, min, max, step = 1, value, onChange }) {
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

export function Accordion({ title, children, isOpen, onToggle }) {
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
    fundamentals: true
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RECORDS FOUND</span>
            <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' }}>
              {filteredCount.toLocaleString()} / {totalCount.toLocaleString()}
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
            </Accordion>
          </div>
        </div>
      )}
    </aside>
  );
}
