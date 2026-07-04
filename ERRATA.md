# ERRATA.md

Below is the identification, explanation, and resolution of the three deliberate technical errors hidden in the training/assessment guidelines document.

---

## 1. Indicator Calculation Test Payload Mismatch (Vitest Spec)

### Location
- **Section A7.2**: `tests/indicators/sma.test.ts` unit spec example.

### Explanation
- The test block passes a flat array of raw numbers:
  ```typescript
  const prices = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
  const sma5 = calculateSMA(prices, 5);
  ```
- However, the core indicator formulas (e.g., `calculateSMA`) expect an array of candle objects with a `.close` property:
  ```typescript
  sum += data[i - j].close;
  ```
- Passing a flat array of numbers to the indicator function results in `data[i - j].close` yielding `undefined`, causing the calculation sum to resolve to `NaN`.

### Correction
The test mock payload must be constructed as objects with `.close` properties:
```typescript
const prices = [
  { time: 1, close: 10 },
  { time: 2, close: 12 },
  { time: 3, close: 14 },
  { time: 4, close: 16 },
  { time: 5, close: 18 },
  { time: 6, close: 20 },
  { time: 7, close: 22 },
  { time: 8, close: 24 },
  { time: 9, close: 26 },
  { time: 10, close: 28 }
];
const sma5 = calculateSMA(prices, 5);
expect(sma5[4].value).toBeCloseTo(14);
```

---

## 2. WebSocket Reconnection Memory Leak (Client Hook)

### Location
- **Section A4.2**: `hooks/useWebSocket.ts` client hook.

### Explanation
- In the `onclose` handler of the WebSocket client:
  ```typescript
  ws.onclose = () => {
    const delay = RECONNECT_DELAYS[Math.min(reconnectAttempt.current, RECONNECT_DELAYS.length - 1)];
    reconnectAttempt.current++;
    setTimeout(connect, delay);
  };
  ```
- When the component unmounts, the `useEffect` cleans up the active connection by invoking `wsRef.current?.close()`.
- This unmount close action triggers the `onclose` listener, which schedules a new connection task via `setTimeout`. Since the timeout ID is not tracked or cleared, it attempts to spin up a new socket connection on an unmounted context, causing memory leaks and socket pollution.

### Correction
Store the timeout ID in a reference and cancel it inside the hook's cleanup function:
```typescript
const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

ws.onclose = () => {
  const delay = RECONNECT_DELAYS[Math.min(reconnectAttempt.current, RECONNECT_DELAYS.length - 1)];
  reconnectAttempt.current++;
  reconnectTimeoutRef.current = setTimeout(connect, delay);
};

// Inside useEffect cleanup:
return () => {
  wsRef.current?.close();
  if (reconnectTimeoutRef.current) {
    clearTimeout(reconnectTimeoutRef.current);
  }
};
```

---

## 3. Zustand Watchlist Persistence Serialization Failure

### Location
- **Section A5.1**: `stores/stockStore.ts` store schema.

### Explanation
- The `watchlist` state is declared as a native JavaScript `Set<string>`:
  ```typescript
  watchlist: Set<string>;
  ```
- The store uses Zustand's `persist` middleware to save state parameters to `localStorage`.
- Since native JSON operations (`JSON.stringify`) cannot serialize `Set` structures, the watchlist is stored as an empty object `{}`. When hydrated, it recovers as a plain object instead of a `Set`, causing crashes when the code calls `.has()` or `.add()` on it.

### Correction
Serialize the `Set` to an array before persisting, and deserialize it back into a `Set` during hydration, or manage watchlist as an array:
```typescript
// Define custom serialization/deserialization methods in persist options:
{
  name: 'stock-store',
  storage: {
    getItem: (name) => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      const parsed = JSON.parse(str);
      if (parsed.state && parsed.state.watchlist) {
        parsed.state.watchlist = new Set(parsed.state.watchlist);
      }
      return parsed;
    },
    setItem: (name, newValue) => {
      const serialized = {
        ...newValue,
        state: {
          ...newValue.state,
          watchlist: Array.from(newValue.state.watchlist)
        }
      };
      localStorage.setItem(name, JSON.stringify(serialized));
    },
    removeItem: (name) => localStorage.removeItem(name)
  }
}
```
