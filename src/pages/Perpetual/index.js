import { useWeb3React } from '@web3-react/core';
import React, { Component, useState, useEffect, useRef } from 'react';
import { connect } from 'umi';
import { Button, Row, Col, Icon, Skeleton, Card } from 'antd';
import samplePositionsData from "./SampleData"
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
import { PriceBox } from './components/PriceBox';
import { DetailBox } from './components/DetailBox';
import { 
  ACTIONS,
  ORDERS, 
  POSITIONS,
  FUNDING_RATE_PRECISION,
  BASIS_POINTS_DIVISOR,
  getLiquidationPrice, 
  getTokenInfo,
  getInfoTokens,
  expandDecimals,
  getPositionKey,
  getLeverage,
  bigNumberify,
  getDeltaStr,
  useAccountOrders
} from '@/acy-dex-futures/utils';

import {

  nativeTokenAddress,
  readerAddress,
  vaultAddress,
  usdgAddress,
  tempLibrary,
  tempChainID,
  orderBookAddress,
  routerAddress,

} from '@/acy-dex-futures/samples/constants'
import Media from 'react-media';
import { uniqueFun } from '@/utils/utils';
import {getTransactionsByAccount,appendNewSwapTx, findTokenWithSymbol} from '@/utils/txData';
import { getTokenContract } from '@/acy-dex-swap/utils/index';
import PerpetualComponent from '@/components/PerpetualComponent';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Kchart from './components/Kchart';
import axios from 'axios';
import moment from 'moment';
import styles from './styles.less';
import { columnsPool } from '../Dao/Util.js';
import styled from "styled-components";
import { useConstantLoader } from '@/constants';
import {useConnectWallet} from '@/components/ConnectWallet';
import PositionsTable from './components/PositionsTable';
import ActionHistoryTable from './components/ActionHistoryTable';
import OrderTable from './components/OrderTable'

/// THIS SECTION IS FOR TESTING SWR AND GMX CONTRACT
import { fetcher } from '@/acy-dex-futures/utils';
import Reader from '@/acy-dex-futures/abis/ReaderV2.json'
import Router from '@/acy-dex-futures/abis/Router.json'
import VaultV2 from '@/acy-dex-futures/abis/VaultV2.json'
import Token from '@/acy-dex-futures/abis/Token.json'
import {ethers} from 'ethers'
import useSWR from 'swr'
import sampleGmxTokens from '@/acy-dex-futures/samples/TokenList'



const { AddressZero } = ethers.constants
// ----------
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
function getFundingFee(data) {
  let { entryFundingRate, cumulativeFundingRate, size } = data
  if (entryFundingRate && cumulativeFundingRate) {
    return size.mul(cumulativeFundingRate.sub(entryFundingRate)).div(FUNDING_RATE_PRECISION)
  }
  return
}
const getTokenAddress = (token, nativeTokenAddress) => {
  if (token.address === AddressZero) {
    return nativeTokenAddress
  }
  return token.address
}

export function getPositionQuery(tokens, nativeTokenAddress) {
  const collateralTokens = []
  const indexTokens = []
  const isLong = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.isStable) { continue }
    if (token.isWrapped) { continue }
    collateralTokens.push(getTokenAddress(token, nativeTokenAddress))
    indexTokens.push(getTokenAddress(token, nativeTokenAddress))
    isLong.push(true)
  }

  for (let i = 0; i < tokens.length; i++) {
    const stableToken = tokens[i]
    if (!stableToken.isStable) { continue }

    for (let j = 0; j < tokens.length; j++) {
      const token = tokens[j]
      if (token.isStable) { continue }
      if (token.isWrapped) { continue }
      collateralTokens.push(stableToken.address)
      indexTokens.push(getTokenAddress(token, nativeTokenAddress))
      isLong.push(false)
    }
  }

  return { collateralTokens, indexTokens, isLong }
}

