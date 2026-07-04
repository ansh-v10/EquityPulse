# Contributing to EquityPulse

Welcome! Thank you for contributing to the EquityPulse professional stock screener application. 

Follow these developer guidelines to set up and verify your changes.

## Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Local Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to preview the interface in real-time.

3. **Configure API Keys**:
   - The application automatically decodes and uses a default fallback key for fetching stock/index data.
   - For custom keys, define the environment variable in a `.env.local` file:
     ```env
     NEXT_PUBLIC_INDIAN_API_KEY=your_key_here
     ```

## Code Standards & Testing

1. **Passive Scrolling & GPU Acceleration**:
   - Maintain scroll event listeners as passive (`{ passive: true }`) to ensure they execute directly on the browser's compositor thread.
   - Ensure virtual rows retain `contain: layout style;` and `transform: translateZ(0);` styles to offload paint calculations.

2. **Memoization**:
   - Ensure derived states and indicator arrays are wrapped in `useMemo` hooks to prevent redundant linear scans and CPU thrashing during ticker ticks.

3. **Execute Automated Tests**:
   - Run the unit and integration test suite before making any commit:
     ```bash
     node src/utils/test.js
     ```

## Deployment & Verification

Run the automated deploy script to execute tests, clear build caches, and compile the production bundle in one go:
```bash
./scripts/deploy.sh
```
Verify the static HTML files export successfully to the `out/` directory with zero build warnings.
