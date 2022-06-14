/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider } from "@ethersproject/providers"
import _ from "lodash";
import Token from "@/acy-dex-futures/abis/Token.json";
import OrderBook from "@/acy-dex-futures/abis/OrderBook";
import OrderBookReader from "@/acy-dex-futures/abis/OrderBookReader";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { InjectedConnector, UserRejectedRequestError as UserRejectedRequestErrorInjected} from "@web3-react/injected-connector";
import { useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { notification } from 'antd';
import useSWR from "swr";
import { getContract } from './Addresses';
import { useLocalStorage } from "react-use";
import { constantInstance, useConstantLoader } from '@/constants';
import { format as formatDateFn } from "date-fns";
export const MARKET = 'Market';
export const LIMIT = 'Limit';
export const LONG = 'Long';
export const SHORT = 'Short';
export const USD_DECIMALS = 30;
export const BASIS_POINTS_DIVISOR = 10000;
export const MARGIN_FEE_BASIS_POINTS = 10;
export const LIQUIDATION_FEE = expandDecimals(5, USD_DECIMALS)
export const FUNDING_RATE_PRECISION = 1000000;
export const MAX_LEVERAGE = 100 * 10000;
export const POSITIONS = 'Positions';
export const ACTIONS = 'Actions';
export const ORDERS = 'Orders';
export const USDG_ADDRESS = getContract(97, "USDG");

const { AddressZero } = ethers.constants


export const GLP_COOLDOWN_DURATION = 15 * 60
export const SECONDS_PER_YEAR = 31536000
export const GLP_DECIMALS = 18
export const USDG_DECIMALS = 18
export const PLACEHOLDER_ACCOUNT = ethers.Wallet.createRandom().address
export const PRECISION = expandDecimals(1, USD_DECIMALS)
export const TAX_BASIS_POINTS = 50
export const MINT_BURN_FEE_BASIS_POINTS = 20
export const DEFAULT_MAX_USDG_AMOUNT = expandDecimals(200 * 1000 * 1000, 18)
export const ARBITRUM_DEFAULT_COLLATERAL_SYMBOL = 'USDC'
// export const ARBITRUM_DEFAULT_COLLATERAL_ADDRESS = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'
export const SLIPPAGE_BPS_KEY = "Exchange-swap-slippage-basis-points-v3";
export const DEFAULT_SLIPPAGE_AMOUNT = 20;
export const SWAP_FEE_BASIS_POINTS = 20;
export const STABLE_SWAP_FEE_BASIS_POINTS = 1;
export const STABLE_TAX_BASIS_POINTS = 5;
export const THRESHOLD_REDEMPTION_VALUE = expandDecimals(993, 27); // 0.993
export const MIN_PROFIT_TIME = 3 * 60 * 60; // 3 hours
export const PROFIT_THRESHOLD_BASIS_POINTS = 120;
export const DUST_BNB = "2000000000000000";
export const CHART_PERIODS = {
  "1m": 60, 
  "5m": 60 * 5,
  "15m": 60 * 15,
  "1h": 60 * 60,
  "4h": 60 * 60 * 4,
  "1d": 60 * 60 * 24,
  "1w": 60 * 60 * 24 * 7
};

export const BSC_MAINNET = 56;
export const BSC_TESTNET = 97;
export const POLYGON_MAINNET = 137;
export const POLYGON_TESTNET = 80001;
export const AVALANCHE = 43114;
export const ARBITRUM_TESTNET = 421611;
export const ARBITRUM = 42161;

const supportedChainIds = [ARBITRUM];
const injectedConnector = new InjectedConnector({
  supportedChainIds
});

export function calculatePositionDelta(
  price,
  { size, collateral, isLong, averagePrice, lastIncreasedTime },
  sizeDelta
) {
  if (!sizeDelta) {
    sizeDelta = size;
  }
  const priceDelta = averagePrice.gt(price)
    ? averagePrice.sub(price)
    : price.sub(averagePrice);
  let delta = sizeDelta.mul(priceDelta).div(averagePrice);
  const pendingDelta = delta;

  const minProfitExpired =
    lastIncreasedTime + MIN_PROFIT_TIME < Date.now() / 1000;
  const hasProfit = isLong ? price.gt(averagePrice) : price.lt(averagePrice);
  if (
    !minProfitExpired &&
    hasProfit &&
    delta.mul(BASIS_POINTS_DIVISOR).lte(size.mul(PROFIT_THRESHOLD_BASIS_POINTS))
  ) {
    delta = bigNumberify(0);
  }

  const deltaPercentage = delta.mul(BASIS_POINTS_DIVISOR).div(collateral);
  const pendingDeltaPercentage = pendingDelta
    .mul(BASIS_POINTS_DIVISOR)
    .div(collateral);

  return {
    delta,
    pendingDelta,
    pendingDeltaPercentage,
    hasProfit,
    deltaPercentage
  };
}

export function useLocalStorageSerializeKey(key, value, opts) {
  key = JSON.stringify(key);
  return useLocalStorage(key, value, opts);
}

export function getSavedSlippageAmount(chainId) {
  const [ savedSlippageAmount ] =
    useLocalStorageSerializeKey([chainId, SLIPPAGE_BPS_KEY], DEFAULT_SLIPPAGE_AMOUNT);
    return savedSlippageAmount
}

export function useLocalStorageByChainId(chainId, key, defaultValue) {
  const [internalValue, setInternalValue] = useLocalStorage(key, {});

  const setValue = useCallback(
    value => {
      setInternalValue(internalValue => {
        if (typeof value === "function") {
          value = value(internalValue[chainId] || defaultValue);
        }
        const newInternalValue = {
          ...internalValue,
          [chainId]: value
        };
        return newInternalValue;
      });
    },
    [chainId, setInternalValue, defaultValue]
  );

  let value;
  if (chainId in internalValue) {
    value = internalValue[chainId];
  } else {
    value = defaultValue;
  }

  return [value, setValue];
}

export function getExchangeRate(tokenAInfo, tokenBInfo, inverted) {
    if (
      !tokenAInfo ||
      !tokenAInfo.minPrice ||
      !tokenBInfo ||
      !tokenBInfo.maxPrice
    ) {
      return;
    }
    if (inverted) {
      return tokenAInfo.minPrice.mul(PRECISION).div(tokenBInfo.maxPrice);
    }
    return tokenBInfo.maxPrice.mul(PRECISION).div(tokenAInfo.minPrice);
  }

export function adjustForDecimals(amount, divDecimals, mulDecimals) {
  return amount
    .mul(expandDecimals(1, mulDecimals))
    .div(expandDecimals(1, divDecimals));
}

export const formatKeyAmount = (
  map,
  key,
  tokenDecimals,
  displayDecimals,
  useCommas
) => {
  if (!map || !map[key]) {
    return "...";
  }

  return formatAmount(map[key], tokenDecimals, displayDecimals, useCommas);
};

export function approveTokens({
  setIsApproving,
  library,
  tokenAddress,
  spender,
  chainId,
  onApproveSubmitted,
  getTokenInfo,
  infoTokens,
  pendingTxns,
  setPendingTxns,
  includeMessage
}) {
  setIsApproving(true);
  const contract = new ethers.Contract(
    tokenAddress,
    Token.abi,
    library.getSigner()
  );
  contract
    .approve(spender, ethers.constants.MaxUint256)
    .then(async res => {
      // const txUrl = getExplorerUrl(chainId) + "tx/" + res.hash;
      // helperToast.success(
      //   <div>
      //     Approval submitted!{" "}
      //     <a href={txUrl} target="_blank" rel="noopener noreferrer">
      //       View status.
      //     </a>
      //     <br />
      //   </div>
      // );
      if (onApproveSubmitted) {
        onApproveSubmitted();
      }
      if (getTokenInfo && infoTokens && pendingTxns && setPendingTxns) {
        const token = getTokenInfo(infoTokens, tokenAddress);
        const pendingTxn = {
          hash: res.hash,
          message: includeMessage ? `${token.symbol} Approved!` : false
        };
        setPendingTxns([...pendingTxns, pendingTxn]);
      }
    })
    .catch(e => {
      console.error(e);
      // let failMsg;
      // if (
      //   [
      //     "not enough funds for gas",
      //     "failed to execute call with revert code InsufficientGasFunds"
      //   ].includes(e.data?.message)
      // ) {
      //   failMsg = (
      //     <div>
      //       There is not enough ETH in your account on Arbitrum to send this
      //       transaction.
      //       <br />
      //       <br />
      //       <a
      //         href={"https://arbitrum.io/bridge-tutorial/"}
      //         target="_blank"
      //         rel="noopener noreferrer"
      //       >
      //         Bridge ETH to Arbitrum
      //       </a>
      //     </div>
      //   );
      // } else if (e.message?.includes("User denied transaction signature")) {
      //   failMsg = "Approval was cancelled.";
      // } else {
      //   failMsg = "Approval failed.";
      // }
      // helperToast.error(failMsg);
    })
    .finally(() => {
      setIsApproving(false);
    });
}

export function getTargetUsdgAmount(token, usdgSupply, totalTokenWeights) {
  if (!token || !token.weight || !usdgSupply) {
    return;
  }

  if (usdgSupply.eq(0)) {
    return bigNumberify(0);
  }

  return token.weight.mul(usdgSupply).div(totalTokenWeights);
}

export function getFeeBasisPoints(
  token,
  usdgDelta,
  feeBasisPoints,
  taxBasisPoints,
  increment,
  usdgSupply,
  totalTokenWeights
) {
  if (!token || !token.usdgAmount || !usdgSupply || !totalTokenWeights) {
    return 0;
  }

  feeBasisPoints = bigNumberify(feeBasisPoints);
  taxBasisPoints = bigNumberify(taxBasisPoints);

  const initialAmount = token.usdgAmount;
  let nextAmount = initialAmount.add(usdgDelta);
  if (!increment) {
    nextAmount = usdgDelta.gt(initialAmount)
      ? bigNumberify(0)
      : initialAmount.sub(usdgDelta);
  }

  const targetAmount = getTargetUsdgAmount(
    token,
    usdgSupply,
    totalTokenWeights
  );
  if (!targetAmount || targetAmount.eq(0)) {
    return feeBasisPoints.toNumber();
  }

  const initialDiff = initialAmount.gt(targetAmount)
    ? initialAmount.sub(targetAmount)
    : targetAmount.sub(initialAmount);
  const nextDiff = nextAmount.gt(targetAmount)
    ? nextAmount.sub(targetAmount)
    : targetAmount.sub(nextAmount);

  if (nextDiff.lt(initialDiff)) {
    const rebateBps = taxBasisPoints.mul(initialDiff).div(targetAmount);
    return rebateBps.gt(feeBasisPoints)
      ? 0
      : feeBasisPoints.sub(rebateBps).toNumber();
  }

  let averageDiff = initialDiff.add(nextDiff).div(2);
  if (averageDiff.gt(targetAmount)) {
    averageDiff = targetAmount;
  }
  const taxBps = taxBasisPoints.mul(averageDiff).div(targetAmount);
  return feeBasisPoints.add(taxBps).toNumber();
}

export function getBuyGlpToAmount(
  fromAmount,
  swapTokenAddress,
  infoTokens,
  glpPrice,
  usdgSupply,
  totalTokenWeights
) {
  const defaultValue = { amount: bigNumberify(0), feeBasisPoints: 0 };
  if (
    !fromAmount ||
    !swapTokenAddress ||
    !infoTokens ||
    !glpPrice ||
    !usdgSupply ||
    !totalTokenWeights
  ) {
    return defaultValue;
  }

  const swapToken = getTokenInfo(infoTokens, swapTokenAddress);
  if (!swapToken || !swapToken.minPrice) {
    return defaultValue;
  }

  // for BTC example, BTC has 8 decimals on BSC
  // FIRST line code: glpAmount will be in 8 decimals (in BTC.decimals)
  // fromAmount = 8 decimals
  // swapToken.minPrice = 30 decimals 
  // swapToken.decimals = 8 decimals (variable, depends on particular tokens), so .mul(10**12) to make it to 30 decimals
  
  // SECOND line code: glpAmount is converted to GLP_DECIMALS
  // glpPrice = 18 decimals (fixed)

  let glpAmount = fromAmount.mul(swapToken.minPrice).div(glpPrice.mul(10**12));
  glpAmount = adjustForDecimals(glpAmount, swapToken.decimals, GLP_DECIMALS);
  
  let usdgAmount = fromAmount.mul(swapToken.minPrice).div(PRECISION);
  usdgAmount = adjustForDecimals(usdgAmount, swapToken.decimals, USDG_DECIMALS);
  const feeBasisPoints = getFeeBasisPoints(
    swapToken,
    usdgAmount,
    MINT_BURN_FEE_BASIS_POINTS,
    TAX_BASIS_POINTS,
    true,
    usdgSupply,
    totalTokenWeights
  );

  glpAmount = glpAmount
    .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
    .div(BASIS_POINTS_DIVISOR);

  return { amount: glpAmount, feeBasisPoints };
}

export function getSellGlpFromAmount(
  toAmount,
  swapTokenAddress,
  infoTokens,
  glpPrice,
  usdgSupply,
  totalTokenWeights
) {
  const defaultValue = { amount: bigNumberify(0), feeBasisPoints: 0 };
  if (
    !toAmount ||
    !swapTokenAddress ||
    !infoTokens ||
    !glpPrice ||
    !usdgSupply ||
    !totalTokenWeights
  ) {
    return defaultValue;
  }

  const swapToken = getTokenInfo(infoTokens, swapTokenAddress);
  if (!swapToken || !swapToken.maxPrice) {
    return defaultValue;
  }

  let glpAmount = toAmount.mul(swapToken.maxPrice).div(glpPrice.mul(10**12));
  glpAmount = adjustForDecimals(glpAmount, swapToken.decimals, GLP_DECIMALS);

  let usdgAmount = toAmount.mul(swapToken.maxPrice).div(PRECISION);
  usdgAmount = adjustForDecimals(usdgAmount, swapToken.decimals, USDG_DECIMALS);
  const feeBasisPoints = getFeeBasisPoints(
    swapToken,
    usdgAmount,
    MINT_BURN_FEE_BASIS_POINTS,
    TAX_BASIS_POINTS,
    false,
    usdgSupply,
    totalTokenWeights
  );

  glpAmount = glpAmount
    .mul(BASIS_POINTS_DIVISOR)
    .div(BASIS_POINTS_DIVISOR - feeBasisPoints);

  return { amount: glpAmount, feeBasisPoints };
}

export function getBuyGlpFromAmount(
  toAmount,
  fromTokenAddress,
  infoTokens,
  glpPrice,
  usdgSupply,
  totalTokenWeights
) {
  const defaultValue = { amount: bigNumberify(0) };
  if (
    !toAmount ||
    !fromTokenAddress ||
    !infoTokens ||
    !glpPrice ||
    !usdgSupply ||
    !totalTokenWeights
  ) {
    return defaultValue;
  }

  const fromToken = getTokenInfo(infoTokens, fromTokenAddress);
  if (!fromToken || !fromToken.minPrice) {
    return defaultValue;
  }

  let fromAmount = toAmount.mul(glpPrice).div(fromToken.minPrice);
  fromAmount = adjustForDecimals(fromAmount, GLP_DECIMALS, fromToken.decimals);

  const usdgAmount = toAmount.mul(glpPrice).div(PRECISION);
  const feeBasisPoints = getFeeBasisPoints(
    fromToken,
    usdgAmount,
    MINT_BURN_FEE_BASIS_POINTS,
    TAX_BASIS_POINTS,
    true,
    usdgSupply,
    totalTokenWeights
  );

  fromAmount = fromAmount
    .mul(BASIS_POINTS_DIVISOR)
    .div(BASIS_POINTS_DIVISOR - feeBasisPoints);

  return { amount: fromAmount, feeBasisPoints };
}

export function getSellGlpToAmount(
  toAmount,
  fromTokenAddress,
  infoTokens,
  glpPrice,
  usdgSupply,
  totalTokenWeights
) {
  const defaultValue = { amount: bigNumberify(0) };
  if (
    !toAmount ||
    !fromTokenAddress ||
    !infoTokens ||
    !glpPrice ||
    !usdgSupply ||
    !totalTokenWeights
  ) {
    return defaultValue;
  }

  const fromToken = getTokenInfo(infoTokens, fromTokenAddress);
  if (!fromToken || !fromToken.maxPrice) {
    return defaultValue;
  }

  let fromAmount = toAmount.mul(glpPrice).div(fromToken.maxPrice);
  fromAmount = adjustForDecimals(fromAmount, GLP_DECIMALS, fromToken.decimals);

  const usdgAmount = toAmount.mul(glpPrice).div(PRECISION);
  const feeBasisPoints = getFeeBasisPoints(
    fromToken,
    usdgAmount,
    MINT_BURN_FEE_BASIS_POINTS,
    TAX_BASIS_POINTS,
    false,
    usdgSupply,
    totalTokenWeights
  );

  fromAmount = fromAmount
    .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
    .div(BASIS_POINTS_DIVISOR);

  return { amount: fromAmount, feeBasisPoints };
}

export function getInjectedConnector() {
  return injectedConnector;
}

export const getInjectedHandler = activate => {
  const fn = async () => {
    activate(getInjectedConnector(), e => {
      const chainId =
        localStorage.getItem("SELECTED_NETWORK") || ARBITRUM;

      if (e.message.includes("No Ethereum provider")) {
        return;
      }
      if (e instanceof UserRejectedRequestErrorInjected) {
        return;
      }
      if (e instanceof UnsupportedChainIdError) {
        return;
      }
      console.log(e.toString());
    });
  };
  return fn;
};

export const getTokenInfo = (infoTokens, tokenAddress, replaceNative, nativeTokenAddress) => {
    if (replaceNative && tokenAddress === nativeTokenAddress) {
        return infoTokens[AddressZero]
    }
    return infoTokens[tokenAddress]
}

export function getDeltaStr({ delta, deltaPercentage, hasProfit }) {
    let deltaStr
    let deltaPercentageStr

    if (delta.gt(0)) {
        deltaStr = hasProfit ? "+" : "-"
        deltaPercentageStr = hasProfit ? "+" : "-"
    } else {
        deltaStr = "";
        deltaPercentageStr = "";
    }
    deltaStr += `$${formatAmount(delta, USD_DECIMALS, 2, true)}`
    deltaPercentageStr += `${formatAmount(deltaPercentage, 2, 2)}%`

    return { deltaStr, deltaPercentageStr }
}

export function getPositionKey(collateralTokenAddress, indexTokenAddress, isLong, nativeTokenAddress) {
    const tokenAddress0 = collateralTokenAddress === AddressZero ? nativeTokenAddress : collateralTokenAddress
    const tokenAddress1 = indexTokenAddress === AddressZero ? nativeTokenAddress : indexTokenAddress
    return tokenAddress0 + ":" + tokenAddress1 + ":" + isLong
}

export function getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo, vaultPropsLength) {

    if (!vaultPropsLength) {
        vaultPropsLength = 12
    }
    const fundingRatePropsLength = 2
    const infoTokens = {}

    for (let i = 0; i < tokens.length; i++) {
        const token = JSON.parse(JSON.stringify(tokens[i]))
        if (tokenBalances) {
            token.balance = tokenBalances[i]
        }
        if (token.address === USDG_ADDRESS) {
            token.minPrice = expandDecimals(1, USD_DECIMALS)
            token.maxPrice = expandDecimals(1, USD_DECIMALS)
        }
        infoTokens[token.address] = token
    }
    // console.log("hereim whitelisted", vaultTokenInfo)
    for (let i = 0; i < whitelistedTokens.length; i++) {
        const token = JSON.parse(JSON.stringify(whitelistedTokens[i]))
        // console.log("hereim vault above", vaultTokenInfo)

        if (vaultTokenInfo) {
          // console.log("hereim vault", vaultTokenInfo)
            token.poolAmount = vaultTokenInfo[i * vaultPropsLength]
            token.reservedAmount = vaultTokenInfo[i * vaultPropsLength + 1]
            token.availableAmount = token.poolAmount.sub(token.reservedAmount)
            token.usdgAmount = vaultTokenInfo[i * vaultPropsLength + 2]
            token.redemptionAmount = vaultTokenInfo[i * vaultPropsLength + 3]
            token.weight = vaultTokenInfo[i * vaultPropsLength + 4]
            token.bufferAmount = vaultTokenInfo[i * vaultPropsLength + 5]
            token.maxUsdgAmount = vaultTokenInfo[i * vaultPropsLength + 6]
            token.minPrice = vaultTokenInfo[i * vaultPropsLength + 7]
            token.maxPrice = vaultTokenInfo[i * vaultPropsLength + 8]
            token.guaranteedUsd = vaultTokenInfo[i * vaultPropsLength + 9]

            token.availableUsd = token.isStable
                ? token.poolAmount.mul(token.minPrice).div(expandDecimals(1, token.decimals))
                : token.availableAmount.mul(token.minPrice).div(expandDecimals(1, token.decimals))

            token.managedUsd = token.availableUsd.add(token.guaranteedUsd)
            token.managedAmount = token.managedUsd.mul(expandDecimals(1, token.decimals)).div(token.minPrice)
        }

        if (fundingRateInfo) {
            token.fundingRate = fundingRateInfo[i * fundingRatePropsLength];
            token.cumulativeFundingRate = fundingRateInfo[i * fundingRatePropsLength + 1];
        }

        if (infoTokens[token.address]) {
            token.balance = infoTokens[token.address].balance
        }

        infoTokens[token.address] = token
    }

    return infoTokens
}