export function getPositions(chainId, positionQuery, positionData, infoTokens, includeDelta) {
  // const propsLength = getConstant(chainId, "positionReaderPropsLength")
  const propsLength = 9;
  const positions = []
  const positionsMap = {}

  if (!positionData) {
    return { positions, positionsMap }
  }
  const { collateralTokens, indexTokens, isLong } = positionQuery
  for (let i = 0; i < collateralTokens.length; i++) {
    const collateralToken = getTokenInfo(infoTokens, collateralTokens[i], true, nativeTokenAddress);
    collateralToken.logoURI = findTokenWithSymbol(collateralToken.symbol).logoURI;
    const indexToken = getTokenInfo(infoTokens, indexTokens[i], true, nativeTokenAddress)
    indexToken.logoURI = findTokenWithSymbol(collateralToken).logoURI;
    const key = getPositionKey(collateralTokens[i], indexTokens[i], isLong[i])

    const position = {
      key,
      collateralToken,
      indexToken,
      isLong: isLong[i],
      size: positionData[i * propsLength],
      collateral: positionData[i * propsLength + 1],
      averagePrice: positionData[i * propsLength + 2],
      entryFundingRate: positionData[i * propsLength + 3],
      cumulativeFundingRate: collateralToken.cumulativeFundingRate,
      hasRealisedProfit: positionData[i * propsLength + 4].eq(1),
      realisedPnl: positionData[i * propsLength + 5],
      lastIncreasedTime: positionData[i * propsLength + 6].toNumber(),
      hasProfit: positionData[i * propsLength + 7].eq(1),
      delta: positionData[i * propsLength + 8],
      markPrice: isLong[i] ? indexToken.minPrice : indexToken.maxPrice
    }

    let fundingFee = getFundingFee(position)
    position.fundingFee = fundingFee ? fundingFee : bigNumberify(0)
    position.collateralAfterFee = position.collateral.sub(position.fundingFee)

    position.hasLowCollateral = position.collateralAfterFee.lte(0) || position.size.div(position.collateralAfterFee.abs()).gt(50)

    position.pendingDelta = position.delta
    if (position.collateral.gt(0)) {
      if (position.delta.eq(0) && position.averagePrice && position.markPrice) {
        const priceDelta = position.averagePrice.gt(position.markPrice) ? position.averagePrice.sub(position.markPrice) : position.markPrice.sub(position.averagePrice)
        position.pendingDelta = position.size.mul(priceDelta).div(position.averagePrice)
      }
      position.deltaPercentage = position.pendingDelta.mul(BASIS_POINTS_DIVISOR).div(position.collateral)

      const { deltaStr, deltaPercentageStr } = getDeltaStr({
        delta: position.pendingDelta,
        deltaPercentage: position.deltaPercentage,
        hasProfit: position.hasProfit
      })

      position.deltaStr = deltaStr
      position.deltaPercentageStr = deltaPercentageStr

      let netValue = position.hasProfit ? position.collateral.add(position.pendingDelta) : position.collateral.sub(position.pendingDelta)
      position.netValue = netValue.sub(position.fundingFee)
    }

    position.leverage = getLeverage({
      size: position.size,
      collateral: position.collateral,
      entryFundingRate: position.entryFundingRate,
      cumulativeFundingRate: position.cumulativeFundingRate,
      hasProfit: position.hasProfit,
      delta: position.delta,
      includeDelta
    })

    positionsMap[key] = position

    if (position.size.gt(0)) {
      positions.push(position)
    }
  }

  return { positions, positionsMap }
}

const Swap = props => {
  const {account, library, chainId, tokenList: supportedTokens, farmSetting: { API_URL: apiUrlPrefix}, globalSettings, } = useConstantLoader();
  console.log("@/ inside swap:", supportedTokens, apiUrlPrefix)

    //hj
    const [isConfirming, setIsConfirming] = useState(false);
    const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
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

  // this are new states for PERPETUAL
  const [tableContent, setTableContent] = useState(POSITIONS);
  const [positionsData, setPositionsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const { activate } = useWeb3React();
//---------- FOR TESTING 
  const whitelistedTokens = sampleGmxTokens.filter(token=>token.symbol!== "USDG");
  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address)
  const tokens = sampleGmxTokens;
  const positionQuery = getPositionQuery(whitelistedTokens, nativeTokenAddress) 



  

  const { data: vaultTokenInfo, mutate: updateVaultTokenInfo } = useSWR([chainId, readerAddress, "getFullVaultTokenInfo"], {
    fetcher: fetcher(tempLibrary, Reader, [vaultAddress, nativeTokenAddress, expandDecimals(1, 18), whitelistedTokenAddresses]),
  })
  const { data: positionData, mutate: updatePositionData } = useSWR(account && [tempChainID, readerAddress, "getPositions", vaultAddress, account],{
    fetcher: fetcher(tempLibrary, Reader, [positionQuery.collateralTokens, positionQuery.indexTokens, positionQuery.isLong]),
  })
  const tokenAddresses = tokens.map(token => token.address)
  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([tempChainID, readerAddress, "getTokenBalances", account], {
    fetcher: fetcher(tempLibrary, Reader, [tokenAddresses]),
  })

  const { data: fundingRateInfo, mutate: updateFundingRateInfo } = useSWR(account && [tempChainID, readerAddress, "getFundingRates"], {
    fetcher: fetcher(tempLibrary, Reader, [vaultAddress, nativeTokenAddress, whitelistedTokenAddresses]),
  })

  const { data: totalTokenWeights, mutate: updateTotalTokenWeights } = useSWR([`Exchange:totalTokenWeights:${true}`, tempChainID, vaultAddress, "totalTokenWeights"], {
    fetcher: fetcher(tempLibrary, VaultV2),
  })

  const { data: usdgSupply, mutate: updateUsdgSupply } = useSWR([`Exchange:usdgSupply:${true}`, tempChainID, usdgAddress, "totalSupply"], {
    fetcher: fetcher(tempLibrary, Token),
  })
  
  const { data: orderBookApproved, mutate: updateOrderBookApproved } = useSWR(account && [ tempChainID, routerAddress, "approvedPlugins", account, orderBookAddress], {
    fetcher: fetcher(tempLibrary, Router)
  });

  useEffect(()=>{ 

  console.log("printing all vault", vaultTokenInfo);
    
  },[vaultTokenInfo])

  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo)
  const { positions, positionsMap } = getPositions(tempChainID, positionQuery, positionData, infoTokens, true)
  // const [orders, updateOrders] = useAccountOrders(flagOrdersEnabled)

  console.log('PRINTING ALL POSITIONS FOR USER', positions);

