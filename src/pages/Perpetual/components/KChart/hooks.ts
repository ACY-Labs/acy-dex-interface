import { useState, useEffect, useRef } from 'react';
import {
  CandlestickStyleOptions,
  ChartOptions,
  createChart,
  CrosshairMode,
  DeepPartial,
  IChartApi,
  ISeriesApi,
  SeriesOptionsCommon,
} from 'lightweight-charts';

import { TokenInfo } from '@/constants/token_list';
import { useChartPrices } from '@/acy-dex-futures/Api';
import { useConstantLoader } from '@/constants';

const candlestickOptions: DeepPartial<CandlestickStyleOptions & SeriesOptionsCommon> = {
  baseLineWidth: 2,
  baseLineColor: '#5472cc',
  priceLineColor: '#3a3e5e',
  upColor: '#0ecc83',
  downColor: '#fa3c58',
  wickUpColor: '#0ecc83',
  wickDownColor: '#fa3c58',
  borderVisible: false,
};

const getChartOptions = (width: number, height: number): DeepPartial<ChartOptions> => ({
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

const useChartInit = () => {
  const chartRef = useRef(null);

  const [{ chart, chartSeries }, setChartData] = useState<{
    chart: IChartApi | null;
    chartSeries: ISeriesApi<'Candlestick'> | null;
  }>({
    chart: null,
    chartSeries: null,
  });

  useEffect(
    () => {
      if (chartRef.current === null) {
        return;
      }

      const newChart = createChart(chartRef.current, getChartOptions(600, 400));

      setChartData({
        chart: newChart,
        chartSeries: newChart.addCandlestickSeries(candlestickOptions),
      });
    },
    [chartRef]
  );

  useEffect(
    () => {
      if (chart !== null) {
        return () => {
          chart.remove();
          setChartData({
            chart: null,
            chartSeries: null,
          });
        };
      }
    },
    [chart]
  );

  return { chartRef, chartSeries };
};

const DEFAULT_PERIOD = '4h';

const usePriceUpdateOnInterval = (updatePriceData: any) => {
  useEffect(
    () => {
      const interval = setInterval(() => {
        updatePriceData(undefined, true);
      }, 60 * 1000);
      return () => clearInterval(interval);
    },
    [updatePriceData]
  );
};

const useChartUpdate = (token: TokenInfo, series: ISeriesApi<'Candlestick'> | null) => {
  const { chainId } = useConstantLoader();
  const period = DEFAULT_PERIOD;

  const [priceData, updatePriceData] = useChartPrices(
    chainId,
    token.symbol,
    token.isStable,
    period,
    null
  );

  usePriceUpdateOnInterval(updatePriceData);

  useEffect(
    () => {
      if (series && priceData && priceData.length) {
        series.setData(priceData);
      }
    },
    [series, priceData]
  );

  return;
};

export { useChartInit, useChartUpdate };
