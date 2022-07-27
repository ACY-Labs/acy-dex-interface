import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import cx from "classnames";

import { Spin, Radio, Button } from 'antd';

// import styles from './ExchangeTVChart.css';
import styled from "styled-components";

import { createChart } from "lightweight-charts";

import { useConstantLoader, constantInstance } from "@/constants"

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
  useLocalStorageSerializeKey
} from '@/acy-dex-futures/utils'
import { useChartPrices } from '@/acy-dex-futures/Api'

import './ExchangeTVChart.css';
// import { getKChartData } from '../utils/index'
// import Tab from '../Tab/Tab'

// import ChartTokenSelector from './ChartTokenSelector'

////// Binance CEX price source
import axios from "axios";
import Binance from "binance-api-node";

const StyledSelect = styled(Radio.Group)`
  .ant-radio-button-wrapper{
    background: transparent !important;
    height: 22px;
    font-size: 0.7rem;
    padding: 0 0.1rem;
    border: 0.75px solid #333333;
    border-radius: 0 0 0 0;
    line-height: 22px;
    color: #b5b5b6;
  }
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled){
    color: #ffffff;
    box-shadow: 0 0 0 0 black;
    border-color: #333333;
    background-color: #29292c !important;
  }
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover{
    color: #ffffff;
    background-color: #29292c !important;
  }
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before{
    background-color: #black !important;
  }
  .ant-radio-button-wrapper:not(:first-child)::before{
    background-color: transparent;
  }
`;

const client = Binance();
////// End of price source

const PRICE_LINE_TEXT_WIDTH = 15;

const timezoneOffset = -new Date().getTimezoneOffset() * 60;

const BinancePriceApi = 'https://api.acy.finance/polygon-test';

const DEFAULT_PERIOD = "4h";

const getSeriesOptions = () => ({
  // https://github.com/tradingview/lightweight-charts/blob/master/docs/area-series.md
  lineColor: "#5472cc",
  topColor: "rgba(49, 69, 131, 0.4)",
  bottomColor: "rgba(42, 64, 103, 0.0)",
  lineWidth: 2,
  priceLineColor: "#3a3e5e",
  downColor: "#fa3c58",
  wickDownColor: "#fa3c58",
  upColor: "#0ecc83",
  wickUpColor: "#0ecc83",
  borderVisible: false,
});

const getChartOptions = (width, height) => ({
  width,
  height,
  layout: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    textColor: "#ccc",
    fontFamily: "Karla 300", 
  },
  localization: {
    // https://github.com/tradingview/lightweight-charts/blob/master/docs/customization.md#time-format
    timeFormatter: (businessDayOrTimestamp) => {
      return formatDateTime(businessDayOrTimestamp);
    },
  },
  grid: {
    vertLines: {
      visible: true,
      // color: "rgba(27, 27, 27, 1)",
      color: "#1b1b1b",
      style: 0,
    },
    horzLines: {
      visible: true,
      // color: "rgba(35, 38, 59, 1)",
      color: "#1b1b1b", 
      style: 2,
    },
  },
  // https://github.com/tradingview/lightweight-charts/blob/master/docs/time-scale.md#time-scale
  timeScale: {
    rightOffset: 5,
    borderVisible: false,
    barSpacing: 5,
    timeVisible: true,
    fixLeftEdge: true,
  },
  // https://github.com/tradingview/lightweight-charts/blob/master/docs/customization.md#price-axis
  priceScale: {
    borderVisible: false,
  },
  crosshair: {
    horzLine: {
      color: "#aaa",
    },
    vertLine: {
      color: "#aaa",
    },
    mode: 0,
  },
});

