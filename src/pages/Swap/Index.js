import { useWeb3React } from '@web3-react/core';
import React, { Component, useState, useEffect, useRef, useMemo, useCallback } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { connect, history } from 'umi';
import { Button, Row, Col, Icon, Skeleton, Card } from 'antd';
import {
  AcyCard,
  AcyIcon,
  AcyPeriodTime,
  AcyTabs,
  AcyModal,
  AcyInput,
  AcyCoinItem,
  AcyPriceChart,
  AcyConfirm,
  AcyApprove,
} from '@/components/Acy';
import { ARBITRUM_DEFAULT_COLLATERAL_SYMBOL } from '@/acy-dex-futures/utils';
import Media from 'react-media';
import AcyPieChart from '@/components/AcyPieChartAlpha';
import AcyRoutingChart from '@/components/AcyRoutingChart';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import { uniqueFun } from '@/utils/utils';
import { getTransactionsByAccount, appendNewSwapTx } from '@/utils/txData';
import { getTokenContract } from '@/acy-dex-swap/utils/index';
import { fetchGeneralTokenInfo, marketClient, fetchTokenDaySimple } from '../Market/Data/index.js';
import SwapComponent from '@/components/SwapComponent';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import PerpetualTabs from '@/components/PerpetualComponent/components/PerpetualTabs';
import axios from 'axios';
import moment from 'moment';
import StakeHistoryTable from './components/StakeHistoryTable';
import styles from './styles.less';
import { columnsPool } from '../Dao/Util.js';
import styled from "styled-components";
import { API_URL, useConstantLoader, getGlobalTokenList, constantInstance, getGlobalTokenPlatformList } from '@/constants';
import { fetcher, getInfoTokens, expandDecimals, useLocalStorageByChainId } from '@/acy-dex-futures/utils';
import { useConnectWallet } from '@/components/ConnectWallet';
import useSWR from 'swr';
import { TxFetcher } from '@/utils/utils';
import SankeyGraph from './components/SankeyGraph';
// import ExchangeTVChart from '@/pages/Perpetual/components/ExchangeTVChart';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import { ethers } from 'ethers'
import Reader from '@/acy-dex-futures/abis/ReaderV2.json'



const { AddressZero } = ethers.constants
const { AcyTabPane } = AcyTabs;
function getTIMESTAMP(time) {
  var date = new Date(time);
  var year = date.getFullYear(time);
  var month = ("0" + (date.getMonth(time) + 1)).substr(-2);
  var day = ("0" + date.getDate(time)).substr(-2);
  var hour = ("0" + date.getHours(time)).substr(-2);
  var minutes = ("0" + date.getMinutes(time)).substr(-2);
  var seconds = ("0" + date.getSeconds(time)).substr(-2);

  return hour + ":" + minutes + ":" + seconds;
  // return `${year}-${month}-${day}`;

}
function abbrNumber(number) {
  const THOUSAND = 0;
  const MILLION = 1;

  let currentDivision = -1;
  let result = '';
  let tempNumber = number;

  if (number >= 1000) {
    tempNumber /= 1000;
    currentDivision = 0;
  }

  if (number >= 1000000) {
    tempNumber /= 1000;
    currentDivision = 1;
  }

  switch (currentDivision) {
    case 0:
      result = `${tempNumber.toFixed(2)}k`;
      break;
    case 1:
      result = `${tempNumber.toFixed(2)}m`;
      break;
    default:
      result = `${number.toFixed(2)}`;
      break;
  }

  return result;
}
const defaultData = [
  ['2000-06-05', 116],
  ['2000-06-06', 129],
  ['2000-06-07', 135],


];
const StyledCard = styled(AcyCard)`
  background: transparent;

  .ant-card-bordered {
    border: none;
  }
  .ant-card-head-title {
    padding: 0;
  }
    
`;


