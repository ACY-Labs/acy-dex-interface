import {
  CurrencyAmount,
  ETHER,
  Fetcher,
  InsufficientReservesError,
  Pair,
  Percent,
  Route,
  Router,
  Token,
  TokenAmount,
  Trade,
  TradeType,
  WETH,
} from '@acyswap/sdk';

import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits, formatUnits } from '@ethersproject/units';
import WETHABI from '@/abis/WETH.json';
import {
  calculateGasMargin,
  checkTokenIsApproved,
  computeTradePriceBreakdown,
  getAllowance,
  getContract,
  isZero,
  withExactOutEstimateInAmount
} from '@/acy-dex-swap/utils';
import {
  getUserTokenBalance,
  getUserTokenBalanceRaw,
  CustomError,
  getEstimateAmount,
  getApprove,
} from '@/acy-dex-usda/utils'
import axios from 'axios';
import { TOKENLIST, NATIVE_CURRENCY, SCAN_URL_PREFIX, SCAN_NAME, API_URL, ROUTER_ADDRESS } from '@/constants';
import { useEffect, useState } from 'react';
import { MinInt256 } from '@ethersproject/constants';

function toFixed4(floatInString) {
  return parseFloat(floatInString).toFixed(4);
}

// get the estimated amount  of the other token required when swapping, in readable string.
export async function swapGetEstimated(
  inputToken0,
  inputToken1,
  swapMode,
  chainId,
  library,
  account,
  setToken1Amount,
  setSwapButtonState,
  setSwapButtonContent,
) {
  if (!account) return new CustomError('Connect to wallet');
  else if (!inputToken0.symbol || !inputToken1.symbol) return new CustomError('please choose tokens');
  if (inputToken0.amount == '' || inputToken0.amount == '0') {
    setToken1Amount
    setSwapButtonState(false)
    setSwapButtonContent('Enter an amount');
    return new CustomError('Enter an amount');
  }

  let userToken0Balance = await getUserTokenBalanceRaw(
    inputToken0,
    account,
    library
  ).catch(err => {
    console.log("Failed to load balance, error param: ", inputToken0.address, inputToken0.symbol, inputToken0.decimals, err);
  })

  let userHasSufficientBalance;
  try {
    userHasSufficientBalance = userToken0Balance.gte(
      parseUnits(inputToken0.amount, inputToken0.decimal)
    );
  } catch (e) {
    setSwapButtonState(false);
    if (e.fault === 'underflow') setSwapButtonContent(e.fault);
    else setSwapButtonContent('Failed to get balance');
    return new CustomError(e.fault);
  }
  setSwapButtonState(false);
  setSwapButtonContent('Loading...');
  try {
    if (swapMode == 'redeem') {
      // const  estimateAmount = await getEstimateAmount(swapMode,inputToken1.address,library,account)
      const estimateAmount = await getEstimateAmount(swapMode, inputToken1, library, account).catch(err => { console.log('failed to get estimate,', err) })
      let token1Amount = estimateAmount * inputToken0.amount
      token1Amount = token1Amount.toFixed(3)
      setToken1Amount(token1Amount)

    } else {
      const estimateAmount = await getEstimateAmount(swapMode, inputToken0, library, account).catch(err => { console.log('failed to get estimate,', err) })
      const token1Amount = estimateAmount * inputToken0.amount
      token1Amount = token1Amount.toFixed(3)
      setToken1Amount(token1Amount)
    }
    setSwapButtonContent('swap');
    setSwapButtonState(true);
  } catch (e) {
    console.log("TEST ERROR HERE:", e);
    setSwapButtonState(false);
  }
  if (!userHasSufficientBalance) {
    setSwapButtonState(false);
    setSwapButtonContent('Not enough balance');
    return new CustomError('Not enough balance');
  }


}
function truncateDecimals(value, decimals) {
  if (!value) return value
  const [whole, fraction] = value.toString().split('.')

  if (!fraction || fraction.length <= decimals) {
    // No change
    return value.toString()
  }

  // truncate decimals & return
  return `${whole}.${fraction.slice(0, decimals)}`
}
// FIXME: slippageAdjustedAmount, minAmountOut, maxAmountIn are only used for logging to console. Calculation is done once more by Router.swapCallParameters()
export async function swap(
  inputToken0,
  inputToken1,
  swapMode,
  chainId,
  library,
  account,
) {
  const isApprove = await getApprove(inputToken0, library, account)
  console.log('###isApprove', isApprove)
}
