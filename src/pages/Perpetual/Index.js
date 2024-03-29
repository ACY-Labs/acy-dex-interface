import { Menu, Dropdown, message, Radio, Spin, Tabs, Layout } from 'antd';
import { ConsoleSqlOutlined, DownOutlined } from '@ant-design/icons';
import { useWeb3React } from '@web3-react/core';
import React, { Component, useState, useEffect, useRef, useCallback, useMemo, useHistory } from 'react';
import { connect } from 'umi';
import { Button, Row, Col, Icon, Skeleton, Card, Select } from 'antd';
import samplePositionsData from "./SampleData"
import {
  AcyCard,
  AcyIcon,
  AcyTabs,
  AcyModal,
  AcyInput,
  AcyCoinItem,
  AcyApprove,
} from '@/components/Acy';
import { PriceBox } from './components/PriceBox';
import { DetailBox } from './components/DetailBox';
import AcyPool from '@/components/AcyPool';
import AcySymbolNav from '@/components/AcySymbolNav';
import AcySymbol from '@/components/AcySymbol';
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
import { getTransactionsByAccount, appendNewSwapTx, findTokenWithSymbol, findTokenWithAddress } from '@/utils/txData';
import { getConstant } from '@/acy-dex-futures/utils/Constants'
import PerpetualComponent from '@/components/PerpetualComponent';
import ComponentTabs from '@/components/ComponentTabs';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { GlpSwapTokenTable } from '@/components/PerpetualComponent/components/GlpSwapBox'
import TokenWeightChart from './components/TokenWeightChart'
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import styles from './styles.less';
import { columnsPool } from '../Dao/Util.js';
import styled from "styled-components";
import { useConnectWallet } from '@/components/ConnectWallet';
import PositionsTable from './components/PositionsTable';
import ActionHistoryTable from './components/ActionHistoryTable';
import OrderTable from './components/OrderTable'

/// THIS SECTION IS FOR TESTING SWR AND GMX CONTRACT
import { fetcher } from '@/acy-dex-futures/utils';
// import PositionRouter from "@/acy-dex-futures/abis/PositionRouter.json";
import Reader from '@/abis/future-option-power/Reader.json'
import Router from '@/acy-dex-futures/abis/Router.json'
import Vault from '@/acy-dex-futures/abis/Vault.json'
// import VaultV2 from '@/acy-dex-futures/abis/VaultV2.json'
import Token from '@/acy-dex-futures/abis/Token.json'
import GlpManager from '@/acy-dex-futures/abis/GlpManager.json'
import Glp from '@/acy-dex-futures/abis/ERC20.json'
import Usdg from "@/acy-dex-futures/abis/Usdg.json"
import RewardTracker from '@/acy-dex-futures/abis/RewardTracker.json'
import Vester from '@/acy-dex-futures/abis/Vester.json'
import RewardReader from '@/acy-dex-futures/abis/RewardReader.json'
// import ReaderV2 from '@/acy-dex-futures/abis/ReaderV2.json'
import { ethers } from 'ethers'
import useSWR from 'swr'

import { useAlpPriceData, useAlpData, useFeesData } from '@/pages/Stats/Perpetual/dataProvider';
import ChartWrapper from '@/pages/Stats/Perpetual/components/ChartWrapper';
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Cell,
} from 'recharts';
import {
  yaxisFormatterNumber,
  yaxisFormatterPercent,
  yaxisFormatter,
  tooltipLabelFormatter,
  tooltipLabelFormatterUnits,
  tooltipFormatter,
  tooltipFormatterNumber,
  tooltipFormatterPercent,
  formatNumber,
  CHART_HEIGHT,
  YAXIS_WIDTH,
  COLORS,
} from '@/pages/Stats/Perpetual/test'

import { useChainId } from '@/utils/helpers';
import { getContract } from '@/constants/future_option_power.js';
import { getTokens, getTokenBySymbol, getTokenByAddress } from '@/constants/future.js';
import { leftPad } from 'web3-utils';

let indexToken = []
let indexTokens = []
const { AddressZero } = ethers.constants
const { AcyTabPane } = AcyTabs;

