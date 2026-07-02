'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

export default function TechnicalChart({
  ohlcvData,
  timeframe = '1D',
  activeIndicators = {},
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const tooltipRef = useRef(null);
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

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#0d1117' },
        textColor: '#8b949e',
      },
      grid: {
        vertLines: { color: '#21262d' },
        horzLines: { color: '#21262d' },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#30363d',
      },
      rightPriceScale: {
        borderColor: '#30363d',
      },
      width: containerRef.current.clientWidth,
      height: 380,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#3fb950',
      downColor: '#f85149',
      borderUpColor: '#2ea043',
      borderDownColor: '#da3633',
      wickUpColor: '#3fb950',
      wickDownColor: '#f85149',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth
        });
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
        const coordinate = param.point;
        setTooltipState({
          visible: true,
          x: coordinate.x + 15,
          y: coordinate.y + 15,
          date: param.time.toString(),
          open: data.open || data.value,
          high: data.high || data.value,
          low: data.low || data.value,
          close: data.close || data.value,
          volume: data.volume || 0
        });
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (candleSeriesRef.current && ohlcvData) {
      candleSeriesRef.current.setData(ohlcvData);
    }
  }, [ohlcvData]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '380px' }} />
      {tooltipState.visible && (
        <div
          ref={tooltipRef}
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