export default function ExchangeTVChart(props) {
  const {
    chartTokenSymbol, passTokenData
  } = props
  const [currentChart, setCurrentChart] = useState();
  const [currentSeries, setCurrentSeries] = useState();
  const [activeTimeScale, setActiveTimeScale] = useState("5m");
  const [period, setPeriod] = useState('5m');

  const [hoveredCandlestick, setHoveredCandlestick] = useState();


  
  const symbol = chartTokenSymbol || "BTC";
  const marketName = symbol + "_USD";
  const previousMarketName = usePrevious(marketName);

  const ref = useRef(null);
  const chartRef = useRef(null);
  
  const [chartInited, setChartInited] = useState(false);
  
  useEffect(() => {
    passTokenData(symbol);
  }, []);

  useEffect(() => {
    if (marketName !== previousMarketName) {
      setChartInited(false);
    }
  }, [marketName, previousMarketName]);

  // 设置chart的横轴range
  const scaleChart = useCallback(() => {
    const from = Date.now() / 1000 - (7 * 24 * CHART_PERIODS[period]) / 2;
    const to = Date.now() / 1000;
    currentChart.timeScale().setVisibleRange({ from, to });
  }, [currentChart, period]);

  // Binance data source
  const [lastCandle, setLastCandle] = useState({})
  const cleaner = useRef()
  useEffect(() => {
    if (!currentSeries)
      return;

    const symbol = chartTokenSymbol;
    console.log("bin chart token: ", symbol)
    if (!symbol)
      return
    const pairName = `${symbol}USDT`;
      
    if (cleaner.current) {
      // unsubscribe from previous subscription
      console.log("cleaned previous subscriber: ", cleaner.current)
      cleaner.current()
      // clear chart candles
      currentSeries.setData([]);
    }
  
    // subscribe to websocket for the future price update
    const clean = client.ws.candles(pairName, period, (res) => {
      console.log("res Swap: ", res)
      const candleData = {
        time: res.startTime / 1000,   // make it in seconds
        open: res.open,
        high: res.high,
        low: res.low,
        close: res.close
      }
      console.log("ws received: ", candleData.time, candleData.close)
      currentSeries.update(candleData)
      setLastCandle(candleData);
      // console.log("hereim see currentseries", currentSeries)
    });
    cleaner.current = clean;
    console.log("added new candles subscription for ", pairName)
  
    const fetchPrevAndSubscribe = async () => {
      // before subscribe to websocket, should prefill the chart with existing history, this can be fetched with normal REST request
      // SHOULD DO THIS BEFORE SUBSCRIBE, HOWEVER MOVING SUBSCRIBE TO AFTER THIS BLOCK OF CODE WILL CAUSE THE SUBSCRIPTION GOES ON FOREVER
      // REACT BUG?
      console.log("fetchPrevAndSubscribe again: ", chartTokenSymbol)
      // Binance data is independent of chain, so here we can fill in any chain name
      const prevData = await axios.get(`${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${pairName}&interval=${period}`).then(res => res.data);
      console.log("prev data: ", prevData)
      currentSeries.setData(prevData);      

      if (!chartInited) {
        scaleChart();
        setChartInited(true);
      }
    }
  
    fetchPrevAndSubscribe()
  }, [currentSeries, chartTokenSymbol, period])
  ///// end of binance data source

  

  // 设置chart的鼠标移动时的回调函数。evt是event的意思。
  const onCrosshairMove = useCallback(
    (evt) => {
      if (!evt.time) {
        setHoveredCandlestick(null);
        return;
      }

      // 这个 for loop + break 为什么这么写我还没搞懂
      for (const point of evt.seriesPrices.values()) {
        setHoveredCandlestick((hoveredCandlestick) => {
          if (hoveredCandlestick && hoveredCandlestick.time === evt.time) {
            // rerender optimisations
            return hoveredCandlestick;
          }
          return {
            time: evt.time,
            ...point,
          };
        });
        break;
      }
    },
    [setHoveredCandlestick]
  );
  
   // 在第一次得到priceData时，初始化 chart
   // 【我认为】当currentChart已经有了的时候，即使priceData变化，也不会触发下面的函数。可以用console.log来测试一下。
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    console.log("debug chart: chart created")

    const chart = createChart(
      chartRef.current,
      getChartOptions(chartRef.current.offsetWidth, chartRef.current.offsetHeight)
    );

    chart.subscribeCrosshairMove(onCrosshairMove);

    const series = chart.addCandlestickSeries(getSeriesOptions());

    setCurrentChart(chart);
    setCurrentSeries(series);
  }, [ref, onCrosshairMove]);

  // 自适应并撑满chartRef这个div的大小。仅当currentChart已经被初始化后，才会被执行。
	// offsetWidth是一个component的宽度。关于offsetWidth 和 clientWidth 的区别可以参考
	// https://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
  useEffect(() => {
    console.log("debug chart: currentChart ", currentChart)
    if (!currentChart) {
      return;
    }
    const resizeChart = () => {
      currentChart.resize(chartRef.current.offsetWidth, 470);
      console.log("debug chart: resize ", chartRef.current.offsetWidth, chartRef.current.offsetHeight)
    };
    resizeChart();
    window.addEventListener("resize", resizeChart);
    return () => window.removeEventListener("resize", resizeChart);
  }, [currentChart]);