const Swap = props => {
  const { account, library, chainId, tokenList: supportedTokens, farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader();

  // console.log("hereim befoere swap coinlist");
  const coinList = getGlobalTokenList()
  // console.log("hereyou see tokens coinlist", coinList)
  const platformList = getGlobalTokenPlatformList()
  // console.log("hereyou see tokens platformlist", platformList)
  // console.log("hereim swap coinlist successful", coinList);
  ////console.log("@/ inside swap:", supportedTokens, apiUrlPrefix)

  // 当 chainId 发生切换时，就更新 url
  // useEffect(() => {
  //   let chainName = "BSC";
  //   switch(chainId) {
  //     case 56: 
  //       chainName = "BSC"; break;
  //     case 137: 
  //       chainName = "Polygon"; break;
  //     default: 
  //       chainName = "BSC";
  //   }
  //   history.push({
  //     pathname: history.location.pathname,
  //     query: {
  //       chain: chainName,
  //     },
  //   })
  // }, [chainId])

  const [pricePoint, setPricePoint] = useState(0);
  const [pastToken1, setPastToken1] = useState('ETH');
  const [pastToken0, setPastToken0] = useState('USDC');
  const [isReceiptObtained, setIsReceiptObtained] = useState(false);
  const [routeData, setRouteData] = useState([]);
  const [format, setFormat] = useState('h:mm:ss a');
  const [activeToken1, setActiveToken1] = useState(supportedTokens[1]);
  const [activeToken0, setActiveToken0] = useState(supportedTokens[0]);
  const [activeAbsoluteChange, setActiveAbsoluteChange] = useState('+0.00');
  const [activeRate, setActiveRate] = useState('Not available');
  const [range, setRange] = useState('1D');
  const [chartData, setChartData] = useState([]);
  const [alphaTable, setAlphaTable] = useState('Line');
  const [visibleLoading, setVisibleLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleConfirmOrder, setVisibleConfirmOrder] = useState(false);
  const [transactionList, setTransactionList] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [transactionNum, setTransactionNum] = useState(0);
  const { activate } = useWeb3React();

  const { perpetuals } = useConstantLoader()
  const readerAddress = perpetuals.getContract("Reader")
  const vaultAddress = perpetuals.getContract("Vault")
  const nativeTokenAddress = perpetuals.getContract("NATIVE_TOKEN")

  const tokens = constantInstance.perpetuals.tokenList;
  const whitelistedTokens = tokens.filter(token => token.symbol !== "USDG");
  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address);

  const defaultTokenSelection = useMemo(() => ({
    ["Pool"]: {
      from: AddressZero,
      to: getTokenBySymbol(tokens, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL).address,
      // to: getTokenBySymbol(tokens, 'BTC').address,
    },
    ["Long"]: {
      from: AddressZero,
      to: AddressZero,
    },
    ["Short"]: {
      from: getTokenBySymbol(tokens, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL).address,
      // from: getTokenBySymbol(tokens, 'BTC').address,
      to: AddressZero,
    }
  }), [chainId, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL])


  const tokenAddresses = tokens.map(token => token.address)
  const [tokenSelection, setTokenSelection] = useLocalStorageByChainId(chainId, "Exchange-token-selection-v2", defaultTokenSelection)


  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([chainId, readerAddress, "getTokenBalances", account], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
  })
  const { data: vaultTokenInfo, mutate: updateVaultTokenInfo } = useSWR([chainId, readerAddress, "getFullVaultTokenInfo"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, expandDecimals(1, 18), whitelistedTokenAddresses]),
  })
  const { data: fundingRateInfo, mutate: updateFundingRateInfo } = useSWR(account && [chainId, readerAddress, "getFundingRates"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, whitelistedTokenAddresses]),
  })

  // useSWR hook example - needs further implementation in backend
  const txListUrl = `${apiUrlPrefix}/txlist/all?`
  const { data: txList, mutate: updateTxList } = useSWR([txListUrl], {
    fetcher: TxFetcher(account),
    // refreshInterval: 1000,
  })

  const txref = useRef();
  txref.current = txList;


  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo);
  console.log("hereim swap infotokens", infoTokens)

  const setToTokenAddress = useCallback((selectedSwapOption, address) => {
    const newTokenSelection = JSON.parse(JSON.stringify(tokenSelection))
    newTokenSelection[selectedSwapOption].to = address
    setTokenSelection(newTokenSelection)
  }, [tokenSelection, setTokenSelection])

  //   console.log("hereim see coinList", coinList)  

  // function getTokenBySymbol(tokenlist, symbol) {
  //   console.log("hereim see gettokenbysymbol tokenlist.symbol, symbol", tokenlist, symbol)
  //   for (let i = 0; i < tokenlist.length; i++) {
  //     if (tokenlist[i].symbol === symbol) {
  //       return tokenlist[i]
  //     }
  //   }
  //   return undefined
  // }


  //   const [tokenSelection, setTokenSelection] = useLocalStorageByChainId(chainId, "Exchange-token-selection-v2", defaultTokenSelection)
  //   const [swapOption, setSwapOption] = useLocalStorageByChainId(chainId, 'Swap-option-v2', "Long")

  //   const setFromTokenAddress = useCallback((selectedSwapOption, address) => {
  //     const newTokenSelection = JSON.parse(JSON.stringify(tokenSelection))
  //     newTokenSelection[selectedSwapOption].from = address
  //     setTokenSelection(newTokenSelection)
  //   }, [tokenSelection, setTokenSelection])

  //   const setToTokenAddress = useCallback((selectedSwapOption, address) => {
  //     // console.log("hereim see tokenSelection", tokenSelection)
  //     const newTokenSelection = JSON.parse(JSON.stringify(tokenSelection))
  //     newTokenSelection[selectedSwapOption].to = address
  //     setTokenSelection(newTokenSelection)
  //   }, [tokenSelection, setTokenSelection])

  //   const fromTokenAddress = tokenSelection[swapOption].from
  //   const toTokenAddress = tokenSelection[swapOption].to

  function getTokenBySymbol(tokenlist, symbol) {
    for (let i = 0; i < tokenlist.length; i++) {
      if (tokenlist[i].symbol === symbol) {
        return tokenlist[i]
      }
    }
    return undefined
  }


  ////console.log('printing tx lists', txList);

  // //console.log('printing tx lists',txList)
  useEffect(() => {
    library.on('block', (blockNum) => {
      ////console.log('updating tx lists');
      updateTxList();
    })
    return () => {
      library.removeAllListeners('block');
    }
  }, [library])
  // ------------------

  useEffect(() => {
    if (!supportedTokens) return

    //console.log("resetting page states")
    // reset on chainId change => supportedTokens change
    setPricePoint(0);
    setPastToken1('ETH');
    setPastToken0('USDC');
    setIsReceiptObtained(false);
    setRouteData([]);
    setFormat('h:mm:ss a');
    setActiveToken1(supportedTokens[1]);
    setActiveToken0(supportedTokens[0]);
    setActiveAbsoluteChange('+0.00');
    setActiveRate('Not available');
    setRange('1D');
    setChartData([]);
    setAlphaTable('Line');
    setVisibleLoading(false);
    setVisible(false);
    setVisibleConfirmOrder(false);
    setTransactionList([]);
    setTableLoading(true);
    setTransactionNum(0);
  }, [chainId])

  const refContainer = useRef();
  refContainer.current = transactionList;

  // connect to provider, listen for wallet to connect
  const connectWalletByLocalStorage = useConnectWallet();
  useMemo(() => {
    if (!account) {
      //console.log('ymj connect');
      connectWalletByLocalStorage();
    }
    //console.log('ymj connect', account);
    getTransactionsByAccount(account, library, 'SWAP').then(data => {
      ////console.log("found this tx dataa::::::", data);
      setTransactionList(data);
      if (account) setTableLoading(false);
    })
  }, [account]);





  // 时间段选择
  const onhandPeriodTimeChoose = periodTimeName => {
    let pt;
    switch (periodTimeName) {
      case '24h': pt = '1D'; break;
      case 'Max': pt = '1M'; break;
    }

    let _format = 'h:mm:ss a';
    switch (pt) {
      case '1D':
        _format = 'h:mm:ss a';
        break;
      case '1W':
        _format = 'ha DD MMM';
        break;
      case '1M':
        _format = 'DD/MM';
        break;
      default:
        _format = 'h:mm:ss a';
    }
    setRange(pt);
    setFormat(_format);
  };

  // useEffect(() => {
  //   getPrice();
  //   // 还原存储的交易信息
  //   const {
  //     transaction: { transactions },
  //     dispatch,
  //   } = props;
  //   let newData = [...transactions];
  //   if (localStorage.getItem('transactions')) {
  //     newData.push(...JSON.parse(localStorage.getItem('transactions')));
  //   }
  //   // 更新数据
  //   dispatch({
  //     type: 'transaction/addTransaction',
  //     payload: {
  //       transactions: [...uniqueFun(newData, 'hash')],
  //     },
  //   });
  // }, [])

  // connect to page model, changes will be reflected in SwapComponent
  // useEffect(() => {
  //   dispatch({
  //     type: "swap/updateTokens",
  //     payload: {
  //       token0: activeToken0,
  //       token1: activeToken1
  //     }
  //   });
  //   getPrice();
  // }, [activeToken0, activeToken1, format]);

  //get chart data the interval is 5 min

  useEffect(() => {
    dispatch({
      type: "swap/updateTokens",
      payload: {
        token0: activeToken0,
        token1: activeToken1
      }
    });
    const dayLength = 24 * 60 / 5;
    // const dayLength = 5;
    let reverseFlag = false;
    // timeMark one record the latest transaction time
    // timeMark two recort the oldest transaction time
    let timeMark = 0;
    let timeMark2 = 0;
    let timeData = [];
    let A = activeToken0.symbol;
    let B = activeToken1.symbol;
    if (A > B) {
      let temp = B;
      B = A;
      A = temp;
      reverseFlag = true;
    }
    ////console.log(A,B);
    ////console.log("fetching the swap Rate data!!!!!!!!!!!!!!!!");
    axios.get(
      `${apiUrlPrefix}/chart/getRate`, { params: { token0: A, token1: B } }
    ).then(res => {
      //console.log("response",res.data);
      if (res.data) {
        const historyData = res.data.History;
        timeMark = historyData[historyData.length - 1].time;
        timeMark2 = historyData[0].time

        let date = new Date(timeMark * 60 * 1000);
        // var options = { weekday: 'long'};
        // setActiveRate(new Intl.DateTimeFormat('en-US', options).format(date));

        for (let i = 0; i < historyData.length; i++) {

          while (i < 0) i++;
          const element = historyData[i];
          // timeData.push(element.time);
          timeData.push(element);
          // var time = element.time*60*1000
          // var date = new Date(time);
          // var dateString = date.toString();
          // //console.log("Time : " + date);

        };

        //add 0 to the chartdata array
        const addData = []
        for (let i = timeMark - 24 * 60; i < timeMark2; i = i + 5) {
          let temp2 = [(i * 60 * 1000), 0];
          addData.push(temp2);
        }
        //console.log("timemark",timeMark - 24*60,timeMark2);
        //console.log("addData",addData);


        // drawing chart
        //console.log("timeData",timeData);
        const tempChart = [];
        for (let a = 0; a < timeData.length; a++) {
          if (timeData[a].time > timeMark - 24 * 60) {
            const time = timeData[a].time * 60 * 1000;
            let date = new Date(time);
            let dateString = date.getMinutes();
            let temp;
            if (reverseFlag)
              temp = [time, 1.0 / timeData[a].exchangeRate];
            else
              temp = [time, timeData[a].exchangeRate];
            tempChart.push(temp);

          }
        }
        //console.log("CHARTING!!!!!!!!!!!",tempChart);

        const finalChartData = addData.concat(tempChart);
        //console.log("finalChartData", finalChartData);
        setChartData(finalChartData);
      }
      else {
        setActiveRate("No this pair data yet");
        setChartData([]);
      }

    })


    //console.log("chartdata");
    //console.log(timeData);

  }, [activeToken0, activeToken1]);
  // workaround way to get USD price (put token1 as USDC)
  // NEEDS ETHEREUM ADDRESS, RINKEBY DOES NOT WORK HERE
  const getRoutePrice = (token0Address, token1Address) => {
    if (!token0Address || !token1Address) return;

    axios
      .post(
        `${apiUrlPrefix}/chart/swap?token0=${token0Address}&token1=${token1Address}&range=1D`
      )
      .then(data => {
        //console.log(data);
        // const { swaps } = data.data.data;
        // const lastDataPoint = swaps[swaps.length - 1];
        // //console.log('ROUTE PRICE POINT', lastDataPoint);
        // setState({
        //   pricePoint: lastDataPoint.rate,
        // });
      });
  }

  // const getPrice = () => {
  //   // FIXME: current api doesn't take token0/1 sequence into consideration, always return ratio based on alphabetical order of token symbol
  //   axios.post(
  //     `${apiUrlPrefix}/chart/swap?token0=${activeToken0.addressOnEth}&token1=${activeToken1.addressOnEth}&range=${range}`
  //     // `https://localhost:3001/api/chart/swap?token0=${activeToken0.addressOnEth}&token1=${activeToken1.addressOnEth}&range=${range}`

  //   )
  //     .then(data => {
  //       let { swaps } = data.data.data;
  //       // invert the nominator and denominator when toggled on the token image (top right of the page)
  //       if (activeToken1.symbol < activeToken0.symbol) {
  //         //console.log("swapping token position")
  //         swaps = Array.from(swaps, o => ({ ...o, "rate": 1 / o.rate }))
  //       }
  //       //console.log(activeToken0.symbol, activeToken1.symbol)
  //       //console.log(swaps)
  //       const lastDataPointIndex = swaps.length - 1;

  //       let precisionedData = swaps.map(item => [item.time, item.rate.toFixed(3)])
  //       // add precision if the ratio is close to zero
  //       if (Math.max(...precisionedData.map(item => item[1])) === 0) {
  //         precisionedData = swaps.map(item => [item.time, item.rate.toFixed(6)])
  //       }
  //       setChartData(precisionedData);
  //       setActiveRate(precisionedData[lastDataPointIndex][1]);
  //     })
  //     .catch(e => {
  //       setChartData([]);
  //       setActiveRate('No data');
  //     });
  // }

  const lineTitleRender = () => {
    let token0logo = null;
    let token1logo = null;
    for (let j = 0; j < supportedTokens.length; j++) {
      if (activeToken0.symbol === supportedTokens[j].symbol) {
        token0logo = supportedTokens[j].logoURI;
      }
      if (activeToken1.symbol === supportedTokens[j].symbol) {
        token1logo = supportedTokens[j].logoURI;
      }
    }

    const swapTokenPosition = () => {
      const tempSwapToken = activeToken0;
      setActiveToken0(activeToken1);
      setActiveToken1(tempSwapToken);
    }
    //parse input data from transaction list


    return [
      <div style={{ width: "100%" }}>
        <div className={styles.maintitle}>
          <div className={styles.lighttitle} style={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }} onClick={swapTokenPosition}>
            <img
              src={token0logo}
              alt=""
              style={{ width: 24, maxWidth: '24px', maxHeight: '24px', marginRight: '0.25rem', marginTop: '0.1rem' }}
            />
            <img
              src={token1logo}
              alt=""
              style={{ width: 24, maxHeight: '24px', marginRight: '0.5rem', marginTop: '0.1rem' }}
            />
            <span>
              {activeToken0.symbol}&nbsp;/&nbsp;{activeToken1.symbol}
            </span>

          </div>

        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className={styles.secondarytitle}>
            <span className={styles.lighttitle}>{activeRate}</span>{' '}
            <span className={styles.percentage}>{activeAbsoluteChange}</span>
          </div>
          <AcyPeriodTime
            onhandPeriodTimeChoose={onhandPeriodTimeChoose}
            className={styles.pt}
            // times={['1D', '1W', '1M']}
            // times={['24h', 'Max']}
            times={['24h']}

          />
        </div>
      </div>,
    ];
  };

  const selectTime = pt => {
    const dateSwitchFunctions = {
      Line: () => {
        setAlphaTable('Line');
      },
      Bar: () => {
        setAlphaTable('Bar');
      },
    };

    dateSwitchFunctions[pt]();
  };



  // 选择Coin
  const onClickCoin = () => {
    setVisible(true);
  };

  const onCancel = () => {
    setVisible(false);
  };

  const onHandModalConfirmOrder = falg => {
    setVisibleConfirmOrder(!!falg);
  };

  const getTokenSymbol = async (address, library, account) => {
    const tokenContract = getTokenContract(address, library, account);
    return tokenContract.symbol();
  };

  const getTokenDecimal = async (address, library, account) => {
    const tokenContract = getTokenContract(address, library, account);
    return tokenContract.decimals();
  };

  const updateTransactionList = async (receipt) => {
    setTableLoading(true);
    //console.log("updating list");
    appendNewSwapTx(refContainer.current, receipt, account, library).then((data) => {
      if (data && data.length > 0) setTransactionList(data);
      setTableLoading(false);
    })

  }


  const onGetReceipt = async (receipt, library, account) => {
    //console.log('RECEIPT', receipt);
    updateTransactionList(receipt);
  };
  const {
    isMobile,
    transaction: { transactions },
    swap: { token0, token1 },
    dispatch
  } = props;

  const updateActiveChartData = (data, dataIndex) => {
    const prevData = dataIndex === 0 ? 0 : chartData[dataIndex - 1][1];
    const absoluteChange = (dataIndex === 0 ? 0 : data - prevData).toFixed(3);
    const formattedAbsChange = absoluteChange > 0 ? "+" + absoluteChange : absoluteChange;
    setActiveRate(data.toFixed(3));
    setActiveAbsoluteChange(formattedAbsChange);
  }

  useEffect(() => {
    if (!chartData.length)
      return;
    const lastDataIndex = chartData.length - 1;
    updateActiveChartData(chartData[lastDataIndex][1], lastDataIndex);
  }, [chartData])

  const [graphType, setGraphType] = useState("Candlestick")
  const graphTypes = ["Routes", "Candlestick"]
  const showGraph = item => {
    setGraphType(item)
  }

  return (
    <PageHeaderWrapper>
      <div className={styles.main}>
        <div className={styles.rowFlexContainer}>
          <div className={`${styles.colItem} ${styles.priceChart}`}>
            <div className={styles.graphTab}>
              <PerpetualTabs
                option={graphType}
                options={graphTypes}
                onChange={showGraph}
              />
            </div>
            <div style={{ borderTop: '0.75px solid #333333' }}>
              {graphType == "Routes" ?
                <SankeyGraph />
                :
                <div>
                  {
                    <ExchangeTVChart 
                      // swapOption={'LONG'}
                      fromTokenAddress={"0x0000000000000000000000000000000000000000"}//platformList[chainId][activeToken0.name]}
                      toTokenAddress={"0x05d6f705c80d9f812d9bc1a142a655cdb25e2571"}//platformList[chainId][activeToken1.name]}
                      // period={'5m'}
                      infoTokens={infoTokens}
                      chainId={chainId}
                      // positions={positions}
                      // savedShouldShowPositionLines,
                      // orders={orders}
                      setToTokenAddress={setToTokenAddress}
                    />
                  }
                </div>
                // <div>Kchart here</div>
              }
            </div>
            <div className={styles.exchangeBottomWrapper}>
              <div className={styles.exchangeItem}>
                {/* <h3>
                  <AcyIcon.MyIcon width={30} type="arrow" />
                  <span className={styles.span}>TRANSACTION HISTORY</span>
                </h3> */}
                <div className={`${styles.colItem}`}>
                  {/* <a className={`${styles.colItem} ${styles.optionTab}`}>All Orders</a> */}
                  <a className={`${styles.colItem} ${styles.optionTab}`}>My Orders</a>
                </div>
                {account && tableLoading ? (
                  <h2 style={{ textAlign: "center", color: "white" }}>Loading <Icon type="loading" /></h2>
                ) : (
                  <StakeHistoryTable
                    isMobile={isMobile}
                    dataSource={transactionList}
                  />
                )}
              </div>
            </div>
          </div>

          {/* <div>
            Hello: {history.location.pathname}
          </div> */}
          <div className={`${styles.colItem} ${styles.swapComponent}`} >
            <AcyCard style={{ backgroundColor: 'transparent', padding: '10px', border: 'none' }}>
              <div className={styles.trade}>
                <SwapComponent
                  onSelectToken0={token => {
                    // console.log("hereyou active0", platformList[chainId][(token.symbol)])
                    // console.log("hereyou active0 chainid", chainId, " ", platformList[chainId])
                    // console.log("hereyou active0 token symbol", (token.symbol).toLowerCase())
                    setActiveToken0(token);
                  }}
                  onSelectToken1={token => {
                    setActiveToken1(token);
                  }}
                  onGetReceipt={onGetReceipt}
                  showGraph={showGraph}
                />
              </div>
            </AcyCard>
          </div>

        </div>

        <AcyConfirm
          onCancel={onHandModalConfirmOrder}
          title="Comfirm Order"
          visible={visibleConfirmOrder}
        >
          <div className={styles.confirm}>
            <p>ETH： 566.228</p>
            <p>BTC：2.669</p>
            <p>Price：212.123</p>
            <p>Price Impact：2.232%</p>
            <p>Liquidity Provide Fee: 0.321%</p>
            <p>Alpha: 0.371%</p>
            <p>Maximum sold: 566.221</p>
            <Button size="large" type="primary">
              Confirm
            </Button>
          </div>
        </AcyConfirm>

        <AcyApprove
          onCancel={() => setVisibleLoading(false)}
          visible={visibleLoading}
        />

      </div>
    </PageHeaderWrapper>
  );
}
export default connect(({ profile, transaction, swap, loading }) => ({
  profile,
  transaction,
  swap,
  loading: loading.effects['profile/fetchBasic'],
}))(props => (
  <Media query="(max-width: 599px)">
    {isMobile => <Swap {...props} isMobile={isMobile} />}
  </Media>
))

