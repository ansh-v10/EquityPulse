'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, CandlestickSeries, LineSeries, AreaSeries } from 'lightweight-charts';

function calculateSMA(data, period) {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push({ time: data[i].time, value: null });
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    sma.push({ time: data[i].time, value: sum / period });
  }
  return sma;
}

function calculateEMA(data, period) {
  const ema = [];
  const k = 2 / (period + 1);
  let prevEma = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push({ time: data[i].time, value: null });
      continue;
    }
    if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      prevEma = sum / period;
      ema.push({ time: data[i].time, value: prevEma });
      continue;
    }
    prevEma = data[i].close * k + prevEma * (1 - k);
    ema.push({ time: data[i].time, value: prevEma });
  }
  return ema;
}

function calculateBollinger(data, period = 20, multiplier = 2) {
  const upper = [];
  const middle = [];
  const lower = [];
  const area = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push({ time: data[i].time, value: null });
      middle.push({ time: data[i].time, value: null });
      lower.push({ time: data[i].time, value: null });
      area.push({ time: data[i].time, value: null });
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const avg = sum / period;
    let varianceSum = 0;
    for (let j = 0; j < period; j++) {
      varianceSum += Math.pow(data[i - j].close - avg, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);
    const upVal = avg + multiplier * stdDev;
    const lowVal = avg - multiplier * stdDev;

    upper.push({ time: data[i].time, value: upVal });
    middle.push({ time: data[i].time, value: avg });
    lower.push({ time: data[i].time, value: lowVal });
    area.push({ time: data[i].time, top: upVal, bottom: lowVal });
  }
  return { upper, middle, lower, area };
}

function calculateRSI(data, period = 14) {
  const rsi = [];
  if (data.length === 0) return rsi;
  const gains = [];
  const losses = [];
  for (let i = 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push({ time: data[i].time, value: null });
      continue;
    }
    if (i > period) {
      const gain = gains[i - 1];
      const loss = losses[i - 1];
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    if (avgLoss === 0) {
      rsi.push({ time: data[i].time, value: 100 });
    } else {
      const rs = avgGain / avgLoss;
      rsi.push({ time: data[i].time, value: 100 - 100 / (1 + rs) });
    }
  }
  return rsi;
}

