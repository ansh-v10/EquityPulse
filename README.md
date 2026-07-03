# EquityPulse - Professional Stock Screener

EquityPulse is a high-density, real-time stock screener built with Next.js, React.js, Lightweight Charts, and Tailwind-free vanilla CSS.

## Architecture Specs

### 1. Staggered API Polling Queue
- To respect rate limits and keep network overhead small, the dashboard utilizes a prioritized polling queue that issues queries sequentially every 400ms.
- **Priority Order**:
  1. The selected stock (on-screen detail view).
  2. Stocks added to the active Watchlist.
  3. Currently visible stocks inside the viewport (tracked dynamically via virtual scroll indices).
  4. Large-cap stock baseline baseline metrics.

### 2. Exponential Backoff Reconnection Engine
- Monitors API response headers and status codes.
- On encountering a rate limit (`429`) or network fetch exception, it automatically transitions the connection indicator to `reconnecting` and enters a backoff retry schedule, multiplying the interval time progressively (up to a 30-second cap).
- Recovers instantly to standard polling rates once the endpoint returns valid headers.

### 3. Batch Update Accumulator
- Accumulates live pricing updates inside a reference buffer.
- Flushes updates to the React state every 1.5 seconds in a single batch, eliminating frame drops during scroll actions and preventing excessive layout recalculations.

### 4. Real-time Price Simulation & Flash Feedback
- Simulates minor ticks (±0.01% fluctuation) on non-polled stock elements to keep the grid dynamic, utilizing the batch flushing buffer.
- Applies `.flash-up` (green) and `.flash-down` (red) keyframe flash overlays on virtual row indices, indicating real-time LTP movement driven directly by API baselines.
