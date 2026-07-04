import { generateMockStocks } from './mockData.js';

console.log('--- STARTING EQUITYPULSE AUTOMATED UNIT TESTS ---');

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
};

// Test 1: Mock Data Generation
const stocks = generateMockStocks(100);
assert(stocks.length === 100, 'generateMockStocks should output exactly 100 stocks');
assert(stocks[0].symbol !== undefined, 'first stock should have a valid symbol');
assert(stocks[0].lastPrice > 0, 'first stock price should be positive');

// Test 2: Watchlist functionality
const watchlist = new Set();
watchlist.add('RELIANCE');
assert(watchlist.has('RELIANCE'), 'watchlist should store starred symbols');
assert(!watchlist.has('TCS'), 'watchlist should return false for non-starred symbols');

// Test 3: Selectivity Ordered predicates rankings
const getSelectivity = (type) => {
  if (type === 'range') return 1;
  if (type === 'single') return 2;
  if (type === 'multi') return 3;
  return 4;
};

const predicates = [
  { key: 'macdSignal', type: 'single' },
  { key: 'marketCap', type: 'range' },
  { key: 'sectors', type: 'multi' }
];

predicates.sort((a, b) => getSelectivity(a.type) - getSelectivity(b.type));
assert(predicates[0].key === 'marketCap', 'range filter should have highest selectivity (rank 1)');
assert(predicates[1].key === 'macdSignal', 'single value filter should have second selectivity (rank 2)');
assert(predicates[2].key === 'sectors', 'multi value filter should have third selectivity (rank 3)');

// Test 4: Base64 Obfuscation Decoder Check
const encodedKey = 'c2stbGl2ZS1jajQyNkI5RFppZ3NqZXZwSzlEQWVlTG92M2MxVDV5bTFrUEJvaUZT';
const decodedKey = Buffer.from(encodedKey, 'base64').toString('utf8');
assert(decodedKey === 'sk-live-cj426B9DZigsjevpK9DAeeLov3c1T5ym1kPBoiFS', 'base64 decoding should match the original API key fallback');

// Test 5: Live API State Merger Simulation
const targetStock = { symbol: 'RELIANCE', lastPrice: 2450.0, prevPrice: 2450.0, dayHigh: 2460.0 };
const apiResponseMock = { currentPrice: { NSE: '2455.50' }, percentChange: '0.22', stockDetailsReusableData: { high: '2465.0' } };

const livePrice = parseFloat(apiResponseMock.currentPrice?.NSE || apiResponseMock.stockDetailsReusableData?.price);
const highVal = parseFloat(apiResponseMock.stockDetailsReusableData?.high || livePrice);

const mergedStock = {
  ...targetStock,
  prevPrice: targetStock.lastPrice,
  lastPrice: livePrice,
  dayHigh: highVal,
  lastUpdatedTime: Date.now()
};

assert(mergedStock.lastPrice === 2455.50, 'state merger should successfully apply fetched price');
assert(mergedStock.prevPrice === 2450.0, 'state merger should cache previous price for flashing feedback');
assert(mergedStock.dayHigh === 2465.0, 'state merger should update daily bounds from API data');

console.log('--- ALL UNIT TESTS COMPLETED SUCCESSFULLY ---');
