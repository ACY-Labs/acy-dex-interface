import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Spin, Radio, Button } from 'antd';
import styled from "styled-components";
import { createChart } from "lightweight-charts";
import {
  CHART_PERIODS,
  formatDateTime,
  usePrevious,
} from '@/acy-dex-futures/utils'
import './ExchangeTVChart.css';
import axios from "axios";
import Binance from "binance-api-node";

const StyledSelect = styled(Radio.Group)`
  .ant-radio-button-wrapper{
    background: transparent !important;
    height: 22px;
    font-size: 0.7rem;
    padding: 0 0.1rem;
    border: 0;
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
const OptionsPriceApi = 'https://options.acy.finance/api';
const TradePriceApi = 'https://stats.acy.finance/api/rates/candles';
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
  watermark: {
    visible: true,
    fontSize: 40,
    horzAlign: 'center',
    vertAlign: 'center',
    color: 'rgba(255, 255, 255, 0.2)',
    text: 'TestNet',
  },
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

function getCurrentTimestamp() {
  let curTime = Math.floor(Date.now() / 1000);
  return curTime
}

export default function ExchangeTVChart(props) {
  const {
    chartTokenSymbol,
    pageName,
    fromToken,
    toToken,
    chainId,
    onChangePrice,
    activeToken,
    setHasPair,
    activeExist,
    setActiveExist
  } = props

  if (!chartTokenSymbol) {
    return null;
  }

  const [currentChart, setCurrentChart] = useState();
  const [currentSeries, setCurrentSeries] = useState();
  const [period, setPeriod] = useState('5m');
  const [hoveredCandlestick, setHoveredCandlestick] = useState();
  const [curPrice, setCurPrice] = useState();
  const [priceChangePercentDelta, setPriceChangePercentDelta] = useState();
  const [deltaIsMinus, setDeltaIsMinus] = useState();
  const [chartInited, setChartInited] = useState(false);

  const isTick = pageName == "Powers";
  const symbol = chartTokenSymbol || "BTC";
  const marketName = symbol + "_USD";
  const previousMarketName = usePrevious(marketName);
  // let fromToken = from_token.length == 42? from_token : from_token.substring(0, 42)
  // let toToken = to_token.length == 42? to_token : to_token.substring(0, 42)
  // console.log("see trade input token", fromToken, toToken, fromToken.length, toToken.length)

  const baseTokenAddr = {
    56: [
      { symbol: "USDT", address: "0xF82eEeC2C58199cb409788E5D5806727cf549F9f" },
      { symbol: "USDC", address: "0x8965349fb649A33a30cbFDa057D8eC2C48AbE2A2" },
      { symbol: "WETH", address: "0xF471F7051D564dE03F3736EeA037D2dA2fa189c1" },
    ],
    137: [
      { symbol: "USDT", address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f" },
      { symbol: "USDC", address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174" },
      { symbol: "WETH", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619" }
    ],
  }
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (marketName !== previousMarketName) {
      setChartInited(false);
    }
  }, [marketName, previousMarketName]);

  // 设置chart的横轴range
  const scaleChart = useCallback(() => {
    // const from = Date.now() / 1000 - (7 * 24 * CHART_PERIODS[period]) / 2;
    // const to = Date.now() / 1000;
    // console.log("see trade timescale width", from, to, CHART_PERIODS[period])
    // setVisibleLogicalRange
    // currentChart.timeScale().setVisibleRange({ from, to });
    const num_candles = 100
    const from_time =  Math.floor(Date.now() / 1000) - num_candles
    const to_time =  Math.floor(Date.now() / 1000)
    const test_time = Math.floor(Date.now() / 1000) - (100*CHART_PERIODS[period])
    // let tmp_from = Math.floor(Date.now() / 1000) - (25)
    // let tmp_to = Math.floor(Date.now() / 1000 )
    console.log("see trade timescale width", test_time, to_time)
    currentChart.timeScale().setVisibleRange({ from: test_time, to: to_time });
    // currentChart.timeScale().setVisibleLogicalRange({ from: from_time, to: to_time });
    // currentChart.timeScale().fitContent()
  }, [currentChart, period, currentSeries]);

  // Binance data source
  const [lastCandle, setLastCandle] = useState({})
  const cleaner = useRef()
  useEffect(() => {
    if (!currentSeries)
      return;

    const pairName = `${fromToken}${toToken}`;

    if (cleaner.current) {
      // unsubscribe from previous subscription
      cleaner.current()
      // clear chart candles
      currentSeries.setData([]);
    }

    if (isTick) {
      // subscribe to websocket for the future price update
      const clean = client.ws.candles(pairName, period, (res) => {
        const candleData = {
          time: res.startTime / 1000,   // make it in seconds
          open: res.open,
          high: res.high,
          low: res.low,
          close: res.close
        }
        currentSeries.update(candleData)
        setLastCandle(candleData);

        const ticks = currentSeries.Kn?.Bt?.Xr;
        if (ticks && period != '1m' && period != '1w') {
          getDeltaPriceChange(ticks)
        }
      });
      cleaner.current = clean;
    }

    let sti;
    const fetchPrevAndSubscribe = async () => {
      // before subscribe to websocket, should prefill the chart with existing history, this can be fetched with normal REST request
      // SHOULD DO THIS BEFORE SUBSCRIBE, HOWEVER MOVING SUBSCRIBE TO AFTER THIS BLOCK OF CODE WILL CAUSE THE SUBSCRIPTION GOES ON FOREVER
      // REACT BUG?
      let responseFromTokenData;
      let responseToTokenData;
      let responsePairData = [];

      if (pageName == "StableCoin") {
        responseFromTokenData = await axios.get(`${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${toToken}USDT&interval=${period}`,)
          .then((res) => res.data);
        if (toToken != "USDT") {
          responseToTokenData = await axios.get(`${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${toToken}USDT&interval=${period}`,)
            .then((res) => res.data)
        }
      } else if (pageName == "Option") {
        responseFromTokenData = await axios.get(`${OptionsPriceApi}/option?chainId=${chainId}&symbol=${chartTokenSymbol}&period=${period}`)
          .then((res) => res.data);
      } else if (pageName == "Futures") {
        responseFromTokenData = await axios.get(`${OptionsPriceApi}/futures?chainId=${chainId}&symbol=${chartTokenSymbol}&period=${period}`)
          .then((res) => res.data);
      } else if (pageName == "Trade") {
        console.log("see trade token0 fromToken:", fromToken, "toToken", toToken, "chainId", chainId,`${TradePriceApi}?token0=${fromToken}&token1=${toToken}&chainId=${chainId}&period=${period}`)
        responseFromTokenData = await axios.get(`${TradePriceApi}?token0=${fromToken}&token1=${toToken}&chainId=${chainId}&period=${period}`)
          .then((res) => res.data);
      } else {
        responseFromTokenData = await axios.get(`${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${fromToken}USDT&interval=${period}`,)
          .then((res) => res.data);
      }
      // console.log("trade responseFromTokenData", responseFromTokenData, Object.keys(responseFromTokenData).length)

      if (!Object.keys(responseFromTokenData).length && pageName == 'Trade') {
        console.log("see trade before for, no pair ", responseFromTokenData)
        // setActiveExist(false)
        setHasPair(false)

      } else if (Object.keys(responseFromTokenData).length) {
        setHasPair(true)
        setActiveExist(true)
      }

      for (let i = 0; i < Object.keys(baseTokenAddr[chainId]).length; i++) {
        if (!Object.keys(responseFromTokenData).length ) {
          console.log("see trade in responseFromTokenData is {}")
          if (fromToken != baseTokenAddr[chainId][i]) {
            try {
              responseFromTokenData = await axios.get(`${TradePriceApi}?token0=${activeToken.address}&token1=${baseTokenAddr[chainId][i].address}&chainId=${chainId}&period=${period}`)
                .then((res) => res.data)
              
            } catch (e) {
              console.log(baseTokenAddr[i], " pair does not exist! see trade")
            }
            console.log("see trade try catch responseFromTokenData", responseFromTokenData, baseTokenAddr[chainId][i].symbol, `${TradePriceApi}?token0=${fromToken}&token1=${baseTokenAddr[chainId][i].address}&chainId=${chainId}&period=${period}`)
          }
        }

      }
      if (!responseFromTokenData || !Object.keys(responseFromTokenData).length) {
        console.log("see trade no from pair found ", responseFromTokenData, responseToTokenData)
        setActiveExist(false)
      } else {
        setActiveExist(true)
      }

      // if (fromToken != USDT_Address) {
      //   responseFromTokenData = await axios.get(`${TradePriceApi}?token0=${fromToken}&token1=${USDT_Address}&chainId=${chainId}&period=${period}`)
      //     .then((res) => res.data)
      // } else if (toToken != USDT_Address) {
      //   responseFromTokenData = await axios.get(`${TradePriceApi}?token0=${toToken}&token1=${USDT_Address}&chainId=${chainId}&period=${period}`)
      //     .then((res) => res.data)
      // } else {
      //   //here should include error msg as both from token and to token is USDT
      // }
      console.log("see trade responsefrom data", responseFromTokenData, `${TradePriceApi}?token0=${activeToken.address}&token1=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&chainId=${chainId}&period=${period}`)
      if (activeExist) {
        for (let i = 0; i < responseFromTokenData.length; i++) {
          if (pageName == "Option" || pageName == "Futures" || pageName == "Trade") {
            responsePairData.push({
              time: responseFromTokenData[i].timestamp,
              open: responseFromTokenData[i].o,
              high: responseFromTokenData[i].h,
              low: responseFromTokenData[i].l,
              close: responseFromTokenData[i].c,
            })
          } else if (toToken != "USDT") {
            responsePairData.push({
              time: responseFromTokenData[i].time,
              open: responseFromTokenData[i].open / responseToTokenData[i].open,
              high: responseFromTokenData[i].high / responseToTokenData[i].high,
              low: responseFromTokenData[i].low / responseToTokenData[i].low,
              close: responseFromTokenData[i].close / responseToTokenData[i].close,
            })
          } else {
            responsePairData = responseFromTokenData
          }
        }

        // Binance data is independent of chain, so here we can fill in any chain name
        if (responsePairData && responsePairData[0].time) {
          currentSeries.setData(responsePairData);
        }

        if (pageName == "Option" || pageName == "Futures") {
          let from = responsePairData[responsePairData.length - 1].time
          sti = setInterval(() => {
            axios.get(`${OptionsPriceApi}/${pageName.toLowerCase()}?chainId=${chainId}&symbol=${chartTokenSymbol}&period=1m&from=${from}`)
              .then((res) => {
                for (let i = 0; i < res.data.length; i++) {
                  if (res.data[i].timestamp > from) {
                    currentSeries.update({
                      time: res.data[i].timestamp,
                      open: res.data[i].o,
                      high: res.data[i].h,
                      low: res.data[i].l,
                      close: res.data[i].c,
                    })
                    from = res.data[i].timestamp
                  }
                }
              });
          }, 60000);
        }

        if (!isTick) {
          // getDeltaPriceChange(responsePairData)
        }

        if (!chartInited) {
          scaleChart();
          setChartInited(true);
        }
      }
    }
    fetchPrevAndSubscribe()

    return () => clearInterval(sti)
  }, [currentSeries, fromToken, toToken, period, chainId, chartTokenSymbol])
  ///// end of binance data source

  const getDeltaPriceChange = (data) => {
    let timeNow = getCurrentTimestamp()
    let latestTick; let yesterday;
    let forwardArr = 86400 / CHART_PERIODS[period]
    let arrIndex = 999 - forwardArr
    if (!isTick) {
      latestTick = data[data.length - 1].open;
      yesterday = data[data.length - 1 - forwardArr].open;
    }
    if (isTick) {
      latestTick = data[data.length - 1]?.St[0];
      yesterday = data[data.length - 1 - forwardArr]?.St[0];
    }

    let deltaPercent = ((latestTick - yesterday) / yesterday * 100).toString();
    if (deltaPercent && deltaPercent[0] == "-") {
      setDeltaIsMinus(true)
      let negativeCurrentPrice = latestTick
      let negativePriceChangePercent = deltaPercent.substring(1)
      setCurPrice(parseFloat(negativeCurrentPrice).toFixed(2))
      setPriceChangePercentDelta(parseFloat(negativePriceChangePercent).toFixed(3))
      onChangePrice && onChangePrice(parseFloat(negativeCurrentPrice).toFixed(2), "-" + parseFloat(negativePriceChangePercent).toFixed(3));

    }
    else {
      setDeltaIsMinus(false)
      let positiveCurrentPrice = latestTick
      let positivePricechangePercent = deltaPercent
      setCurPrice(parseFloat(positiveCurrentPrice).toFixed(2))
      setPriceChangePercentDelta(parseFloat(positivePricechangePercent).toFixed(3))
      onChangePrice && onChangePrice(parseFloat(positiveCurrentPrice).toFixed(2), "+" + parseFloat(positivePricechangePercent).toFixed(3));

    }
  }

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
    if (!currentChart) {
      return;
    }
    const resizeChart = () => {
      currentChart.resize(chartRef.current.offsetWidth, 470);
    };
    resizeChart();
    window.addEventListener("resize", resizeChart);
    return () => window.removeEventListener("resize", resizeChart);
  }, [currentChart]);

  const placementChange = e => {
    setPeriod(e.target.value);
  };

  return (
    <div className="ExchangeChart tv" ref={ref} style={{ height: "100%", width: "100%" }}>
      <div className="ExchangeChart-top App-box App-box-border">
        <div className="ExchangeChart-top-inner">
          <div class="grid-container-element">
            <div className="timeSelector" style={{ float: "left" }}>
              <StyledSelect value={period} onChange={placementChange}
                style={{ width: '200%', height: '23px' }}>
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
            </div>
            {/* {deltaIsMinus ?
              <div style={{ float: "right", paddingRight: "1rem", wordSpacing: "0.5rem", color: "#FA3C58" }}>
                ${curPrice} -{priceChangePercentDelta}%
              </div>
              :
              <div style={{ float: "right", paddingRight: "1rem", wordSpacing: "0.5rem", color: '#46E3AE' }}>
                ${curPrice} +{priceChangePercentDelta}%
              </div>
            } */}
          </div>

        </div>
      </div>
      <div className="ExchangeChart-bottom App-box App-box-border" style={{ height: "100%", width: "100%" }}>
        <div className="ExchangeChart-bottom-header">
          <div className="ExchangeChart-bottom-controls">
          </div>
        </div>
        {!currentChart && <Spin />}
        <div className="ExchangeChart-bottom-content" ref={chartRef} style={{ height: "100%", width: "100%" }}></div>
      </div>
    </div>
  );
}
