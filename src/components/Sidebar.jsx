'use client';

import React from 'react';

export default function Sidebar({ totalCount, filteredCount, isCollapsed, onToggleCollapse }) {
  return (
    <aside
      className={`filter-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      aria-label="Filter sidebar"
    >
      <div className="sidebar-header">
        {!isCollapsed && <span className="sidebar-title">Filters</span>}
        <button
          className="close-btn"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          {isCollapsed ? '➡️' : '⬅️'}
        </button>
      </div>

      {!isCollapsed && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              RECORDS FOUND
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' }}>
              {filteredCount.toLocaleString()} / {totalCount.toLocaleString()}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PRESET SCREENERS</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <button style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '8px 12px',
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'not-allowed',
                fontSize: '12px'
              }}>Value Stocks</button>
              <button style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '8px 12px',
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'not-allowed',
                fontSize: '12px'
              }}>Growth Momentum</button>
              <button style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '8px 12px',
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'not-allowed',
                fontSize: '12px'
              }}>Large Cap Quality</button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FILTERS ENGINE</span>
            <p style={{ color: 'var(--text-faint)', fontSize: '12px', marginTop: '8px' }}>
              Filter fields (PE, Market Cap, Technicals, etc.) will be active in the next phase.
            </p>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: '20px' }}>
          <div title="Filter System" style={{ cursor: 'pointer', fontSize: '16px' }}>🔍</div>
          <div title="Presets" style={{ cursor: 'pointer', fontSize: '16px' }}>📊</div>
          <div title="Active Count" style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: 'var(--accent)', fontWeight: '600' }}>
            {filteredCount > 1000 ? `${(filteredCount/1000).toFixed(1)}k` : filteredCount}
          </div>
        </div>
      )}
    </aside>
  );
}