// TODO need update to fetch data from subgraph
export function useAccountOrders(flagOrdersEnabled, overrideAccount) {
  const { library, account: connectedAccount } = useWeb3React();
  const active = true; // this is used in Actions.js so set active to always be true
  const account = overrideAccount || connectedAccount;

  const {chainId} = useConstantLoader();
  const shouldRequest = active && account && flagOrdersEnabled;

  const orderBookAddress = getContract(chainId, "OrderBook");
  const orderBookReaderAddress = getContract(chainId, "OrderBookReader");
  const key = shouldRequest ? [active, chainId, orderBookAddress, account] : false;
  const { data: orders = [], mutate: updateOrders } = useSWR(key, {
    dedupingInterval: 5000,
    fetcher: async (active, chainId, orderBookAddress, account) => {
      const provider = getProvider(library, chainId);
      const orderBookContract = new ethers.Contract(orderBookAddress, OrderBook.abi, provider);
      const orderBookReaderContract = new ethers.Contract(orderBookReaderAddress, OrderBookReader.abi, provider);

      const fetchIndexesFromServer = () => {
        const ordersIndexesUrl = `${getServerBaseUrl(chainId)}/orders_indices?account=${account}`;
        return fetch(ordersIndexesUrl)
          .then(async (res) => {
            const json = await res.json();
            const ret = {};
            for (const key of Object.keys(json)) {
              ret[key.toLowerCase()] = json[key].map((val) => parseInt(val.value));
            }

            return ret;
          })
          .catch(() => ({ swap: [], increase: [], decrease: [] }));
      };

      const fetchLastIndex = async (type) => {
        const method = type.toLowerCase() + "OrdersIndex";
        return await orderBookContract[method](account).then((res) => bigNumberify(res._hex).toNumber());
      };

      const fetchLastIndexes = async () => {
        const [swap, increase, decrease] = await Promise.all([
          fetchLastIndex("swap"),
          fetchLastIndex("increase"),
          fetchLastIndex("decrease"),
        ]);

        return { swap, increase, decrease };
      };

      const getRange = (to, from) => {
        const LIMIT = 10;
        const _indexes = [];
        from = from || Math.max(to - LIMIT, 0);
        for (let i = to - 1; i >= from; i--) {
          _indexes.push(i);
        }
        return _indexes;
      };

      const getIndexes = (knownIndexes, lastIndex) => {
        if (knownIndexes.length === 0) {
          return getRange(lastIndex);
        }
        return [
          ...knownIndexes,
          ...getRange(lastIndex, knownIndexes[knownIndexes.length - 1] + 1).sort((a, b) => b - a),
        ];
      };

      const getOrders = async (method, knownIndexes, lastIndex, parseFunc) => {
        const indexes = getIndexes(knownIndexes, lastIndex);
        const ordersData = await orderBookReaderContract[method](orderBookAddress, account, indexes);
        const orders = parseFunc(chainId, ordersData, account, indexes);

        return orders;
      };

      try {
        const [serverIndexes, lastIndexes] = await Promise.all([fetchIndexesFromServer(), fetchLastIndexes()]);
        const [swapOrders = [], increaseOrders = [], decreaseOrders = []] = await Promise.all([
          getOrders("getSwapOrders", serverIndexes.swap, lastIndexes.swap, parseSwapOrdersData),
          getOrders("getIncreaseOrders", serverIndexes.increase, lastIndexes.increase, parseIncreaseOrdersData),
          getOrders("getDecreaseOrders", serverIndexes.decrease, lastIndexes.decrease, parseDecreaseOrdersData),
        ]);
        return [...swapOrders, ...increaseOrders, ...decreaseOrders];
      } catch (ex) {
        console.error(ex);
      }
    },
  });

  return [orders, updateOrders];

}

