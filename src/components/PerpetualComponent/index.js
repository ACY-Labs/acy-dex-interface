import {
  AcyDescriptions,  
} from '@/components/Acy';
import ComponentCard from '../ComponentCard';
import ComponentButton from '../ComponentButton';
import { PriceBox } from './components/PriceBox';
import ConfirmationBox from './components/ConfirmationBox';
import ComponentTabs from '../ComponentTabs';
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
import Glp from '@/acy-dex-futures/abis/ERC20.json'
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
import { useConnectWallet } from '@/components/ConnectWallet';
import { AcyRadioButton } from '@/components/AcyRadioButton';
import AcyPattern from '@/components/AcyPattern';

import BuyInputSection from '@/pages/BuyGlp/components/BuyInputSection'
import AccountInfoGauge from '../AccountInfoGauge';
import AcyPoolComponent from '../AcyPoolComponent';
import Segmented from '../AcySegmented';
import { useChainId } from '@/utils/helpers';
import { getTokens, getTokenBySymbol, getContract, getTokenByAddress } from '@/constants/future.js';

import styled from "styled-components";

import { JsonRpcProvider } from "@ethersproject/providers";

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

const SwapComponent = props => {
  const { account, library, active } = useWeb3React();
  const { chainId } = useChainId();

  const tokens = getTokens(chainId)
  console.log("test chainId perpetual component", chainId, tokens)

  const {
    swapOption: mode,
    setSwapOption: setMode,

    toTokenAddress,
    setToTokenAddress,
    fromTokenAddress,
    setFromTokenAddress,

    positionsMap,
    pendingTxns,
    setPendingTxns,
    savedIsPnlInLeverage,
    approveOrderBook,
    isWaitingForPluginApproval,
    setIsWaitingForPluginApproval,
    isPluginApproving,
    orders,
  } = props;

  const connectWalletByLocalStorage = useConnectWallet();

  const [type, setType] = useState(MARKET);
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [anchorOnFromAmount, setAnchorOnFromAmount] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
  const [modalError, setModalError] = useState(false);
  const [ordersToaOpen, setOrdersToaOpen] = useState(false);
  const [isHigherSlippageAllowed, setIsHigherSlippageAllowed] = useState(false);


  const savedSlippageAmount = getSavedSlippageAmount(chainId)

  let allowedSlippage = savedSlippageAmount;
  if (isHigherSlippageAllowed) {
    allowedSlippage = DEFAULT_HIGHER_SLIPPAGE_AMOUNT;
  }

  // TODO: check if we need different tokenlist for long and short
  // check if we even need 2 inputs, or 1 just fine? deri only have 1 to select symbol.
  const stableTokens = tokens.filter(token => token.isStable);
  const indexTokens = tokens.filter(token => !token.isStable && !token.isWrapped);
  const shortableTokens = indexTokens.filter(token => token.isShortable);

  const isLong = mode === LONG;
  const isShort = mode === SHORT;
  let toTokens = tokens;


  // const [fromTokenAddress, setFromTokenAddress] = useState("0x0000000000000000000000000000000000000000");
  // const [toTokenAddress, setToTokenAddress] = useState(initialToToken);
  // const [fromTokenInfo, setFromTokenInfo] = useState();
  // const [toTokenInfo, setToTokenInfo] = useState();
  // const [fees, setFees] = useState(0.1);
  // const [leverage, setLeverage] = useState(5);
  // const [isLeverageSliderEnabled, setIsLeverageSliderEnabled] = useState(true);
  // const [entryPriceLimit, setEntryPriceLimit] = useState(0);
  // const [priceValue, setPriceValue] = useState('');
  // const [isWaitingForPluginApproval, setIsWaitingForPluginApproval] = useState(false);

  // TODO: update and remove unused contracts
  // required contracts: router (add/remove liquidity, add/remove margin), pool (trade), reader
  const tokenAddresses = tokens.map(token => token.address)
  const readerAddress = getContract(chainId, "Reader")
  const vaultAddress = getContract(chainId, "Vault")
  const usdgAddress = getContract(chainId, "USDG")
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")
  const routerAddress = getContract(chainId, "Router")
  const orderBookAddress = getContract(chainId, "OrderBook")

  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([chainId, readerAddress, "getTokenBalances", account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
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

  useEffect(() => {
    if (active) {
      function onBlock() {
        updateTokenBalances()
        // updatePositionData(undefined, true)
        updateTotalTokenWeights()
        updateUsdgSupply()
        updateOrderBookApproved()
      }
      library.on('block', onBlock)
      return () => {
        library.removeListener('block', onBlock)
      }
    }
  }, [active, library, chainId,
    updateTokenBalances, updateTotalTokenWeights, updateUsdgSupply,
    updateOrderBookApproved])

  const tokenAllowanceAddress = fromTokenAddress === AddressZero ? nativeTokenAddress : fromTokenAddress;
  const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR([chainId, tokenAllowanceAddress, "allowance", account || PLACEHOLDER_ACCOUNT, routerAddress], {
    fetcher: fetcher(library, Glp)
  });

  console.log("test needOrderBookApproval: ", type !== MARKET, !orderBookApproved)
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

  const [shortCollateralAddress, setShortCollateralAddress] = useState(fromTokenAddress);

  // const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo)
  const infoTokens = {}
  console.log("test multichain: tokens", infoTokens, tokens)
  let fromToken = getTokenByAddress(chainId, fromTokenAddress);
  let toToken = getTokenByAddress(chainId, toTokenAddress);

  const shortCollateralToken = getTokenInfo(infoTokens, shortCollateralAddress);
  const fromTokenInfo = getTokenInfo(infoTokens, fromTokenAddress);
  const toTokenInfo = getTokenInfo(infoTokens, toTokenAddress);

  const fromBalance = fromTokenInfo ? fromTokenInfo.balance : bigNumberify(0);
  const toBalance = toTokenInfo ? toTokenInfo.balance : bigNumberify(0);

  const fromAmount = parseValue(fromValue, fromToken && fromToken.decimals);
  const toAmount = parseValue(toValue, toToken && toToken.decimals);
  const isPotentialWrap = (fromToken?.isNative && toToken.isWrapped) || (fromToken.isWrapped && toToken?.isNative);
  const isWrapOrUnwrap = mode === SWAP && isPotentialWrap;
  const needApproval =
    fromTokenAddress !== AddressZero &&
    tokenAllowance &&
    fromAmount &&
    fromAmount.gt(tokenAllowance) &&
    !isWrapOrUnwrap;
  console.log("needApproval? ", needApproval)
  const prevFromTokenAddress = usePrevious(fromTokenAddress);
  const prevNeedApproval = usePrevious(needApproval);
  const prevToTokenAddress = usePrevious(toTokenAddress);

  // TODO: not sure what does these 2 mean?
  const fromUsdMin = getUsd(fromAmount, fromTokenAddress, false, infoTokens);
  const toUsdMax = getUsd(toAmount, toTokenAddress, true, infoTokens, type, triggerPriceUsd);

  const indexTokenAddress = toTokenAddress === AddressZero ? nativeTokenAddress : toTokenAddress;
  const collateralTokenAddress = shortCollateralAddress;
  const collateralToken = getTokenByAddress(chainId, collateralTokenAddress);

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
    // 0.1: {
    //   style: { color: '#b5b6b6', },
    //   label: '0.1x'
    // },
    1: {
      style: { color: '#b5b6b6', },
      label: '1x'
    },
    // 2: {
    //   style: { color: '#b5b6b6', },
    //   label: '2x'
    // },
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
  useEffect(() => console.log("leverageOption ", leverageOption), [leverageOption])
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
        console.log("onBlock, updateTokenAllowance");
        updateTokenAllowance(undefined, true);
      }
      library.on("block", onBlock);
      return () => {
        library.removeListener("block", onBlock);
      };
    }
  }, [active, library, updateTokenAllowance]);

  // WE NO LONGER USES COLLATERAL TOKEN CONCEPT
  // useEffect(() => {
  //   if (mode !== SHORT) {
  //     return;
  //   }
  //   if (toTokenAddress === prevToTokenAddress) {
  //     return;
  //   }
  //   for (let i = 0; i < stableTokens.length; i++) {
  //     const stableToken = stableTokens[i];
  //     const key = getPositionKey(
  //       stableToken.address,
  //       toTokenAddress,
  //       false,
  //       nativeTokenAddress
  //     );
  //     const position = positionsMap[key];
  //     if (position && position.size && position.size.gt(0)) {
  //       setShortCollateralAddress(position.collateralToken.address);
  //       return;
  //     }
  //   }
  // }, [
  //   toTokenAddress,
  //   prevToTokenAddress,
  //   mode,
  //   positionsMap,
  //   stableTokens,
  //   nativeTokenAddress,
  //   shortCollateralAddress,
  //   setShortCollateralAddress
  // ]);

  // TODO: revise this section. Basically it check if FromInput is active, it calculate the value for ToInput, and vice versa
  // useEffect(() => {
  //   const updateLeverageAmounts = () => {
  //     if (!hasLeverageOption) {
  //       return;
  //     }
  //     if (anchorOnFromAmount) {
  //       if (!fromAmount) {
  //         setToValue("");
  //         return;
  //       }

  //       const toTokenInfo = getTokenInfo(infoTokens, toTokenAddress);
  //       if (
  //         toTokenInfo &&
  //         toTokenInfo.maxPrice &&
  //         fromUsdMin &&
  //         fromUsdMin.gt(0)
  //       ) {
  //         const leverageMultiplier = parseInt(
  //           leverageOption * BASIS_POINTS_DIVISOR
  //         );
  //         const toTokenPriceUsd =
  //           type !== MARKET && triggerPriceUsd && triggerPriceUsd.gt(0)
  //             ? triggerPriceUsd
  //             : toTokenInfo.maxPrice;

  //         const { feeBasisPoints } = getNextToAmount(
  //           chainId,
  //           fromAmount,
  //           fromTokenAddress,
  //           collateralTokenAddress,
  //           infoTokens,
  //           undefined,
  //           undefined,
  //           usdgSupply,
  //           totalTokenWeights
  //         );

  //         let fromUsdMinAfterFee = fromUsdMin;
  //         if (feeBasisPoints) {
  //           fromUsdMinAfterFee = fromUsdMin
  //             .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
  //             .div(BASIS_POINTS_DIVISOR);
  //         }

  //         const toNumerator = fromUsdMinAfterFee.mul(leverageMultiplier).mul(BASIS_POINTS_DIVISOR)
  //         const toDenominator = bigNumberify(MARGIN_FEE_BASIS_POINTS).mul(leverageMultiplier).add(bigNumberify(BASIS_POINTS_DIVISOR).mul(BASIS_POINTS_DIVISOR))

  //         const nextToUsd = toNumerator.div(toDenominator)

  //         const nextToAmount = nextToUsd
  //           .mul(expandDecimals(1, toToken.decimals))
  //           .div(toTokenPriceUsd);

  //         const nextToValue = formatAmountFree(
  //           nextToAmount,
  //           toToken.decimals,
  //           toToken.decimals
  //         );

  //         setToValue(nextToValue);
  //       }
  //       return;
  //     }

  //     if (!toAmount) {
  //       setFromValue("");
  //       return;
  //     }

  //     const fromTokenInfo = getTokenInfo(infoTokens, fromTokenAddress);
  //     if (
  //       fromTokenInfo &&
  //       fromTokenInfo.minPrice &&
  //       toUsdMax &&
  //       toUsdMax.gt(0)
  //     ) {
  //       const leverageMultiplier = parseInt(
  //         leverageOption * BASIS_POINTS_DIVISOR
  //       );

  //       const baseFromAmountUsd = toUsdMax
  //         .mul(BASIS_POINTS_DIVISOR)
  //         .div(leverageMultiplier);

  //       let fees = toUsdMax
  //         .mul(MARGIN_FEE_BASIS_POINTS)
  //         .div(BASIS_POINTS_DIVISOR);

  //       const { feeBasisPoints } = getNextToAmount(
  //         chainId,
  //         fromAmount,
  //         fromTokenAddress,
  //         collateralTokenAddress,
  //         infoTokens,
  //         undefined,
  //         undefined,
  //         usdgSupply,
  //         totalTokenWeights
  //       );

  //       if (feeBasisPoints) {
  //         const swapFees = baseFromAmountUsd
  //           .mul(feeBasisPoints)
  //           .div(BASIS_POINTS_DIVISOR);
  //         fees = fees.add(swapFees);
  //       }

  //       const nextFromUsd = baseFromAmountUsd.add(fees);

  //       const nextFromAmount = nextFromUsd
  //         .mul(expandDecimals(1, fromToken.decimals))
  //         .div(fromTokenInfo.minPrice);

  //       const nextFromValue = formatAmountFree(
  //         nextFromAmount,
  //         fromToken.decimals,
  //         fromToken.decimals
  //       );

  //       setFromValue(nextFromValue);
  //     }
  //   };

  //   if (isLong || isShort) {
  //     updateLeverageAmounts();
  //   }
  // }, [
  //   mode,
  //   type,
  //   anchorOnFromAmount,
  //   fromAmount,
  //   toAmount,
  //   fromToken,
  //   toToken,
  //   fromTokenAddress,
  //   toTokenAddress,
  //   infoTokens,
  //   leverageOption,
  //   fromUsdMin,
  //   toUsdMax,
  //   triggerPriceUsd,
  //   triggerRatio,
  //   hasLeverageOption,
  //   usdgSupply,
  //   totalTokenWeights,
  //   chainId,
  //   collateralTokenAddress,
  //   indexTokenAddress
  // ]);

  // TODO: revise entry price
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

  // TODO: below calculates the current leverage factor given existing position using GMX method, we need to change it to adapt deri style
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

  // UI
  const selectFromToken = symbol => {
    const token = getTokenBySymbol(chainId, symbol)
    setFromTokenAddress(mode, token.address);
    console.log("update from token: ", symbol, token, mode);
    setIsWaitingForApproval(false);
  };

  const selectToToken = symbol => {
    const token = getTokenBySymbol(chainId, symbol)
    console.log("selectToToken symbol and address", symbol, token.address)
    setToTokenAddress(mode, token.address);
  };

  useEffect(() => {
    console.log("update from token 1: ", fromTokenAddress)
  }, [fromTokenAddress])

  // TODO: is this redundant? seems doing things in selectFromToken()
  useEffect(() => {
    fromToken = getTokenByAddress(chainId, fromTokenAddress)
    toToken = getTokenByAddress(chainId, toTokenAddress)
    setFromTokenAddress(mode, fromTokenAddress);
    setToTokenAddress(mode, toTokenAddress);

  }, [chainId, fromTokenAddress, toTokenAddress])

  const onFromValueChange = e => {
    setAnchorOnFromAmount(true);
    setFromValue(e.target.value);
  };

  const onToValueChange = e => {
    setAnchorOnFromAmount(false);
    setToValue(e.target.value);
  };

  // TODO: revise this logic, adapt to deri contract
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
    const indexToken = getTokenByAddress(chainId, indexTokenAddress);
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
  // TODO: revise this logic, adapt to deri contract
  const increasePosition = async () => {
    console.log("try to increasePosition");
    setIsSubmitting(true);
    const tokenAddress0 = fromTokenAddress === AddressZero ? nativeTokenAddress : fromTokenAddress;
    const indexTokenAddress = toTokenAddress === AddressZero ? nativeTokenAddress : toTokenAddress;
    let path = [indexTokenAddress]; // assume long
    if (toTokenAddress !== fromTokenAddress) {
      path = [tokenAddress0];
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
    const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner());
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

  // LONG or SHORT or POOL
  const modeSelect = (input) => {
    setMode(input);
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

    setFromTokenAddress(mode, toTokenAddress)
    setToTokenAddress(mode, fromTokenAddress)
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

    if (leverage && leverage.lt(0.1 * BASIS_POINTS_DIVISOR)) {
      return ["Min leverage: 0.1x"];
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

      if (fromTokenAddress !== toTokenAddress) {
        const { amount: swapAmount } = getNextToAmount(
          chainId,
          toAmount,
          toTokenAddress,
          fromTokenAddress,
          infoTokens,
          undefined,
          undefined,
          usdgSupply,
          totalTokenWeights
        );

        // requiredAmount = requiredAmount.add(swapAmount);
        let requiredAmount = fromAmount.mul(parseInt(leverageOption * 100)).div(100);
        if (
          toToken &&
          toTokenAddress !== USDG_ADDRESS &&
          fromTokenInfo.availableAmount &&
          requiredAmount.gt(fromTokenInfo.availableAmount)
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
          return [`Insufficient liquidity, change "Profits In" 1`];
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
            `Insufficient liquidity, change "Profits In" 2`,
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
      // no more this short limits
      // if (toTokenInfo.maxAvailableShort && toTokenInfo.maxAvailableShort.gt(0) && sizeUsd.gt(toTokenInfo.maxAvailableShort)) {
      //   return [`Max ${toTokenInfo.symbol} short exceeded`]
      // }
      console.log("DEBUG HERE3:", stableTokenAmount, sizeTokens.toString(), shortCollateralToken)
      stableTokenAmount = stableTokenAmount.add(sizeTokens)
      if (stableTokenAmount.gt(shortCollateralToken.availableAmount)) {
        return [`Insufficient liquidity, change "Profits In" 3`];
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

    // TODO: terms and condition pop up, we dont have it now
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

    // TODO: temporarily disabled the useless confirmation box. 
    // It is very useful in GMX, containing a lot of info. But we are not clear if we have sufficient data to display at current stage.
    // this will be in the next release.
    // setIsConfirming(true);
    onConfirmationClick();
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
  if (toUsdMax) {
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

  return (
    <div className={styles.mainContent}>
      <ComponentCard style={{ backgroundColor: 'transparent', height: '1100px' }}>
        <div className={styles.modeSelector}>
          <ComponentTabs
            option={mode}
            options={perpetualMode}
            onChange={modeSelect}
          />
        </div>
        {mode !== POOL ?
          <>
            <AcyPattern leverage={<AcyDescriptions>
              <div className={styles.leverageContainer}>
                <div className={styles.slippageContainer}>
                  <div className={styles.leverageLabel}>
                    <span>Leverage</span>
                    {isLeverageSliderEnabled &&
                      <div className={styles.leverageInputContainer}>
                        <button
                          className={styles.leverageButton}
                          onClick={() => {
                            if (leverageOption > 0.1) {
                              setLeverageOption((parseFloat(leverageOption) - 0.1).toFixed(1))
                            }
                          }}
                        >
                          <span> - </span>
                        </button>
                        <input
                          type="number"
                          value={leverageOption}
                          onChange={e => {
                            // let val = parseFloat(e.target.value.replace(/^(-)*(\d+)\.(\d).*$/, '$1$2.$3')).toFixed(1)
                            let val = parseFloat(e.target.value)
                            if (val < 0.1) {
                              setLeverageOption(0.1)
                            } else if (val >= 0.1 && val <= 30.5) {
                              setLeverageOption(Math.round(val * 10) / 10)
                            } else {
                              setLeverageOption(30.5)
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
                      min={0.1}
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
            </AcyDescriptions>} />
            <div className={styles.typeSelector}>
              <ComponentTabs
                option={type}
                options={perpetualType}
                type="inline"
                onChange={typeSelect}
                style={{ height: '30px' }}
              />
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
            <div style={{ margin: '20px 0' }}>
              <Segmented options={['10%', '25%', '50%', '75%', '100%']} />
            </div>
            {/* Leverage Slider */}
            {(isLong || isShort) && false &&
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
                              if (leverageOption > 0.1) {
                                setLeverageOption((parseFloat(leverageOption) - 0.1).toFixed(1))
                              }
                            }}
                          >
                            <span> - </span>
                          </button>
                          <input
                            type="number"
                            value={leverageOption}
                            onChange={e => {
                              // let val = parseFloat(e.target.value.replace(/^(-)*(\d+)\.(\d).*$/, '$1$2.$3')).toFixed(1)
                              let val = parseFloat(e.target.value)
                              if (val < 0.1) {
                                setLeverageOption(0.1)
                              } else if (val >= 0.1 && val <= 30.5) {
                                setLeverageOption(Math.round(val * 10) / 10)
                              } else {
                                setLeverageOption(30.5)
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
                        min={0.1}
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
              <ComponentButton
                // <AcyButton
                style={{ marginTop: '25px' }}
                onClick={onClickPrimary}
                disabled={!isPrimaryEnabled()}
              >
                {getPrimaryText()}
              </ComponentButton>
              {/* </AcyButton> */}
            </div>
          </>
          : <AcyPoolComponent />
        }

        {/* Long/Short Detail card  */}
        {(isLong || isShort) &&
          <>
            <ComponentCard style={{ backgroundColor: 'transparent', padding: '10px', border: 'none', marginTop: '50px' }}>

              {/*  *Profits In // TODO: how do user withdraw profit from platform? gmx: decided before trade. deri: calculate usd value
              {isLong && (
                <div className={styles.detailCard}>
                  <div className={styles.label}>Profits In</div>
                  <div className={styles.value}>{fromToken.symbol}</div>
                </div>
              )}
              {isShort && (
                <div className={styles.detailCard}>
                  <div className={styles.label}>Profits In</div>
                  <div className={styles.TooltipHandle}>
                    <span>{shortCollateralToken.symbol}</span>
                  </div>
                </div>
              )}/}

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
              {isShort && toTokenInfo && toTokenInfo.maxAvailableShort && toTokenInfo.maxAvailableShort.gt(0) &&
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

              <AccountInfoGauge
                account={account}
                library={library}
                chainId={chainId}
                tokens={tokens}
                active={active}
              />

            </ComponentCard>
          </>
        }

      </ComponentCard>

      {/* {isConfirming && (
        <ConfirmationBox
          fromToken={fromToken}
          fromTokenInfo={fromTokenInfo}
          toToken={toToken}
          toTokenInfo={toTokenInfo}
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
      )} */}

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