export default function TechnicalChart({
  ohlcvData,
  timeframe = '1D',
  activeIndicators = {},
}) {
  const containerRef = useRef(null);
  const rsiContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const rsiChartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const indicatorSeriesRef = useRef({});
  const rsiSeriesRef = useRef(null);

  const sma20 = useMemo(() => {
    if (!ohlcvData || ohlcvData.length === 0) return [];
    return calculateSMA(ohlcvData, 20);
  }, [ohlcvData]);

  const sma50 = useMemo(() => {
    if (!ohlcvData || ohlcvData.length === 0) return [];
    return calculateSMA(ohlcvData, 50);
  }, [ohlcvData]);

  const sma200 = useMemo(() => {
    if (!ohlcvData || ohlcvData.length === 0) return [];
    return calculateSMA(ohlcvData, 200);
  }, [ohlcvData]);

  const ema12 = useMemo(() => {
    if (!ohlcvData || ohlcvData.length === 0) return [];
    return calculateEMA(ohlcvData, 12);
  }, [ohlcvData]);

  const ema26 = useMemo(() => {
    if (!ohlcvData || ohlcvData.length === 0) return [];
    return calculateEMA(ohlcvData, 26);
  }, [ohlcvData]);

  const bbData = useMemo(() => {
    if (!ohlcvData || ohlcvData.length === 0) return { upper: [], middle: [], lower: [], area: [] };
    return calculateBollinger(ohlcvData, 20, 2);
  }, [ohlcvData]);

  const rsiData = useMemo(() => {
    if (!ohlcvData || ohlcvData.length === 0) return [];
    return calculateRSI(ohlcvData, 14);
  }, [ohlcvData]);

  const [tooltipState, setTooltipState] = useState({
    visible: false,
    x: 0,
    y: 0,
    date: '',
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    volume: 0
  });

  const drawVolumeProfile = () => {
    const canvas = canvasRef.current;
    const chart = chartRef.current;
    if (!canvas || !chart || !ohlcvData || ohlcvData.length === 0 || !activeIndicators.VOL) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const range = chart.timeScale().getVisibleRange();
    if (!range) return;

    const visibleCandles = ohlcvData.filter(d => d.time >= range.from && d.time <= range.to);
    if (visibleCandles.length === 0) return;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    visibleCandles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    const bucketsCount = 30;
    const bucketSize = (maxPrice - minPrice) / bucketsCount;
    const buckets = Array(bucketsCount).fill(0);

    visibleCandles.forEach(c => {
      const lowIdx = Math.max(0, Math.min(bucketsCount - 1, Math.floor((c.low - minPrice) / bucketSize)));
      const highIdx = Math.max(0, Math.min(bucketsCount - 1, Math.floor((c.high - minPrice) / bucketSize)));
      const span = (highIdx - lowIdx) + 1;
      const volPerBucket = c.volume / span;
      for (let i = lowIdx; i <= highIdx; i++) {
        buckets[i] += volPerBucket;
      }
    });

    const maxVol = Math.max(...buckets);
    if (maxVol === 0) return;

    const canvasWidth = containerRef.current.clientWidth;
    const profileWidth = canvasWidth * 0.25;

    ctx.fillStyle = 'rgba(47, 129, 247, 0.15)';
    ctx.strokeStyle = 'rgba(47, 129, 247, 0.3)';
    ctx.lineWidth = 1;

    for (let i = 0; i < bucketsCount; i++) {
      const pStart = minPrice + i * bucketSize;
      const pEnd = pStart + bucketSize;

      const yStart = chart.priceScale('right').priceToCoordinate(pStart);
      const yEnd = chart.priceScale('right').priceToCoordinate(pEnd);

      if (yStart === null || yEnd === null) continue;

      const barHeight = Math.abs(yStart - yEnd);
      const barWidth = (buckets[i] / maxVol) * profileWidth;
      const x = canvasWidth - barWidth - 60;
      const y = Math.min(yStart, yEnd);

      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.strokeRect(x, y, barWidth, barHeight);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#0d1117' }, textColor: '#8b949e' },
      grid: { vertLines: { color: '#21262d' }, horzLines: { color: '#21262d' } },
      crosshair: { mode: 0 },
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#30363d' },
      rightPriceScale: { borderColor: '#30363d' },
      width: containerRef.current.clientWidth,
      height: 380,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#3fb950', downColor: '#f85149',
      borderUpColor: '#2ea043', borderDownColor: '#da3633',
      wickUpColor: '#3fb950', wickDownColor: '#f85149',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const indicators = {};
    indicators.SMA20 = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1.5 });
    indicators.SMA50 = chart.addSeries(LineSeries, { color: '#f97316', lineWidth: 1.5 });
    indicators.SMA200 = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1.5 });
    indicators.EMA12 = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 1.5 });
    indicators.EMA26 = chart.addSeries(LineSeries, { color: '#ec4899', lineWidth: 1.5 });

    indicators.bbUpper = chart.addSeries(LineSeries, { color: '#2f81f7', lineWidth: 1, lineStyle: 1 });
    indicators.bbMiddle = chart.addSeries(LineSeries, { color: '#2f81f7', lineWidth: 1.5 });
    indicators.bbLower = chart.addSeries(LineSeries, { color: '#2f81f7', lineWidth: 1, lineStyle: 1 });
    indicators.bbArea = chart.addSeries(AreaSeries, {
      topColor: 'rgba(47, 129, 247, 0.1)',
      bottomColor: 'rgba(47, 129, 247, 0.1)',
      lineColor: 'transparent',
      lineWidth: 0,
    });

    indicatorSeriesRef.current = indicators;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
      if (rsiContainerRef.current && rsiChartRef.current) {
        rsiChartRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
      }
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        drawVolumeProfile();
      }
    };
    window.addEventListener('resize', handleResize);

    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > containerRef.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > 380
      ) {
        setTooltipState((prev) => ({ ...prev, visible: false }));
        return;
      }

      const data = param.seriesData.get(candleSeries);
      if (data) {
        setTooltipState({
          visible: true,
          x: param.point.x + 15,
          y: param.point.y + 15,
          date: param.time.toString(),
          open: data.open || data.value,
          high: data.high || data.value,
          low: data.low || data.value,
          close: data.close || data.value,
          volume: data.volume || 0
        });
      }
    });

    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      drawVolumeProfile();
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = 380;
    }
  }, [ohlcvData]);

  useEffect(() => {
    drawVolumeProfile();
  }, [activeIndicators.VOL, ohlcvData]);

  useEffect(() => {
    if (!rsiContainerRef.current || !activeIndicators.RSI) {
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
        rsiSeriesRef.current = null;
      }
      return;
    }

    if (!rsiChartRef.current) {
      const rsiChart = createChart(rsiContainerRef.current, {
        layout: { background: { color: '#0d1117' }, textColor: '#8b949e' },
        grid: { vertLines: { color: '#21262d' }, horzLines: { color: '#21262d' } },
        timeScale: { borderColor: '#30363d' },
        rightPriceScale: { borderColor: '#30363d', minValuation: 0, maxValuation: 100 },
        width: rsiContainerRef.current.clientWidth,
        height: 100,
      });

      const overboughtLine = rsiChart.addSeries(LineSeries, { color: '#f85149', lineWidth: 1, lineStyle: 1 });
      const oversoldLine = rsiChart.addSeries(LineSeries, { color: '#3fb950', lineWidth: 1, lineStyle: 1 });
      const rsiSeries = rsiChart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1.5 });

      if (ohlcvData && ohlcvData.length > 0) {
        const lineTimes = ohlcvData.map(d => ({ time: d.time, value: 70 }));
        const oversoldTimes = ohlcvData.map(d => ({ time: d.time, value: 30 }));
        overboughtLine.setData(lineTimes);
        oversoldLine.setData(oversoldTimes);
      }

      rsiChartRef.current = rsiChart;
      rsiSeriesRef.current = rsiSeries;
    }
  }, [activeIndicators.RSI, ohlcvData]);

  useEffect(() => {
    if (!candleSeriesRef.current || !ohlcvData || ohlcvData.length === 0) return;

    candleSeriesRef.current.setData(ohlcvData);

    const indSeries = indicatorSeriesRef.current;

    if (activeIndicators.SMA20) {
      indSeries.SMA20.setData(sma20);
    } else {
      indSeries.SMA20.setData([]);
    }

    if (activeIndicators.SMA50) {
      indSeries.SMA50.setData(sma50);
    } else {
      indSeries.SMA50.setData([]);
    }

    if (activeIndicators.SMA200) {
      indSeries.SMA200.setData(sma200);
    } else {
      indSeries.SMA200.setData([]);
    }

    if (activeIndicators.EMA12) {
      indSeries.EMA12.setData(ema12);
    } else {
      indSeries.EMA12.setData([]);
    }

    if (activeIndicators.EMA26) {
      indSeries.EMA26.setData(ema26);
    } else {
      indSeries.EMA26.setData([]);
    }

    if (activeIndicators.BB) {
      indSeries.bbUpper.setData(bbData.upper);
      indSeries.bbMiddle.setData(bbData.middle);
      indSeries.bbLower.setData(bbData.lower);
      indSeries.bbArea.setData(bbData.upper.map((item, idx) => ({
        time: item.time,
        value: item.value,
        target: bbData.lower[idx].value
      })));
    } else {
      indSeries.bbUpper.setData([]);
      indSeries.bbMiddle.setData([]);
      indSeries.bbLower.setData([]);
      indSeries.bbArea.setData([]);
    }

    if (activeIndicators.RSI && rsiSeriesRef.current) {
      rsiSeriesRef.current.setData(rsiData);
    }
  }, [ohlcvData, activeIndicators, sma20, sma50, sma200, ema12, ema26, bbData, rsiData]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '380px', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '380px',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      </div>
      {activeIndicators.RSI && (
        <div ref={rsiContainerRef} style={{ width: '100%', height: '100px', borderTop: '1px solid var(--border)' }} />
      )}
      {tooltipState.visible && (
        <div
          className="chart-tooltip"
          style={{
            left: `${tooltipState.x}px`,
            top: `${tooltipState.y}px`
          }}
        >
          <div className="chart-tooltip-date">{tooltipState.date}</div>
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-label">O</span>
            <span className="chart-tooltip-val">₹{tooltipState.open.toFixed(2)}</span>
          </div>
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-label">H</span>
            <span className="chart-tooltip-val">₹{tooltipState.high.toFixed(2)}</span>
          </div>
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-label">L</span>
            <span className="chart-tooltip-val">₹{tooltipState.low.toFixed(2)}</span>
          </div>
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-label">C</span>
            <span className="chart-tooltip-val">₹{tooltipState.close.toFixed(2)}</span>
          </div>
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-label">V</span>
            <span className="chart-tooltip-val">{tooltipState.volume.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