export function getProvider(library, chainId) {
  if (library) {
    return library.getSigner();
  }
  // let provider;
  // provider = _.sample(RPC_PROVIDERS[chainId]);
  // return new ethers.providers.StaticJsonRpcProvider(provider, { chainId });
  return new JsonRpcProvider('https://arb1.arbitrum.io/rpc');
}

export function getOrderKey(order) {
  return `${order.type}-${order.account}-${order.index}`;
}

export const fetcher = (library, contractInfo, additionalArgs) => (...args) => {
  // eslint-disable-next-line
  const [chainId, arg0, arg1, ...params] = args
  const provider = getProvider(library, chainId);
  const method = ethers.utils.isAddress(arg0) ? arg1 : arg0

  function onError(e) {
    // console.log("hereim fetcher error", e);
    console.error(method, e)
  }

  if (ethers.utils.isHexString(arg0)) {
    const address = arg0
    const contract = new ethers.Contract(address, contractInfo.abi, provider)
    // console.log('fetcher contract', contract)

    try {
      if (additionalArgs) {
        // console.log(method, "fetcher 2")
        // console.log('FETCHER FUNCTION CALLED WITH METHOD  --> ', method);
        // console.log('printing additional args', params, additionalArgs);
        // console.log('printing provider', contract);
        // console.log("debug useSWR: ", contract, method, params.concat(additionalArgs))
        return contract[method](...params.concat(additionalArgs)).catch(onError)
      }
      return contract[method](...params).catch(onError)
    } catch (e) {
      onError(e)
    }
  }
  if (!library) {
    return
  }
  return library[method](arg1,...params).catch(onError);;
}

