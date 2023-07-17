import React, { useEffect, useState, useRef, useCallback, useMemo, createElement } from "react";
import { Spin, Radio, Button } from 'antd';
import styled from "styled-components";
import { createChart } from "lightweight-charts";
import {
  CHART_PERIODS,
  formatDateTime,
  timeToTz,
  usePrevious,
} from '@/acy-dex-futures/utils'
import './ExchangeTVChart.css';
import axios from "axios";
import Binance from "binance-api-node";
import Icon from "antd";

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
const deltaApi = 'https://options.acy.finance/api/market-overview'; //for retrieving 24h delta info
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
    // timeFormatter: (businessDayOrTimestamp) => {
    //   return formatDateTime(businessDayOrTimestamp);
    // },
    timescale: {
      // rightOffset: 50,
      // lockVisibleTimeRangeOnResize: !1,
    }
    // timeFormatter: () => {
    //   const currentLocalDate = new Date(Date.now());
    //   return timeToTz(currentLocalDate, Intl.DateTimeFormat().resolvedOptions().timeZone);
    // },
    // localization: {
    //   dateFormat: 'MM/dd/yy',
    //   locale: 'en-US',
    // },
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
    crosshairMarkerVisible: true,
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
    // chainId,
    pageName,
    //for Future, Option (and Powers) page
    activeSymbol,
    //for trade page
    token0Addr,
    token1Addr,
    // fromTokenAddr,
    // toTokenAddr,
    activeToken,
    hasPair,
    setHasPair,
    activeExist,
    setActiveExist,
    //for 24h change
    setCurPrice,
    setPriceDeltaPercent,
    setDailyHigh,
    setDailyLow,
    setDailyVol,
  } = props

  // TODO: ARBITRUM TESTNET TEMP DEV CONFIG
  let chainId = 80001

  if (!activeSymbol) {
    return null;
  }

  const [currentChart, setCurrentChart] = useState();
  const [currentSeries, setCurrentSeries] = useState();
  const [currentChartSeriesInitDone, setCurrentChartSeriesInitDone] = useState(false);
  const [period, setPeriod] = useState('5m');
  const [hoveredCandlestick, setHoveredCandlestick] = useState();
  const [chartInited, setChartInited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sti_1m = useRef(null);
  const sti_timescale = useRef(null);
  const ref = useRef(null);
  const chartRef = useRef(null);

  const tooltipDiv = document.createElement("div");
  tooltipDiv.className = pageName === "Powers" ? "tooltipLong" : "tooltip";

  const isTick = pageName == "Powers";
  const symbol = activeSymbol || "BTC";
  const isReciprocal = token0Addr < token1Addr; // check if trade candles need division or not

  const fromTokenAddr = token0Addr < token1Addr ? token0Addr : token1Addr
  const toTokenAddr = token0Addr < token1Addr ? token1Addr : token0Addr
  const marketName = symbol + "_USD";
  const previousMarketName = usePrevious(marketName);
  const tzOffset = new Date(Date.now()).getTimezoneOffset() * 60 //using tzoffset to directly change candle timestamp to show correct chart x-axis
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

  useEffect(() => {
    get24Change();
  }, [])


  useEffect(() => {
    if (localStorage.getItem("sti_1m")) {
      clearInterval(localStorage.getItem("sti_1m"))
    }
    if (localStorage.getItem("sti_timescale")) {
      clearInterval(localStorage.getItem("sti_timescale"))
    }
  }, [])

  useEffect(() => {
    if (marketName !== previousMarketName) {
      setChartInited(false);
    }
  }, [marketName, previousMarketName]);

  // 设置chart的横轴range
  const scaleChart = useCallback(() => {
    if (!activeExist) {
      return
    }
    // const from = Date.now() / 1000 - (7 * 24 * CHART_PERIODS[period]) / 2;
    // const to = Date.now() / 1000;
    // setVisibleLogicalRange
    // currentChart.timeScale().setVisibleRange({ from, to });
    const num_candles = 100
    const from_time = Math.floor(Date.now() / 1000) - num_candles
    const to_time = Math.floor(Date.now() / 1000)
    //how many candles shown in chart at init
    const test_time = Math.floor(Date.now() / 1000) - (60 * CHART_PERIODS[period])
    // let tmp_from = Math.floor(Date.now() / 1000) - (25)
    // let tmp_to = Math.floor(Date.now() / 1000 )
    if (currentChart?.timeScale()?.setVisibleRange) {
      currentChart.timeScale()?.setVisibleRange({ from: test_time - tzOffset, to: to_time - tzOffset });
    }
    // currentChart.timeScale().setVisibleLogicalRange({ from: from_time, to: to_time });
    // currentChart.timeScale().fitContent()
  }, [currentChart, period, currentSeries, token0Addr, token1Addr]);

  // Binance data source
  const [lastCandle, setLastCandle] = useState({})
  const cleaner = useRef()

  useEffect(() => {
    if (!currentSeries || !currentChartSeriesInitDone) {
      return;
    }

    setIsLoading(true)
    currentSeries.setData([]);

    const pairName = `${fromTokenAddr}${toTokenAddr}`;

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
          time: res.startTime / 1000,
          open: res.open,
          high: res.high,
          low: res.low,
          close: res.close
        }
        currentSeries.update(candleData)
        setLastCandle(candleData);

        const ticks = currentSeries.Kn?.Bt?.Xr;
        if (ticks && period != '1m' && period != '1w') {
          // getDeltaPriceChange(ticks)
          // get24Change()
        }
      });
      cleaner.current = clean;
    }

    const fetchPrevAndSubscribe = async () => {
      // before subscribe to websocket, should prefill the chart with existing history, this can be fetched with normal REST request
      // SHOULD DO THIS BEFORE SUBSCRIBE, HOWEVER MOVING SUBSCRIBE TO AFTER THIS BLOCK OF CODE WILL CAUSE THE SUBSCRIPTION GOES ON FOREVER
      // REACT BUG?
      let responseFromTokenData;
      let responseToTokenData;
      let responsePairData = [];
      if (pageName == "StableCoin") {
        responseFromTokenData = await axios.get(`${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${toTokenAddr}USDT&interval=${period}`,)
          .then((res) => res.data);
        if (toTokenAddr != "USDT") {
          responseToTokenData = await axios.get(`${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${toTokenAddr}USDT&interval=${period}`,)
            .then((res) => res.data)
        }
      } else if (pageName == "Option") {
        responseFromTokenData = await axios.get(`${OptionsPriceApi}/option?chainId=${chainId}&symbol=${activeSymbol}&period=${period}`)
          .then((res) => res.data);
      } else if (pageName == "Powers") {
        responseFromTokenData = await axios.get(`${OptionsPriceApi}/power?chainId=${chainId}&symbol=${activeSymbol}&period=${period}`)
          .then((res) => res.data);
      } else if (pageName == "Futures") {
        responseFromTokenData = await axios.get(`${OptionsPriceApi}/futures?chainId=${chainId}&symbol=${activeSymbol}&period=${period}`)
          .then((res) => res.data);
      } else if (pageName == "Trade") {
        responseFromTokenData = await axios.get(`${TradePriceApi}?token0=${fromTokenAddr}&token1=${toTokenAddr}&chainId=${chainId}&period=${period}`) 
          .then((res) => res.data);
      } else {
        responseFromTokenData = await axios.get(`${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${fromTokenAddr}USDT&interval=${period}`,)
          .then((res) => res.data);
      }

      if (pageName === 'Trade') {
        if (!Object.keys(responseFromTokenData).length) {
          // setActiveExist(false)
          setHasPair(false)
        } else if (Object.keys(responseFromTokenData).length) {
          setHasPair(true)
          setActiveExist(true)
        }
        for (let i = 0; i < Object.keys(baseTokenAddr[chainId]).length; i++) {
          if (!Object.keys(responseFromTokenData).length) {
            if (fromTokenAddr != baseTokenAddr[chainId][i]) {
              try {
                responseFromTokenData = await axios.get(`${TradePriceApi}?token0=${activeToken.address}&token1=${baseTokenAddr[chainId][i].address}&chainId=${chainId}&period=${period}`)
                  .then((res) => res.data)

              } catch (e) {
                console.log(baseTokenAddr[i], " pair does not exist! see trade")
              }
            }
          }
        }
        if (!Object.keys(responseFromTokenData).length) {
          setActiveExist(false)
          setHasPair(false)
        } else {
          setActiveExist(true)
        }
      }
      //merging, not sure if this can be here or not
      // Binance data is independent of chain, so here we can fill in any chain name
      // if (responsePairData && responsePairData[0].time) {
      //   currentSeries.setData(responsePairData);
      //   setIsLoading(false)
      // }

      // if (fromTokenAddr != USDT_Address) {
      //   responseFromTokenData = await axios.get(`${TradePriceApi}?token0=${fromTokenAddr}&token1=${USDT_Address}&chainId=${chainId}&period=${period}`)
      //     .then((res) => res.data)
      // } else if (toTokenAddr != USDT_Address) {
      //   responseFromTokenData = await axios.get(`${TradePriceApi}?token0=${toTokenAddr}&token1=${USDT_Address}&chainId=${chainId}&period=${period}`)
      //     .then((res) => res.data)
      // } else {
      //   //here should include error msg as both from token and to token is USDT
      // }

      // set pair data only when from data exists
      if (activeExist && pageName == 'Trade' || pageName != 'Trade') {
        for (let i = 0; i < responseFromTokenData.length; i++) {
          if (pageName == "Option" || pageName == "Powers" || pageName == "Futures" || (pageName === "Trade" && !isReciprocal))  {
            responsePairData.push({
              time: responseFromTokenData[i].timestamp - tzOffset,
              open: responseFromTokenData[i].o,
              high: responseFromTokenData[i].h,
              low: responseFromTokenData[i].l,
              close: responseFromTokenData[i].c,
            })
          }
          else if (pageName === "Trade" && isReciprocal) {
            responsePairData.push({
              time: responseFromTokenData[i].timestamp - tzOffset,
              open: responseFromTokenData[i].o === 0 ? 0 : 1 / responseFromTokenData[i].o,
              high: responseFromTokenData[i].o === 0 ? 0 : 1 / responseFromTokenData[i].h,
              low: responseFromTokenData[i].o === 0 ? 0 : 1 / responseFromTokenData[i].l,
              close: responseFromTokenData[i].o === 0 ? 0 : 1 / responseFromTokenData[i].c,
            })
          }
          // else if (toTokenAddr != "USDT") {
          //   responsePairData.push({
          //     time: responseFromTokenData[i].time - tzOffset,
          //     open: responseFromTokenData[i].open / responseToTokenData[i].open,
          //     high: responseFromTokenData[i].high / responseToTokenData[i].high,
          //     low: responseFromTokenData[i].low / responseToTokenData[i].low,
          //     close: responseFromTokenData[i].close / responseToTokenData[i].close,
          //   })
          // } 
          else {
            responsePairData.push({
              time: responseFromTokenData[i].time - tzOffset,
              open: responseFromTokenData[i].open,
              high: responseFromTokenData[i].high,
              low: responseFromTokenData[i].low,
              close: responseFromTokenData[i].close,
            })
            // responsePairData = responseFromTokenData
          }
        }
        // Binance data is independent of chain, so here we can fill in any chain name
        if (responsePairData && responsePairData[0]?.time) {
          currentSeries.setData(responsePairData);
          setIsLoading(false)
          setCurPrice(parseFloat(responsePairData[responsePairData.length - 1].close).toFixed(2))
        }

      }
      if (pageName == "Option" || pageName == "Futures") {
        updateInterval();
      }

      if (!isTick) {
        // getDeltaPriceChange(responsePairData)
        // get24Change()
      }

      if (!chartInited) {
        scaleChart();
        setChartInited(true);
      }
    }
    fetchPrevAndSubscribe()
    get24Change();
    // clearInterval(sti_timescale);
  }, [currentChartSeriesInitDone, fromTokenAddr, toTokenAddr, period, chainId, activeSymbol])
  ///// end of binance data source

  const updateInterval = () => {
    if (!currentSeries || !currentChartSeriesInitDone) {
      return;
    }

    if (sti_1m.current != null) {
      clearInterval(sti_1m.current);
    }
    const from = currentSeries.Kn?.Bt?.Xr[currentSeries.Kn?.Bt?.Xr.length - 1]?.tr?.So
    sti_1m.current = setInterval(() => {
      axios.get(`${OptionsPriceApi}/${pageName.toLowerCase()}?chainId=${chainId}&symbol=${activeSymbol}&period=1m`)
        .then((res) => {
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].timestamp - tzOffset > from) {
              currentSeries.update({
                time: res.data[i].timestamp - tzOffset,
                open: res.data[i].o,
                high: res.data[i].h,
                low: res.data[i].l,
                close: res.data[i].c,
              })
              from = res.data[i].timestamp
            }
          }
          setCurPrice(parseFloat(res.data[res.data.length - 1].c).toFixed(2))
        });
      // }, 60000);
    }, 15000);
    localStorage.setItem("sti_1m", sti_1m.current)

    if (sti_timescale.current != null) {
      clearInterval(sti_timescale.current);
    }
    sti_timescale.current = setInterval(() => {
      get24Change()
    }, CHART_PERIODS[period] * 1000);
    localStorage.setItem("sti_timescale", sti_timescale.current)

  }


  //for test 24h data retrieval, 24h data will be replaced by data from backend
  const get24Change = async () => {
    let tmpPageName //to cope with different api names for future
    if (pageName == 'Futures') {
      tmpPageName = 'futureMarket'
    } else if (pageName == 'Option') {
      tmpPageName = 'optionMarket'
    }
    else if (pageName == 'Powers') {
      tmpPageName = 'powerMarket'
    }
    axios.get(`${deltaApi}`)
      .then((res) => {
        for (const [page, tokens] of Object.entries(res.data)) {
          if (page == tmpPageName) {
            for (const [index, data] of Object.entries(tokens)) {
              if (data.symbol === activeSymbol.toString()) {
                setDailyHigh(parseFloat(data.highestPrice).toFixed(3))
                setDailyLow(parseFloat(data.lowestPrice).toFixed(3))
                setPriceDeltaPercent(parseFloat(data.priceVariation * 100).toFixed(3))
                setDailyVol(parseFloat(data.volume).toFixed(3))
              }
            }
          }
        }
      });
  }

  // 设置chart的鼠标移动时的回调函数。evt是event的意思。
  const onCrosshairMove = useCallback((evt) => {
    if (!evt.time) {
      setHoveredCandlestick(null);
      tooltipDiv.style.display = "none";
      return;
    }

    // 这个 for loop + break 为什么这么写我还没搞懂
    for (const point of evt.seriesPrices.values()) {
      setHoveredCandlestick((hoveredCandlestick) => {
        if (hoveredCandlestick && hoveredCandlestick.time === evt.time) {
          let date = new Date((hoveredCandlestick.time + tzOffset) * 1000)
          let dateFormat = date.getHours() + ":" + date.getMinutes() + ", " + date.toLocaleDateString();
          tooltipDiv.innerText = `${dateFormat}\nhigh: ${hoveredCandlestick.high.toFixed(4)}\nlow: ${hoveredCandlestick.low.toFixed(4)}\nopen: ${hoveredCandlestick.open.toFixed(4)}\nclose: ${hoveredCandlestick.close.toFixed(4)}`;
          return hoveredCandlestick;
        }
        tooltipDiv.style.display = "block";
        tooltipDiv.style.left = `${evt.point.x}px`;
        tooltipDiv.style.top = `${evt.point.y}px`;
        // rerender optimisations
        return {
          time: evt.time,
          ...point,
        };
      });
      break;
    }

  }, [setHoveredCandlestick]
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

    chartRef.current.appendChild(tooltipDiv);

    chart.subscribeCrosshairMove(onCrosshairMove);

    const series = chart.addCandlestickSeries(getSeriesOptions());
    setCurrentChart(chart);
    setCurrentSeries(series);
    setCurrentChartSeriesInitDone(true);
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
                style={{ width: '400%', height: '23px' }}>
                <Radio.Button value="1m" style={{ width: '9%', textAlign: 'center' }}>1m</Radio.Button>
                <Radio.Button value="5m" style={{ width: '9%', textAlign: 'center' }}>5m</Radio.Button>
                <Radio.Button value="15m" style={{ width: '9%', textAlign: 'center' }}>15m</Radio.Button>
                <Radio.Button value="1h" style={{ width: '9%', textAlign: 'center' }}>1h</Radio.Button>
                <Radio.Button value="1d" style={{ width: '9%', textAlign: 'center' }}>1D</Radio.Button>
                <Radio.Button value="1w" style={{ width: '9%', textAlign: 'center' }}>1W</Radio.Button>
              </StyledSelect>
            </div>
          </div>

        </div>
      </div>
      <div className="ExchangeChart-bottom App-box App-box-border" style={{ height: "100%", width: "100%" }}>
        <div className="ExchangeChart-bottom-header">
          <div className="ExchangeChart-bottom-controls">
          </div>
        </div>
        {isLoading && <Spin style={{ width: "100%", marginBottom: "-40%" }} />}
        <div className="ExchangeChart-bottom-content" ref={chartRef} style={{ height: "100%", width: "100%" }}></div>
      </div>
    </div>
  );
}
