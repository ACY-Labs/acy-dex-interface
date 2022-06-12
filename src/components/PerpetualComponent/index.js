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
  AcyDescriptions,
  AcyPerpetualButton
} from '@/components/Acy';
import { PriceBox } from './components/PriceBox';
import ConfirmationBox from './components/ConfirmationBox';
import { GlpSwapBox, GlpSwapDetailBox } from './components/GlpSwapBox'
import PerpetualTabs from './components/PerpetualTabs'
import { MARKET, LIMIT, LONG, SHORT, SWAP, POOL, DEFAULT_HIGHER_SLIPPAGE_AMOUNT } from './constant'

import {
  USD_DECIMALS,
  USDG_ADDRESS,
  USDG_DECIMALS,
  GLP_DECIMALS,
  BASIS_POINTS_DIVISOR,
  MARGIN_FEE_BASIS_POINTS,
  PLACEHOLDER_ACCOUNT,
  PRECISION,
  DUST_BNB,
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
  isTriggerRatioInverted,
  getLeverage,
  getLiquidationPrice,
  calculatePositionDelta,
  getSavedSlippageAmount,
  approveTokens,
  shouldRaiseGasError,
  helperToast,
  replaceNativeTokenAddress,
  getMostAbundantStableToken,
} from '@/acy-dex-futures/utils'
import { getConstant } from '@/acy-dex-futures/utils/Constants'
import Reader from '@/acy-dex-futures/abis/Reader.json'
import Vault from '@/acy-dex-futures/abis/Vault.json'
import Router from '@/acy-dex-futures/abis/Router.json'
import GlpManager from '@/acy-dex-futures/abis/GlpManager.json'
import Glp from '@/acy-dex-futures/abis/Glp.json'
import useSWR from 'swr'

// swapBox compontent end
import { connect } from 'umi';
import styles from './styles.less';
import { ethers } from "ethers"

import { useWeb3React } from '@web3-react/core';
// import { binance, injected } from '@/connectors';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import * as Api from '@/acy-dex-futures/Api';
import WETHABI from '@/abis/WETH.json';

import { Slider, Checkbox, Tooltip } from 'antd';
import { useConstantLoader } from '@/constants';
import { useConnectWallet } from '@/components/ConnectWallet';
import { AcyRadioButton } from '@/components/AcyRadioButton';
import { constantInstance } from '@/constants';
import BuyInputSection from '@/pages/BuyGlp/components/BuyInputSection'

