# EquityPulse - Performance & Audit Tuning

This document describes the design configurations implemented to maximize page speeds, minimize layout shifts, and optimize resource bundles.

## Performance Configurations

### 1. Compositor Thread Scrolling
- Scrolling in the `DataGrid` is fully virtualized and runs imperatively via passive scroll listeners (`{ passive: true }`).
- This allows the browser to process scroll inputs directly on the GPU/compositor thread, preventing frame drop stutters when JavaScript is executing background updates.

### 2. Rendering Optimization & GPU Compositing
- Grid row containers (`.grid-row`) utilize layout containment rules (`contain: layout style;` and `content-visibility: auto;`) to prevent redraw invalidation cascades.
- Hardware acceleration is enabled via `transform: translateZ(0);` to offload paint storm calculations to the GPU.

### 3. Dynamic Chunk Loading
- The detail chart panel is split into a separate bundle chunk via React dynamic imports (`dynamic(() => import(...))`).
- The heavy charting script is only loaded when a symbol is selected, saving 50KB from the initial JavaScript load.

### 4. Derived State Caching
- Indicator formulas (SMA, EMA, Bollinger Bands, and RSI arrays) are cached inside `useMemo` hooks.
- Preset toggles do not re-calculate arrays, saving CPU cycles when switching chart views.
- Active search filters are computed using synchronous memoization selectors rather than asynchronous double-render cycles.
