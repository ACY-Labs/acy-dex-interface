import React, { Component, useState, useEffect, useRef } from 'react';
import { getKChartData } from '../utils/index'
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
    const [currentChartData, setCurrentChartData] = useState([]);
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
    useEffect(async () => {
      if (currentChart) {
        return;
      }

      const chart = createChart(
          chartRef.current,
          getChartOptions(chartRef.current.offsetWidth, chartRef.current.offsetHeight),
      );

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

      candleSeries.setData(currentChartData);

      const series = chart.addCandlestickSeries(getSeriesOptions())
      setCurrentChart(chart);
      setCurrentSeries(series);
    },[ref, currentChart])

    useEffect(() => {
      if (!currentChart) { return; }
      const resizeChart = () => {
        currentChart.resize(chartRef.current.offsetWidth, chartRef.current.offsetHeight)
      }
      window.addEventListener('resize', resizeChart);
      return () => window.removeEventListener('resize', resizeChart);
    }, [currentChart]);

    
    return(
        <div className='PriceChart' ref={chartRef}>
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