import styled from "styled-components";

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
    perpetuals
  } = useConstantLoader(props);

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
    isConfirming,
    setIsConfirming,
    isPendingConfirmation,
    setIsPendingConfirmation,
    isBuying,
    setIsBuying,
    onChangeMode,
    swapTokenAddress,
    setSwapTokenAddress,
    glp_isWaitingForApproval,
    glp_setIsWaitingForApproval,
    orders,
    minExecutionFee
  } = props;

  const connectWalletByLocalStorage = useConnectWallet();
  const { active, activate } = useWeb3React();

  const [mode, setMode] = useState(LONG);
  const [type, setType] = useState(MARKET);
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [anchorOnFromAmount, setAnchorOnFromAmount] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isConfirming, setIsConfirming] = useState(false);
  const [modalError, setModalError] = useState(false);
  const [ordersToaOpen, setOrdersToaOpen] = useState(false);
  const [isHigherSlippageAllowed, setIsHigherSlippageAllowed] = useState(false);


  const savedSlippageAmount = getSavedSlippageAmount(chainId)

  let allowedSlippage = savedSlippageAmount;
  if (isHigherSlippageAllowed) {
    allowedSlippage = DEFAULT_HIGHER_SLIPPAGE_AMOUNT;
  }

  const tokens = perpetuals.tokenList;
  const whitelistedTokens = tokens.filter(t => t.symbol !== "USDG")
  const stableTokens = tokens.filter(token => token.isStable);
  const indexTokens = whitelistedTokens.filter(token => !token.isStable && !token.isWrapped);
  const shortableTokens = indexTokens.filter(token => token.isShortable);
  let toTokens = tokens;

  const isLong = mode === LONG;
  const isShort = mode === SHORT;
  const isSwap = mode === SWAP;

  if (isLong) {
    toTokens = indexTokens;
  }
  if (isShort) {
    toTokens = shortableTokens;
  }

  const [fromTokenAddress, setFromTokenAddress] = useState("0x0000000000000000000000000000000000000000");
  const initialToToken = perpetuals.getTokenBySymBol("BTC").address;
  console.log("initialToToken: ", initialToToken, chainId)
  const [toTokenAddress, setToTokenAddress] = useState(initialToToken);
  // const [fromTokenInfo, setFromTokenInfo] = useState();
  // const [toTokenInfo, setToTokenInfo] = useState();
  // const [fees, setFees] = useState(0.1);
  // const [leverage, setLeverage] = useState(5);
  // const [isLeverageSliderEnabled, setIsLeverageSliderEnabled] = useState(true);
  // const [entryPriceLimit, setEntryPriceLimit] = useState(0);
  // const [priceValue, setPriceValue] = useState('');
  // const [shortCollateralAddress, setShortCollateralAddress] = useState('0xf97f4df75117a78c1A5a0DBb814Af92458539FB4');
  // const [isWaitingForPluginApproval, setIsWaitingForPluginApproval] = useState(false);


  const tokenAddresses = tokens.map(token => token.address)
  const readerAddress = perpetuals.getContract("Reader")
  const vaultAddress = perpetuals.getContract("Vault")
  const usdgAddress = perpetuals.getContract("USDG")
  const nativeTokenAddress = perpetuals.getContract("NATIVE_TOKEN")
  const routerAddress = perpetuals.getContract("Router")
  const orderBookAddress = perpetuals.getContract("OrderBook")
  const glpManagerAddress = perpetuals.getContract("GlpManager")
  const glpAddress = perpetuals.getContract("GLP")
  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([chainId, readerAddress, "getTokenBalances", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
  })
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
  console.log("test orderbook approved: ", routerAddress, account, orderBookAddress, orderBookApproved)
  const tokenAllowanceAddress = fromTokenAddress === AddressZero ? nativeTokenAddress : fromTokenAddress;
  const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR([chainId, tokenAllowanceAddress,"allowance", account || PLACEHOLDER_ACCOUNT, routerAddress], {
    fetcher: fetcher(library, Glp)
  });

  console.log("test needOrderBookApproval: ", type!==MARKET, !orderBookApproved)
  const needOrderBookApproval = type !== MARKET && !orderBookApproved;
  const prevNeedOrderBookApproval = usePrevious(needOrderBookApproval);

  useEffect(() => {
    if (
      !needOrderBookApproval &&
      prevNeedOrderBookApproval &&
      isWaitingForPluginApproval
    ) {
      setIsWaitingForPluginApproval(false);
      helperToast.success(<div>Orders enabled!</div>);
    }
  }, [
    needOrderBookApproval,
    prevNeedOrderBookApproval,
    setIsWaitingForPluginApproval,
    isWaitingForPluginApproval
  ]);



  const [triggerPriceValue, setTriggerPriceValue] = useState("");
  const triggerPriceUsd = type === MARKET ? 0 : parseValue(triggerPriceValue, USD_DECIMALS);
  const onTriggerPriceChange = evt => {
    setTriggerPriceValue(evt.target.value || "");
  };
  const onTriggerRatioChange = evt => {
    setTriggerRatioValue(evt.target.value || "");
  };

  

  // default collateral address on ARBITRUM
  
  const shortCollateralAddressInitAddr = perpetuals.getTokenBySymBol("USDT").address;
  const [shortCollateralAddress, setShortCollateralAddress] = useState(shortCollateralAddressInitAddr);
  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo)
  console.log("test multichain: tokens", infoTokens, tokens)
  const fromToken = perpetuals.getToken(fromTokenAddress);
  const toToken = perpetuals.getToken(toTokenAddress);
  
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
  const collateralTokenAddress = isLong
    ? indexTokenAddress
    : shortCollateralAddress;
  const collateralToken = perpetuals.getToken(collateralTokenAddress);

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

  const getTokenLabel = () => {
    if (isLong) {
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
      helperToast.success(<div>{fromToken.symbol} approved!</div>);
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

    if (isLong || isShort) {
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
      isLong ? toTokenInfo.maxPrice : toTokenInfo.minPrice;
    exitMarkPrice =
      isLong ? toTokenInfo.minPrice : toTokenInfo.maxPrice;
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
  if (isLong) {
    positionKey = getPositionKey(
      toTokenAddress,
      toTokenAddress,
      true,
      nativeTokenAddress
    );
  }
  if (isShort) {
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

  const selectFromToken = symbol => {
    const token = getTokenfromSymbol(tokens, symbol)
    setFromTokenAddress(token.address);
    setIsWaitingForApproval(false);
    if (isShort && token.isStable) {
      setShortCollateralAddress(token.address);
    }
  };

  useEffect(() => {
    const fromToken = getTokenfromSymbol(tokens, activeToken0.symbol)
    const toToken = getTokenfromSymbol(tokens, activeToken1.symbol)

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

  const createIncreaseOrder = () => {
    console.log("inside createIncreaseOrder")
    let path = [fromTokenAddress];

    if (path[0] === USDG_ADDRESS) {
      if (isLong) {
        const stableToken = getMostAbundantStableToken(chainId, infoTokens);
        path.push(stableToken.address);
      } else {
        path.push(shortCollateralAddress);
      }
    }

    const minOut = 0;
    const indexToken = perpetuals.getToken(indexTokenAddress);
    const successMsg = `
      Created limit order for ${indexToken.symbol} ${isLong ? "Long" : "Short"}: ${formatAmount(toUsdMax, USD_DECIMALS, 2)} USD!`;
    return Api.createIncreaseOrder(
      chainId,
      library,
      nativeTokenAddress,
      path,
      fromAmount,
      indexTokenAddress,
      minOut,
      toUsdMax,
      collateralTokenAddress,
      isLong,
      triggerPriceUsd,
      {
        pendingTxns,
        setPendingTxns,
        sentMsg: "Limit order submitted!",
        successMsg,
        failMsg: "Limit order creation failed.",
      }
    )
      .then(() => {
        setIsConfirming(false);
      })
      .finally(() => {
        setIsSubmitting(false);
        setIsPendingConfirmation(false);
      });
  };

  // refers to gmx 9c6b4a8 commit
  const increasePosition = async () => {
    console.log("try to increasePosition");
    setIsSubmitting(true);
    const tokenAddress0 = fromTokenAddress === AddressZero ? nativeTokenAddress : fromTokenAddress;
    const indexTokenAddress = toTokenAddress === AddressZero ? nativeTokenAddress : toTokenAddress;
    let path = [indexTokenAddress]; // assume long
    if (toTokenAddress !== fromTokenAddress) {
      path = [tokenAddress0, indexTokenAddress];
    }

    if (fromTokenAddress === AddressZero && toTokenAddress === nativeTokenAddress) {
      path = [nativeTokenAddress];
    }

    if (fromTokenAddress === nativeTokenAddress && toTokenAddress === AddressZero) {
      path = [nativeTokenAddress];
    }

    if (isShort) {
      path = [shortCollateralAddress];
      if (tokenAddress0 !== shortCollateralAddress) {
        path = [tokenAddress0, shortCollateralAddress];
      }
    }

    const refPrice = isLong ? toTokenInfo.maxPrice : toTokenInfo.minPrice;
    const priceBasisPoints = isLong ? BASIS_POINTS_DIVISOR + allowedSlippage : BASIS_POINTS_DIVISOR - allowedSlippage;
    const priceLimit = refPrice.mul(priceBasisPoints).div(BASIS_POINTS_DIVISOR);

    const boundedFromAmount = fromAmount ? fromAmount : bigNumberify(0);

    if (fromAmount && fromAmount.gt(0) && fromTokenAddress === USDG_ADDRESS && isLong) {
      const { amount: nextToAmount, path: multiPath } = getNextToAmount(
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
      if (nextToAmount.eq(0)) {
        helperToast.error("Insufficient liquidity");
        return;
      }
      if (multiPath) {
        path = replaceNativeTokenAddress(multiPath);
      }
    }

    let params = [
      path, // _path
      indexTokenAddress, // _indexToken
      boundedFromAmount, // _amountIn
      0, // _minOut
      toUsdMax, // _sizeDelta
      isLong, // _isLong
      priceLimit, // _acceptablePrice
    ];

    let method = "increasePosition";	
    let value = bigNumberify(0);	
    if (fromTokenAddress === AddressZero) {	
      method = "increasePositionETH";	
      value = boundedFromAmount;	
      params = [path, indexTokenAddress, 0, toUsdMax, isLong, priceLimit];
    }

    if (shouldRaiseGasError(getTokenInfo(infoTokens, fromTokenAddress), fromAmount)) {
      setIsSubmitting(false);
      setIsPendingConfirmation(false);
      helperToast.error(
        `Leave at least ${formatAmount(DUST_BNB, 18, 3)} ${getConstant(chainId, "nativeTokenSymbol")} for gas`
      );
      return;
    }

    console.log("increasePosition 2: ", params);
    const contract = new ethers.Contract(routerAddress, Router, library.getSigner());
    const indexToken = getTokenInfo(infoTokens, indexTokenAddress);
    const tokenSymbol = indexToken.isWrapped ? getConstant(chainId, "nativeTokenSymbol") : indexToken.symbol;
    const successMsg = `Requested increase of ${tokenSymbol} ${isLong ? "Long" : "Short"} by ${formatAmount(
      toUsdMax,
      USD_DECIMALS,
      2
    )} USD.`;
    
    Api.callContract(chainId, contract, method, params, {
      value,
      setPendingTxns,
      sentMsg: `${isLong ? "Long" : "Short"} submitted.`,
      failMsg: `${isLong ? "Long" : "Short"} failed.`,
      successMsg,
    })
      .then(async () => {
        setIsConfirming(false);
        
      })
      .finally(() => {
        setIsConfirming(false);
        setIsSubmitting(false);
        setIsPendingConfirmation(false);
      });
  };

  const onConfirmationClick = () => {
    if (!account) {
      connectWalletByLocalStorage()
      return;
    }

    if (needOrderBookApproval) {
      approveOrderBook();
      // return;
    }

    setIsPendingConfirmation(true);

    if (type === LIMIT) {
      createIncreaseOrder();
      return;
    }

    increasePosition();
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
        `${isLong ? "Longing" : "Shorting"} ${toTokenInfo.symbol
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
      if (isLong && entryMarkPrice.lt(triggerPriceUsd)) {
        return ["Price above Mark Price"];
      }
      if (mode !== LONG && entryMarkPrice.gt(triggerPriceUsd)) {
        return ["Price below Mark Price"];
      }
    }

    if (isLong) {
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

    if (isShort) {
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

    if (isLong) {
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

    // TODO terms and condition pop up, we dont have it now
    if (needOrderBookApproval) {
      setOrdersToaOpen(true);
      // return;
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
  if (isLong && toTokenInfo && toTokenInfo.fundingRate) {
    borrowFeeText = formatAmount(toTokenInfo.fundingRate, 4, 4) + "% / 1h";
  }
  if (isShort && shortCollateralToken && shortCollateralToken.fundingRate) {
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
  if (fromUsdMin) {
    payBalance = `$${formatAmount(fromUsdMin, USD_DECIMALS, 2, true, 0)}`
  }
  if (toUsdMax) {
    receiveBalance = `$${formatAmount(toUsdMax, USD_DECIMALS, 2, true)}`
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
  const glpPrice = (aumInUsdg && aumInUsdg.gt(0) && glpSupply && glpSupply.gt(0) ) ? aumInUsdg.mul(expandDecimals(1, GLP_DECIMALS)).div(glpSupply) : expandDecimals(1, USD_DECIMALS)
  // const glpPrice = (aum && aum.gt(0) && glpSupply.gt(0)) ? aum.mul(expandDecimals(1, GLP_DECIMALS)).div(glpSupply) : expandDecimals(1, USD_DECIMALS)
  let glpBalanceUsd
  if (glpBalance) {
    glpBalanceUsd = glpBalance.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS))
  }
  const glpSupplyUsd = glpSupply ? glpSupply.mul(glpPrice).div(expandDecimals(1, GLP_DECIMALS)) : bigNumberify(0)
  const glp_infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, undefined)

  return (
    <div className={styles.mainContent}>
      <AcyPerpetualCard style={{ backgroundColor: 'transparent' }}>
        <div className={styles.modeSelector}>
          <PerpetualTabs
            option={mode}
            options={perpetualMode}
            onChange={modeSelect}
            // style={{height:''}}
          />
        </div>

        {mode !== POOL ?
          <>
            <div className={styles.typeSelector}>
              <PerpetualTabs
                option={type}
                options={perpetualType}
                type="inline"
                onChange={typeSelect}
                style={{height:'30px'}}
              />
            </div>

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
            {(isLong || isShort) &&
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
                    {/* <div className={styles.checkbox}>
                      <StyledCheckbox
                        checked={isLeverageSliderEnabled}
                        onChange={() => {
                          setIsLeverageSliderEnabled(!isLeverageSliderEnabled)
                        }}
                      />
                    </div> */}
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

            <div className={styles.centerButton}>
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
              setPendingTxns={setPendingTxns}
            />
          </>
        }

      </AcyPerpetualCard>

      {/* Long/Short Detail card  */}
      {(isLong || isShort) &&
        <>
          <AcyPerpetualCard style={{ backgroundColor: 'transparent', padding: '10px' }}>

            {/* Profits In */}
            {isLong && (
              <div className={styles.detailCard}>
                <div className={styles.label}>Profits In</div>
                <div className={styles.value}>{toToken.symbol}</div>
              </div>
            )}
            {isShort && (
              <div className={styles.detailCard}>
                <div className={styles.label}>Profits In</div>
                <div className={styles.TooltipHandle}>
                  <span>{shortCollateralToken.symbol}</span>
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
                          {isLong &&
                            "There are more shorts than longs, borrow fees for longing is currently zero"}
                          {isShort &&
                            "There are more longs than shorts, borrow fees for shorting is currently zero"}
                        </div>
                      )}
                      {!hasZeroBorrowFee && (
                        <div>
                          The borrow fee is calculated as (assets borrowed) /
                          (total assets in pool) * 0.01% per hour.
                          <br /><br />
                          {isShort &&
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
            {isShort && toTokenInfo.maxAvailableShort && toTokenInfo.maxAvailableShort.gt(0) &&
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

      {/* Swap detail box */}
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


      {isConfirming && (
        <ConfirmationBox
          fromToken={fromToken}
          fromTokenInfo={fromTokenInfo}
          toToken={toToken}
          toTokenInfo={toTokenInfo}
          isSwap={isSwap}
          isLong={isLong}
          isMarketOrder={type === MARKET}
          type={type}
          isHigherSlippageAllowed={isHigherSlippageAllowed}
          setIsHigherSlippageAllowed={setIsHigherSlippageAllowed}
          isShort={isShort}
          toAmount={toAmount}
          fromAmount={fromAmount}
          onConfirmationClick={onConfirmationClick}
          setIsConfirming={setIsConfirming}
          shortCollateralAddress={shortCollateralAddress}
          hasExistingPosition={hasExistingPosition}
          leverage={leverage}
          existingPosition={existingPosition}
          existingLiquidationPrice={existingLiquidationPrice}
          displayLiquidationPrice={displayLiquidationPrice}
          shortCollateralToken={shortCollateralToken}
          isPendingConfirmation={isPendingConfirmation}
          triggerPriceUsd={triggerPriceUsd}
          triggerRatio={triggerRatio}
          fees={fees}
          feesUsd={feesUsd}
          isSubmitting={isSubmitting}
          fromUsdMin={fromUsdMin}
          toUsdMax={toUsdMax}
          nextAveragePrice={nextAveragePrice}
          collateralTokenAddress={collateralTokenAddress}
          feeBps={feeBps}
          chainId={chainId}
          orders={orders}
        />
      )}

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