//   // 当用户连接着钱包，有position或者order的时候，会显示入场价+liquidation价格
//   useEffect(() => {
//     const lines = [];
//     if (currentSeries && savedShouldShowPositionLines) {
//       if (currentOrders && currentOrders.length > 0) {
//         currentOrders.forEach((order) => {
//           const indexToken = constantInstance.perpetuals.getToken(order.indexToken);
//           let tokenSymbol;
//           if (indexToken && indexToken.symbol) {
//             tokenSymbol = indexToken.isWrapped ? indexToken.baseSymbol : indexToken.symbol;
//           }
//           const title = `${order.type === INCREASE ? "Inc." : "Dec."} ${tokenSymbol} ${
//             order.isLong ? "Long" : "Short"
//           }`;
//           const color = "#3a3e5e";
//           lines.push(
//             currentSeries.createPriceLine({
//               price: parseFloat(formatAmount(order.triggerPrice, USD_DECIMALS, 2)),
//               color,
//               title: title.padEnd(PRICE_LINE_TEXT_WIDTH, " "),
//             })
//           );
//         });
//       }
//       if (positions && positions.length > 0) {
//         const color = "#3a3e5e";

//         positions.forEach((position) => {
//           lines.push(
//             currentSeries.createPriceLine({
//               price: parseFloat(formatAmount(position.averagePrice, USD_DECIMALS, 2)),
//               color,
//               title: `Open ${position.indexToken.symbol} ${position.isLong ? "Long" : "Short"}`.padEnd(
//                 PRICE_LINE_TEXT_WIDTH,
//                 " "
//               ),
//             })
//           );

