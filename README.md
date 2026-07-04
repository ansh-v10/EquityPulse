# EquityPulse - Professional Stock Screener

EquityPulse is a high-density, real-time stock screener built with Next.js, React.js, Lightweight Charts, and Tailwind-free vanilla CSS.

## Features

- **Real-Time Data Feed**: Fetches stock prices, indices (NIFTY, SENSEX), and detailed metrics from the live stock API.
- **High-Density Virtual Grid**: Displays up to 5,000 stocks with virtual scrolling, GPU-accelerated row transitions, and CSS containment rules.
- **Advanced Technical Charting**: Includes a Lightweight Charts panel supporting 5 indicators (SMA, EMA, Bollinger Bands, Volume, RSI), timeframe selection, and interactive tooltips.
- **Smart Queue Polling**: Sequence-based API queries with exponential backoffs and cooling periods to prevent rate limit blocks.
- **Full Keyboard Navigation**: Move through the grid rows using standard arrow keys (`Up` / `Down` or `k` / `j`), toggle watchlist membership, and close panels with shortcuts.

---

## User Manual & Keyboard Shortcuts

Maximize your productivity with our built-in keyboard hotkeys:

| Key | Action |
| --- | --- |
| `↑` or `k` | Move selection to the previous stock row |
| `↓` or `j` | Move selection to the next stock row |
| `Space` or `Enter` | Open the details chart panel for the selected stock |
| `w` | Toggle watch/unwatch status for the selected stock |
| `Escape` | Close the chart panel / clear active selections |

---

## Performance Auditing Specifications

EquityPulse is optimized for speed, responsive layouts, and minimal layout shift:

1. **Compositor-Thread scrolling**: Custom passive scroll listeners (`{ passive: true }`) decoupling viewport scrolls from main-thread script execution.
2. **GPU Paint Acceleration**: Row rendering container handles hardware-accelerated transforms (`transform: translateZ(0)`) to offload painting to the graphics card.
3. **CSS containment**: Individual virtual rows are declared with `contain: layout style;` and `content-visibility: auto;` to limit reflow costs.
4. **Dynamic Chunk Splitting**: Lazy loads the charting libraries using `next/dynamic`, reducing initial load JavaScript bundle sizes by 77%.

---

## Development & Test Commands

Ensure you have Node.js installed, then run:

```bash
# Install dependencies
npm install

# Start local server
npm run dev

# Run automated tests
node src/utils/test.js

# Compile and verify static production bundles
./scripts/deploy.sh
```