export function getExplorerUrl(chainId) {
  if (chainId === 3) {
    return "https://ropsten.etherscan.io/";
  } else if (chainId === 42) {
    return "https://kovan.etherscan.io/";
  } else if (chainId === BSC_MAINNET) {
    return "https://bscscan.com/";
  } else if (chainId === BSC_TESTNET) {
    return "https://testnet.bscscan.com/";
  } else if (chainId === ARBITRUM_TESTNET) {
    return "https://rinkeby-explorer.arbitrum.io/";
  } else if (chainId === ARBITRUM) {
    return "https://arbiscan.io/";
  } else if (chainId === AVALANCHE) {
    return "https://snowtrace.io/";
  } else if (chainId === POLYGON_TESTNET) {
    return "https://mumbai.polygonscan.com/"
  } else if (chainId === POLYGON_MAINNET) {
    return "https://polygonscan.com/"
  }
  return "https://etherscan.io/";
}

const GAS_PRICE_ADJUSTMENT_MAP = {
  [ARBITRUM]: "0",
  [AVALANCHE]: "3000000000" // 3 gwei
};

export async function getGasPrice(provider, chainId) {
  if (!provider) {
    return;
  }

  const gasPrice = await provider.getGasPrice();
  const premium = GAS_PRICE_ADJUSTMENT_MAP[chainId] || bigNumberify(0);

  return gasPrice.add(premium);
}

export async function getGasLimit(contract, method, params = [], value, gasBuffer) {
    const defaultGasBuffer = 200000;
    const defaultValue = bigNumberify(0);

    if (!value) {
        value = defaultValue;
    }

    let gasLimit = await contract.estimateGas[method](...params, { value });

    if (!gasBuffer) {
        gasBuffer = defaultGasBuffer;
    }

    return gasLimit.add(gasBuffer);
}
export function bigNumberify(n) {
    return BigNumber.from(n);
}

export const limitDecimals = (amount, maxDecimals) => {
    let amountStr = amount.toString()
    if (maxDecimals === undefined) {
        return amountStr
    }
    if (maxDecimals === 0) {
        return amountStr.split(".")[0]
    }
    const dotIndex = amountStr.indexOf(".")
    if (dotIndex !== -1) {
        let decimals = amountStr.length - dotIndex - 1
        if (decimals > maxDecimals) {
            amountStr = amountStr.substr(0, amountStr.length - (decimals - maxDecimals))
        }
    }
    return amountStr
}
export const padDecimals = (amount, minDecimals) => {
    let amountStr = amount.toString()
    const dotIndex = amountStr.indexOf(".")
    if (dotIndex !== -1) {
        const decimals = amountStr.length - dotIndex - 1
        if (decimals < minDecimals) {
            amountStr = amountStr.padEnd(amountStr.length + (minDecimals - decimals), "0")
        }
    } else {
        amountStr = amountStr + ".0000"
    }
    return amountStr
  }
