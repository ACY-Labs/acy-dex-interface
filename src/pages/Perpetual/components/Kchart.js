import React, { useState, useEffect, useRef } from 'react';
//------FOR Pricehart-----TODO Austin
import { createChart, CrosshairMode } from 'lightweight-charts';
import { getTokens } from '../../../acy-dex-futures/data/Tokens.js';
import {
  USD_DECIMALS,
  SWAP,
  INCREASE,
  CHART_PERIODS,
  getTokenInfo,
  formatAmount,
  formatDateTime,
  usePrevious,
  getLiquidationPrice,
  useLocalStorageSerializeKey,
  useChainId,
} from '../../../acy-dex-futures/utils/Helpers';

// import { useChartPrices } from '../../../acy-dex-futures/Api'
// import Tab from '../../../acy-dex-futures/Tab/Tab';

import './styles.css';
import testData from './kchart-sample-data';

const candlestickOptions = {
  baseLineWidth: 2,
  baseLineColor: '#5472cc',
  priceLineColor: '#3a3e5e',
  upColor: '#0ecc83',
  downColor: '#fa3c58',
  wickUpColor: '#0ecc83',
  wickDownColor: '#fa3c58',
  borderVisible: false,
};

const getChartToken = (swapOption, fromToken, toToken, chainId) => {
  if (!fromToken || !toToken) {
    return;
  }

  if (swapOption !== SWAP) {
    return toToken;
  }

  if (fromToken.isUsdg && toToken.isUsdg) {
    return getTokens(chainId).find(t => t.isStable);
  }
  if (fromToken.isUsdg) {
    return toToken;
  }
  if (toToken.isUsdg) {
    return fromToken;
  }

  if (fromToken.isStable && toToken.isStable) {
    return toToken;
  }
  if (fromToken.isStable) {
    return toToken;
  }
  if (toToken.isStable) {
    return fromToken;
  }

  return toToken;
};

const getSeriesOptions = () => ({
  // https://github.com/tradingview/lightweight-charts/blob/master/docs/area-series.md
  lineColor: '#5472cc',
  topColor: 'rgba(49, 69, 131, 0.4)',
  bottomColor: 'rgba(42, 64, 103, 0.0)',
  lineWidth: 2,
  priceLineColor: '#3a3e5e',
  downColor: '#fa3c58',
  wickDownColor: '#fa3c58',
  upColor: '#0ecc83',
  wickUpColor: '#0ecc83',
  borderVisible: false,
});

const getChartOptions = (width, height) => ({
  width,
  height,
  layout: {
    backgroundColor: '#000000',
    textColor: 'rgba(255, 255, 255, 0.9)',
  },
  grid: {
    vertLines: {
      color: 'rgba(197, 203, 206, 0.5)',
    },
    horzLines: {
      color: 'rgba(197, 203, 206, 0.5)',
    },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
  rightPriceScale: {
    borderColor: 'rgba(197, 203, 206, 0.8)',
  },
  timeScale: {
    borderColor: 'rgba(197, 203, 206, 0.8)',
  },
});

const Kchart = () => {
  const chartRef = useRef(null);

  const [chartData] = useState(testData);
  const [{ chart, chartSeries }, setChart] = useState({
    chart: null,
    chartSeries: null,
  });

  useEffect(
    () => {
      if (chartRef.current === null) {
        return;
      }

      const newChart = createChart(chartRef.current, getChartOptions(600, 400));

      setChart({
        chart: newChart,
        chartSeries: newChart.addCandlestickSeries(candlestickOptions),
      });
    },
    [chartRef]
  );

  useEffect(
    () => {
      if (chartSeries === null) {
        return;
      }
      chartSeries.setData(chartData);
    },
    [chartData, chartSeries]
  );

  useEffect(
    () => {
      if (chart !== null) {
        return () => {
          chart.remove();
        };
      }
    },
    [chart]
  );

  return (
    <div className="PriceChart">
      <div className="TopInner">
        <div>ACY/USDT</div>
        <div>XXX</div>
        <div>XXX</div>
        <div>XXX</div>
        <div>XXX</div>
      </div>
      <div className="BotInner">
        <div className="KChartHeader">
          <div className="KChartControl">
            {/* <div className='TabBlock'> </div> */}
            {/* <Tab options={Object.keys(CHART_PERIODS)} option={period} setOption={setPeriod} /> */}
          </div>
          <div className="KChartStat" />
        </div>
        <div className="KChartBox" ref={chartRef} />
      </div>
    </div>
  );
};
export default Kchart;