//--------- 
  useEffect(() => {
    if (!supportedTokens) return

    console.log("resetting page states")
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
    
    for ( let item of samplePositionsData){
      item['collateralToken'] = findTokenWithSymbol(item.collateralTokenSymbol);
      item['indexToken'] = findTokenWithSymbol(item.indexTokenSymbol);
      item['liqPrice'] = getLiquidationPrice(item);
    }
    setPositionsData(samplePositionsData);

    const sampleOrdersData = [
      {
        type: "Swap",
        order: {
          amountIn: 100,
          fromTokenSymbol: "USDT",
          amountOut: 50,
          toTokenSymbol: "ACY"
        },
        price: 100,
        markPrice: 105,
      }
    ]
    setOrdersData(sampleOrdersData)

  }, [chainId])

  useEffect(() => {
      library.on('block', (blockNum) => {
        updateVaultTokenInfo()
        updateTokenBalances()
        updatePositionData()
        updateFundingRateInfo()
        updateTotalTokenWeights()
        updateUsdgSupply()
        updateOrderBookApproved()
      })
      return () => {
        library.removeAllListeners('block');
      }
  }, [library])

  const refContainer = useRef();
  refContainer.current = transactionList;

  // connect to provider, listen for wallet to connect
  const connectWalletByLocalStorage = useConnectWallet();
  useEffect(() => {
    if(!account){
      connectWalletByLocalStorage()
     }
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

  useEffect(() => {
    dispatch({
      type: "swap/updateTokens",
      payload: {
        token0: activeToken0,
        token1: activeToken1
      }
    });
    const dayLength = 24*60/5;
    let reverseFlag = false;
    let timeMark = 0;
    let timeMark2 = 0;
    let timeData = [];
    let A = activeToken0.symbol;
    let B = activeToken1.symbol;
    if(A>B)
    {
      let temp = B;
      B = A;
      A = temp;
      reverseFlag = true;
    }
    axios.get(
      `${apiUrlPrefix}/chart/getRate`, {params : {token0 : A , token1 : B}}
    ).then(res => {
      if(res.data){
      const historyData = res.data.History;
      timeMark = historyData[historyData.length-1].time;
      timeMark2 = historyData[0].time

      let date = new Date(timeMark*60*1000);

      for (let i = 0; i < historyData.length; i++) {
  
        while(i < 0) i++;
        const element = historyData[i];
        timeData.push(element);
        
      };

      const addData = []
      for (let i = timeMark - 24*60; i < timeMark2; i = i+5) {
        let temp2 = [(i*60*1000),  0 ] ;
        addData.push(temp2);
      } 
      console.log("timemark",timeMark - 24*60,timeMark2);
      console.log("addData",addData);

          console.log("timeData",timeData);
          const tempChart = [];
          for (let a = 0; a < timeData.length; a++) {
            if(timeData[a].time > timeMark - 24*60){
            const time = timeData[a].time*60*1000;
            let date = new Date(time);
            let dateString = date.getMinutes();
            let temp;
            if(reverseFlag)
            temp = [time, 1.0/timeData[a].exchangeRate ] ;
            else
            temp = [time,timeData[a].exchangeRate ] ;
            tempChart.push(temp);
            
          }
        }
          console.log("CHARTING!!!!!!!!!!!",tempChart);

          const finalChartData = addData.concat(tempChart);
          console.log("finalChartData", finalChartData);
          setChartData(finalChartData);
    }
      else{
        setActiveRate("No this pair data yet");
        setChartData([]);
      }

    })
     

      console.log("chartdata");
      console.log(timeData);
   
  }, [activeToken0, activeToken1]);

  const getRoutePrice = (token0Address, token1Address) => {
    if(!token0Address || !token1Address) return;    

    axios
      .post(
        `${apiUrlPrefix}/chart/swap?token0=${token0Address}&token1=${token1Address}&range=1D`
      )
      .then(data => {
        console.log(data);
      });
  }


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
    

    return [
      <div style={{width: "100%"}}>
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
        <div style={{display: "flex", justifyContent: "space-between"}}>
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

  const RenderTable = () => {
    if (tableContent === POSITIONS) {
      return (
        <PositionsTable
            isMobile={isMobile}
            dataSource={positions}
        />
      )
    } else if (tableContent === ACTIONS) {
      return (
        <ActionHistoryTable
            isMobile={isMobile}
            dataSource={positionsData}
        />
      )
    } else if (tableContent === ORDERS) {
      return (
        <OrderTable
          isMobile={isMobile}
          dataSource={ordersData}
        />
      )
    }
  }

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
    appendNewSwapTx(refContainer.current,receipt,account,library).then((data) => {
      if(data && data.length > 0) setTransactionList(data);
      setTableLoading(false);
    })
    
  }


  const onGetReceipt = async (receipt, library, account) => {
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
    const lastDataIndex = chartData.length-1;
    updateActiveChartData(chartData[lastDataIndex][1], lastDataIndex);
  }, [chartData])



  // const renderChart = () => {
  //   return <ExchangeTVChart
  //     fromTokenAddress={fromTokenAddress}
  //     toTokenAddress={toTokenAddress}
  //     infoTokens={infoTokens}
  //     swapOption={swapOption}
  //     chainId={chainId}
  //     positions={positions}
  //     savedShouldShowPositionLines={savedShouldShowPositionLines}
  //     orders={orders}
  //   />
  // }
 
  return (
    <PageHeaderWrapper>
      <div className={styles.main}>
        <div className={styles.rowFlexContainer}>
          <div className={`${styles.colItem} ${styles.priceChart}`}>
          <Kchart></Kchart>
          </div> 
          <div className={`${styles.colItem} ${styles.perpetualComponent}`} >
                <AcyCard style={{ backgroundColor: '#1B1B1C', padding: '10px' }}>
                  <div className={styles.trade}>
                    <PerpetualComponent
                      onSelectToken0={token => {
                        setActiveToken0(token);
                      }}
                      onSelectToken1={token => {
                        setActiveToken1(token);

                      }}
                      infoTokens_test = {infoTokens}
                      positions = {positions}
                      positionsMap = {positionsMap}
                      usdgSupply = {usdgSupply}
                      tokens={tokens}
                      onGetReceipt={onGetReceipt}
                      profitsIn={'ETH'} 
                      liqPrice={456}
                      entryPriceMarket={123}
                      exitPrice={123}
                      borrowFee={123}
                    isConfirming={isConfirming}
                    setIsConfirming={setIsConfirming}
                    // isPendingConfirmation={isPendingConfirmation}
                    // setIsPendingConfirmation={setIsPendingConfirmation}
                    // savedSlippageAmount={savedSlippageAmount}
                    />
                  </div>
                </AcyCard>
                <AcyCard>
                <AcyCard>
          <DetailBox
  
          />
          </AcyCard>
                </AcyCard>
          </div>

        </div>
        <div className={styles.rowFlexContainer}>
              <div className={`${styles.colItem}`}>
                  <a className={`${styles.colItem} ${styles.optionTab}`} onClick={()=>{setTableContent(POSITIONS)}}>Positions</a>
                  <a className={`${styles.colItem} ${styles.optionTab}`} onClick={()=>{setTableContent(ORDERS)}}>Orders</a>
                  <a className={`${styles.colItem} ${styles.optionTab}`} onClick={()=>{setTableContent(ACTIONS)}}>Actions </a>
              </div>
          </div>
        <div className={styles.rowFlexContainer}>
            <div className={`${styles.colItem} ${styles.priceChart}`}>
                <div className={styles.positionsTable}>
                <RenderTable/>
                </div>
            </div>
        <div className={styles.exchangeItem}>
        </div>
      </div>
      <AcyModal onCancel={onCancel} width={600} visible={visible}>
        <div className={styles.title}>
          <AcyIcon name="back" /> Select a token
        </div>
        <div className={styles.search}>
          <AcyInput
            placeholder="Enter the token symbol or address"
            suffix={<AcyIcon name="search" />}
          />
        </div>
        <div className={styles.coinList}>
          <AcyTabs>
            <AcyTabPane tab="All" key="1">
              <AcyCoinItem />
              <AcyCoinItem />
              <AcyCoinItem />
              <AcyCoinItem />
            </AcyTabPane>
            <AcyTabPane tab="Favorite" key="2" />
            <AcyTabPane tab="Index" key="3" />
            <AcyTabPane tab="Synth" key="4" />
          </AcyTabs>
        </div>
      </AcyModal>
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

