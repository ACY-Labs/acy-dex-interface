import React, { Component, useState, useEffect, useRef } from 'react';
//------FOR Pricehart-----TODO Austin
// import { createChart } from 'krasulya-lightweight-charts'
import { createChart } from 'lightweight-charts';
import './styles.css';
// import { getTokens,getToken } from '../../../acy-dex-futures/data/Tokens.js'
// import {
// 	USD_DECIMALS,
// 	SWAP,
//   INCREASE,
//   CHART_PERIODS,
// 	getTokenInfo,
// 	formatAmount,
// 	formatDateTime,
//   usePrevious,
//   getLiquidationPrice,
//   useLocalStorageSerializeKey
// } from '../../../acy-dex-futures/utils/Helpers'

// import { useChartPrices } from '../../../acy-dex-futures/Api'
import Tab from '../../../acy-dex-futures/Tab/Tab'

const Kchart=()=> {

    const [currentChart, setCurrentChart] = useState();
    const [currentSeries, setCurrentSeries] = useState();
    // let [period, setPeriod] = useLocalStorageSerializeKey([chainId, "Chart-period"], DEFAULT_PERIOD)
    // if (!(period in CHART_PERIODS)) {
    //   period = DEFAULT_PERIOD
    // }

    // const [hoveredCandlestick, setHoveredCandlestick] = useState()




  const ref = useRef(null);
  const chartRef = useRef();
  // const chartToken = getChartToken(swapOption, fromToken, toToken, chainId)

  // function getChartToken(swapOption, fromToken, toToken, chainId) {
  //     if (!fromToken || !toToken) { return }
    
  //     if (swapOption !== SWAP) { return toToken }
    
  //     if (fromToken.isUsdg && toToken.isUsdg) { return getTokens(chainId).find(t => t.isStable) }
  //     if (fromToken.isUsdg) { return toToken }
  //     if (toToken.isUsdg) { return fromToken }
    
  //     if (fromToken.isStable && toToken.isStable) { return toToken }
  //     if (fromToken.isStable) { return toToken }
  //     if (toToken.isStable) { return fromToken }
    
  //     return toToken
  //   }

  const getChartOptions = (width, height) => ({
    // width: document.body.offsetWidth *0.7,
    // height: document.body.offsetHeight / 2,
    width,
    height,
    layout: {

      backgroundColor: '#0e0304',
      textColor: '#ccc',
      fontFamily: 'Relative'
    },
    // localization: {
    //   // https://github.com/tradingview/lightweight-charts/blob/master/docs/customization.md#time-format
    //   timeFormatter: businessDayOrTimestamp => {
    //     return formatDateTime(businessDayOrTimestamp - timezoneOffset);
    //   }
    // },
    grid: {
      vertLines: {
        visible: true,
        color: 'rgba(46, 46, 49, 1)',
        style: 2
      },
      horzLines: {
        visible: true,
        color: 'rgba(46, 46, 49, 1)',
        style: 2
      }
    },
    // https://github.com/tradingview/lightweight-charts/blob/master/docs/time-scale.md#time-scale
    timeScale: {
      rightOffset: 5,
      borderVisible: false,
      barSpacing: 5,
      timeVisible: true,
      fixLeftEdge: true
    },
    // https://github.com/tradingview/lightweight-charts/blob/master/docs/customization.md#price-axis
    priceScale: {
      borderVisible: false
    },
    crosshair: {
      horzLine: {
        color: 'rgba(46, 46, 49, 1)'
      },
      vertLine: {
        color: 'rgba(46, 46, 49, 1)'
      },
      mode: 0
    }
  });
  
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
    borderVisible: false
  });
  
    //#TODO (Austin) convert into ACY Style
    useEffect(()=>{
      console.log("here AAAB", ref.current, currentChart);
      if (currentChart) {
        return;
      }
      console.log("here AAAC", currentChart, "chartRef", chartRef);

      const chart = createChart(
          chartRef.current,
          getChartOptions(chartRef.current.offsetWidth, chartRef.current.offsetHeight),
      );
      console.log("here AAAD", chartRef.current.offsetWidth, chartRef.current.offsetHeight);

      var candleSeries = chart.addCandlestickSeries({
        lineColor: '#5472cc',
        topColor: 'rgba(49, 69, 131, 0.4)',
        bottomColor: 'rgba(42, 64, 103, 0.0)',
        lineWidth: 2,
        priceLineColor: '#3a3e5e',
        downColor: '#fa3c58',
        wickDownColor: '#fa3c58',
        upColor: '#0ecc83',
        wickUpColor: '#0ecc83',
        borderVisible: false
      });
  
      candleSeries.setData([
        { time: '2018-10-19', open: 180.34, high: 180.99, low: 178.57, close: 179.85 },
        { time: '2018-10-22', open: 180.82, high: 181.40, low: 177.56, close: 178.75 },
        { time: '2018-10-23', open: 175.77, high: 179.49, low: 175.44, close: 178.53 },
        { time: '2018-10-24', open: 178.58, high: 182.37, low: 176.31, close: 176.97 },
        { time: '2018-10-25', open: 177.52, high: 180.50, low: 176.83, close: 179.07 },
        { time: '2018-10-26', open: 176.88, high: 177.34, low: 170.91, close: 172.23 },
        { time: '2018-10-29', open: 173.74, high: 175.99, low: 170.95, close: 173.20 },
        { time: '2018-10-30', open: 173.16, high: 176.43, low: 172.64, close: 176.24 },
        { time: '2018-10-31', open: 177.98, high: 178.85, low: 175.59, close: 175.88 },
        { time: '2018-11-01', open: 176.84, high: 180.86, low: 175.90, close: 180.46 },
        { time: '2018-11-02', open: 182.47, high: 183.01, low: 177.39, close: 179.93 },
        { time: '2018-11-05', open: 181.02, high: 182.41, low: 179.30, close: 182.19 },
        { time: '2018-11-06', open: 181.93, high: 182.65, low: 180.05, close: 182.01 },
        { time: '2018-11-07', open: 183.79, high: 187.68, low: 182.06, close: 187.23 },
        { time: '2018-11-08', open: 187.13, high: 188.69, low: 185.72, close: 188.00 },
        { time: '2018-11-09', open: 188.32, high: 188.48, low: 184.96, close: 185.99 },
        { time: '2018-11-12', open: 185.23, high: 186.95, low: 179.02, close: 179.43 },
        { time: '2018-11-13', open: 177.30, high: 181.62, low: 172.85, close: 179.00 },
        { time: '2018-11-14', open: 182.61, high: 182.90, low: 179.15, close: 179.90 },
        { time: '2018-11-15', open: 179.01, high: 179.67, low: 173.61, close: 177.36 },
        { time: '2018-11-16', open: 173.99, high: 177.60, low: 173.51, close: 177.02 },
        { time: '2018-11-19', open: 176.71, high: 178.88, low: 172.30, close: 173.59 },
        { time: '2018-11-20', open: 169.25, high: 172.00, low: 167.00, close: 169.05 },
        { time: '2018-11-21', open: 170.00, high: 170.93, low: 169.15, close: 169.30 },
        { time: '2018-11-23', open: 169.39, high: 170.33, low: 168.47, close: 168.85 },
        { time: '2018-11-26', open: 170.20, high: 172.39, low: 168.87, close: 169.82 },
        { time: '2018-11-27', open: 169.11, high: 173.38, low: 168.82, close: 173.22 },
        { time: '2018-11-28', open: 172.91, high: 177.65, low: 170.62, close: 177.43 },
        { time: '2018-11-29', open: 176.80, high: 177.27, low: 174.92, close: 175.66 },
        { time: '2018-11-30', open: 175.75, high: 180.37, low: 175.11, close: 180.32 },
        { time: '2018-12-03', open: 183.29, high: 183.50, low: 179.35, close: 181.74 },
        { time: '2018-12-04', open: 181.06, high: 182.23, low: 174.55, close: 175.30 },
        { time: '2018-12-06', open: 173.50, high: 176.04, low: 170.46, close: 175.96 },
        { time: '2018-12-07', open: 175.35, high: 178.36, low: 172.24, close: 172.79 },
        { time: '2018-12-10', open: 173.39, high: 173.99, low: 167.73, close: 171.69 },
        { time: '2018-12-11', open: 174.30, high: 175.60, low: 171.24, close: 172.21 },
        { time: '2018-12-12', open: 173.75, high: 176.87, low: 172.81, close: 174.21 },
        { time: '2018-12-13', open: 174.31, high: 174.91, low: 172.07, close: 173.87 },
        { time: '2018-12-14', open: 172.98, high: 175.14, low: 171.95, close: 172.29 },
        { time: '2018-12-17', open: 171.51, high: 171.99, low: 166.93, close: 167.97 },
        { time: '2018-12-18', open: 168.90, high: 171.95, low: 168.50, close: 170.04 },
        { time: '2018-12-19', open: 170.92, high: 174.95, low: 166.77, close: 167.56 },
        { time: '2018-12-20', open: 166.28, high: 167.31, low: 162.23, close: 164.16 },
        { time: '2018-12-21', open: 162.81, high: 167.96, low: 160.17, close: 160.48 },
        { time: '2018-12-24', open: 160.16, high: 161.40, low: 158.09, close: 158.14 },
        { time: '2018-12-26', open: 159.46, high: 168.28, low: 159.44, close: 168.28 },
        { time: '2018-12-27', open: 166.44, high: 170.46, low: 163.36, close: 170.32 },
        { time: '2018-12-28', open: 171.22, high: 173.12, low: 168.60, close: 170.22 },
        { time: '2018-12-31', open: 171.47, high: 173.24, low: 170.65, close: 171.82 },
        { time: '2019-01-02', open: 169.71, high: 173.18, low: 169.05, close: 172.41 },
        { time: '2019-01-03', open: 171.84, high: 171.84, low: 168.21, close: 168.61 },
        { time: '2019-01-04', open: 170.18, high: 174.74, low: 169.52, close: 173.62 },
        { time: '2019-01-07', open: 173.83, high: 178.18, low: 173.83, close: 177.04 },
        { time: '2019-01-08', open: 178.57, high: 179.59, low: 175.61, close: 177.89 },
        { time: '2019-01-09', open: 177.87, high: 181.27, low: 177.10, close: 179.73 },
        { time: '2019-01-10', open: 178.03, high: 179.24, low: 176.34, close: 179.06 },
        { time: '2019-01-11', open: 177.93, high: 180.26, low: 177.12, close: 179.41 },
        { time: '2019-01-14', open: 177.59, high: 179.23, low: 176.90, close: 178.81 },
        { time: '2019-01-15', open: 176.08, high: 177.82, low: 175.20, close: 176.47 },
        { time: '2019-01-16', open: 177.09, high: 177.93, low: 175.86, close: 177.04 },
        { time: '2019-01-17', open: 174.01, high: 175.46, low: 172.00, close: 174.87 },
        { time: '2019-01-18', open: 176.98, high: 180.04, low: 176.18, close: 179.58 },
        { time: '2019-01-22', open: 177.49, high: 178.60, low: 175.36, close: 177.11 },
        { time: '2019-01-23', open: 176.59, high: 178.06, low: 174.53, close: 176.89 },
        { time: '2019-01-24', open: 177.00, high: 177.53, low: 175.30, close: 177.29 },
        { time: '2019-01-25', open: 179.78, high: 180.87, low: 178.61, close: 180.40 },
        { time: '2019-01-28', open: 178.97, high: 179.99, low: 177.41, close: 179.83 },
        { time: '2019-01-29', open: 178.96, high: 180.15, low: 178.09, close: 179.69 },
        { time: '2019-01-30', open: 180.47, high: 184.20, low: 179.78, close: 182.18 },
        { time: '2019-01-31', open: 181.50, high: 184.67, low: 181.06, close: 183.53 },
        { time: '2019-02-01', open: 184.03, high: 185.15, low: 182.83, close: 184.37 },
        { time: '2019-02-04', open: 184.30, high: 186.43, low: 183.84, close: 186.43 },
        { time: '2019-02-05', open: 186.89, high: 186.99, low: 184.69, close: 186.39 },
        { time: '2019-02-06', open: 186.69, high: 186.69, low: 184.06, close: 184.72 },
        { time: '2019-02-07', open: 183.74, high: 184.92, low: 182.45, close: 184.07 },
        { time: '2019-02-08', open: 183.05, high: 184.58, low: 182.72, close: 184.54 },
        { time: '2019-02-11', open: 185.00, high: 185.42, low: 182.75, close: 182.92 },
        { time: '2019-02-12', open: 183.84, high: 186.40, low: 183.52, close: 185.52 },
        { time: '2019-02-13', open: 186.30, high: 188.68, low: 185.92, close: 188.41 },
        { time: '2019-02-14', open: 187.50, high: 188.93, low: 186.00, close: 187.71 },
        { time: '2019-02-15', open: 189.87, high: 192.62, low: 189.05, close: 192.39 },
        { time: '2019-02-19', open: 191.71, high: 193.19, low: 191.28, close: 192.33 },
        { time: '2019-02-20', open: 192.39, high: 192.40, low: 191.11, close: 191.85 },
        { time: '2019-02-21', open: 191.85, high: 192.37, low: 190.61, close: 191.82 },
        { time: '2019-02-22', open: 191.69, high: 192.54, low: 191.62, close: 192.39 },
        { time: '2019-02-25', open: 192.75, high: 193.42, low: 189.96, close: 189.98 },
        { time: '2019-02-26', open: 185.59, high: 188.47, low: 182.80, close: 188.30 },
        { time: '2019-02-27', open: 187.90, high: 188.50, low: 183.21, close: 183.67 },
        { time: '2019-02-28', open: 183.60, high: 185.19, low: 183.11, close: 185.14 },
        { time: '2019-03-01', open: 185.82, high: 186.56, low: 182.86, close: 185.17 },
        { time: '2019-03-04', open: 186.20, high: 186.24, low: 182.10, close: 183.81 },
        { time: '2019-03-05', open: 184.24, high: 185.12, low: 183.25, close: 184.00 },
        { time: '2019-03-06', open: 184.53, high: 184.97, low: 183.84, close: 184.45 },
        { time: '2019-03-07', open: 184.39, high: 184.62, low: 181.58, close: 182.51 },
        { time: '2019-03-08', open: 181.49, high: 181.91, low: 179.52, close: 181.23 },
        { time: '2019-03-11', open: 182.00, high: 183.20, low: 181.20, close: 182.44 },
        { time: '2019-03-12', open: 183.43, high: 184.27, low: 182.33, close: 184.00 },
        { time: '2019-03-13', open: 183.24, high: 183.78, low: 181.08, close: 181.14 },
        { time: '2019-03-14', open: 181.28, high: 181.74, low: 180.50, close: 181.61 },
        { time: '2019-03-15', open: 182.30, high: 182.49, low: 179.57, close: 182.23 },
        { time: '2019-03-18', open: 182.53, high: 183.48, low: 182.33, close: 183.42 },
        { time: '2019-03-19', open: 184.19, high: 185.82, low: 183.48, close: 184.13 },
        { time: '2019-03-20', open: 184.30, high: 187.12, low: 183.43, close: 186.10 },
        { time: '2019-03-21', open: 185.50, high: 190.00, low: 185.50, close: 189.97 },
        { time: '2019-03-22', open: 189.31, high: 192.05, low: 188.67, close: 188.75 },
        { time: '2019-03-25', open: 188.75, high: 191.71, low: 188.51, close: 189.68 },
        { time: '2019-03-26', open: 190.69, high: 192.19, low: 188.74, close: 189.34 },
        { time: '2019-03-27', open: 189.65, high: 191.61, low: 188.39, close: 189.25 },
        { time: '2019-03-28', open: 189.91, high: 191.40, low: 189.16, close: 190.06 },
        { time: '2019-03-29', open: 190.85, high: 192.04, low: 190.14, close: 191.89 },
        { time: '2019-04-01', open: 192.99, high: 195.90, low: 192.85, close: 195.64 },
        { time: '2019-04-02', open: 195.50, high: 195.50, low: 194.01, close: 194.31 },
        { time: '2019-04-03', open: 194.98, high: 198.78, low: 194.11, close: 198.61 },
        { time: '2019-04-04', open: 199.00, high: 200.49, low: 198.02, close: 200.45 },
        { time: '2019-04-05', open: 200.86, high: 203.13, low: 200.61, close: 202.06 },
        { time: '2019-04-08', open: 201.37, high: 203.79, low: 201.24, close: 203.55 },
        { time: '2019-04-09', open: 202.26, high: 202.71, low: 200.46, close: 200.90 },
        { time: '2019-04-10', open: 201.26, high: 201.60, low: 198.02, close: 199.43 },
        { time: '2019-04-11', open: 199.90, high: 201.50, low: 199.03, close: 201.48 },
        { time: '2019-04-12', open: 202.13, high: 204.26, low: 202.13, close: 203.85 },
        { time: '2019-04-15', open: 204.16, high: 205.14, low: 203.40, close: 204.86 },
        { time: '2019-04-16', open: 205.25, high: 205.99, low: 204.29, close: 204.47 },
        { time: '2019-04-17', open: 205.34, high: 206.84, low: 205.32, close: 206.55 },
        { time: '2019-04-18', open: 206.02, high: 207.78, low: 205.10, close: 205.66 },
        { time: '2019-04-22', open: 204.11, high: 206.25, low: 204.00, close: 204.78 },
        { time: '2019-04-23', open: 205.14, high: 207.33, low: 203.43, close: 206.05 },
        { time: '2019-04-24', open: 206.16, high: 208.29, low: 205.54, close: 206.72 },
        { time: '2019-04-25', open: 206.01, high: 207.72, low: 205.06, close: 206.50 },
        { time: '2019-04-26', open: 205.88, high: 206.14, low: 203.34, close: 203.61 },
        { time: '2019-04-29', open: 203.31, high: 203.80, low: 200.34, close: 202.16 },
        { time: '2019-04-30', open: 201.55, high: 203.75, low: 200.79, close: 203.70 },
        { time: '2019-05-01', open: 203.20, high: 203.52, low: 198.66, close: 198.80 },
        { time: '2019-05-02', open: 199.30, high: 201.06, low: 198.80, close: 201.01 },
        { time: '2019-05-03', open: 202.00, high: 202.31, low: 200.32, close: 200.56 },
        { time: '2019-05-06', open: 198.74, high: 199.93, low: 198.31, close: 199.63 },
        { time: '2019-05-07', open: 196.75, high: 197.65, low: 192.96, close: 194.77 },
        { time: '2019-05-08', open: 194.49, high: 196.61, low: 193.68, close: 195.17 },
        { time: '2019-05-09', open: 193.31, high: 195.08, low: 191.59, close: 194.58 },
        { time: '2019-05-10', open: 193.21, high: 195.49, low: 190.01, close: 194.58 },
        { time: '2019-05-13', open: 191.00, high: 191.66, low: 189.14, close: 190.34 },
        { time: '2019-05-14', open: 190.50, high: 192.76, low: 190.01, close: 191.62 },
        { time: '2019-05-15', open: 190.81, high: 192.81, low: 190.27, close: 191.76 },
        { time: '2019-05-16', open: 192.47, high: 194.96, low: 192.20, close: 192.38 },
        { time: '2019-05-17', open: 190.86, high: 194.50, low: 190.75, close: 192.58 },
        { time: '2019-05-20', open: 191.13, high: 192.86, low: 190.61, close: 190.95 },
        { time: '2019-05-21', open: 187.13, high: 192.52, low: 186.34, close: 191.45 },
        { time: '2019-05-22', open: 190.49, high: 192.22, low: 188.05, close: 188.91 },
        { time: '2019-05-23', open: 188.45, high: 192.54, low: 186.27, close: 192.00 },
        { time: '2019-05-24', open: 192.54, high: 193.86, low: 190.41, close: 193.59 },
        ]);

      const series = chart.addCandlestickSeries(getSeriesOptions())

      console.log("here AAAE");

      setCurrentChart(chart);
      setCurrentSeries(series);
    },[ref, currentChart])

    useEffect(() => {
      console.log ("here AAAA", currentChart);
      if (!currentChart) { return; }
      const resizeChart = () => {
        currentChart.resize(chartRef.current.offsetWidth, chartRef.current.offsetHeight)
        // currentChart.resize(500, 300)
        console.log("here AAAG", chartRef.current.offsetWidth, chartRef.current.offsetHeight);
      }
      window.addEventListener('resize', resizeChart);
      return () => window.removeEventListener('resize', resizeChart);
    }, [currentChart]);

    
    return(
        <div className='PriceChart' ref={chartRef}>
            <div className="TopInner">
                <div>ACY/USDT</div>
                <div>XXX</div>
                <div>XXX</div>
                <div>XXX</div>
                <div>XXX</div>

            </div>
            <div className="BotInner">
                <div className="KChartHeader">
                    <div className='KChartControl'>
                        {/* <div className='TabBlock'> </div> */}
                        {/* <Tab options={Object.keys(CHART_PERIODS)} option={period} setOption={setPeriod} /> */}

                    </div>
                    <div className='KChartStat'></div>
                </div>
                <div className="KChartBox"></div>


            </div>
        </div>

    )
}
export default Kchart;