// ----------------- fetch data --------------------
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
  for (let i = 0; i < collateralTokens.length; i += 1) {
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


const Swap = props => {
  const { savedIsPnlInLeverage, setSavedIsPnlInLeverage, savedSlippageAmount, pendingTxns, setPendingTxns } = props
  const { account, library, active } = useWeb3React();
  let { chainId } = useChainId();

  //// ui tab
  const defaultTokenSelection = useMemo(() => ({
    ["Pool"]: {
      from: AddressZero,
      to: getTokenBySymbol(chainId, "USDC").address,
    },
    ["Long"]: {
      from: AddressZero,
      to: AddressZero,
    },
    ["Short"]: {
      from: getTokenBySymbol(chainId, "USDC").address,
      to: AddressZero,
    }
  }), [chainId])

  const [tokenSelection, setTokenSelection] = useLocalStorageByChainId(chainId, "Exchange-token-selection-v2", defaultTokenSelection)
  const [swapOption, setSwapOption] = useLocalStorageByChainId(chainId, 'Swap-option-v2', "Long")

  //// prepare tokenlist and from/to token given chainId
  const tokens = getTokens(chainId)

  const [fromToken, setFromToken] = useState(tokens[0])
  const [toToken, setToToken] = useState(tokens[0])

  const setFromTokenAddress = useCallback((selectedSwapOption, address) => {
    const newTokenSelection = JSON.parse(JSON.stringify(tokenSelection))
    newTokenSelection[selectedSwapOption].from = address
    setTokenSelection(newTokenSelection)
    setFromToken(getTokenByAddress(chainId, address))
  }, [tokenSelection, setTokenSelection])

  const setToTokenAddress = useCallback((selectedSwapOption, address) => {
    const newTokenSelection = JSON.parse(JSON.stringify(tokenSelection))
    newTokenSelection[selectedSwapOption].to = address
    setTokenSelection(newTokenSelection)
    setToToken(getTokenByAddress(chainId, address))
  }, [tokenSelection, setTokenSelection])

  const fromTokenAddress = tokenSelection[swapOption].from.toLowerCase()
  const toTokenAddress = tokenSelection[swapOption].to.toLowerCase()

  //// ui
  const [visibleLoading, setVisibleLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [transactionList, setTransactionList] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  //// chart ui
  const [curPrice, setCurPrice] = useState(0);
  const [priceDeltaPercent, setPriceDeltaPercent] = useState(0);
  const [deltaIsMinus, setDeltaIsMinus] = useState(false);

  // this are new states for PERPETUAL
  const [tableContent, setTableContent] = useState(POSITIONS);
  const [positionsData, setPositionsData] = useState([]);

  /// get contract addresses
  // TODO: update and remove unused contracts
  // required contracts: router (add/remove liquidity, add/remove margin), pool (trade), reader
  const readerAddress = getContract(chainId, "reader")
  // const vaultAddress = getContract(chainId, "Vault")
  const usdgAddress = getContract(chainId, "USDG")
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")
  const routerAddress = getContract(chainId, "Router")
  const glpManagerAddress = getContract(chainId, "GlpManager")
  const glpAddress = getContract(chainId, "GLP")
  const orderBookAddress = getContract(chainId, "OrderBook")
  const poolAddress = getContract(chainId, "pool")

  //---------- FOR TESTING 
  // const positionQuery = getPositionQuery(whitelistedTokens, nativeTokenAddress)


  // const { data: positionData, mutate: updatePositionData } = useSWR([chainId, readerAddress, "getPositions", vaultAddress, account], {
  //   fetcher: fetcher(library, Reader, [positionQuery.collateralTokens, positionQuery.indexTokens, positionQuery.isLong]),
  // })
  const tokenAddresses = tokens.map(token => token.address)
  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([chainId, readerAddress, "getTokenBalances", account], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
  })

  // const { data: totalTokenWeights, mutate: updateTotalTokenWeights } = useSWR([chainId, vaultAddress, "totalTokenWeights"], {
  //   fetcher: fetcher(library, Vault),
  // })

  // const { data: usdgSupply, mutate: updateUsdgSupply } = useSWR([chainId, usdgAddress, "totalSupply"], {
  //   fetcher: fetcher(library, Glp),
  // })

  // const { data: orderBookApproved, mutate: updateOrderBookApproved } = useSWR(account && [chainId, routerAddress, "approvedPlugins", account, orderBookAddress], {
  //   fetcher: fetcher(library, Router)
  // });

  // const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo);
  const infoTokens = {};
  // console.log('test params: ', positionQuery, positionData, infoTokens, true, nativeTokenAddress)

  // POSITIONS DATA
  // const { positions, positionsMap } = getPositions(chainId, positionQuery, positionData, infoTokens, true, nativeTokenAddress);
  // useEffect(() => {
  //   if (!supportedTokens) return

  //   // reset on chainId change => supportedTokens change

  //   setIsReceiptObtained(false);
  //   setVisibleLoading(false);
  //   setVisible(false);
  //   setTransactionList([]);
  //   setTableLoading(true);

  //   for (let item of samplePositionsData) {
  //     item['collateralToken'] = findTokenWithSymbol(item.collateralTokenSymbol);
  //     item['indexToken'] = findTokenWithSymbol(item.indexTokenSymbol);
  //     item['liqPrice'] = getLiquidationPrice(item);
  //   }
  //   setPositionsData(samplePositionsData);

  // }, [supportedTokens])

  useEffect(() => {
    console.log("delta", typeof setDeltaIsMinus)
    setDeltaIsMinus(false)
  }, [])

  // ORDER BOOK FEATURES, WHICH WE MIGHT NOT SUPPORT AT THE MOMENT
  const flagOrdersEnabled = true;
  const [orders] = useAccountOrders(flagOrdersEnabled);

  const [isWaitingForPluginApproval, setIsWaitingForPluginApproval] = useState(false);
  const [isPluginApproving, setIsPluginApproving] = useState(false);

  // const approveOrderBook = () => {
  //   setIsPluginApproving(true)
  //   return approvePlugin(chainId, orderBookAddress, {
  //     library,
  //     pendingTxns,
  //     setPendingTxns
  //   }).then(() => {
  //     setIsWaitingForPluginApproval(true)
  //     updateOrderBookApproved(undefined, true);
  //   }).finally(() => {
  //     setIsPluginApproving(false)
  //   })
  // }


  //// data
  // const { data: lastPurchaseTime, mutate: updateLastPurchaseTime } = useSWR(account && [`GlpSwap:lastPurchaseTime:${active}`, chainId, glpManagerAddress, "lastAddedAt", account], {
  //   fetcher: fetcher(library, GlpManager),
  // })
  const { data: symbolsInfo, mutate: updateSymbolsInfo } = useSWR([chainId, readerAddress, "getSymbolsInfo", poolAddress, []], {
    fetcher: fetcher(library, Reader)
  });

  //future_tokens store every symbols in future and its data 
  const future_tokens = symbolsInfo?.filter(ele => ele[0] == "futures")
  let future_tokens_symbol = []
  future_tokens?.forEach((ele) => {
    future_tokens_symbol.push({
      name: ele[1],
      symbol: ele[1].substring(0, 3),
    })
  })
  //future_token stores token symbols without duplicates for tab display
  let future_token = []
  future_tokens_symbol?.forEach((ele) => {
    if (!future_token.includes(ele.symbol)) {
      future_token.push(ele.symbol)
    }
  })

  useEffect(() => {
    if (active) {
      library.on('block', () => {
        // updatePositionData(undefined, true)
        updateTokenBalances(undefined, true)
        // updateTotalTokenWeights(undefined, true)
        // updateUsdgSupply(undefined, true)
        // updateOrderBookApproved(undefined, true)
        // updateLastPurchaseTime(undefined, true)
        updateSymbolsInfo(undefined, true)
      })
      return () => {
        library.removeAllListeners('block')
      }
    }
  }, [active, library, chainId,
    // updatePositionData,
    updateTokenBalances,
    // updateTotalTokenWeights,
    // updateUsdgSupply,
    // updateOrderBookApproved,
    // updateLastPurchaseTime,
    updateSymbolsInfo]
  )

  const [activeSymbol, setActiveSymbol] = useState("BTC")
  const [activeToken, setActiveToken] = useState("BTC");

  const refContainer = useRef();
  refContainer.current = transactionList;

  // connect to provider, listen for wallet to connect
  const connectWalletByLocalStorage = useConnectWallet();
  useEffect(() => {
    if (!account) {
      connectWalletByLocalStorage()
    }
  }, [account]);

  // ui
  // 选择Coin
  const onClickCoin = () => {
    setVisible(true);
  };

  const onCancel = () => {
    setVisible(false);
  };

  const {
    isMobile,
    transaction: { transactions },
    swap: { token0, token1 },
    dispatch
  } = props;

  const onClickSetActiveToken = (e) => {
    console.log("hereim see click token", e)
    setToTokenAddress(swapOption, getTokenBySymbol(chainId, e).address)  // when click tab change token
  }

  const selectChartToken = item => {
    onClickSetActiveToken(item)
  }
  // const [latestPrice, setLatestPrice] = useState(0);
  // const [priceChangePercentDelta, setPpriceChangePercentDelta] = useState(0);
  // const onChangePrice = (curPrice, change) => {
  //   setLatestPrice(curPrice);
  //   setPpriceChangePercentDelta(change);
  // }
  return (
    <PageHeaderWrapper>

      <div className={styles.main}>
        <div className={styles.rowFlexContainer}>
          {swapOption != "Pool"
            ?
            <div className={`${styles.colItem} ${styles.priceChart}`}>
              <div>
                {/* <div className={styles.chartTokenSelectorTab}>
                  <PerpetualTabs
                    option={toToken.symbol}
                    options={KChartTokenList}
                    onChange={selectChartToken}
                  />
                </div> */}
                <AcySymbolNav data={future_token} onChange={selectChartToken} />
                <AcySymbol
                  activeSymbol={activeSymbol}
                  setActiveSymbol={setActiveSymbol}
                  coinList={future_tokens_symbol}
                  // showDrawer={showDrawer}
                  latestPriceColor={priceDeltaPercent * 1 >= 0 && '#0ecc83' || '#fa3c58'}
                  latestPrice={curPrice}
                  latestPricePercentage={priceDeltaPercent}
                />
                <div style={{ backgroundColor: 'black', display: "flex", flexDirection: "column" }}>
                  <ExchangeTVChart
                    chartTokenSymbol={toToken.symbol}
                    pageName="Futures"
                    fromToken={toToken}
                    toToken="USDT"
                    chainId={chainId}
                    activeToken={toToken}
                    curPrice={curPrice}
                    setCurPrice={setCurPrice}
                    priceDeltaPercent={priceDeltaPercent}
                    setPriceDeltaPercent={setPriceDeltaPercent}
                    deltaIsMinus={deltaIsMinus}
                    setDeltaIsMinus={setDeltaIsMinus}
                    // onChangePrice={onChangePrice}
                    setHasPair={true}
                    activeExist={true}
                    setActiveExist={""}
                  />
                </div>
              </div>

              <div className={styles.bottomWrapper}>
                <div className={styles.chartTokenSelectorTab}>
                  <ComponentTabs
                    option={tableContent}
                    options={[POSITIONS, ORDERS, ACTIONS]}
                    onChange={item => { setTableContent(item) }}
                  />
                </div>
                <AcyCard style={{ backgroundColor: 'transparent', padding: '10px', width: '100%', borderTop: '0.75px solid #333333', borderRadius: '0' }}>
                  <div className={`${styles.colItem} ${styles.priceChart}`}>
                    {/* <div className={styles.positionsTable}>
                      {tableContent == POSITIONS && (
                        <PositionsTable
                          isMobile={isMobile}
                          dataSource={positions}
                          setPendingTxns={setPendingTxns}
                          infoTokens={infoTokens}
                        />
                      )}
                      {tableContent == ORDERS && (
                        <OrderTable
                          isMobile={isMobile}
                          dataSource={orders}
                          infoTokens={infoTokens}
                        />
                      )}
                      {tableContent == ACTIONS && (
                        <ActionHistoryTable
                          isMobile={isMobile}
                          dataSource={positionsData}
                        />
                      )}

                    </div> */}
                  </div>
                </AcyCard>
              </div>
            </div>
            :
            <AcyPool />
          }

          <div className={`${styles.colItem} ${styles.perpetualComponent}`}>
            <PerpetualComponent
              swapOption={swapOption}
              setSwapOption={setSwapOption}
              fromTokenAddress={fromTokenAddress}
              setFromTokenAddress={setFromTokenAddress}
              toTokenAddress={toTokenAddress}
              setToTokenAddress={setToTokenAddress}
              // positionsMap={positionsMap}
              positionsMap={{}}
              pendingTxns={pendingTxns}
              setPendingTxns={setPendingTxns}
              savedIsPnlInLeverage={savedIsPnlInLeverage}
              // approveOrderBook={approveOrderBook}
              isWaitingForPluginApproval={isWaitingForPluginApproval}
              setIsWaitingForPluginApproval={setIsWaitingForPluginApproval}
              isPluginApproving={isPluginApproving}
              orders={orders}
            />
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
