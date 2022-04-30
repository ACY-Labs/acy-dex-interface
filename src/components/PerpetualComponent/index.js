/* eslint-disable no-restricted-globals */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
/* eslint-disable react/button-has-type */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable prefer-template */
/* eslint-disable no-inner-declarations */
/* eslint-disable radix */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable import/extensions */
import {
  AcyPerpetualCard,
  AcyTabs,
  AcyButton,
  AcyDescriptions,
  AcyPerpetualButton
} from '@/components/Acy';
// import { AcyPerpetualButton } from '@/components/PerpetualComponent/components/AcyPerpetualButton';
import TokenSelectorModal from '@/components/TokenSelectorModal';
// ymj swapBox components start
import { PriceBox } from './components/PriceBox';
import { DetailBox } from './components/DetailBox';
import { GlpSwapBox, GlpSwapDetailBox } from './components/GlpSwapBox'
import PerpTabs from './components/PerpTabs/PerpTabs'

import { MARKET, LIMIT, LONG, SHORT, SWAP, POOL } from './constant'
import {
  USD_DECIMALS,
  USDG_ADDRESS,
  USDG_DECIMALS,
  GLP_DECIMALS,
  BASIS_POINTS_DIVISOR,
  MARGIN_FEE_BASIS_POINTS,
  PLACEHOLDER_ACCOUNT,
  ARBITRUM_DEFAULT_COLLATERAL_ADDRESS,
  PRECISION,
  getNextToAmount,
  getTokenInfo,
  parseValue,
  getUsd,
  expandDecimals,
  formatAmountFree,
  usePrevious,
  getPositionKey,
  formatAmount,
  fetcher,
  getInfoTokens,
  adjustForDecimals,
  bigNumberify,
  useLocalStorageSerializeKey,
  getNextFromAmount,
  isTriggerRatioInverted,
  getLeverage,
  getLiquidationPrice,
  calculatePositionDelta,
  getSavedSlippageAmount,
  approveTokens,
  shouldRaiseGasError,
  helperToast,
  replaceNativeTokenAddress,
  getExchangeRate
} from '@/acy-dex-futures/utils'
import {
  readerAddress,
  vaultAddress,
  usdgAddress,
  nativeTokenAddress,
  routerAddress,
  orderBookAddress,
  // stakedGlpTrackerAddress,
  glpManagerAddress,
  glpAddress,
  // feeGlpTrackerAddress,
  // glpVesterAddress,
  // rewardReaderAddress,
  tempChainID,
  tempLibrary
} from '@/acy-dex-futures/samples/constants'
import { callContract, useGmxPrice } from '@/acy-dex-futures/core/Perpetual'
import Reader from '@/acy-dex-futures/abis/Reader.json'
import ReaderV2 from '@/acy-dex-futures/abis/ReaderV2.json'
import Vault from '@/acy-dex-futures/abis/Vault.json'
import Token from '@/acy-dex-futures/abis/Token.json'
import Router from '@/acy-dex-futures/abis/Router.json'
import GlpManager from '@/acy-dex-futures/abis/GlpManager.json'
import Glp from '@/acy-dex-futures/abis/Glp.json'
import RewardTracker from '@/acy-dex-futures/abis/RewardTracker.json'
import Vester from '@/acy-dex-futures/abis/Vester.json'
import RewardReader from '@/acy-dex-futures/abis/RewardReader.json'
import useSWR from 'swr'

import { getInfoTokens_test } from './utils'
import Pattern from '@/utils/pattern'

// swapBox compontent end
import { connect } from 'umi';
import styles from './styles.less';
import { sortAddress, abbrNumber } from '@/utils/utils';
import axios from 'axios';
import { ethers } from "ethers"

import { useWeb3React } from '@web3-react/core';
import { binance, injected } from '@/connectors';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import {
  Error,
  approve,
  calculateGasMargin,
  checkTokenIsApproved,
  computeTradePriceBreakdown,
  getAllowance,
  getContract,
  getRouterContract,
  getUserTokenBalance,
  getUserTokenBalanceRaw,
  isZero,
  parseArbitrageLog,
} from '@/acy-dex-swap/utils/index';

// hj add
import { getContractAddress } from '@/acy-dex-futures/utils/Addresses';
import * as Api from '@/acy-dex-futures/core/Perpetual';
import { swapGetEstimated, swap } from '@/acy-dex-swap/core/swap';
import ERC20ABI from '@/abis/ERC20.json';
import WETHABI from '@/abis/WETH.json';

import {
  // Token,
  TokenAmount,
  Pair,
  TradeType,
  Route,
  Trade,
  Percent,
  // Router,
  // WETH,
  // ETHER,
  CurrencyAmount,
  InsufficientReservesError,
} from '@acyswap/sdk';

import { MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import { hexlify } from '@ethersproject/bytes';

import { Row, Col, Button, Input, InputNumber, Icon, Radio, Tabs, Slider, Alert, Checkbox, Tooltip } from 'antd';
import { RiseOutlined, FallOutlined, LineChartOutlined, FieldTimeOutlined } from '@ant-design/icons';
import spinner from '@/assets/loading.svg';
import moment from 'moment';
import { useConstantLoader } from '@/constants';
import { useConnectWallet } from '@/components/ConnectWallet';
import { AcyRadioButton } from '@/components/AcyRadioButton';
import * as defaultToken from '@/acy-dex-futures/samples/TokenList'
import BuyInputSection from '@/pages/BuyGlp/components/BuyInputSection'

import styled from "styled-components";

const { AcyTabPane } = AcyTabs;
const { TabPane } = Tabs;
const { AddressZero } = ethers.constants;

const StyledSlider = styled(Slider)`
  .ant-slider-track {
    background: #929293;
    height: 3px;
  }
  .ant-slider-rail {
    background: #29292c;
    height: 3px;
  }
  .ant-slider-handle {
    background: #929293;
    width: 12px;
    height: 12px;
    border: none;
  }
  .ant-slider-handle-active {
    background: #929293;
    width: 12px;
    height: 12px;
    border: none;
  }
  .ant-slider-dot {
    border: 1.5px solid #29292c;
    border-radius: 1px;
    background: #29292c;
    width: 2px;
    height: 10px;
  }
  .ant-slider-dot-active {
    border: 1.5px solid #929293;
    border-radius: 1px;
    background: #929293;
    width: 2px;
    height: 10px;
  }
  .ant-slider-with-marks {
      margin-bottom: 50px;
  }
`;

const StyledCheckbox = styled(Checkbox)`
  .ant-checkbox .ant-checkbox-inner {
      background-color: transparent;
      border-color: #b5b5b6;
  }
  .ant-checkbox-checked .ant-checkbox-inner {
      background-color: transparent;
      border-color: #b5b5b6;
  }
  .ant-checkbox-disabled .ant-checkbox-inner {
      background-color: #333333;
      border: 1px solid #b5b5b6;
  }
  .ant-checkbox-checked::after {
      border: 1px solid #333333;
  }
  .ant-checkbox::after {
      border: 1px solid #333333;
  }
`;



export function getChartToken(swapOption, fromToken, toToken, chainId) {
  if (!fromToken || !toToken) {
    return;
  }

  if (swapOption !== SWAP) {
    return toToken;
  }

  if (fromToken.isUsdg && toToken.isUsdg) {
    return getTokens(chainId).find((t) => t.isStable);
  }
  if (fromToken.isUsdg) {
    return toToken;
  }
  if (toToken.isUsdg) {
    return fromToken;
  }

  if (fromToken.isStable && toToken.isStable) {
    return toToken;
  }
  if (fromToken.isStable) {
    return toToken;
  }
  if (toToken.isStable) {
    return fromToken;
  }
  
  return toToken;
}

function getToken(tokenlist, tokenAddr) {
  for (let i = 0; i < tokenlist.length; i++) {
    if (tokenlist[i].address === tokenAddr) {
      return tokenlist[i]
    }
  }
  return undefined
}

function getNextAveragePrice({ size, sizeDelta, hasProfit, delta, nextPrice, isLong }) {
  if (!size || !sizeDelta || !delta || !nextPrice) {
    return;
  }
  const nextSize = size.add(sizeDelta);
  let divisor;
  if (isLong) {
    divisor = hasProfit ? nextSize.add(delta) : nextSize.sub(delta);
  } else {
    divisor = hasProfit ? nextSize.sub(delta) : nextSize.add(delta);
  }
  if (!divisor || divisor.eq(0)) {
    return;
  }
  const nextAveragePrice = nextPrice.mul(nextSize).div(divisor);
  return nextAveragePrice;
}

function getTokenfromSymbol(tokenlist, symbol) {
  for (let i = 0; i < tokenlist.length; i++) {
    if (tokenlist[i].symbol === symbol) {
      return tokenlist[i]
    }
  }
  return undefined
}

// var CryptoJS = require("crypto-js");
const SwapComponent = props => {

  const {
    account,
    library,
    chainId,
    tokenList: INITIAL_TOKEN_LIST,
    farmSetting: { INITIAL_ALLOWED_SLIPPAGE },
  } = useConstantLoader(props);
  // const { profitsIn, liqPrice } = props;
  // const { entryPriceMarket, exitPrice, borrowFee, positions } = props;
  // const { infoTokens_test, usdgSupply, positions } = props;
  // const { isConfirming, setIsConfirming } = props;
  // isPendingConfirmation, setIsPendingConfirmation } = props;
  // const { savedSlippageAmount } = props;

  const {
    activeToken0,
    setActiveToken0,
    activeToken1,
    setActiveToken1,
    positionsMap,
    pendingTxns,
    setPendingTxns,
    savedIsPnlInLeverage,
    approveOrderBook,
    isWaitingForPluginApproval,
    setIsWaitingForPluginApproval,
    isPluginApproving,
    setIsConfirming,
    isBuying,
    setIsBuying,
    onChangeMode,
    swapTokenAddress,
    setSwapTokenAddress,
    glp_isWaitingForApproval,
    glp_setIsWaitingForApproval,
  } = props;

  const connectWalletByLocalStorage = useConnectWallet();
  const { active, activate } = useWeb3React();
  const flagOrdersEnabled = true

  const [mode, setMode] = useState(LONG);
  const [type, setType] = useState(MARKET);
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [anchorOnFromAmount, setAnchorOnFromAmount] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isConfirming, setIsConfirming] = useState(false);
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
  const [modalError, setModalError] = useState(false);
  const [ordersToaOpen, setOrdersToaOpen] = useState(false);

  const savedSlippageAmount = getSavedSlippageAmount(chainId)
  const tokens = defaultToken.longTokenList
  const whitelistedTokens = tokens.filter(t => t.symbol !== "USDG")
  const stableTokens = tokens.filter(token => token.isStable);
  const indexTokens = whitelistedTokens.filter(token => !token.isStable && !token.isWrapped);
  const shortableTokens = indexTokens.filter(token => token.isShortable);
  let toTokens = defaultToken.longTokenList;
  if (mode === LONG) {
    toTokens = indexTokens;
  }
  if (mode === SHORT) {
    toTokens = shortableTokens;
  }
  
  const needOrderBookApproval = type !== MARKET && !orderBookApproved;
  const prevNeedOrderBookApproval = usePrevious(needOrderBookApproval);

  useEffect(() => {
    if (
      !needOrderBookApproval &&
      prevNeedOrderBookApproval &&
      isWaitingForPluginApproval
    ) {
      setIsWaitingForPluginApproval(false);
      // helperToast.success(<div>Orders enabled!</div>);
    }
  }, [
    needOrderBookApproval,
    prevNeedOrderBookApproval,
    setIsWaitingForPluginApproval,
    isWaitingForPluginApproval
  ]);

  // when exactIn is true, it means the firt line
  // when exactIn is false, it means the second line
  const [exactIn, setExactIn] = useState(true);

  const [needApprove, setNeedApprove] = useState(false);
  const [approveAmount, setApproveAmount] = useState('0');
  const [approveButtonStatus, setApproveButtonStatus] = useState(true);

  // Breakdown shows the estimated information for swap

  // let [estimatedStatus,setEstimatedStatus]=useState();
  const [swapBreakdown, setSwapBreakdown] = useState();
  const [swapButtonState, setSwapButtonState] = useState(false);
  const [swapButtonContent, setSwapButtonContent] = useState('Connect to Wallet');
  const [swapStatus, setSwapStatus] = useState();

  const [pair, setPair] = useState();
  const [route, setRoute] = useState();
  const [trade, setTrade] = useState();
  const [slippageAdjustedAmount, setSlippageAdjustedAmount] = useState();
  const [minAmountOut, setMinAmountOut] = useState();
  const [maxAmountIn, setMaxAmountIn] = useState();
  const [wethContract, setWethContract] = useState();
  const [wrappedAmount, setWrappedAmount] = useState();
  const [showSpinner, setShowSpinner] = useState(false);

  const [methodName, setMethodName] = useState();
  const [midTokenAddress, setMidTokenAddress] = useState();
  const [poolExist, setPoolExist] = useState(true);

  // ymj useState
  const [fromTokenAddress, setFromTokenAddress] = useState("0x0000000000000000000000000000000000000000");
  const [toTokenAddress, setToTokenAddress] = useState("0x6E59735D808E49D050D0CB21b0c9549D379BBB39");
  // const [fromTokenInfo, setFromTokenInfo] = useState();
  // const [toTokenInfo, setToTokenInfo] = useState();
  // const [fees, setFees] = useState(0.1);
  // const [leverage, setLeverage] = useState(5);
  // const [isLeverageSliderEnabled, setIsLeverageSliderEnabled] = useState(true);
  const [entryPriceLimit, setEntryPriceLimit] = useState(0);
  // const [priceValue, setPriceValue] = useState('');
  // const [shortCollateralAddress, setShortCollateralAddress] = useState('0xf97f4df75117a78c1A5a0DBb814Af92458539FB4');
  // const [isWaitingForPluginApproval, setIsWaitingForPluginApproval] = useState(false);

  // hj add to

  const [triggerPriceValue, setTriggerPriceValue] = useState("");
  const triggerPriceUsd = type === MARKET ? 0 : parseValue(triggerPriceValue, USD_DECIMALS);
  const onTriggerPriceChange = evt => {
    setTriggerPriceValue(evt.target.value || "");
  };
  const onTriggerRatioChange = evt => {
    setTriggerRatioValue(evt.target.value || "");
  };

  // ymj const
  // const individualFieldPlaceholder = 'Enter amount';
  // const dependentFieldPlaceholder = 'Estimated value';
  // const slippageTolerancePlaceholder = 'Please input a number from 1.00 to 100.00';

  const tokenAddresses = tokens.map(token => token.address)
  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([chainId, readerAddress, "getTokenBalances", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
  })
  console.log("token balances", tokenBalances);
  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address)
  const { data: vaultTokenInfo, mutate: updateVaultTokenInfo } = useSWR([chainId, readerAddress, "getFullVaultTokenInfo"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, expandDecimals(1, 18), whitelistedTokenAddresses]),
  })
  const { data: fundingRateInfo, mutate: updateFundingRateInfo } = useSWR([chainId, readerAddress, "getFundingRates"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, whitelistedTokenAddresses]),
  })
  const { data: totalTokenWeights, mutate: updateTotalTokenWeights } = useSWR([chainId, vaultAddress, "totalTokenWeights"], {
    fetcher: fetcher(library, Vault),
  })
  const { data: usdgSupply, mutate: updateUsdgSupply } = useSWR([chainId, usdgAddress, "totalSupply"], {
    fetcher: fetcher(library, Glp),
  })
  const { data: orderBookApproved, mutate: updateOrderBookApproved } = useSWR([chainId, routerAddress, "approvedPlugins", account || PLACEHOLDER_ACCOUNT, orderBookAddress], {
    fetcher: fetcher(library, Router)
  });
  const tokenAllowanceAddress = fromTokenAddress === AddressZero ? nativeTokenAddress : fromTokenAddress;
  const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR([chainId, tokenAllowanceAddress,"allowance", account || PLACEHOLDER_ACCOUNT, routerAddress], {
    fetcher: fetcher(library, Glp)
  });

  // default collateral address on ARBITRUM
  const [shortCollateralAddress, setShortCollateralAddress] = useState("0xF82eEeC2C58199cb409788E5D5806727cf549F9f")

  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo)
  const fromToken = getToken(tokens, fromTokenAddress);
  const toToken = getToken(toTokens, toTokenAddress);
  
  const shortCollateralToken = getTokenInfo(infoTokens, shortCollateralAddress);
  const fromTokenInfo = getTokenInfo(infoTokens, fromTokenAddress);
  const toTokenInfo = getTokenInfo(infoTokens, toTokenAddress);

  const fromBalance = fromTokenInfo ? fromTokenInfo.balance : bigNumberify(0);
  const toBalance = toTokenInfo ? toTokenInfo.balance : bigNumberify(0);

  const fromAmount = parseValue(fromValue, fromToken && fromToken.decimals);
  const toAmount = parseValue(toValue, toToken && toToken.decimals);
  
  const isPotentialWrap = (fromToken.isNative && toToken.isWrapped) || (fromToken.isWrapped && toToken.isNative);
  const isWrapOrUnwrap = mode === SWAP && isPotentialWrap;
  const needApproval =
    fromTokenAddress !== AddressZero &&
    tokenAllowance &&
    fromAmount &&
    fromAmount.gt(tokenAllowance) &&
    !isWrapOrUnwrap;
  const prevFromTokenAddress = usePrevious(fromTokenAddress);
  const prevNeedApproval = usePrevious(needApproval);
  const prevToTokenAddress = usePrevious(toTokenAddress);

  const fromUsdMin = getUsd(fromAmount, fromTokenAddress, false, infoTokens);
  const toUsdMax = getUsd(toAmount, toTokenAddress, true, infoTokens, type, triggerPriceUsd);

  const indexTokenAddress = toTokenAddress === AddressZero ? nativeTokenAddress : toTokenAddress;
  const collateralTokenAddress = mode === LONG
    ? indexTokenAddress
    : shortCollateralAddress;
  const collateralToken = getToken(tokens, collateralTokenAddress);

  const [triggerRatioValue, setTriggerRatioValue] = useState("");
  const triggerRatioInverted = useMemo(() => {
    return isTriggerRatioInverted(fromTokenInfo, toTokenInfo);
  }, [toTokenInfo, fromTokenInfo]);
  const triggerRatio = useMemo(() => {
    if (!triggerRatioValue) {
      return bigNumberify(0);
    }
    let ratio = parseValue(triggerRatioValue, USD_DECIMALS);
    if (ratio.eq(0)) {
      return bigNumberify(0);
    }
    if (triggerRatioInverted) {
      ratio = PRECISION.mul(PRECISION).div(ratio);
    }
    return ratio;
  }, [triggerRatioValue, triggerRatioInverted]);


  // useCallback(() => {
  //   setFromTokenInfo(getTokenInfo(infoTokens, fromTokenAddress));
  //   setToTokenInfo(getTokenInfo(infoTokens, toTokenAddress));
  //   // setEntryMarkPrice(mode === LONG ? toTokenInfo.maxPrice : toTokenInfo.minPrice);
  // }, [
  //   fromTokenAddress,
  //   toTokenAddress
  // ]);
  // useCallback(() => {
  //   setEntryMarkPrice(mode === LONG ? toTokenInfo.maxPrice : toTokenInfo.minPrice);
  // }, [
  //   toTokenInfo
  // ]);


  const getTokenLabel = () => {
    // if (mode === SWAP) {
    //   return "Receive";
    // }
    if (mode === LONG) {
      return "Long";
    }
    return "Short";
  };

  const leverageMarks = {
    2: {
      style: { color: '#b5b6b6', },
      label: '2x'
    },
    5: {
      style: { color: '#b5b6b6', },
      label: '5x'
    },
    10: {
      style: { color: '#b5b6b6', },
      label: '10x'
    },
    15: {
      style: { color: '#b5b6b6', },
      label: '15x'
    },
    20: {
      style: { color: '#b5b6b6', },
      label: '20x'
    },
    25: {
      style: { color: '#b5b6b6', },
      label: '25x'
    },
    30: {
      style: { color: '#b5b6b6', },
      label: '30x'
    }
  };

  const [leverageOption, setLeverageOption] = useLocalStorageSerializeKey([chainId, "Exchange-swap-leverage-option"], "2");
  const [isLeverageSliderEnabled, setIsLeverageSliderEnabled] = useLocalStorageSerializeKey([chainId, "Exchange-swap-leverage-slider-enabled"], true);
  const hasLeverageOption = isLeverageSliderEnabled && !isNaN(parseFloat(leverageOption));

  useEffect(() => {
    if (
      fromToken &&
      fromTokenAddress === prevFromTokenAddress &&
      !needApproval &&
      prevNeedApproval &&
      isWaitingForApproval
    ) {
      setIsWaitingForApproval(false);
      // helperToast.success(<div>{fromToken.symbol} approved!</div>);
    }
  }, [
    fromTokenAddress,
    prevFromTokenAddress,
    needApproval,
    prevNeedApproval,
    setIsWaitingForApproval,
    fromToken.symbol,
    isWaitingForApproval,
    fromToken
  ]);

  useEffect(() => {
    if (!toTokens.find(token => token.address === toTokenAddress)) {
      setToTokenAddress(mode, toTokens[0].address);
    }
  }, [mode, toTokens, toTokenAddress, setToTokenAddress]);

  useEffect(() => {
    if (active) {
      function onBlock() {
        updateTokenAllowance(undefined, true);
      }
      library.on("block", onBlock);
      return () => {
        library.removeListener("block", onBlock);
      };
    }
  }, [active, library, updateTokenAllowance]);

  useEffect(() => {
    if (mode !== SHORT) {
      return;
    }
    if (toTokenAddress === prevToTokenAddress) {
      return;
    }
    for (let i = 0; i < stableTokens.length; i++) {
      const stableToken = stableTokens[i];
      const key = getPositionKey(
        stableToken.address,
        toTokenAddress,
        false,
        nativeTokenAddress
      );
      const position = positionsMap[key];
      if (position && position.size && position.size.gt(0)) {
        setShortCollateralAddress(position.collateralToken.address);
        return;
      }
    }
  }, [
    toTokenAddress,
    prevToTokenAddress,
    mode,
    positionsMap,
    stableTokens,
    nativeTokenAddress,
    shortCollateralAddress,
    setShortCollateralAddress
  ]);

  useEffect(() => {
    const updateSwapAmounts = () => {
      if (anchorOnFromAmount) {
        if (!fromAmount) {
          setToValue("");
          return;
        }
        if (toToken) {
          const { amount: nextToAmount } = getNextToAmount(
            chainId,
            fromAmount,
            fromTokenAddress,
            toTokenAddress,
            infoTokens,
            undefined,
            type !== MARKET && triggerRatio,
            usdgSupply,
            totalTokenWeights
          );

          const nextToValue = formatAmountFree(
            nextToAmount,
            toToken.decimals,
            toToken.decimals
          );
          setToValue(nextToValue);
        }
        return;
      }

      if (!toAmount) {
        setFromValue("");
        return;
      }
      if (fromToken) {
        const { amount: nextFromAmount } = getNextFromAmount(
          chainId,
          toAmount,
          fromTokenAddress,
          toTokenAddress,
          infoTokens,
          undefined,
          type !== MARKET && triggerRatio,
          usdgSupply,
          totalTokenWeights
        );
        const nextFromValue = formatAmountFree(
          nextFromAmount,
          fromToken.decimals,
          fromToken.decimals
        );
        setFromValue(nextFromValue);
      }
    };

    const updateLeverageAmounts = () => {
      if (!hasLeverageOption) {
        return;
      }
      if (anchorOnFromAmount) {
        if (!fromAmount) {
          setToValue("");
          return;
        }

        const toTokenInfo = getTokenInfo(infoTokens, toTokenAddress);
        if (
          toTokenInfo &&
          toTokenInfo.maxPrice &&
          fromUsdMin &&
          fromUsdMin.gt(0)
        ) {
          const leverageMultiplier = parseInt(
            leverageOption * BASIS_POINTS_DIVISOR
          );
          const toTokenPriceUsd =
            type !== MARKET && triggerPriceUsd && triggerPriceUsd.gt(0)
              ? triggerPriceUsd
              : toTokenInfo.maxPrice;

          const { feeBasisPoints } = getNextToAmount(
            chainId,
            fromAmount,
            fromTokenAddress,
            collateralTokenAddress,
            infoTokens,
            undefined,
            undefined,
            usdgSupply,
            totalTokenWeights
          );

          let fromUsdMinAfterFee = fromUsdMin;
          if (feeBasisPoints) {
            fromUsdMinAfterFee = fromUsdMin
              .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
              .div(BASIS_POINTS_DIVISOR);
          }

          const toNumerator = fromUsdMinAfterFee.mul(leverageMultiplier).mul(BASIS_POINTS_DIVISOR)
          const toDenominator = bigNumberify(MARGIN_FEE_BASIS_POINTS).mul(leverageMultiplier).add(bigNumberify(BASIS_POINTS_DIVISOR).mul(BASIS_POINTS_DIVISOR))

          const nextToUsd = toNumerator.div(toDenominator)

          const nextToAmount = nextToUsd
            .mul(expandDecimals(1, toToken.decimals))
            .div(toTokenPriceUsd);

          const nextToValue = formatAmountFree(
            nextToAmount,
            toToken.decimals,
            toToken.decimals
          );

          setToValue(nextToValue);
        }
        return;
      }

      if (!toAmount) {
        setFromValue("");
        return;
      }

      const fromTokenInfo = getTokenInfo(infoTokens, fromTokenAddress);
      if (
        fromTokenInfo &&
        fromTokenInfo.minPrice &&
        toUsdMax &&
        toUsdMax.gt(0)
      ) {
        const leverageMultiplier = parseInt(
          leverageOption * BASIS_POINTS_DIVISOR
        );

        const baseFromAmountUsd = toUsdMax
          .mul(BASIS_POINTS_DIVISOR)
          .div(leverageMultiplier);

        let fees = toUsdMax
          .mul(MARGIN_FEE_BASIS_POINTS)
          .div(BASIS_POINTS_DIVISOR);

        const { feeBasisPoints } = getNextToAmount(
          chainId,
          fromAmount,
          fromTokenAddress,
          collateralTokenAddress,
          infoTokens,
          undefined,
          undefined,
          usdgSupply,
          totalTokenWeights
        );

        if (feeBasisPoints) {
          const swapFees = baseFromAmountUsd
            .mul(feeBasisPoints)
            .div(BASIS_POINTS_DIVISOR);
          fees = fees.add(swapFees);
        }

        const nextFromUsd = baseFromAmountUsd.add(fees);

        const nextFromAmount = nextFromUsd
          .mul(expandDecimals(1, fromToken.decimals))
          .div(fromTokenInfo.minPrice);

        const nextFromValue = formatAmountFree(
          nextFromAmount,
          fromToken.decimals,
          fromToken.decimals
        );

        setFromValue(nextFromValue);
      }
    };

    // if (mode === SWAP) {
    //   updateSwapAmounts();
    // }

    if (mode === LONG || mode === SHORT) {
      updateLeverageAmounts();
    }
  }, [
    mode,
    type,
    anchorOnFromAmount,
    fromAmount,
    toAmount,
    fromToken,
    toToken,
    fromTokenAddress,
    toTokenAddress,
    infoTokens,
    leverageOption,
    fromUsdMin,
    toUsdMax,
    triggerPriceUsd,
    triggerRatio,
    hasLeverageOption,
    usdgSupply,
    totalTokenWeights,
    chainId,
    collateralTokenAddress,
    indexTokenAddress
  ]);

  let entryMarkPrice;
  let exitMarkPrice;
  if (toTokenInfo) {
    entryMarkPrice =
      mode === LONG ? toTokenInfo.maxPrice : toTokenInfo.minPrice;
    exitMarkPrice =
      mode === LONG ? toTokenInfo.minPrice : toTokenInfo.maxPrice;
  }

  let leverage = bigNumberify(0);
  if (fromUsdMin && toUsdMax && fromUsdMin.gt(0)) {
    const fees = toUsdMax.mul(MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR);
    if (fromUsdMin.sub(fees).gt(0)) {
      leverage = toUsdMax.mul(BASIS_POINTS_DIVISOR).div(fromUsdMin.sub(fees));
    }
  }

  let nextAveragePrice = type === MARKET ? entryMarkPrice : triggerPriceUsd;
  if (hasExistingPosition) {
    let nextDelta
    let nextHasProfit

    if (type === MARKET) {
      nextDelta = existingPosition.delta;
      nextHasProfit = existingPosition.hasProfit;
    } else {
      const data = calculatePositionDelta(
        triggerPriceUsd || bigNumberify(0),
        existingPosition
      );
      nextDelta = data.delta;
      nextHasProfit = data.hasProfit;
    }

    nextAveragePrice = getNextAveragePrice({
      size: existingPosition.size,
      sizeDelta: toUsdMax,
      hasProfit: nextHasProfit,
      delta: nextDelta,
      nextPrice: type === MARKET ? entryMarkPrice : triggerPriceUsd,
      isLong: mode === LONG
    });
  }

  let positionKey;
  if (mode === LONG) {
    positionKey = getPositionKey(
      toTokenAddress,
      toTokenAddress,
      true,
      nativeTokenAddress
    );
  }
  if (mode === SHORT) {
    positionKey = getPositionKey(
      shortCollateralAddress,
      toTokenAddress,
      false,
      nativeTokenAddress
    );
  }

  const existingPosition = positionKey ? positionsMap[positionKey] : undefined;
  const hasExistingPosition = existingPosition && existingPosition.size && existingPosition.size.gt(0);

  const liquidationPrice = getLiquidationPrice({
    isLong: mode === LONG,
    size: hasExistingPosition ? existingPosition.size : bigNumberify(0),
    collateral: hasExistingPosition
      ? existingPosition.collateral
      : bigNumberify(0),
    averagePrice: nextAveragePrice,
    entryFundingRate: hasExistingPosition
      ? existingPosition.entryFundingRate
      : bigNumberify(0),
    cumulativeFundingRate: hasExistingPosition
      ? existingPosition.cumulativeFundingRate
      : bigNumberify(0),
    sizeDelta: toUsdMax,
    collateralDelta: fromUsdMin,
    increaseCollateral: true,
    increaseSize: true
  });

  const existingLiquidationPrice = existingPosition
    ? getLiquidationPrice(existingPosition)
    : undefined;
  let displayLiquidationPrice = liquidationPrice
    ? liquidationPrice
    : existingLiquidationPrice;

  if (hasExistingPosition) {
    const collateralDelta = fromUsdMin ? fromUsdMin : bigNumberify(0);
    const sizeDelta = toUsdMax ? toUsdMax : bigNumberify(0);
    leverage = getLeverage({
      size: existingPosition.size,
      sizeDelta,
      collateral: existingPosition.collateral,
      collateralDelta,
      increaseCollateral: true,
      entryFundingRate: existingPosition.entryFundingRate,
      cumulativeFundingRate: existingPosition.cumulativeFundingRate,
      increaseSize: true,
      hasProfit: existingPosition.hasProfit,
      delta: existingPosition.delta,
      includeDelta: savedIsPnlInLeverage
    });
  } else if (hasLeverageOption) {
    leverage = bigNumberify(parseInt(leverageOption * BASIS_POINTS_DIVISOR));
  }

  const [visible, setVisible] = useState()

  const selectFromToken = symbol => {
    const token = getTokenfromSymbol(tokens, symbol)
    setFromTokenAddress(token.address);
    setIsWaitingForApproval(false);
    if (mode === SHORT && token.isStable) {
      setShortCollateralAddress(token.address);
    }
  };

  useEffect(() => {
    console.log("tokens in useeffect", tokens);
    const fromToken = getTokenfromSymbol(tokens, activeToken0.symbol)
    const toToken = getTokenfromSymbol(tokens, activeToken1.symbol)
    console.log("useeffect fromtoken",fromToken);
    console.log("useeffect totoken",activeToken1);

    setFromTokenAddress(fromToken.address);
    setToTokenAddress(toToken.address);

  }, [activeToken0, activeToken1])


  const selectToToken = symbol => {
    const token = getTokenfromSymbol(tokens, symbol)
    setToTokenAddress(token.address);
    setActiveToken1((tokens.filter(ele => ele.symbol === symbol))[0]);
  };

  const onFromValueChange = e => {
    setAnchorOnFromAmount(true);
    setFromValue(e.target.value);
  };

  const onToValueChange = e => {
    setAnchorOnFromAmount(false);
    setToValue(e.target.value);
  };

  const wrap = async () => {
    setIsSubmitting(true);

    const contract = new ethers.Contract(
      getContractAddress(chainId, 'NATIVE_TOKEN'),
      WETHABI,
      library.getSigner()
    );
    Api.callContract(chainId, contract, 'deposit', {
      value: fromAmount,
      sentMsg: 'Swap submitted!',
      successMsg: `Swapped ${formatAmount(fromAmount, fromToken.decimals, 4, true)} ${fromToken.symbol
        } for ${formatAmount(toAmount, toToken.decimals, 4, true)} ${toToken.symbol}`,
      failMsg: 'Swap failed.',
      setPendingTxns,
    })
      .then(async res => { })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const unwrap = async () => {
    setIsSubmitting(true);

    const contract = new ethers.Contract(
      getContractAddress(chainId, 'NATIVE_TOKEN'),
      WETHABI,
      library.getSigner()
    );
    Api.callContract(chainId, contract, 'withdraw', [fromAmount], {
      sentMsg: 'Swap submitted!',
      failMsg: 'Swap failed.',
      successMsg: `Swapped ${formatAmount(fromAmount, fromToken.decimals, 4, true)} ${fromToken.symbol
        } for ${formatAmount(toAmount, toToken.decimals, 4, true)} ${toToken.symbol}`,
      setPendingTxns,
    })
      .then(async res => { })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const perpetualMode = [LONG, SHORT, POOL];
  const perpetualType = [MARKET, LIMIT]

  // LONG or SHORT
  const modeSelect = (input) => {
    setMode(input);
    onChangeMode(input);
  }

  // MARKET or LIMIT
  const typeSelect = input => {
    setType(input);
  }
  // const calculateFee = () => fees * 100
  // const limitOnChange = (e) => {
  //   const check = Pattern.coinNum.test(e.target.value);
  //   if (check) {
  //     setEntryPriceLimit(e.target.value)
  //     setPriceValue(e.target.value.toString())
  //     setTriggerPriceValue(e.target.value.toString())
  //     if (!e.target.value) {
  //       setEntryPriceLimit(0);
  //       setPriceValue("")
  //       setTriggerPriceValue("")
  //     }
  //   }
  // };
  // const markOnClick = (e) => {
  //   // setTriggerPriceValue(marketPrice.toString());
  //   setTriggerPriceValue(e.toString());
  //   setPriceValue(e.toString())

  // }

  const switchTokens = () => {
    if (fromAmount && toAmount) {
      if (anchorOnFromAmount) {
        setToValue(formatAmountFree(fromAmount, fromToken.decimals, 8));
      } else {
        setFromValue(formatAmountFree(toAmount, toToken.decimals, 8));
      }
      setAnchorOnFromAmount(!anchorOnFromAmount);
    }
    setIsWaitingForApproval(false);

    setFromTokenAddress(toTokenAddress)
    setToTokenAddress(fromTokenAddress)
  };

  const getLeverageError = useCallback(() => {

    if (!toAmount || toAmount.eq(0)) {
      return ["Enter an amount"];
    }

    let toTokenInfo = getTokenInfo(infoTokens, toTokenAddress);
    if (toTokenInfo && toTokenInfo.isStable) {
      return [
        `${mode === LONG ? "Longing" : "Shorting"} ${toTokenInfo.symbol
        } not supported`
      ];
    }

    const fromTokenInfo = getTokenInfo(infoTokens, fromTokenAddress);
    if (
      fromTokenInfo &&
      fromTokenInfo.balance &&
      fromAmount &&
      fromAmount.gt(fromTokenInfo.balance)
    ) {
      return [`Insufficient ${fromTokenInfo.symbol} balance`];
    }

    if (leverage && leverage.eq(0)) {
      return ["Enter an amount"];
    }
    if (type !== MARKET && (!triggerPriceValue || triggerPriceUsd.eq(0))) {
      return ["Enter a price"];
    }

    if (
      !hasExistingPosition &&
      fromUsdMin &&
      fromUsdMin.lt(expandDecimals(10, USD_DECIMALS))
    ) {
      return ["Min order: 10 USD"];
    }

    if (leverage && leverage.lt(1.1 * BASIS_POINTS_DIVISOR)) {
      return ["Min leverage: 1.1x"];
    }

    if (leverage && leverage.gt(30.5 * BASIS_POINTS_DIVISOR)) {
      return ["Max leverage: 30.5x"];
    }

    if (type !== MARKET && entryMarkPrice && triggerPriceUsd) {
      if (mode === LONG && entryMarkPrice.lt(triggerPriceUsd)) {
        return ["Price above Mark Price"];
      }
      if (mode !== LONG && entryMarkPrice.gt(triggerPriceUsd)) {
        return ["Price below Mark Price"];
      }
    }

    if (mode === LONG) {
      let requiredAmount = toAmount;
      if (fromTokenAddress !== toTokenAddress) {
        const { amount: swapAmount } = getNextToAmount(
          chainId,
          fromAmount,
          fromTokenAddress,
          toTokenAddress,
          infoTokens,
          undefined,
          undefined,
          usdgSupply,
          totalTokenWeights
        );
        requiredAmount = requiredAmount.add(swapAmount);

        if (
          toToken &&
          toTokenAddress !== USDG_ADDRESS &&
          toTokenInfo.availableAmount &&
          requiredAmount.gt(toTokenInfo.availableAmount)
        ) {
          return ["Insufficient liquidity"];
        }

        if (
          toTokenInfo.poolAmount &&
          toTokenInfo.bufferAmount &&
          toTokenInfo.bufferAmount.gt(toTokenInfo.poolAmount.sub(swapAmount))
        ) {
          return ["Insufficient liquidity", true, "BUFFER"];
        }

        if (
          fromUsdMin &&
          fromTokenInfo.maxUsdgAmount &&
          fromTokenInfo.maxUsdgAmount.gt(0) &&
          fromTokenInfo.minPrice &&
          fromTokenInfo.usdgAmount
        ) {
          const usdgFromAmount = adjustForDecimals(
            fromUsdMin,
            USD_DECIMALS,
            USDG_DECIMALS
          );
          const nextUsdgAmount = fromTokenInfo.usdgAmount.add(usdgFromAmount);
          if (nextUsdgAmount.gt(fromTokenInfo.maxUsdgAmount)) {
            return [
              `${fromTokenInfo.symbol} pool exceeded, try different token`,
              true,
              "MAX_USDG"
            ];
          }
        }
      }
    }

    if (mode === SHORT) {
      let stableTokenAmount = bigNumberify(0);
      if (
        fromTokenAddress !== shortCollateralAddress &&
        fromAmount &&
        fromAmount.gt(0)
      ) {
        const { amount: nextToAmount } = getNextToAmount(
          chainId,
          fromAmount,
          fromTokenAddress,
          shortCollateralAddress,
          infoTokens,
          undefined,
          undefined,
          usdgSupply,
          totalTokenWeights
        );
        stableTokenAmount = nextToAmount;
        if (stableTokenAmount.gt(shortCollateralToken.availableAmount)) {
          return [`Insufficient liquidity, change "Profits In"`];
        }

        if (
          shortCollateralToken.bufferAmount &&
          shortCollateralToken.poolAmount &&
          shortCollateralToken.bufferAmount.gt(
            shortCollateralToken.poolAmount.sub(stableTokenAmount)
          )
        ) {
          // suggest swapping to collateralToken
          return [
            `Insufficient liquidity, change "Profits In"`,
            true,
            "BUFFER"
          ];
        }

        if (
          fromTokenInfo.maxUsdgAmount &&
          fromTokenInfo.maxUsdgAmount.gt(0) &&
          fromTokenInfo.minPrice &&
          fromTokenInfo.usdgAmount
        ) {
          const usdgFromAmount = adjustForDecimals(
            fromUsdMin,
            USD_DECIMALS,
            USDG_DECIMALS
          );
          const nextUsdgAmount = fromTokenInfo.usdgAmount.add(usdgFromAmount);
          if (nextUsdgAmount.gt(fromTokenInfo.maxUsdgAmount)) {
            return [
              `${fromTokenInfo.symbol} pool exceeded, try different token`,
              true,
              "MAX_USDG"
            ];
          }
        }
      }
      if (
        !shortCollateralToken ||
        !fromTokenInfo ||
        !toTokenInfo ||
        !toTokenInfo.maxPrice ||
        !shortCollateralToken.availableAmount
      ) {
        return ["Fetching token info..."];
      }

      const sizeUsd = toAmount
        .mul(toTokenInfo.maxPrice)
        .div(expandDecimals(1, toTokenInfo.decimals));
      const sizeTokens = sizeUsd
        .mul(expandDecimals(1, shortCollateralToken.decimals))
        .div(shortCollateralToken.minPrice);

      if (toTokenInfo.maxAvailableShort && toTokenInfo.maxAvailableShort.gt(0) && sizeUsd.gt(toTokenInfo.maxAvailableShort)) {
        return [`Max ${toTokenInfo.symbol} short exceeded`]
      }

      stableTokenAmount = stableTokenAmount.add(sizeTokens)
      if (stableTokenAmount.gt(shortCollateralToken.availableAmount)) {
        return [`Insufficient liquidity, change "Profits In"`];
      }
    }

    return [false];
  }, [
    chainId,
    fromAmount,
    fromTokenAddress,
    fromUsdMin,
    // hasExistingPosition,
    infoTokens,
    leverage,
    shortCollateralAddress,
    shortCollateralToken,
    toAmount,
    toToken,
    toTokenAddress,
    totalTokenWeights,
    triggerPriceUsd,
    triggerPriceValue,
    usdgSupply,
    entryMarkPrice
  ]);

  const isPrimaryEnabled = () => {
    if (!active) { return true }
    if (mode !== POOL) {
      const [error, modal] = getLeverageError()
      if (error && !modal) { return false }
    }
    if (needOrderBookApproval && isWaitingForPluginApproval) { return false }
    if ((needApproval && isWaitingForApproval) || isApproving) { return false }
    if (isApproving) { return false }
    if (isSubmitting) { return false }
    return true;
  };

  const getPrimaryText = () => {
    if (!active) { return "Connect Wallet"; }
    if (mode !== POOL) {
      const [error, modal] = getLeverageError()
      if (error && !modal) { return error }
    }

    if (needApproval && isWaitingForApproval) {
      return "Waiting for Approval";
    }
    if (isApproving) {
      return `Approving ${fromToken.symbol}...`;
    }
    if (needApproval) {
      return `Approve ${fromToken.symbol}`;
    }

    if (needOrderBookApproval && isWaitingForPluginApproval) {
      return "Enabling Orders...";
    }
    if (isPluginApproving) {
      return "Enabling Orders...";
    }
    if (needOrderBookApproval) {
      return "Enable Orders";
    }

    if (type !== MARKET)
      return `Create ${type} Order`;

    if (mode === LONG) {
      const indexTokenInfo = getTokenInfo(infoTokens, toTokenAddress);
      if (indexTokenInfo && indexTokenInfo.minPrice) {
        const { amount: nextToAmount } = getNextToAmount(
          chainId,
          fromAmount,
          fromTokenAddress,
          indexTokenAddress,
          infoTokens,
          undefined,
          undefined,
          usdgSupply,
          totalTokenWeights
        );
        const nextToAmountUsd = nextToAmount
          .mul(indexTokenInfo.minPrice)
          .div(expandDecimals(1, indexTokenInfo.decimals));
        if (
          fromTokenAddress === USDG_ADDRESS &&
          nextToAmountUsd.lt(fromUsdMin.mul(98).div(100))
        ) {
          return "High USDG Slippage, Long Anyway";
        }
      }
      return `Long ${toToken.symbol}`;
    }

    return `Short ${toToken.symbol}`;
  };

  function approveFromToken() {
    approveTokens({
      setIsApproving,
      library,
      tokenAddress: fromToken.address,
      spender: routerAddress,
      chainId,
      onApproveSubmitted: () => {
        setIsWaitingForApproval(true);
      },
      infoTokens,
      getTokenInfo,
      pendingTxns
    });
  }

  const onClickPrimary = () => {
    if (!account) {
      connectWalletByLocalStorage()
      return;
    }

    if (needOrderBookApproval) {
      setOrdersToaOpen(true);
      return;
    }

    if (needApproval) {
      approveFromToken();
      return;
    }
    
    if (mode !== POOL) {
      const [, modal, errorCode] = getLeverageError()
      if (modal) {
        setModalError(errorCode);
        return;
      }
    }

    setIsConfirming(true);
  };

  let hasZeroBorrowFee = false;
  let borrowFeeText;
  if (mode === LONG && toTokenInfo && toTokenInfo.fundingRate) {
    borrowFeeText = formatAmount(toTokenInfo.fundingRate, 4, 4) + "% / 1h";
  }
  if (mode === SHORT && shortCollateralToken && shortCollateralToken.fundingRate) {
    borrowFeeText =
      formatAmount(shortCollateralToken.fundingRate, 4, 4) + "% / 1h";
  }

  let fees;
  let feesUsd;
  let feeBps;
  let swapFees;
  let positionFee;
  if (mode === SWAP) {
    if (fromAmount) {
      const { feeBasisPoints } = getNextToAmount(
        chainId,
        fromAmount,
        fromTokenAddress,
        toTokenAddress,
        infoTokens,
        undefined,
        undefined,
        usdgSupply,
        totalTokenWeights
      );
      if (feeBasisPoints !== undefined) {
        fees = fromAmount.mul(feeBasisPoints).div(BASIS_POINTS_DIVISOR);
        const feeTokenPrice =
          fromTokenInfo.address === USDG_ADDRESS
            ? expandDecimals(1, USD_DECIMALS)
            : fromTokenInfo.maxPrice;
        feesUsd = fees
          .mul(feeTokenPrice)
          .div(expandDecimals(1, fromTokenInfo.decimals));
      }
      feeBps = feeBasisPoints;
    }
  } else if (toUsdMax) {
    positionFee = toUsdMax
      .mul(MARGIN_FEE_BASIS_POINTS)
      .div(BASIS_POINTS_DIVISOR);
    feesUsd = positionFee;

    const { feeBasisPoints } = getNextToAmount(
      chainId,
      fromAmount,
      fromTokenAddress,
      collateralTokenAddress,
      infoTokens,
      undefined,
      undefined,
      usdgSupply,
      totalTokenWeights
    );
    if (feeBasisPoints) {
      swapFees = fromUsdMin.mul(feeBasisPoints).div(BASIS_POINTS_DIVISOR);
      feesUsd = feesUsd.add(swapFees);
    }
    feeBps = feeBasisPoints;
  }

  let payBalance = "$0.00"
  let receiveBalance = "$0.00"
  let leverageLabel = ""
  let leverageValue = ""
  if (fromUsdMin) {
    payBalance = `$${formatAmount(fromUsdMin, USD_DECIMALS, 2, true, 0)}`
  }
  if (toUsdMax) {
    receiveBalance = `$${formatAmount(toUsdMax, USD_DECIMALS, 2, true)}`
  }
  if (mode !== SWAP && isLeverageSliderEnabled) {
    leverageLabel = "Leverage: "
    leverageValue = `${parseFloat(leverageOption).toFixed(2)}x`
  }

  // Glp Swap Component
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
  // const { data: reservedAmount, mutate: updateReservedAmount } = useSWR([chainId, glpVesterAddress, "pairAmounts", account || PLACEHOLDER_ACCOUNT], {
  //   fetcher: fetcher(library, Vester),
  // })
  // const { gmxPrice, mutate: updateGmxPrice } = useGmxPrice(chainId, { arbitrum: library }, active)
  // const rewardTrackersForStakingInfo = [ stakedGlpTrackerAddress, feeGlpTrackerAddress ]
  // const { data: stakingInfo, mutate: updateStakingInfo } = useSWR([chainId, rewardReaderAddress, "getStakingInfo", account || PLACEHOLDER_ACCOUNT], {
  //   fetcher: fetcher(library, RewardReader, [rewardTrackersForStakingInfo]),
  // })
  const [glpValue, setGlpValue] = useState("")
  const glpAmount = parseValue(glpValue, GLP_DECIMALS)

  const { data: glpSupply, mutate: updateGlpSupply } = useSWR([chainId, glpAddress, "totalSupply"], {
    fetcher: fetcher(library, Glp),
  })
  // const glpSupply = balancesAndSupplies ? balancesAndSupplies[1] : bigNumberify(0)
  // const glp_usdgSupply = balancesAndSupplies ? balancesAndSupplies[3] : bigNumberify(0)
  // let aum
  // if (aums && aums.length > 0) {
  //   aum = isBuying ? aums[0] : aums[1]
  // }
  const { data: aumInUsdg, mutate: updateAumInUsdg } = useSWR([chainId, glpManagerAddress, "getAumInUsdg", true], {
    fetcher: fetcher(library, GlpManager),
  })
  const glpPrice = (aumInUsdg && aumInUsdg.gt(0) && glpSupply.gt(0)) ? aumInUsdg.mul(expandDecimals(1, GLP_DECIMALS)).div(glpSupply) : expandDecimals(1, USD_DECIMALS)
  // const glpPrice = (aum && aum.gt(0) && glpSupply.gt(0)) ? aum.mul(expandDecimals(1, GLP_DECIMALS)).div(glpSupply) : expandDecimals(1, USD_DECIMALS)
  let glpBalanceUsd
  if (glpBalance) {
    glpBalanceUsd = glpBalance.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS))
  }
  const glpSupplyUsd = glpSupply ? glpSupply.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS)) : bigNumberify(0)

  // let reserveAmountUsd
  // if (reservedAmount) {
  //   reserveAmountUsd = reservedAmount.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS))
  // }

  const glp_infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, undefined)

  return (
    <div>
      <AcyPerpetualCard style={{ backgroundColor: 'transparent' }}>
        <div className={styles.modeSelector}>
          <PerpTabs
            option={mode}
            options={perpetualMode}
            onChange={modeSelect}
          />
        </div>

        {mode !== POOL ?
          <>
            <div className={styles.typeSelector}>
              <PerpTabs
                option={type}
                options={perpetualType}
                type="inline"
                onChange={typeSelect}
              />

              {/* <Tabs
                defaultActiveKey={MARKET}
                onChange={typeSelect}
                size={'small'}
                tabBarGutter={0}
                type="inline"
                tabPosition={'top'}
                tabBarStyle={{ border: '0px black' }}
              // animated={false}
              >
                {perpetualType.map(i => (
                  <TabPane tab={<span>{i.name}{' '}</span>} key={i.id} />
                ))}
              </Tabs> */}
            </div>

            <BuyInputSection
              token={fromToken}
              tokenlist={tokens.filter(token => !token.isWrapped)}
              topLeftLabel="Pay"
              balance={payBalance}
              topRightLabel='Balance: '
              tokenBalance={formatAmount(fromBalance, fromToken.decimals, 4, true)}
              inputValue={fromValue}
              onInputValueChange={onFromValueChange}
              onSelectToken={selectFromToken}
            />

            {/* <div className={styles.arrow} onClick={switchTokens}>
              <Icon style={{ fontSize: '16px' }} type="arrow-down" />
            </div> */}

            <BuyInputSection
              token={toToken}
              tokenlist={toTokens}
              topLeftLabel={getTokenLabel()}
              balance={receiveBalance}
              // topRightLabel={leverageLabel}
              // tokenBalance={leverageValue}
              inputValue={toValue}
              onInputValueChange={onToValueChange}
              onSelectToken={selectToToken}
            />

            {type === LIMIT &&
              <div className={styles.priceBox}>
                <PriceBox
                  priceValue={triggerPriceValue}
                  onChange={onTriggerPriceChange}
                  markOnClick={() => {
                    setTriggerPriceValue(
                      formatAmountFree(entryMarkPrice, USD_DECIMALS, 2)
                    );
                  }}
                  mark={formatAmount(entryMarkPrice, USD_DECIMALS, 2, true)}
                />
              </div>
            }

            {/* Leverage Slider */}
            {(mode === LONG || mode === SHORT) &&
              <AcyDescriptions>
                <div className={styles.leverageContainer}>
                  <div className={styles.slippageContainer}>
                    <div className={styles.leverageLabel}>
                      <span>Leverage</span>
                      {isLeverageSliderEnabled &&
                        <div className={styles.leverageInputContainer}>
                          <button
                            className={styles.leverageButton}
                            onClick={() => {
                              if (leverageOption > 1.1) {
                                setLeverageOption((parseFloat(leverageOption) - 0.1).toFixed(1))
                              }
                            }}
                          >
                            <span> - </span>
                          </button>
                          <input
                            type="number"
                            min={1.1}
                            max={30.5}
                            value={leverageOption}
                            onChange={e => {
                              let val = parseFloat(e.target.value.replace(/^(-)*(\d+)\.(\d).*$/, '$1$2.$3')).toFixed(1)
                              if (val >= 1.1 && val <= 30.5) {
                                setLeverageOption(val)
                              }
                            }}
                            className={styles.leverageInput}
                          />
                          <button
                            className={styles.leverageButton}
                            onClick={() => {
                              if (leverageOption < 30.5) {
                                setLeverageOption((parseFloat(leverageOption) + 0.1).toFixed(1))
                              }
                            }}
                          >
                            <span> + </span>
                          </button>
                        </div>
                      }
                    </div>
                    <div className={styles.checkbox}>
                      <StyledCheckbox
                        checked={isLeverageSliderEnabled}
                        onChange={() => {
                          setIsLeverageSliderEnabled(!isLeverageSliderEnabled)
                        }}
                      />
                    </div>
                  </div>
                  {isLeverageSliderEnabled &&
                    <span className={styles.leverageSlider}>
                      <StyledSlider
                        min={1.1}
                        max={30.5}
                        step={0.1}
                        marks={leverageMarks}
                        value={leverageOption}
                        onChange={value => setLeverageOption(value)}
                        defaultValue={leverageOption}
                        style={{ color: 'red' }}
                      />
                    </span>
                  }
                </div>
              </AcyDescriptions>
            }

            <div>
              <AcyPerpetualButton
                // <AcyButton
                style={{ marginTop: '25px' }}
                onClick={onClickPrimary}
                disabled={!isPrimaryEnabled()}
              >
                {getPrimaryText()}
              </AcyPerpetualButton>
              {/* </AcyButton> */}
            </div>
          </> :
          <>
            <GlpSwapBox 
              isBuying={isBuying} 
              setIsBuying={setIsBuying} 
              swapTokenAddress={swapTokenAddress}
              setSwapTokenAddress={setSwapTokenAddress}
              isWaitingForApproval={glp_isWaitingForApproval}
              setIsWaitingForApproval={glp_setIsWaitingForApproval}
            />
          </>
        }

      </AcyPerpetualCard>

      {/* Long/Short Detail card  */}
      {(mode === LONG || mode === SHORT) &&
        <>
          <AcyPerpetualCard style={{ backgroundColor: 'transparent', padding: '10px' }}>

            {/* Profits In */}
            {mode === LONG && (
              <div className={styles.detailCard}>
                <div className={styles.label}>Profits In</div>
                <div className={styles.value}>{toToken.symbol}</div>
              </div>
            )}
            {mode === SHORT && (
              <div className={styles.detailCard}>
                <div className={styles.label}>Profits In</div>
                <div className={styles.TooltipHandle}>
                  <span>{shortCollateralToken.symbol}</span>
                  {/* <TokenSelectorModal
                    onCancel={() => {
                      setVisible(false)
                    }}
                    width={400}
                    visible={visible}
                    onCoinClick={token => {
                      setVisible(false)
                      setShortCollateralAddress(token.address)
                    }}
                    tokenlist={stableTokens}
                  /> */}
                </div>
              </div>
            )}

            {/* Leverage */}
            <div className={styles.detailCard}>
              <div className={styles.label}>Leverage</div>
              <div className={styles.value}>
                {hasExistingPosition &&
                  toAmount &&
                  toAmount.gt(0) &&
                  `${formatAmount(existingPosition.leverage, 4, 2)}x →`
                }
                {toAmount &&
                  leverage &&
                  leverage.gt(0) &&
                  `${formatAmount(leverage, 4, 2)}x`}
                {!toAmount && leverage && leverage.gt(0) && `-`}
                {leverage && leverage.eq(0) && `-`}
              </div>
            </div>

            {/* Entry Price */}
            <div className={styles.detailCard}>
              <div className={styles.label}>Entry Price</div>
              <div className={styles.value}>
                {hasExistingPosition &&
                  toAmount &&
                  toAmount.gt(0) &&
                  `$${formatAmount(existingPosition.averagePrice, USD_DECIMALS, 2, true)} →`
                }
                {nextAveragePrice &&
                  `$${formatAmount(nextAveragePrice, USD_DECIMALS, 2, true)}`}
                {!nextAveragePrice && `-`}
              </div>
            </div>

            {/* Liq. Price */}
            <div className={styles.detailCard}>
              <div className={styles.label}>Liq. Price</div>
              <div className={styles.value}>
                {hasExistingPosition &&
                  toAmount &&
                  toAmount.gt(0) &&
                  `$${formatAmount(existingLiquidationPrice, USD_DECIMALS, 2, true)} →`
                }
                {toAmount && displayLiquidationPrice &&
                  `$${formatAmount(displayLiquidationPrice, USD_DECIMALS, 2, true)}`
                }
                {!toAmount && displayLiquidationPrice && `-`}
                {!displayLiquidationPrice && `-`}
              </div>
            </div>

            {/* Fees */}
            <div className={styles.detailCard}>
              <div className={styles.label}>Fees</div>
              <div className={styles.value}>
                {!feesUsd && "-"}
                {feesUsd &&
                  <Tooltip
                    placement='bottomLeft'
                    color='#b5b5b6'
                    mouseEnterDelay={0.5}
                    title={() => {
                      return (
                        <>
                          {swapFees && (
                            <div>
                              {collateralToken.symbol} is required for
                              collateral.
                              <br /><br />
                              Swap {fromToken.symbol} to{" "}
                              {collateralToken.symbol} Fee: $
                              {formatAmount(swapFees, USD_DECIMALS, 2, true)}
                              <br /><br />
                            </div>
                          )}
                          <div>
                            Position Fee (0.08% of position size): $
                            {formatAmount(positionFee, USD_DECIMALS, 2, true)}
                          </div>
                        </>
                      )
                    }}
                  >
                    <div className={styles.TooltipHandle}>
                      ${formatAmount(feesUsd, USD_DECIMALS, 2, true)}
                    </div>
                  </Tooltip>
                }
              </div>
            </div>

            {/* Entry Price */}
            <div className={styles.detailCard}>
              <div className={styles.label}>Entry Price</div>
              <Tooltip
                placement='bottomLeft'
                color='#b5b5b6'
                mouseEnterDelay={0.5}
                title={() => {
                  return (
                    <>
                      The position will be opened at{" "}
                      {formatAmount(entryMarkPrice, USD_DECIMALS, 2, true)} USD
                      with a max slippage of{" "}
                      {parseFloat(savedSlippageAmount / 100.0).toFixed(2)}%.
                      <br /><br />
                      The slippage amount can be configured under Settings,
                      found by clicking on your address at the top right of the
                      page after connecting your wallet.
                      <br /><br />
                      <a href="https://gmxio.gitbook.io/gmx/trading#opening-a-position" target="_blank" rel="noopener noreferrer">
                        More Info
                      </a>
                    </>
                  )
                }}
              >
                <div className={styles.TooltipHandle}>
                  {`${formatAmount(entryMarkPrice, USD_DECIMALS, 2, true)} USD`}
                </div>
              </Tooltip>
            </div>

            {/* Exit Price */}
            <div className={styles.detailCard}>
              <div className={styles.label}>Exit Price</div>
              <Tooltip
                placement='bottomLeft'
                color='#b5b5b6'
                mouseEnterDelay={0.5}
                title={() => {
                  return (
                    <>
                      If you have an existing position, the position will be
                      closed at{" "}
                      {formatAmount(entryMarkPrice, USD_DECIMALS, 2, true)} USD.
                      <br /><br />
                      This exit price will change with the price of the asset.
                      <br /><br />
                      <a href="https://gmxio.gitbook.io/gmx/trading#opening-a-position" target="_blank" rel="noopener noreferrer">
                        More Info
                      </a>
                    </>
                  )
                }}
              >
                <div className={styles.TooltipHandle}>
                  {`${formatAmount(exitMarkPrice, USD_DECIMALS, 2, true)} USD`}
                </div>
              </Tooltip>
            </div>

            {/* Borrow Fee */}
            <div className={styles.detailCard}>
              <div className={styles.label}>Borrow Fee</div>
              <Tooltip
                placement='bottomLeft'
                color='#b5b5b6'
                mouseEnterDelay={0.5}
                title={() => {
                  return (
                    <>
                      {hasZeroBorrowFee && (
                        <div>
                          {mode === LONG &&
                            "There are more shorts than longs, borrow fees for longing is currently zero"}
                          {mode === SHORT &&
                            "There are more longs than shorts, borrow fees for shorting is currently zero"}
                        </div>
                      )}
                      {!hasZeroBorrowFee && (
                        <div>
                          The borrow fee is calculated as (assets borrowed) /
                          (total assets in pool) * 0.01% per hour.
                          <br /><br />
                          {mode === SHORT &&
                            `You can change the "Profits In" token above to find lower fees`}
                        </div>
                      )}
                      <br />
                      <a href="https://gmxio.gitbook.io/gmx/trading#opening-a-position" target="_blank" rel="noopener noreferrer">
                        More Info
                      </a>
                    </>
                  )
                }}
              >
                <div className={styles.TooltipHandle}>
                  {borrowFeeText}
                </div>
              </Tooltip>
            </div>

            {/* Available Liquidity */}
            {mode === SHORT && toTokenInfo.maxAvailableShort && toTokenInfo.maxAvailableShort.gt(0) &&
              <div className={styles.detailCard}>
                <div className={styles.label}>Available Liquidity</div>
                <Tooltip
                  placement='bottomLeft'
                  color='#b5b5b6'
                  mouseEnterDelay={0.5}
                  title={() => {
                    return (
                      <>
                        Max {toTokenInfo.symbol} short capacity: ${formatAmount(toTokenInfo.maxGlobalShortSize, USD_DECIMALS, 2, true)}
                        <br /><br />
                        Current {toTokenInfo.symbol} shorts: ${formatAmount(toTokenInfo.globalShortSize, USD_DECIMALS, 2, true)}
                        <br />
                      </>
                    )
                  }}
                >
                  <div className={styles.TooltipHandle}>
                    {formatAmount(toTokenInfo.maxAvailableShort, USD_DECIMALS, 2, true)}
                  </div>
                </Tooltip>
              </div>
            }

          </AcyPerpetualCard>
        </>
      }

      {mode === POOL &&
        <>
          <GlpSwapDetailBox
            isBuying={isBuying}
            setIsBuying={setIsBuying}
            tokens={tokens}
            infoTokens={glp_infoTokens}
            glpPrice={glpPrice}
            glpBalance={glpBalance}
            glpBalanceUsd={glpBalanceUsd}
            // reservedAmount={reservedAmount}
            // reserveAmountUsd={reserveAmountUsd}
            // stakingInfo={stakingInfo}
            glpSupply={glpSupply}
            glpSupplyUsd={glpSupplyUsd}
            // gmxPrice={gmxPrice}
          />
        </>
      }
    </div>
  );
};

export default connect(({ global, transaction, swap, loading }) => ({
  global,
  transaction,
  account: global.account,
  swap,
  loading: loading.global,
}))(SwapComponent);
