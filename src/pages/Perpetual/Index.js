/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-useless-computed-key */
import { Menu, Dropdown, message, Radio, Spin, Tabs, Layout } from 'antd';
import { ConsoleSqlOutlined, DownOutlined } from '@ant-design/icons';
import { useWeb3React } from '@web3-react/core';
import React, { Component, useState, useEffect, useRef, useCallback, useMemo, useHistory } from 'react';
import { connect } from 'umi';
import { Button, Row, Col, Icon, Skeleton, Card, Select } from 'antd';
import samplePositionsData from "./SampleData"
import {
  AcyPerpetualCard,
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
  ARBITRUM_DEFAULT_COLLATERAL_SYMBOL,
  GLP_DECIMALS,
  USD_DECIMALS,
  PLACEHOLDER_ACCOUNT,
  parseValue,
  getLiquidationPrice,
  getTokenInfo,
  getInfoTokens,
  expandDecimals,
  getPositionKey,
  getLeverage,
  bigNumberify,
  getDeltaStr,
  useLocalStorageByChainId,
  useAccountOrders,
  formatAmount,
  
} from '@/acy-dex-futures/utils';

import { approvePlugin } from '@/acy-dex-futures/Api'
import Media from 'react-media';
import { uniqueFun } from '@/utils/utils';
import { getTransactionsByAccount, appendNewSwapTx, findTokenWithSymbol, findTokenWithAddress } from '@/utils/txData';
import { getTokenContract } from '@/acy-dex-swap/utils/index';
import { getConstant } from '@/acy-dex-futures/utils/Constants'
import PerpetualComponent from '@/components/PerpetualComponent';
import PerpetualTabs from '@/components/PerpetualComponent/components/PerpetualTabs';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { GlpSwapTokenTable } from '@/components/PerpetualComponent/components/GlpSwapBox'
// import Kchart from './components/Kchart';
import KChart from './components/KChart';
import ExchangeTVChart from './components/ExchangeTVChart';
import axios from 'axios';
import moment from 'moment';
import styles from './styles.less';
import { columnsPool } from '../Dao/Util.js';
import styled from "styled-components";
import { constantInstance, useConstantLoader } from '@/constants';
import { useConnectWallet } from '@/components/ConnectWallet';
import PositionsTable from './components/PositionsTable';
import ActionHistoryTable from './components/ActionHistoryTable';
import OrderTable from './components/OrderTable'

/// THIS SECTION IS FOR TESTING SWR AND GMX CONTRACT
import { fetcher } from '@/acy-dex-futures/utils';
// import PositionRouter from "@/acy-dex-futures/abis/PositionRouter.json";
import Reader from '@/acy-dex-futures/abis/ReaderV2.json'
import Router from '@/acy-dex-futures/abis/Router.json'
import Vault from '@/acy-dex-futures/abis/Vault.json'
// import VaultV2 from '@/acy-dex-futures/abis/VaultV2.json'
import Token from '@/acy-dex-futures/abis/Token.json'
import GlpManager from '@/acy-dex-futures/abis/GlpManager.json'
import Glp from '@/acy-dex-futures/abis/Glp.json'
import Usdg from "@/acy-dex-futures/abis/Usdg.json"
import RewardTracker from '@/acy-dex-futures/abis/RewardTracker.json'
import Vester from '@/acy-dex-futures/abis/Vester.json'
import RewardReader from '@/acy-dex-futures/abis/RewardReader.json'
// import ReaderV2 from '@/acy-dex-futures/abis/ReaderV2.json'
import { ethers } from 'ethers'
import useSWR from 'swr'
import { getKChartData } from './utils';
import { from, HeuristicFragmentMatcher } from 'apollo-boost';
// import e from '@umijs/deps/compiled/express';

//import ChartTokenSelector from './ChartTokenSelector'

let indexToken = []
let indexTokens = []
const { AddressZero } = ethers.constants
// ----------
const { AcyTabPane } = AcyTabs;
const { TabPane } = Tabs;

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

