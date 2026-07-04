# EquityPulse - System Architecture Documentation

This document describes the architectural component design, real-time data flows, and state management pipelines for the EquityPulse stock screener dashboard.

---

## 1. System Design Flows

Below is the diagram mapping component hierarchy and real-time state flushes:

```mermaid
graph TD
    subgraph Client Viewport
        Home[page.jsx - Screener Home]
        Header[Header.jsx - Index Bar & Status]
        Sidebar[Sidebar.jsx - Preset Filters]
        DataGrid[DataGrid.jsx - Virtual Scroll Grid]
        ChartPanel[ChartPanel.jsx - Lazy Loaded Panel]
        TechnicalChart[TechnicalChart.jsx - Lightweight Charts Canvas]
    end

    subgraph State & Data Engine
        API[IndianAPI Server]
        Queue[Staggered Polling Queue]
        Buffer[Updates Flush Buffer - 1.5s]
        FiltersMemo[Filter AST Selector - useMemo]
        GridRowMemo[Recycled Virtual Rows - React.memo]
    end

    Home --> Header
    Home --> Sidebar
    Home --> DataGrid
    Home --> ChartPanel
    ChartPanel --> TechnicalChart

    API -->|Index LTPs| Header
    Queue -->|Sequential 10s Requests| API
    API -->|Fetch Response| Buffer
    Buffer -->|Batch Flush| Home
    Home -->|Derived Filter Ast| FiltersMemo
    FiltersMemo -->|Filtered Lists| DataGrid
    DataGrid -->|Row Viewport Indices| GridRowMemo
```

---

## 2. Structural Layer Breakdowns

### A. UI Layout Components
- **Home (`page.jsx`)**: The container component orchestrating main layout positioning, active search filters, selection indicators, and websocket synchronization.
- **Header (`Header.jsx`)**: Holds global search inputs, connection status status dots, and live index tickers (NIFTY/SENSEX).
- **DataGrid (`DataGrid.jsx`)**: Renders virtual lists matching height offsets of the stock items. Uses memoized `GridRow` components to recycle DOM nodes.
- **ChartPanel (`ChartPanel.jsx`)**: Lazy loaded panel presenting details and OHLCV history of the active stock.

### B. Real-Time Price Merging Flow
1. **Background Poll**: Sequential query queue fetches live prices for on-screen viewport rows, selected detail records, and active watchlist rows every 10 seconds.
2. **Buffer Accumulator**: Saves price response data values inside reference variables.
3. **Flusher**: Staggered 1.5s interval ticker flushes buffer inputs to React state, prompting redraw cycles.
4. **Mock Fluctuation Ticker**: Minor random updates (±0.01%) are applied to keep the UI active between true API fetches.
