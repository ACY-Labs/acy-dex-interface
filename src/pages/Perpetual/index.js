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
  getDeltaStr
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

// import { createChart } from 'krasulya-lightweight-charts'
import { createChart } from 'lightweight-charts';

//hj
// const [isConfirming, setIsConfirming] = useState(false);
// const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);

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

//------FOR Pricehart-----TODO Austin
const chartRef = useRef(null);


  

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


  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo)
  const { positions, positionsMap } = getPositions(tempChainID, positionQuery, positionData, infoTokens, true)

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



  //#TODO (Austin) convert into ACY Style
  useEffect(()=>{
const chart = createChart(chartRef.current,{
	width: 600,
  height: 300,
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
	rightPriceScale: {
		borderColor: 'rgba(197, 203, 206, 0.8)',
	},
	timeScale: {
		borderColor: 'rgba(197, 203, 206, 0.8)',
	},
});

var candleSeries = chart.addCandlestickSeries({
  upColor: 'rgba(255, 144, 0, 1)',
  downColor: '#000',
  borderDownColor: 'rgba(255, 144, 0, 1)',
  borderUpColor: 'rgba(255, 144, 0, 1)',
  wickDownColor: 'rgba(255, 144, 0, 1)',
  wickUpColor: 'rgba(255, 144, 0, 1)',
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

  },[chartRef,])


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
          <div ref={chartRef}></div>
          </div> 
          <div className={`${styles.colItem} ${styles.perpetualComponent}`} >
                <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
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
                    // isConfirming={isConfirming}
                    // setIsConfirming={setIsConfirming}
                    // isPendingConfirmation={isPendingConfirmation}
                    // setIsPendingConfirmation={setIsPendingConfirmation}
                    />
                  </div>
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
                <div className={styles.Trade}>
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