const StyledButton = styled(Button)`
  .ant-btn{
    height: 50px !important;
    background-color: #0e0304 !important;    
    border-color: #0e0304 !important;
  }
  .ant-row{
    line-height: 9px;
    margin-top: 3px;
    margin-left: 0.3rem;
  }
`
// const StyledTokenSelect = styled(Radio.Group)`
// // default
//   .ant-radio-button-wrapper{
//     font-size: 1rem;
//     background-color: #0E0304;
//     color: #b5b5b6;
//     border-color: #333333;
//     height: 45px;
//     padding: 0 0;
//     line-height: 45px;
//     align-items: center;
//     border-radius: 0px;
//     width: 250px;
//   }
//   .ant-radio-button-wrapper:hover{
//     color: #ffffff;
//     background-color: #0E0304;
//     border: 0px;
//   }
//   .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover {
//     color: #fff;
//     border: 0px;
//   }
//   .ant-radio-button-wrapper:not(:first-child)::before{
//     border: 0px;
//     background-color: #0E0304 !important;
//     border-color: #0E0304;
//   }
// `;

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
    box-shadow: 0 0 0 0 #0e0304;
    border-color: #333333;
  }
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover{
    color: #ffffff;
  }
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before{
    background-color: #0e0304 !important;
  }

  .ant-radio-button-wrapper:not(:first-child)::before{
    background-color: transparent;
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
    // if (token.isWrapped) { continue }
    if (token.isNative) { continue }

    for (let j = 0; j < tokens.length; j++) {
      const collateral = tokens[j]
      if (collateral.isNative) { continue }
      collateralTokens.push(collateral.address)
      indexTokens.push(getTokenAddress(token, nativeTokenAddress))
      isLong.push(true)
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.isStable) { continue }
    // if (token.isWrapped) { continue }
    if (token.isNative) { continue }

    for (let j = 0; j < tokens.length; j++) {
      const collateral = tokens[j]
      if (collateral.isNative) { continue }
      collateralTokens.push(collateral.address)
      indexTokens.push(getTokenAddress(token, nativeTokenAddress))
      isLong.push(false)
    }
  }

  // for (let i = 0; i < tokens.length; i++) {
  //   const stableToken = tokens[i]
  //   if (!stableToken.isStable) { continue }

    // for (let j = 0; j < tokens.length; j++) {
    //   const token = tokens[j]
    //   if (token.isStable) { continue }
    //   if (token.isWrapped) { continue }
    //   collateralTokens.push(stableToken.address)
    //   indexTokens.push(getTokenAddress(token, nativeTokenAddress))
    //   isLong.push(false)
    // }
  // }

  return { collateralTokens, indexTokens, isLong }
}

export function getPositions(chainId, positionQuery, positionData, infoTokens, includeDelta, nativeTokenAddress) {

  const propsLength = getConstant(chainId, "positionReaderPropsLength")
  // const propsLength = 9;

  const positions = []
  const positionsMap = {}
  // 
  if (!positionData) {
  // if (true) {
    return { positions, positionsMap }
  }
  
  const { collateralTokens, indexTokens, isLong } = positionQuery
  for (let i = 0; i < collateralTokens.length; i+=1) {
    const collateralToken = getTokenInfo(infoTokens, collateralTokens[i], true, nativeTokenAddress);
    collateralToken.logoURI = findTokenWithAddress(collateralToken.address).logoURI;
    indexToken = getTokenInfo(infoTokens, indexTokens[i], true, nativeTokenAddress)
    indexToken.logoURI = findTokenWithAddress(indexToken.address).logoURI;
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
    position.liqPrice = getLiquidationPrice(position)
  }


  return { positions, positionsMap }
}

function getTokenBySymbol(tokenlist, symbol) {
  for (let i = 0; i < tokenlist.length; i++) {
    if (tokenlist[i].symbol === symbol) {
      return tokenlist[i]
    }
  }
  return undefined
}



