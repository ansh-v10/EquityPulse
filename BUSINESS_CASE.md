# Screener Wars - Gamified Simulation & Case Studies

This document details the business simulation concept (**Section B**) and real-world case study comparisons (**Section C**) for the EquityPulse retail brokerage stock screener platform.

---

## Section B: Gamified Simulation Concept ("Screener Wars")

### 1. Market Context & EquityPulse Mandate
As the Lead Front-End Developer at **EquityPulse** (a Series-A funded retail brokerage startup), the primary challenge is to capture market share from traditional incumbents by launching a next-generation stock screener. 

To achieve this, the platform is designed with gamified simulation triggers that measure Candidate/Developer metrics across three core retail customer behaviors:
- **User Retention Rate**: Tracked via user engagement with customizable Watchlists (saving states in persistent local storage).
- **Screener Query Density**: Measured by how fast users construct complex AST-based queries (optimized via a sub-200ms filtering engine to eliminate UI input lag).
- **Chart Analysis Frequency**: Enabled by responsive, lightweight technical charts with real-time indicators to keep traders on the portal longer.

### 2. Gamified User Flow
- **The Dashboard Board**: A dynamic dashboard representing market status, connection rates, and live LTP indexes.
- **Level Progression**:
  - *Level 1*: Basic screener grid navigation and filters.
  - *Level 2*: Star watchlists and technical indicators setup.
  - *Level 3*: Real-time updates, flash triggers, and queue monitoring.
  - *Level 4*: Performance containment tuning & 60fps scrolling.

---

## Section C: Case Studies & Real-World Competitors

To build a best-in-class product, we analyzed four industry leaders:

### 1. Screener.in (Fundamental Screener)
- **Strengths**: Powerful query builder using SQL-like syntax; high-density balance sheet and profit & loss tables.
- **Weaknesses**: Static data structures; lack of real-time price updates (LTPs are delayed); static charting without overlay indicators.
- **EquityPulse Adaptation**: Implemented Screener.in's high-density grid design and multi-dimensional filter categories (30+ criteria), but upgraded it with active WebSocket simulated ticks.

### 2. Finviz (Technical Visualizer)
- **Strengths**: Interactive grids, visual heatmap displays, and quick charts hover overlays.
- **Weaknesses**: Heavy DOM layout shifts (high CLS); page redraw lag during active updates.
- **EquityPulse Adaptation**: Improved performance by implementing strict virtual scrolling with TanStack Virtual and CSS containment, maintaining `CLS = 0.00` during fast scrolling.

### 3. TradingView (Advanced Charting)
- **Strengths**: Extremely smooth Canvas-based charting engine; extensive technical indicators library.
- **Weaknesses**: Heavy bundle sizes (~2MB+ scripts); high resource footprint.
- **EquityPulse Adaptation**: Integrated TradingView's Lightweight Charts library but lazy-loaded the bundle dynamically via React Suspense, keeping the initial home page bundle size under 17KB.
