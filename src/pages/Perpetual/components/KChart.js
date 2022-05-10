import React, { Component, useState, useEffect, useRef } from 'react';
import { getKChartData } from '../utils/index'
//------FOR Pricehart-----TODO Austin 
// import { createChart } from 'krasulya-lightweight-charts'
import { createChart } from 'lightweight-charts';
import './styles.css';
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

import Tab from '../../../acy-dex-futures/Tab/Tab'

const Kchart=(props)=> {

  const [currentChart, setCurrentChart] = useState();
  const [currentSeries, setCurrentSeries] = useState();
  const [currentChartData, setCurrentChartData] = useState([]);

  // const { activeToken0, activeToken1 } = props;

  const ref = useRef(null);
  const chartRef = useRef();

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
  function fillGaps(prices, periodSeconds) {
    if (prices.length < 2) {
      return prices
    }
  
    const newPrices = [prices[0]]
    let prevTime = prices[0].time
    for (let i = 1; i < prices.length; i++) {
      const { time, open } = prices[i]
      if (prevTime) {
        let j = (time - prevTime) / periodSeconds - 1
        while (j > 0) {
          newPrices.push({
            time: time - j * periodSeconds,
            open,
            close: open,
            high: open * 1.0003,
            low: open * 0.9996
          })
          j--
        }
      }
  
      prevTime = time
      newPrices.push(prices[i])
    }
  
    return newPrices
  }
  const getCurrentTime = () => {
    let currentTime = Math.floor(new Date().getTime()/1000);
    // console.log("hereim current time", currentTime);
    return currentTime;
  }
  const getFromTime100 = ( currentTime ) => {
    let fromTime = currentTime - 100* 24* 60* 60;
    return fromTime;
  }
  const getSeconds = ( timeScale ) => {
    let seconds;
    switch (timeScale) {
        case "1w":
          seconds = 7*24*60*60;
          break;
        case "1d": 
          seconds = 24*60*60;
          break;
        case "4h":
          seconds = 4*60*60;
          break;
        case "1h":
          seconds = 60*60;
          break;
        case "15m":
          seconds = 15*60;
          break;
        case "5m":
          seconds = 5*60;
          break;
      }
    return seconds;
  }
  const getFromTimeUpdate = ( currentTime, timeScale ) => {
    let fromTime;
    fromTime = currentTime - getSeconds(timeScale);
    return fromTime;
  }
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
    let chart;
    if (currentChart) {
      console.log("hereim init if")

    }

    chart = createChart(
      chartRef.current,
      getChartOptions(chartRef.current.offsetWidth, chartRef.current.offsetHeight),
    );

    var candleSeries = chart.addCandlestickSeries(getSeriesOptions());

    let currentTime = getCurrentTime();
    let fromTime = getFromTime100( currentTime );
    let data;
    try {
      data = await getKChartData(props.activeToken1.symbol, "56", props.activeTimeScale, fromTime.toString(), currentTime.toString(), "chainlink");
    } catch {
      data = [];
      console.log("fallback to empty array");
    }
    let seconds = getSeconds(props.activeTimeScale);
    let filledData = fillGaps(data, seconds);
    candleSeries.setData(filledData);

    const series = chart.addCandlestickSeries(getSeriesOptions())
    setCurrentChart(chart);
    setCurrentSeries(series);
  },[])

  useEffect(() => {
    if (!currentChart) { return; }
    const resizeChart = () => {
      currentChart.resize(chartRef.current.offsetWidth, chartRef.current.offsetHeight)
    }
    window.addEventListener('resize', resizeChart);
    return () => window.removeEventListener('resize', resizeChart);
  }, [currentChart]);


  useEffect(async () => {
    if (currentChart == undefined) {
      return;
    } 
    currentChart.resize(0,0);
    
    const chart = createChart(
        chartRef.current,
        getChartOptions(chartRef.current.offsetWidth, chartRef.current.offsetHeight),
    );
    var candleSeries = chart.addCandlestickSeries(getSeriesOptions());

    // candleSeries.setData(currentChartData);
    let currentTime = getCurrentTime();
  let fromTime = getFromTime100( currentTime );
  let data;
    try {
      data = await getKChartData(props.activeToken1.symbol, "56", props.activeTimeScale, fromTime.toString(), currentTime.toString(), "chainlink");
    } catch {
      data = [];
      console.log("fallback to empty array");
    }
    let seconds = getSeconds(props.activeTimeScale);
    let filledData = fillGaps(data, seconds);
    candleSeries.setData(filledData);
    setCurrentChart(chart);
  },[props.activeToken1.symbol, props.activeTimeScale])

  useEffect(() => {
    if (!currentChart) { return; }
    const resizeChart = () => {
      currentChart.resize(chartRef.current.offsetWidth, chartRef.current.offsetHeight)
    }
    window.addEventListener('resize', resizeChart);
    return () => window.removeEventListener('resize', resizeChart);
  }, [currentChart]);


  useEffect(async() => {
    if (currentChart == undefined) {
      return;
    } 
    
    let chart = currentChart;
    var candleSeries = chart.addCandlestickSeries(getSeriesOptions());

    // const interval = setInterval(async() => {
    //   let currentTime = getCurrentTime();
    //   let fromTime = getFromTimeUpdate( currentTime, props.activeTimeScale );
    //   let data = await getKChartData(props.activeToken1.symbol, "42161", props.activeTimeScale, fromTime.toString(), currentTime.toString(), "chainlink");
    //   console.log("hereim data timescale", data);
    //   candleSeries.update(data[0])
    //   // candleSeries.update({ time: '2022-05-06', open: 112, high: 112, low: 100, close: 101 });

    //   // console.log("hereim update")
    // }, 5 * 1000)
    // return () => clearInterval(interval);
  }, [props.activeTimeScale])

    
  return(
      <div className='PriceChart' ref={chartRef}>
        {/* <div>wefiweu</div> */}
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