const Swap = props => {
  const { savedIsPnlInLeverage, setSavedIsPnlInLeverage, savedSlippageAmount, pendingTxns, setPendingTxns } = props

  const { account, library, chainId, farmSetting: { API_URL: apiUrlPrefix }, globalSettings, } = useConstantLoader();
  // console.log("this is constantInstance ", constantInstance);
  const supportedTokens = constantInstance.perpetuals.tokenList;

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
  const [activeTimeScale, setActiveTimeScale] = useState("5m");
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
  const { active, activate } = useWeb3React();
  const [placement, setPlacement] = useState('5m');
  const [high24, setHigh24] = useState(0);
  const [low24, setLow24] = useState(0);
  const [deltaPrice24, setDeltaPrice24] = useState(0);
  const [percentage24, setPercentage24] = useState(0);
  const [currentAveragePrice, setCurrentAveragePrice] = useState(0);
  const tokens = supportedTokens;
  
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
// }), [chainId])


  const [tokenSelection, setTokenSelection] = useLocalStorageByChainId(chainId, "Exchange-token-selection-v2", defaultTokenSelection)
  const [swapOption, setSwapOption] = useLocalStorageByChainId(chainId, 'Swap-option-v2', "Long")

  const setFromTokenAddress = useCallback((selectedSwapOption, address) => {
    const newTokenSelection = JSON.parse(JSON.stringify(tokenSelection))
    newTokenSelection[selectedSwapOption].from = address
    setTokenSelection(newTokenSelection)
  }, [tokenSelection, setTokenSelection])

  const setToTokenAddress = useCallback((selectedSwapOption, address) => {
    // console.log("hereim see tokenSelection", tokenSelection)
    const newTokenSelection = JSON.parse(JSON.stringify(tokenSelection))
    newTokenSelection[selectedSwapOption].to = address
    setTokenSelection(newTokenSelection)
  }, [tokenSelection, setTokenSelection])

  const fromTokenAddress = tokenSelection[swapOption].from
  const toTokenAddress = tokenSelection[swapOption].to


  const { perpetuals } = useConstantLoader()
  const readerAddress = perpetuals.getContract("Reader")
  const vaultAddress = perpetuals.getContract("Vault")
  const usdgAddress = perpetuals.getContract("USDG")
  const nativeTokenAddress = perpetuals.getContract("NATIVE_TOKEN")
  const routerAddress = perpetuals.getContract("Router")
  const glpManagerAddress = perpetuals.getContract("GlpManager")
  const glpAddress = perpetuals.getContract("GLP")
  const orderBookAddress = perpetuals.getContract("OrderBook")

  //---------- FOR TESTING 
  const whitelistedTokens = supportedTokens.filter(token => token.symbol !== "USDG");
  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address);
  const positionQuery = getPositionQuery(whitelistedTokens, nativeTokenAddress)


  const { data: vaultTokenInfo, mutate: updateVaultTokenInfo } = useSWR([chainId, readerAddress, "getFullVaultTokenInfo"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, expandDecimals(1, 18), whitelistedTokenAddresses]),
  })
  const { data: positionData, mutate: updatePositionData } = useSWR([chainId, readerAddress, "getPositions", vaultAddress, account],{
    fetcher: fetcher(library, Reader, [positionQuery.collateralTokens, positionQuery.indexTokens, positionQuery.isLong]),
  })
  const tokenAddresses = tokens.map(token => token.address)
  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([chainId, readerAddress, "getTokenBalances", account], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
  })

  const { data: fundingRateInfo, mutate: updateFundingRateInfo } = useSWR(account && [chainId, readerAddress, "getFundingRates"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, whitelistedTokenAddresses]),
  })

  const { data: totalTokenWeights, mutate: updateTotalTokenWeights } = useSWR([chainId, vaultAddress, "totalTokenWeights"], {
    fetcher: fetcher(library, Vault),
  })

  const { data: usdgSupply, mutate: updateUsdgSupply } = useSWR([chainId, usdgAddress, "totalSupply"], {
    fetcher: fetcher(library, Glp),
  })
  
  const { data: orderBookApproved, mutate: updateOrderBookApproved } = useSWR(account && [ chainId, routerAddress, "approvedPlugins", account, orderBookAddress], {
    fetcher: fetcher(library, Router)
  });

  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo);
  const { positions, positionsMap } = getPositions(chainId, positionQuery, positionData, infoTokens, true, nativeTokenAddress);

  const flagOrdersEnabled = true;
  const [orders] = useAccountOrders(flagOrdersEnabled);

  const [isWaitingForPluginApproval, setIsWaitingForPluginApproval] = useState(false);
  const [isPluginApproving, setIsPluginApproving] = useState(false);

  const approveOrderBook = () => {
    setIsPluginApproving(true)
    return approvePlugin(chainId, orderBookAddress, {
      library,
      pendingTxns,
      setPendingTxns
    }).then(() => {
      setIsWaitingForPluginApproval(true)
      updateOrderBookApproved(undefined, true);
    }).finally(() => {
      setIsPluginApproving(false)
    })
  }

  //--------- 
  useEffect(() => {
    if (!supportedTokens) return

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

    for (let item of samplePositionsData) {
      item['collateralToken'] = findTokenWithSymbol(item.collateralTokenSymbol);
      item['indexToken'] = findTokenWithSymbol(item.indexTokenSymbol);
      item['liqPrice'] = getLiquidationPrice(item);
    }
    setPositionsData(samplePositionsData);

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
    if (!account) {
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

  // useEffect(async () => {
  //   // dispatch({
  //   //   type: "swap/updateTokens",
  //   //   payload: {
  //   //     token0: activeToken0,
  //   //     token1: activeToken1
  //   //   }
  //   // });
  //   console.log("hereim", activeToken1);
  //   // setChartData(await getKChartData(activeToken1.symbol, "56", "1h", "1650234954", "1650378658", "chainlink"))

  // }, [activeToken0, activeToken1]);


  const getRoutePrice = (token0Address, token1Address) => {
    if (!token0Address || !token1Address) return;

    axios
      .post(
        `${apiUrlPrefix}/chart/swap?token0=${token0Address}&token1=${token1Address}&range=1D`
      )
      .then(data => {

      });
  }

  const getCurrentTime = () => {
    let currentTime = Math.floor(new Date().getTime()/1000);
    return currentTime;
  }
  const getFromTime = ( currentTime ) => {
    let fromTime = currentTime - 100* 24* 60* 60;
    // console.log("hereim from time", fromTime);
    return fromTime;
  }

 
  // useEffect(async () => {
  //   let currentTime = getCurrentTime();
  //   let previous24 = currentTime - 24*60*60;    
  //   console.log("hereim time", previous24, currentTime);
  //   let data24 = await getKChartData(activeToken1.symbol, "56", "1d", previous24.toString(), currentTime.toString(), "chainlink");
  //   console.log("hereim data24", data24);
    
  //   let high24 = 0;
  //   let low24 = 0;
  //   let deltaPrice24 = 0;
  //   let currentAveragePrice = 0;
  //   let percentage = 0;
  //   if (data24.length > 1) {
  //     high24 = Math.round(data24[0].high * 100) / 100;
  //     low24 = Math.round(data24[0].low * 100) / 100;    
  //     deltaPrice24 = Math.round(data24[0].open * 100) / 100;
  //     currentAveragePrice = ((high24+low24)/2);
  //     percentage = Math.round((currentAveragePrice - deltaPrice24) *100 / currentAveragePrice *100)/100;
  //   }
    
  //   setHigh24(high24);
  //   setLow24(low24);
  //   setDeltaPrice24(deltaPrice24);
  //   setPercentage24(percentage);

  // }, [activeToken1])

  useEffect(async () => {
    let currentTime = getCurrentTime();
    let previousTime = currentTime - 24*60*60 ;

    let data24 = await getKChartData(activeToken1.symbol, "56", "5m", previousTime.toString(), currentTime.toString(), "chainlink");
    let high24 = 0;
    let low24 = 0;
    let deltaPrice24 = 0;
    let percentage = 0;
    let average = 0;
    let highArr = [];
    let lowArr = [];
    if (data24.length > 0) {
      for (let i=1; i < data24.length; i++){
        highArr.push(data24[i].high);
        lowArr.push(data24[i].low);
      }
      high24 = Math.max(...highArr);
      low24 = Math.min(...lowArr);
      high24 = Math.round(high24*100)/100;
      low24 = Math.round(low24*100)/100;

      deltaPrice24 = Math.round(data24[0].open * 100) / 100;
      average = Math.round( ((high24+low24)/2) *100)/100;
      percentage = Math.round((average - deltaPrice24) *100 / average *100)/100;
    }
    
    setHigh24(high24);
    setLow24(low24);
    setDeltaPrice24(deltaPrice24);
    setPercentage24(percentage);
    setCurrentAveragePrice(average);
    // console.log("hereim show 24 cal", "high24:", high24, " low24:", low24, " average:", currentAveragePrice, " delta:", deltaPrice24);
  }, [activeToken1])

  const lineTitleRender = () => {

    // let token0logo = null;
    // let token1logo = null;
    // for (let j = 0; j < supportedTokens.length; j++) {
    //   if (activeToken0.symbol === supportedTokens[j].symbol) {
    //     token0logo = supportedTokens[j].logoURI;
    //   }
    //   if (activeToken1.symbol === supportedTokens[j].symbol) {
    //     token1logo = supportedTokens[j].logoURI;
    //   }
    // }
    // console.log("hereim after await", high24 );
    // const chartToken = getTokenInfo(infoTokens, activeToken1.address)    

    // const swapTokenPosition = () => {
    //   const tempSwapToken = activeToken0;
    //   setActiveToken0(activeToken1);
    //   setActiveToken1(tempSwapToken);
    // }
    // const onSelectToken = (token) => {
    //   console.log ("tmp", token)
    //   const tmp = getTokenInfo(infoTokens, token.address)
    //   //setActiveToken0(tmp)
    //   setActiveToken1(tmp, token.address)
    // }


    return [
      // <div style={{ width: 50%}}>      
      <div className={styles.maintitle}>
        <div>
          <div className={styles.secondarytitle}> 24h Change </div>
          <div className={styles.lighttitle}> {percentage24} % </div>

        </div>
        <div>
          <div className={styles.secondarytitle}> 24h High </div>
          <div className={styles.lighttitle}> $ {high24} </div>

        </div>
        <div>
          <div className={styles.secondarytitle}> 24h Low </div>
          <div className={styles.lighttitle}> $ {low24} </div>
        </div>
      </div>

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


  const onClickDropdown = e => {
    // console.log("hereim dropdown", e.key);
 
    setActiveToken1((supportedTokens.filter(ele => ele.symbol == e))[0]);
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
    appendNewSwapTx(refContainer.current, receipt, account, library).then((data) => {
      if (data && data.length > 0) setTransactionList(data);
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
    const lastDataIndex = chartData.length - 1;
    updateActiveChartData(chartData[lastDataIndex][1], lastDataIndex);
  }, [chartData])

  // Glp Swap
  const [isBuying, setIsBuying] = useState(true)
  const [showTokenTable, setShowTokenTable] = useState(false)
  const [swapTokenAddress, setSwapTokenAddress] = useState(tokens[0].address)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)
  // const history = useHistory()
  // useEffect(() => {
  //   const hash = history.location.hash.replace('#', '')
  //   const buying = !(hash === 'redeem') 
  //   setIsBuying(buying)
  // }, [history.location.hash])

  const glp_tokenList = whitelistedTokens.filter(t => !t.isWrapped)
  // const tokensForBalanceAndSupplyQuery = [stakedGlpTrackerAddress, usdgAddress]
  // const { data: balancesAndSupplies, mutate: updateBalancesAndSupplies } = useSWR([chainId, readerAddress, "getTokenBalancesWithSupplies", account || PLACEHOLDER_ACCOUNT], {
  //   fetcher: fetcher(library, ReaderV2, [tokensForBalanceAndSupplyQuery]),
  // })
  // const { data: aums, mutate: updateAums } = useSWR([chainId, glpManagerAddress, "getAums"], {
  //   fetcher: fetcher(library, GlpManager),
  // })
  const { data: glpBalance, mutate: updateGlpBalance } = useSWR([chainId, glpAddress, "balanceOf", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Glp),
  })
  // const { data: glpBalance, mutate: updateGlpBalance } = useSWR([chainId, feeGlpTrackerAddress, "stakedAmounts", account || PLACEHOLDER_ACCOUNT], {
  //   fetcher: fetcher(library, RewardTracker),
  // })
  const [glpValue, setGlpValue] = useState("")
  const glpAmount = parseValue(glpValue, GLP_DECIMALS)

  const { data: glpSupply, mutate: updateGlpSupply } = useSWR([chainId, glpAddress, "totalSupply"], {
    fetcher: fetcher(library, Glp),
  })
  // todo: usdgSupply -> vaultUtil
  // const { data: glpUsdgSupply, mutate: updateGlpUsdgSupply } = useSWR([chainId, vaultAddress, "vaultUtils"], {
  //   fetcher: fetcher(library, Vault),
  // })
  const { data: glpUsdgSupply, mutate: updateGlpUsdgSupply } = useSWR([chainId, usdgAddress, "totalSupply"], {
    fetcher: fetcher(library, Usdg),
  })
  // const glpSupply = balancesAndSupplies ? balancesAndSupplies[1] : bigNumberify(0)
  // const glp_usdgSupply = balancesAndSupplies ? balancesAndSupplies[3] : bigNumberify(0)
  // let aum
  // if (aums && aums.length > 0) {
  //   aum = isBuying ? aums[0] : aums[1]
  // }

  const { data: aumInUsdg, mutate: updateAumInUsdg } = useSWR([chainId, glpManagerAddress, "getAumInUsda", true], {
    fetcher: fetcher(library, GlpManager),
  })
  const glpPrice = (aumInUsdg && aumInUsdg.gt(0) && glpSupply && glpSupply.gt(0) ) ? aumInUsdg.mul(expandDecimals(1, GLP_DECIMALS)).div(glpSupply) : expandDecimals(1, USD_DECIMALS)
  // const glpPrice = (aum && aum.gt(0) && glpSupply.gt(0)) ? aum.mul(expandDecimals(1, GLP_DECIMALS)).div(glpSupply) : expandDecimals(1, USD_DECIMALS)
  let glpBalanceUsd
  if (glpBalance) {
    glpBalanceUsd = glpBalance.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS))
  }
  const glpSupplyUsd = glpSupply ? glpSupply.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS)) : bigNumberify(0)

  const onChangeMode = (mode) => {
    if (mode === "Pool") {
      setShowTokenTable(true)
    } else {
      setShowTokenTable(false)
    }
  }

  const { Option } = Select;
  
  const [updatingKchartsFlag, setUpdatingKchartsFlag] = useState(false);