//           const liquidationPrice = getLiquidationPrice(position);
//           lines.push(
//             currentSeries.createPriceLine({
//               price: parseFloat(formatAmount(liquidationPrice, USD_DECIMALS, 2)),
//               color,
//               title: `Liq. ${position.indexToken.symbol} ${position.isLong ? "Long" : "Short"}`.padEnd(
//                 PRICE_LINE_TEXT_WIDTH,
//                 " "
//               ),
//             })
//           );
//         });
//       }
//     }
//     return () => {
//       lines.forEach((line) => currentSeries.removePriceLine(line));
//     };
//   }, [currentOrders, positions, currentSeries, chainId, savedShouldShowPositionLines]);

  // // 显示OHLC数据, 若使用binance则需要先API获取24h high low, 然后用websocket来更新
  // const candleStatsHtml = useMemo(() => {
  //   if (!priceData) {
  //     return null;
  //   }
  //   const candlestick = hoveredCandlestick || priceData[priceData.length - 1];
  //   if (!candlestick) {
  //     return null;
  //   }

  //   const className = cx({
  //     "ExchangeChart-bottom-stats": true,
  //     positive: candlestick.open <= candlestick.close,
  //     negative: candlestick.open > candlestick.close,
  //     [`length-${String(parseInt(candlestick.close)).length}`]: true,
  //   });

  //   const toFixedNumbers = 2;

  //   return (
  //     <div className={className}>
  //       <span className="ExchangeChart-bottom-stats-label">O</span>
  //       <span className="ExchangeChart-bottom-stats-value">{candlestick.open.toFixed(toFixedNumbers)}</span>
  //       <span className="ExchangeChart-bottom-stats-label">H</span>
  //       <span className="ExchangeChart-bottom-stats-value">{candlestick.high.toFixed(toFixedNumbers)}</span>
  //       <span className="ExchangeChart-bottom-stats-label">L</span>
  //       <span className="ExchangeChart-bottom-stats-value">{candlestick.low.toFixed(toFixedNumbers)}</span>
  //       <span className="ExchangeChart-bottom-stats-label">C</span>
  //       <span className="ExchangeChart-bottom-stats-value">{candlestick.close.toFixed(toFixedNumbers)}</span>
  //     </div>
  //   );
  // }, [hoveredCandlestick, priceData]);

  // // 24h OHLC stats
  // let high;
  // let low;
  // let deltaPrice;
  // let delta;
  // let deltaPercentage;
  // let deltaPercentageStr;

  // const now = parseInt(Date.now() / 1000);
  // const timeThreshold = now - 24 * 60 * 60;

  // if (priceData) {
  //   for (let i = priceData.length - 1; i > 0; i--) {
  //     const price = priceData[i];
  //     if (price.time < timeThreshold) {
  //       break;
  //     }
  //     if (!low) {
  //       low = price.low;
  //     }
  //     if (!high) {
  //       high = price.high;
  //     }

  //     if (price.high > high) {
  //       high = price.high;
  //     }
  //     if (price.low < low) {
  //       low = price.low;
  //     }

  //     deltaPrice = price.open;
  //   }
  // }

  // if (deltaPrice && currentAveragePrice) {
  //   const average = parseFloat(formatAmount(currentAveragePrice, USD_DECIMALS, 2));
  //   delta = average - deltaPrice;
  //   deltaPercentage = (delta * 100) / average;
  //   if (deltaPercentage > 0) {
  //     deltaPercentageStr = `+${deltaPercentage.toFixed(2)}%`;
  //   } else {
  //     deltaPercentageStr = `${deltaPercentage.toFixed(2)}%`;
  //   }
  //   if (deltaPercentage === 0) {
  //     deltaPercentageStr = "0.00";
  //   }
  // }

  if (!chartTokenSymbol) {
    return null;
  }
  const placementChange = e => {
    // if(updatingKchartsFlag) {
    //   return;
    // }
    // setUpdatingKchartsFlag(true);
    setPeriod(e.target.value);
    setActiveTimeScale(e.target.value);
    console.log("hereim button triggered", e.target.value)
  };

  // const getTimescaleButton = value => {
  //   if (period != value) {
  //     return (
  //       <button
  //         className={styles.timescaleButton}
  //         onClick={() => { setPeriod(value) }}>
  //         {value}
  //       </button>
  //     )
  //   } else {
  //     return (
  //       <button
  //         className={styles.timescaleButtonActive}
  //         onClick={() => { setPeriod(value) }}>
  //         {value}
  //       </button>
  //     )
  //   }
  // }

  // const onSelectToken = (token) => {
  //   const tmp = getTokenInfo(infoTokens, token.address)
  //   setChartToken(tmp)
  //   setToTokenAddress(swapOption, token.address)
  // }

  return (
    <div className="ExchangeChart tv" ref={ref} style={{ height: "100%", width: "100%"}}>
      <div className="ExchangeChart-top App-box App-box-border">
        <div className="ExchangeChart-top-inner">
            <div>
              {/* <div className="ExchangeChart-info-label">24h Change</div> */}
                {/* <div className={styles.timeSelector}> */}
                  
                  <StyledSelect value={period} onChange={placementChange}
                    style={{ width: '100%', height: '20px', paddingRight: '50%' }}>
                    <Radio.Button value="1m" style={{ width: '9%', textAlign: 'center' }}>1m</Radio.Button>
                    <Radio.Button value="5m" style={{ width: '9%', textAlign: 'center' }}>5m</Radio.Button>
                    <Radio.Button value="15m" style={{ width: '9%', textAlign: 'center' }}>15m</Radio.Button>
                    <Radio.Button value="30m" style={{ width: '9%', textAlign: 'center' }}>30m</Radio.Button>
                    <Radio.Button value="1h" style={{ width: '9%', textAlign: 'center' }}>1h</Radio.Button>
                    <Radio.Button value="2h" style={{ width: '9%', textAlign: 'center' }}>2h</Radio.Button>
                    <Radio.Button value="4h" style={{ width: '9%', textAlign: 'center' }}>4h</Radio.Button>
                    <Radio.Button value="1d" style={{ width: '9%', textAlign: 'center' }}>1D</Radio.Button>
                    <Radio.Button value="1w" style={{ width: '9%', textAlign: 'center' }}>1W</Radio.Button>
                  </StyledSelect>
                {/* </div> */}
              {/* <div className="ExchangeChart-title">
                <ChartTokenSelector
                  chainId={chainId}
                  selectedToken={chartToken}
                  swapOption={swapOption}
                  infoTokens={infoTokens}
                  onSelectToken={onSelectToken}
                  className="chart-token-selector"
                />
              </div> */}
            </div>
          {/* <div> */}
            {/* <div className="ExchangeChart-title">
              <ChartTokenSelector
                chainId={chainId}
                selectedToken={chartToken}
                swapOption={swapOption}
                infoTokens={infoTokens}
                onSelectToken={onSelectToken}
                className="chart-token-selector"
              />
            </div> */}
          {/* </div> */}
					{/* <div>
						<div className="ExchangeChart-main-price">{chartToken.maxPrice && formatAmount(chartToken.maxPrice, USD_DECIMALS, 2)}</div>
						<div className="ExchangeChart-info-label">${chartToken.minPrice && formatAmount(chartToken.minPrice, USD_DECIMALS, 2)}</div>
					</div>
					<div>
						<div className="ExchangeChart-info-label">24h Change</div>
						<div className={cx({ positive: deltaPercentage > 0, negative: deltaPercentage < 0 })}>
							{!deltaPercentageStr && "-"}
							{deltaPercentageStr && deltaPercentageStr}
						</div>
					</div>
					<div className="ExchangeChart-additional-info">
						<div className="ExchangeChart-info-label">24h High</div>
						<div>
							{!high && "-"}
							{high && high.toFixed(2)}
						</div>
					</div>
					<div className="ExchangeChart-additional-info">
						<div className="ExchangeChart-info-label">24h Low</div>
						<div>
							{!low && "-"}
							{low && low.toFixed(2)}
						</div>
					</div> */}
        </div>
      </div>
      <div className="ExchangeChart-bottom App-box App-box-border" style={{ height: "100%", width: "100%"}}>
        <div className="ExchangeChart-bottom-header">
          <div className="ExchangeChart-bottom-controls">
            {/* <Tab options={Object.keys(CHART_PERIODS)} option={period} setOption={setPeriod} /> */}
          </div>
          {/* {candleStatsHtml} */}
        </div>
        {!currentChart && <Spin />}
        <div className="ExchangeChart-bottom-content" ref={chartRef} style={{ height: "100%", width: "100%"}}></div>
      </div>
    </div>
  );
}