export const formatAmount = (amount, tokenDecimals, displayDecimals, useCommas, defaultValue) => {
  // console.log("hereim formatamount 1", amount);

  if (!defaultValue) {
      defaultValue = "..."
  }
  // console.log("hereim formatamount 2", amount);

  if (amount === undefined || amount.toString().length === 0) {
      return defaultValue
  }
  // console.log("hereim formatamount 3", amount);

  if (displayDecimals === undefined) {
      displayDecimals = 4
  }
  // console.log("hereim formatamount 4", amount);

  let amountStr = ethers.utils.formatUnits(amount, tokenDecimals)
  amountStr = limitDecimals(amountStr, displayDecimals)
  // console.log("hereim formatamount 5", amount);

  if (displayDecimals !== 0) {
      amountStr = padDecimals(amountStr, displayDecimals)
  }
  // console.log("hereim formatamount 6", amount);

  if (useCommas) {
      return numberWithCommas(amountStr)
  }
  // console.log("hereim formatamount 7", amount);

  return amountStr
}


export function numberWithCommas(x) {
    if (!x) { return "..." }
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


export function expandDecimals(n, decimals) {
    return bigNumberify(n).mul(bigNumberify(10).pow(decimals))
}
export function getLiquidationPriceFromDelta({ liquidationAmount, size, collateral, averagePrice, isLong }) {
    if (!size || size.eq(0)) { return }

    if (liquidationAmount.gt(collateral)) {
        const liquidationDelta = liquidationAmount.sub(collateral)
        const priceDelta = liquidationDelta.mul(averagePrice).div(size)
        return !isLong ? averagePrice.sub(priceDelta) : averagePrice.add(priceDelta)
    }

    const liquidationDelta = collateral.sub(liquidationAmount)
    const priceDelta = liquidationDelta.mul(averagePrice).div(size)

    return isLong ? averagePrice.sub(priceDelta) : averagePrice.add(priceDelta)
}
//fee of holding a position
export function getPositionFee(size) {
    if (!size) {
        return bigNumberify(0);
    }
    let myBigNumber = BigNumber.from('0xfbedfa25a3259ab347f7400000');
    const afterFeeUsd = size.mul(BASIS_POINTS_DIVISOR - MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR)
    return size.sub(afterFeeUsd)
}
export const parseValue = (value, tokenDecimals) => {
    const pValue = parseFloat(value)
    if (isNaN(pValue)) {
        return undefined
    }
    value = limitDecimals(value, tokenDecimals)
    const amount = ethers.utils.parseUnits(value, tokenDecimals)
    return bigNumberify(amount)
}
//deposits only act on collateral
function getNewPositionInfo(position, collateralDelta, method, keepLeverage) {

    if (!collateralDelta) return {};

    if (collateralDelta <= 0) return {};

    if (method == 'Close') {

        const sizeDelta = collateralDelta;

        let newLiqPrice = getLiquidationPrice({
            isLong: position.isLong,
            size: position.size,
            sizeDelta,
            collateral: position.collateral,
            averagePrice: position.averagePrice,
            entryFundingRate: position.entryFundingRate,
            cumulativeFundingRate: position.cumulativeFundingRate,
            increaseCollateral: false
        });

        let newLeverage = getLeverage({
            size: position.size,
            sizeDelta,
            collateral: position.collateral,
            increaseCollateral: false,
            entryFundingRate: position.entryFundingRate,
            cumulativeFundingRate: position.cumulativeFundingRate,
            hasProfit: position.hasProfit,
            delta: position.delta,
            includeDelta: false
        });

        let newSize = position.size.sub(sizeDelta);
        let delta = sizeDelta.mul(position.collateral).div(position.size)
        let newCollateral = position.collateral.sub(delta);
        if (!keepLeverage) {

            return {
                'Size': formatAmount(newSize, USD_DECIMALS, 2, null, true),
                'Leverage': formatAmount(newLeverage, 4, 2, null, true),
                'Liq. Price': formatAmount(newLiqPrice, USD_DECIMALS, 2, null, true)
            }

        }
        return {
            'Size': formatAmount(newSize, USD_DECIMALS, 2, null, true),
            'Collateral': formatAmount(newCollateral, USD_DECIMALS, 2, null, true),
            'Liq. Price': formatAmount(newLiqPrice, USD_DECIMALS, 2, null, true)
        }


    }

    let newLiqPrice = getLiquidationPrice({
        isLong: position.isLong,
        size: position.size,
        collateral: position.collateral,
        averagePrice: position.averagePrice,
        entryFundingRate: position.entryFundingRate,
        cumulativeFundingRate: position.cumulativeFundingRate,
        collateralDelta,
        increaseCollateral: method == 'Deposit'
    });

    console.log("collateral delta : ", collateralDelta.toString());
    console.log("new liq price", newLiqPrice);
    let newLeverage = getLeverage({
        size: position.size,
        collateral: position.collateral,
        collateralDelta,
        increaseCollateral: method == 'Deposit',
        entryFundingRate: position.entryFundingRate,
        cumulativeFundingRate: position.cumulativeFundingRate,
        hasProfit: position.hasProfit,
        delta: position.delta,
        includeDelta: false
    });

    console.log("collateral delta : ", position.collateral.toString());

    let newCollateral = method == 'Deposit' ? position.collateral.add(collateralDelta) : position.collateral.sub(collateralDelta);

    return {
        'Collateral': formatAmount(newCollateral, USD_DECIMALS, 2, null, true),
        'Leverage': formatAmount(newLeverage, 4, 2, null, true),
        'Liq. Price': formatAmount(newLiqPrice, USD_DECIMALS, 2, null, true)
    }

}


// converts a current position into a new one according to the input ammount (USD)
export function mapPositionData(position, mode, inputAmount, keepLeverage) {

    switch (mode) {
        case 'none':
            return {
                'Size': formatAmount(position.size, USD_DECIMALS, 2, null, true),
                'Collateral': formatAmount(position.collateral, USD_DECIMALS, 2, null, true),
                'Leverage': formatAmount(position.leverage, 4, 2, null, true),
                'Mark Price': formatAmount(position.markPrice, USD_DECIMALS, 2, null, true),
                'Liq. Price': formatAmount(position.liqPrice, USD_DECIMALS, 2, null, true)
            }
        case 'Deposit':
            return getNewPositionInfo(position, inputAmount, 'Deposit');
        case 'Withdraw':
            return getNewPositionInfo(position, inputAmount, 'Withdraw');
        case 'Close':
            return getNewPositionInfo(position, inputAmount, 'Close', keepLeverage);
    }
}

export function getLiquidationPrice(data) {
    let { isLong, size, collateral, averagePrice, entryFundingRate, cumulativeFundingRate, sizeDelta, collateralDelta, increaseCollateral, increaseSize } = data
    if (!size || !collateral || !averagePrice) { return }

    let nextSize = size ? size : bigNumberify(0)
    let remainingCollateral = collateral

    if (sizeDelta) {
        if (increaseSize) {
            nextSize = size.add(sizeDelta)
        } else {
            if (sizeDelta.gte(size)) {
                return
            }
            nextSize = size.sub(sizeDelta)
        }

        const marginFee = getMarginFee(sizeDelta)
        remainingCollateral = remainingCollateral.sub(marginFee)
    }

    if (collateralDelta) {
        if (increaseCollateral) {
            remainingCollateral = remainingCollateral.add(collateralDelta)
        } else {
            if (collateralDelta.gte(remainingCollateral)) {
                return
            }
            remainingCollateral = remainingCollateral.sub(collateralDelta)
        }
    }

    let positionFee = getPositionFee(size).add(LIQUIDATION_FEE)
    if (entryFundingRate && cumulativeFundingRate) {
        const fundingFee = size.mul(cumulativeFundingRate.sub(entryFundingRate)).div(FUNDING_RATE_PRECISION)
        positionFee = positionFee.add(fundingFee)
    }

    const liquidationPriceForFees = getLiquidationPriceFromDelta({
        liquidationAmount: positionFee, size: nextSize, collateral: remainingCollateral, averagePrice, isLong
    })

    const liquidationPriceForMaxLeverage = getLiquidationPriceFromDelta({
        liquidationAmount: nextSize.mul(BASIS_POINTS_DIVISOR).div(MAX_LEVERAGE), size: nextSize, collateral: remainingCollateral, averagePrice, isLong
    })

    if (!liquidationPriceForFees) { return liquidationPriceForMaxLeverage }
    if (!liquidationPriceForMaxLeverage) { return liquidationPriceForFees }

    if (isLong) {
        // return the higher price
        return liquidationPriceForFees.gt(liquidationPriceForMaxLeverage) ? liquidationPriceForFees : liquidationPriceForMaxLeverage
    }

    // return the lower price
    return liquidationPriceForFees.lt(liquidationPriceForMaxLeverage) ? liquidationPriceForFees : liquidationPriceForMaxLeverage
}

export function getLeverage({ size, sizeDelta, increaseSize, collateral, collateralDelta, increaseCollateral, entryFundingRate, cumulativeFundingRate, hasProfit, delta, includeDelta }) {
    if (!size && !sizeDelta) { return }
    if (!collateral && !collateralDelta) { return }

    let nextSize = size ? size : bigNumberify(0)
    if (sizeDelta) {
        if (increaseSize) {
            nextSize = size.add(sizeDelta)
        } else {
            if (sizeDelta.gte(size)) {
                return
            }
            nextSize = size.sub(sizeDelta)
        }
    }

    let remainingCollateral = collateral ? collateral : bigNumberify(0)
    if (collateralDelta) {
        if (increaseCollateral) {
            remainingCollateral = collateral.add(collateralDelta)
        } else {
            if (collateralDelta.gte(collateral)) {
                return
            }
            remainingCollateral = collateral.sub(collateralDelta)
        }
    }

    if (delta && includeDelta) {
        if (hasProfit) {
            remainingCollateral = remainingCollateral.add(delta)
        } else {
            if (delta.gt(remainingCollateral)) {
                return
            }

            remainingCollateral = remainingCollateral.sub(delta)
        }
    }

    if (remainingCollateral.eq(0)) { return }

    remainingCollateral = sizeDelta ? remainingCollateral.mul(BASIS_POINTS_DIVISOR - MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR) : remainingCollateral
    if (entryFundingRate && cumulativeFundingRate) {
        const fundingFee = size.mul(cumulativeFundingRate.sub(entryFundingRate)).div(FUNDING_RATE_PRECISION)
        remainingCollateral = remainingCollateral.sub(fundingFee)
    }

    return nextSize.mul(BASIS_POINTS_DIVISOR).div(remainingCollateral)
}

export function getMarginFee(sizeDelta) {
  if (!sizeDelta) {
      return bigNumberify(0);
  }
  const afterFeeUsd = sizeDelta.mul(BASIS_POINTS_DIVISOR - MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR)
  return sizeDelta.sub(afterFeeUsd)
}

export function getServerBaseUrl(chainId) {
  if (!chainId) {
    throw new Error("chainId is not provided");
  }
  if (document.location.hostname.includes("deploy-preview")) {
    const fromLocalStorage = localStorage.getItem("SERVER_BASE_URL");
    if (fromLocalStorage) {
      return fromLocalStorage;
    }
  }
  if (chainId === BSC_MAINNET) {
    return "https://gambit-server-staging.uc.r.appspot.com";
  } else if (chainId === ARBITRUM_TESTNET) {
    return "https://gambit-l2.as.r.appspot.com";
  } else if (chainId === ARBITRUM) {
    return "https://gmx-server-mainnet.uw.r.appspot.com";
  } else if (chainId === AVALANCHE) {
    return "https://gmx-avax-server.uc.r.appspot.com";
  }
  return "https://gmx-server-mainnet.uw.r.appspot.com";
}

  const adjustForDecimalsFactory = n => number => {
    if (n === 0) {
      return number;
    }
    if (n > 0) {
      return number.mul(expandDecimals(1, n));
    }
    return number.div(expandDecimals(1, -n));
  };

  export function getSwapFeeBasisPoints(isStable) {
    return isStable ? STABLE_SWAP_FEE_BASIS_POINTS : SWAP_FEE_BASIS_POINTS;
  }

  export function getMostAbundantStableToken(chainId, infoTokens) {
    const tokens = constantInstance.perpetuals.tokenList;
    const whitelistedTokens = tokens.filter(t => t.symbol !== "USDG")
    let availableAmount;
    let stableToken = whitelistedTokens.find(t => t.isStable);
    for (let i = 0; i < whitelistedTokens.length; i++) {
      const info = getTokenInfo(infoTokens, whitelistedTokens[i].address);
      if (!info.isStable || !info.availableAmount) {
        continue;
      }
  
      const adjustedAvailableAmount = adjustForDecimals(
        info.availableAmount,
        info.decimals,
        USD_DECIMALS
      );
      if (!availableAmount || adjustedAvailableAmount.gt(availableAmount)) {
        availableAmount = adjustedAvailableAmount;
        stableToken = info;
      }
    }
    return stableToken;
  }

  export function getNextFromAmount(
    chainId,
    toAmount,
    fromTokenAddress,
    toTokenAddress,
    infoTokens,
    toTokenPriceUsd,
    ratio,
    usdgSupply,
    totalTokenWeights
) {
    const defaultValue = { amount: bigNumberify(0) };

    if (!toAmount || !fromTokenAddress || !toTokenAddress || !infoTokens) {
        return defaultValue;
    }

    if (fromTokenAddress === toTokenAddress) {
        return { amount: toAmount };
    }

    const fromToken = getTokenInfo(infoTokens, fromTokenAddress);
    const toToken = getTokenInfo(infoTokens, toTokenAddress);
  
    if (fromToken.isNative && toToken.isWrapped) {
      return { amount: toAmount };
    }
  
    if (fromToken.isWrapped && toToken.isNative) {
      return { amount: toAmount };
    }
  
    if (!fromToken || !fromToken.minPrice || !toToken || !toToken.maxPrice) {
        return defaultValue;
    }

    const adjustDecimals = adjustForDecimalsFactory(
        fromToken.decimals - toToken.decimals
    );

    let fromAmountBasedOnRatio;
    if (ratio && !ratio.isZero()) {
        fromAmountBasedOnRatio = toAmount.mul(ratio).div(PRECISION);
    }

    if (toTokenAddress === USDG_ADDRESS) {
        const feeBasisPoints = getSwapFeeBasisPoints(fromToken.isStable);

        if (ratio && !ratio.isZero()) {
            return {
                amount: adjustDecimals(
                    fromAmountBasedOnRatio
                        .mul(BASIS_POINTS_DIVISOR + feeBasisPoints)
                        .div(BASIS_POINTS_DIVISOR)
                )
            };
        }
        const fromAmount = toAmount.mul(PRECISION).div(fromToken.maxPrice);
        return {
            amount: adjustDecimals(
                fromAmount
                    .mul(BASIS_POINTS_DIVISOR + feeBasisPoints)
                    .div(BASIS_POINTS_DIVISOR)
            )
        };
    }

    if (fromTokenAddress === USDG_ADDRESS) {
        const redemptionValue = toToken.redemptionAmount
            .mul(toToken.maxPrice)
            .div(expandDecimals(1, toToken.decimals));
        if (redemptionValue.gt(THRESHOLD_REDEMPTION_VALUE)) {
            const feeBasisPoints = getSwapFeeBasisPoints(toToken.isStable);

            const fromAmount =
                ratio && !ratio.isZero()
                    ? fromAmountBasedOnRatio
                    : toAmount
                        .mul(expandDecimals(1, toToken.decimals))
                        .div(toToken.redemptionAmount);

            return {
                amount: adjustDecimals(
                    fromAmount
                        .mul(BASIS_POINTS_DIVISOR + feeBasisPoints)
                        .div(BASIS_POINTS_DIVISOR)
                )
            };
        }

        const expectedAmount = toAmount.mul(toToken.maxPrice).div(PRECISION);

        const stableToken = getMostAbundantStableToken(chainId, infoTokens);
        if (!stableToken || stableToken.availableAmount.lt(expectedAmount)) {
            const feeBasisPoints = getSwapFeeBasisPoints(toToken.isStable);

            const fromAmount =
                ratio && !ratio.isZero()
                    ? fromAmountBasedOnRatio
                    : toAmount
                        .mul(expandDecimals(1, toToken.decimals))
                        .div(toToken.redemptionAmount);

            return {
                amount: adjustDecimals(
                    fromAmount
                        .mul(BASIS_POINTS_DIVISOR + feeBasisPoints)
                        .div(BASIS_POINTS_DIVISOR)
                )
            };
        }

        const feeBasisPoints0 = getSwapFeeBasisPoints(true);
        const feeBasisPoints1 = getSwapFeeBasisPoints(false);

        if (ratio && !ratio.isZero()) {
            // apply fees twice usdg -> token1 -> token2
            const fromAmount = fromAmountBasedOnRatio
                .mul(BASIS_POINTS_DIVISOR + feeBasisPoints0 + feeBasisPoints1)
                .div(BASIS_POINTS_DIVISOR);
            return {
                amount: adjustDecimals(fromAmount),
                path: [USDG_ADDRESS, stableToken.address, toToken.address]
            };
        }

        // get fromAmount for stableToken => toToken
        let fromAmount = toAmount.mul(toToken.maxPrice).div(stableToken.minPrice);

        // apply stableToken => toToken fees
        fromAmount = fromAmount
            .mul(BASIS_POINTS_DIVISOR + feeBasisPoints1)
            .div(BASIS_POINTS_DIVISOR);

        // get fromAmount for USDG => stableToken
        fromAmount = fromAmount.mul(stableToken.maxPrice).div(PRECISION);

        // apply USDG => stableToken fees
        fromAmount = fromAmount
            .mul(BASIS_POINTS_DIVISOR + feeBasisPoints0)
            .div(BASIS_POINTS_DIVISOR);

        return {
            amount: adjustDecimals(fromAmount),
            path: [USDG_ADDRESS, stableToken.address, toToken.address]
        };
    }

    const fromAmount =
        ratio && !ratio.isZero()
            ? fromAmountBasedOnRatio
            : toAmount.mul(toToken.maxPrice).div(fromToken.minPrice);

    let usdgAmount = fromAmount.mul(fromToken.minPrice).div(PRECISION);
    usdgAmount = adjustForDecimals(usdgAmount, toToken.decimals, USDG_DECIMALS);
    const swapFeeBasisPoints =
        fromToken.isStable && toToken.isStable
            ? STABLE_SWAP_FEE_BASIS_POINTS
            : SWAP_FEE_BASIS_POINTS;
    const taxBasisPoints =
        fromToken.isStable && toToken.isStable
            ? STABLE_TAX_BASIS_POINTS
            : TAX_BASIS_POINTS;
    const feeBasisPoints0 = getFeeBasisPoints(
        fromToken,
        usdgAmount,
        swapFeeBasisPoints,
        taxBasisPoints,
        true,
        usdgSupply,
        totalTokenWeights
    );
    const feeBasisPoints1 = getFeeBasisPoints(
        toToken,
        usdgAmount,
        swapFeeBasisPoints,
        taxBasisPoints,
        false,
        usdgSupply,
        totalTokenWeights
    );
    const feeBasisPoints =
        feeBasisPoints0 > feeBasisPoints1 ? feeBasisPoints0 : feeBasisPoints1;

    return {
        amount: adjustDecimals(
            fromAmount
                .mul(BASIS_POINTS_DIVISOR)
                .div(BASIS_POINTS_DIVISOR - feeBasisPoints)
        ),
        feeBasisPoints
    };
}

export function getNextToAmount(
    chainId,
    fromAmount,
    fromTokenAddress,
    toTokenAddress,
    infoTokens,
    toTokenPriceUsd,
    ratio,
    usdgSupply,
    totalTokenWeights
) {
    const defaultValue = { amount: bigNumberify(0) };
    if (!fromAmount || !fromTokenAddress || !toTokenAddress || !infoTokens) {
        return defaultValue;
    }

    if (fromTokenAddress === toTokenAddress) {
        return { amount: fromAmount };
    }

    const fromToken = getTokenInfo(infoTokens, fromTokenAddress);
    const toToken = getTokenInfo(infoTokens, toTokenAddress);

    if (fromToken.isNative && toToken.isWrapped) {
        console.log("ymj test 1", fromAmount)
        return { amount: fromAmount };
    }

    if (fromToken.isWrapped && toToken.isNative) {
        console.log("ymj test 2")
        return { amount: fromAmount };
    }

    if (!fromToken || !fromToken.minPrice || !toToken || !toToken.maxPrice) {
        return defaultValue;
    }

    const adjustDecimals = adjustForDecimalsFactory(
        toToken.decimals - fromToken.decimals
    );

    let toAmountBasedOnRatio = bigNumberify(0);
    if (ratio && !ratio.isZero()) {
        toAmountBasedOnRatio = fromAmount.mul(PRECISION).div(ratio);
    }

    if (toTokenAddress === USDG_ADDRESS) {
        const feeBasisPoints = getSwapFeeBasisPoints(fromToken.isStable);

        if (ratio && !ratio.isZero()) {
            const toAmount = toAmountBasedOnRatio;
            console.log("ymj test")
            return {
                amount: adjustDecimals(
                    toAmount
                        .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
                        .div(BASIS_POINTS_DIVISOR)
                ),
                feeBasisPoints
            };
        }

        const toAmount = fromAmount.mul(fromToken.minPrice).div(PRECISION);
        console.log("ymj test", {
            amount: adjustDecimals(
                toAmount
                    .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
                    .div(BASIS_POINTS_DIVISOR)
            ),
            feeBasisPoints
        });
        return {
            amount: adjustDecimals(
                toAmount
                    .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
                    .div(BASIS_POINTS_DIVISOR)
            ),
            feeBasisPoints
        };
    }

    if (fromTokenAddress === USDG_ADDRESS) {
        const redemptionValue = toToken.redemptionAmount
            .mul(toTokenPriceUsd || toToken.maxPrice)
            .div(expandDecimals(1, toToken.decimals));

        if (redemptionValue.gt(THRESHOLD_REDEMPTION_VALUE)) {
            const feeBasisPoints = getSwapFeeBasisPoints(toToken.isStable);

            const toAmount =
                ratio && !ratio.isZero()
                    ? toAmountBasedOnRatio
                    : fromAmount
                        .mul(toToken.redemptionAmount)
                        .div(expandDecimals(1, toToken.decimals));

            return {
                amount: adjustDecimals(
                    toAmount
                        .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
                        .div(BASIS_POINTS_DIVISOR)
                ),
                feeBasisPoints
            };
        }

        const expectedAmount = fromAmount;

        const stableToken = getMostAbundantStableToken(chainId, infoTokens);
        if (!stableToken || stableToken.availableAmount.lt(expectedAmount)) {
            const toAmount =
                ratio && !ratio.isZero()
                    ? toAmountBasedOnRatio
                    : fromAmount
                        .mul(toToken.redemptionAmount)
                        .div(expandDecimals(1, toToken.decimals));
            const feeBasisPoints = getSwapFeeBasisPoints(toToken.isStable);
            return {
                amount: adjustDecimals(
                    toAmount
                        .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
                        .div(BASIS_POINTS_DIVISOR)
                ),
                feeBasisPoints
            };
        }

        const feeBasisPoints0 = getSwapFeeBasisPoints(true);
        const feeBasisPoints1 = getSwapFeeBasisPoints(false);

        if (ratio && !ratio.isZero()) {
            const toAmount = toAmountBasedOnRatio
                .mul(BASIS_POINTS_DIVISOR - feeBasisPoints0 - feeBasisPoints1)
                .div(BASIS_POINTS_DIVISOR);
            return {
                amount: adjustDecimals(toAmount),
                path: [USDG_ADDRESS, stableToken.address, toToken.address],
                feeBasisPoints: feeBasisPoints0 + feeBasisPoints1
            };
        }

        // get toAmount for USDG => stableToken
        let toAmount = fromAmount.mul(PRECISION).div(stableToken.maxPrice);
        // apply USDG => stableToken fees
        toAmount = toAmount
            .mul(BASIS_POINTS_DIVISOR - feeBasisPoints0)
            .div(BASIS_POINTS_DIVISOR);

        // get toAmount for stableToken => toToken
        toAmount = toAmount
            .mul(stableToken.minPrice)
            .div(toTokenPriceUsd || toToken.maxPrice);
        // apply stableToken => toToken fees
        toAmount = toAmount
            .mul(BASIS_POINTS_DIVISOR - feeBasisPoints1)
            .div(BASIS_POINTS_DIVISOR);

        return {
            amount: adjustDecimals(toAmount),
            path: [USDG_ADDRESS, stableToken.address, toToken.address],
            feeBasisPoints: feeBasisPoints0 + feeBasisPoints1
        };
    }

    const toAmount =
        ratio && !ratio.isZero()
            ? toAmountBasedOnRatio
            : fromAmount
                .mul(fromToken.minPrice)
                .div(toTokenPriceUsd || toToken.maxPrice);

    let usdgAmount = fromAmount.mul(fromToken.minPrice).div(PRECISION);
    usdgAmount = adjustForDecimals(usdgAmount, fromToken.decimals, USDG_DECIMALS);
    const swapFeeBasisPoints =
        fromToken.isStable && toToken.isStable
            ? STABLE_SWAP_FEE_BASIS_POINTS
            : SWAP_FEE_BASIS_POINTS;
    const taxBasisPoints =
        fromToken.isStable && toToken.isStable
            ? STABLE_TAX_BASIS_POINTS
            : TAX_BASIS_POINTS;
    const feeBasisPoints0 = getFeeBasisPoints(
        fromToken,
        usdgAmount,
        swapFeeBasisPoints,
        taxBasisPoints,
        true,
        usdgSupply,
        totalTokenWeights
    );
    const feeBasisPoints1 = getFeeBasisPoints(
        toToken,
        usdgAmount,
        swapFeeBasisPoints,
        taxBasisPoints,
        false,
        usdgSupply,
        totalTokenWeights
    );
    const feeBasisPoints =
        feeBasisPoints0 > feeBasisPoints1 ? feeBasisPoints0 : feeBasisPoints1;

    return {
        amount: adjustDecimals(
            toAmount
                .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
                .div(BASIS_POINTS_DIVISOR)
        ),
        feeBasisPoints
    };
}
export function getUsd(
    amount,
    tokenAddress,
    max,
    infoTokens,
    orderOption,
    triggerPriceUsd
) {
    if (!amount) {
        return;
    }
    if (tokenAddress === USDG_ADDRESS) {
        return amount.mul(PRECISION).div(expandDecimals(1, 18));
    }
    const info = getTokenInfo(infoTokens, tokenAddress);
    const price = getTriggerPrice(
        tokenAddress,
        max,
        info,
        orderOption,
        triggerPriceUsd
    );
    if (!price) {
        return;
    }

    return amount.mul(price).div(expandDecimals(1, info.decimals));
}
function getTriggerPrice(
    tokenAddress,
    max,
    info,
    orderOption,
    triggerPriceUsd
) {
    // Limit/stop orders are executed with price specified by user
    if (orderOption && orderOption !== MARKET && triggerPriceUsd) {
        return triggerPriceUsd;
    }

    // Market orders are executed with current market price
    if (!info) {
        return;
    }
    if (max && !info.maxPrice) {
        return;
    }
    if (!max && !info.minPrice) {
        return;
    }
    return max ? info.maxPrice : info.minPrice;
}
export const formatAmountFree = (amount, tokenDecimals, displayDecimals) => {
    if (!amount) {
        return "...";
    }
    let amountStr = ethers.utils.formatUnits(amount, tokenDecimals);
    amountStr = limitDecimals(amountStr, displayDecimals);
    return trimZeroDecimals(amountStr);
};
export const trimZeroDecimals = amount => {
    if (parseFloat(amount) === parseInt(amount)) {
        return parseInt(amount).toString();
    }
    return amount;
};
//hj ---------------------
export const shouldRaiseGasError = (token, amount) => {
    if (!amount) {
        return false;
    }
    if (token.address !== AddressZero) {
        return false;
    }
    if (!token.balance) {
        return false;
    }
    if (amount.gte(token.balance)) {
        return true;
    }
    if (token.balance.sub(amount).lt(DUST_BNB)) {
        return true;
    }
    return false;
};

export const helperToast = {
    success: content => {
      notification.open({
        message: <div style={{"color": "#c3c5cb"}}>Submitted</div>,
        description: content,
        style: {
          radius: "10px",
          border: "1px solid #2c2f36",
          background: "#29292c",
          color: "#c3c5cb",
        },
        onClose: async () => {},
      });
        // toast.dismiss();
        // toast.success(content);
    },
    error: content => {
      notification.open({
        message: <div style={{"color": "#c3c5cb"}}>Failed</div>,
        description: content,
        style: {
          radius: "10px",
          border: "1px solid #2c2f36",
          background: "#29292c",
          color: "#c3c5cb",
        },
        onClose: async () => {},
      });
        // toast.dismiss();
        // toast.error(content);
    }
};

export const replaceNativeTokenAddress = (path, nativeTokenAddress) => {
    if (!path) {
        return;
    }

    let updatedPath = [];
    for (let i = 0; i < path.length; i++) {
        let address = path[i];
        if (address === AddressZero) {
            address = nativeTokenAddress;
        }
        updatedPath.push(address);
    }

    return updatedPath;
};

export function isTriggerRatioInverted(fromTokenInfo, toTokenInfo) {
    if (!toTokenInfo || !fromTokenInfo) return false;
    if (toTokenInfo.isStable || toTokenInfo.isUsdg) return true;
    if (toTokenInfo.maxPrice)
        return toTokenInfo.maxPrice.lt(fromTokenInfo.maxPrice);
    return false;
}


export function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export function formatDateTime(time) {
  return formatDateFn(time * 1000, "dd MMM yyyy, h:mm a");
}
export function formatDate(time) {
  return formatDateFn(time * 1000, "dd MMM yyyy");
}