//charttokenselection
  const { Header, Footer, Sider, Content } = Layout; 

  // const tokenPlacements = ['BTC', 'ETH'];

  // const tokenPlacementChange = e => {
  //   console.log("hereim set placement", e)

  //   setActiveToken1((supportedTokens.filter(ele => ele.symbol == e.target.value))[0]);

  //   // setPlacement(e.target.value);
  //   // setActiveTimeScale(e.target.value);
  // };
  // const tokenPlacementChange = value => {
  //   console.log("hereim set placement", value)

  //   // setActiveToken1((supportedTokens.filter(ele => ele.symbol == e.target.value))[0]);

  //   // setPlacement(e.target.value);
  //   // setActiveTimeScale(e.target.value);
  // };
  const onClickSetActiveToken = (e) => {
    console.log("hereim see click token", e)
    setActiveToken1((supportedTokens.filter(ele => ele.symbol == e))[0]);
  }
    
  const placementChange = e => {
    if(updatingKchartsFlag) return;

    setUpdatingKchartsFlag(true);
    setPlacement(e.target.value);
    setActiveTimeScale(e.target.value);
  };

  const chartPanes = [
    { title: 'BTC', content: 'BTC', key: 'BTC', closable: false },
    { title: 'ETH', content: 'ETH', key: 'ETH' },
    // { title: 'Tab 3', content: 'Content of Tab 3', key: '3'},
  ];
  const [activeKey, setActiveKey] = useState(chartPanes[0].key);
  const [panes, setPanes] = useState(chartPanes);
  const newTabIndex = useRef(0);

  const onChange = (newActiveKey) => {
    setActiveKey(newActiveKey);
    setActiveToken1((supportedTokens.filter(ele => ele.symbol == newActiveKey))[0])
  };
  const add = () => {
    const newActiveKey = `newTab${newTabIndex.current++}`;
    const newPanes = [...panes];
    newPanes.push({
      title: 'New Tab',
      content: 'Content of new Tab',
      key: newActiveKey,
    });
    setPanes(newPanes);
    setActiveKey(newActiveKey);
  };

  const remove = (targetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = panes.filter((pane) => pane.key !== targetKey);

    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }

    setPanes(newPanes);
    setActiveKey(newActiveKey);
  };

  const onEdit = (targetKey, action) => {
    if (action === 'add') {
      add();
    } else {
      remove(targetKey);
    }
  };

  // let options = supportedTokens;
  // const menu = (
  //   <div className={styles.tokenSelector}>
  //     <Menu onClick={onClickDropdown}>
  //       {

  //         // supportedTokens.filter(token => !token.symbol !== 'USDT').map((option) => (
  //         //   <Menu.Item key={option.symbol}>
  //         //     <span>{option.symbol} / USD</span> 
  //         //     {/* for showing before hover */}
  //         //   </Menu.Item>
  //         // ))
  //       }
  //     </Menu>
  //   </div>
  // );

  // function onChange (value) {
  //   // console.log("hereim onchange",value);
  //   setActiveToken1(option);
  // }

  const [kChartTab, setKChartTab] = useState("BTC")
  const kChartTabs = ["BTC", "ETH"]
  const selectChart = item => {
    setKChartTab(item)
    onClickSetActiveToken(item)
  }

  return (
    <PageHeaderWrapper>
      <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        
            <div className={styles.chartTokenSelectorTab}>
              <PerpetualTabs
                option={kChartTab}
                options={kChartTabs}
                onChange={selectChart}
              />
            {/* <StyledTokenSelect value={tokenPlacements} onChange={tokenPlacementChange}> */}
              {/* <StyledButton value="BTC" onClick={() => onClickSetActiveToken("BTC")} style={{ fontFamily:"Karla, sans-serif", height:"50px", background: "#0e0304", borderColor: "#0e0304" }}> 
                  <Row>
                    <Col span={12} style={{ lineHeight: "25px", fontSize: "1.5rem" }} >BTC</Col>
                    <Col span={12}>
                      <Row span={30}>$25000</Row>                      
                      <Row span={30}>-2.34%</Row>
                    </Col>
                  </Row>
              </StyledButton>
              <StyledButton value="ETH" onClick={() => onClickSetActiveToken("ETH")} style={{ height:"50px", background: "black", borderColor: "black" }}> 
                  <Row>
                    <Col span={12} style={{ lineHeight: "25px", fontSize: "1.5rem" }} >ETH</Col>
                    <Col span={12}>
                      <Row span={30}>$2100</Row>                      
                      <Row span={30}>+3.74%</Row>
                    </Col>
                  </Row>
              </StyledButton> */}
            {/* </StyledTokenSelect> */}

              {/* <StyledChartTab type="editable-card" onChange={onChange} activeKey={activeKey} 
              // <StyledChartTab type="editable-card" onChange={onChange} activeKey={activeKey} onEdit={onEdit}
                style={{ background:'black', width:'100%', height:'45px'}}>
                {panes.map((pane) => (
                  <TabPane tab={pane.title} key={pane.key} closable={pane.closable}
                    style={{ background:'black', width:'100%', height:'45px'}}>
                    {pane.content}
                  </TabPane>
                ))}
              </StyledChartTab> */}
        
            </div>
            <div className={styles.timeSelector}>
              


              
                {/* <div className={styles.tokenSelector}>
                  {/* <Select 
                    value={activeToken1.symbol} 
                    onChange={onClickDropdown}                  
                    dropdownClassName={styles.dropDownMenu}
                  >
                    {supportedTokens.filter(token => token.symbol !== 'USDT' && token.symbol !== 'USDC' && token.symbol !== 'WMATIC').map((option) => (
                      <Option className={styles.optionItem} value={option.symbol}>{option.symbol} / USD</Option>
                    ))}
                  </Select> */}
                {/* </div> */}
                {/* {lineTitleRender()
                }  */}
                {/* <PerpetualTimeSelector
                  option={placement}
                  options={placements}
                  onChange={placementChange}
                  // style={{ height: '10px'}}
                /> */}
                <StyledSelect value={placement} onChange={placementChange} 
                  style={{ width:'50%', height:'23px'}}>
                  <Radio.Button value="1m" style={{width:'9%'}}>1m</Radio.Button>
                  <Radio.Button value="5m" style={{width:'9%'}}>5m</Radio.Button>
                  <Radio.Button value="15m" style={{width:'9%'}}>15m</Radio.Button>
                  <Radio.Button value="30m" style={{width:'9%'}}>30m</Radio.Button>
                  <Radio.Button value="1h" style={{width:'9%'}}>1h</Radio.Button>
                  <Radio.Button value="2h" style={{width:'9%'}}>2h</Radio.Button>
                  <Radio.Button value="4h" style={{width:'9%'}}>4h</Radio.Button>
                  <Radio.Button value="1d" style={{width:'9%'}}>1D</Radio.Button>
                  <Radio.Button value="1w" style={{width:'9%'}}>1W</Radio.Button>
                </StyledSelect>
            </div>
          {/* K chart */}
              
              
          <div className={styles.kchartBox}>
            <div style={{ backgroundColor: '#0E0304', margin: '10px', height: "450px", display: "flex", flexDirection: "column" }}>
            
              <div className={`${styles.colItem} ${styles.priceChart}`} style={{ flex: 1 }}>
                {
                  // currentAveragePrice === 0 ?
                  // <Spin/>
                  // // : <KChart activeToken0={activeToken0} activeToken1={activeToken1} activeTimeScale={activeTimeScale} currentAveragePrice={currentAveragePrice} />
                  // :
                  <ExchangeTVChart 
                  swapOption={swapOption}
                  fromTokenAddress={fromTokenAddress}
                  toTokenAddress={toTokenAddress}
                  period={placement}
                  infoTokens={infoTokens}
                  chainId={chainId}
                  positions={positions}
                  // savedShouldShowPositionLines,
                  orders={orders}
                  setToTokenAddress={setToTokenAddress}
                  />
                }
              </div>
            </div> 

          </div>

          {/* Position table */}
          {!showTokenTable ?
            <>
              <AcyPerpetualCard style={{ backgroundColor: '#0E0304', padding: '10px' }}>
                <div className={`${styles.colItem} ${styles.priceChart}`}>
                  <div className={`${styles.colItem}`}>
                    <a className={`${styles.colItem} ${styles.optionTab}`} onClick={() => { setTableContent(POSITIONS) }}>Positions</a>
                    <a className={`${styles.colItem} ${styles.optionTab}`} onClick={() => { setTableContent(ORDERS) }}>Orders</a>
                    <a className={`${styles.colItem} ${styles.optionTab}`} onClick={() => { setTableContent(ACTIONS) }}>Actions </a>
                  </div>
                  <div className={styles.positionsTable}>
                    { tableContent == POSITIONS && (
                      <PositionsTable
                        isMobile={isMobile}
                        dataSource={positions}
                        setPendingTxns={setPendingTxns}
                        infoTokens={infoTokens}
                    />
                    )} 
                    { tableContent == ORDERS && (
                      <OrderTable
                        isMobile={isMobile}
                        dataSource={orders}
                        infoTokens={infoTokens}
                      />
                    )}
                    { tableContent == ACTIONS && (
                      <ActionHistoryTable
                        isMobile={isMobile}
                        dataSource={positionsData}
                      />
                    )}
                     
                  </div>
                </div>
              </AcyPerpetualCard>
            </> :
            <>
              <GlpSwapTokenTable
                isBuying={isBuying}
                setIsBuying={setIsBuying}
                setSwapTokenAddress={setSwapTokenAddress}
                setIsWaitingForApproval={setIsWaitingForApproval}
                tokenList={glp_tokenList}
                infoTokens={infoTokens}
                glpAmount={glpAmount}
                glpPrice={glpPrice}
                usdgSupply={glpUsdgSupply}
                totalTokenWeights={totalTokenWeights}
              />
            </>}

          {/* <div className={styles.rowFlexContainer}>
                <div className={`${styles.colItem}`}>
                  <a className={`${styles.colItem} ${styles.optionTab}`} onClick={()=>{setTableContent(POSITIONS)}}>Positions</a>
                  <a className={`${styles.colItem} ${styles.optionTab}`} onClick={()=>{setTableContent(ORDERS)}}>Orders</a>
                  <a className={`${styles.colItem} ${styles.optionTab}`} onClick={()=>{setTableContent(ACTIONS)}}>Actions </a>
                </div>
              </div> */}

          {/* <div className={styles.rowFlexContainer}>
                <div className={`${styles.colItem} ${styles.priceChart}`}>
                  <div className={styles.positionsTable}>
                    <RenderTable/>
                  </div>
                </div>
                <div className={styles.exchangeItem}>
                </div>
          </div> */}

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
        {/* <div className={styles.rowFlexContainer}> */}
        {/* Perpetual Component */}
        <div className={styles.perpetualComponent}>
          <PerpetualComponent
            swapOption={swapOption}
            setSwapOption={setSwapOption}
            activeToken0={activeToken0}
            setActiveToken0={setActiveToken0}
            activeToken1={activeToken1}
            setActiveToken1={setActiveToken1}
            fromTokenAddress={fromTokenAddress}
            setFromTokenAddress={setFromTokenAddress}
            toTokenAddress={toTokenAddress}
            setToTokenAddress={setToTokenAddress}
            positionsMap={positionsMap}
            pendingTxns={pendingTxns}
            setPendingTxns={setPendingTxns}
            savedIsPnlInLeverage={savedIsPnlInLeverage}
            approveOrderBook={approveOrderBook}
            isWaitingForPluginApproval={isWaitingForPluginApproval}
            setIsWaitingForPluginApproval={setIsWaitingForPluginApproval}
            isPluginApproving={isPluginApproving}
            isConfirming={isConfirming}
            setIsConfirming={setIsConfirming}
            isPendingConfirmation={isPendingConfirmation}
            setIsPendingConfirmation={setIsPendingConfirmation}
            isBuying={isBuying}
            setIsBuying={setIsBuying}
            onChangeMode={onChangeMode}
            swapTokenAddress={swapTokenAddress}
            setSwapTokenAddress={setSwapTokenAddress}
            glp_isWaitingForApproval={isWaitingForApproval}
            glp_setIsWaitingForApproval={setIsWaitingForApproval}
            orders={orders}
          />
        </div>
      </div>
      {/* </div> */}
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

