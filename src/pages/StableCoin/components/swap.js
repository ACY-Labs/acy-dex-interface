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
  getUserTokenBalance,
  getUserTokenBalanceRaw,
  CustomError,
  getEstimateAmount,
  getApprove,
  getAllowance,
  redeemUSDAtoUSDT,
  redeemUSDAtoUSDC,
  redeemUSDAtoDAI,
  mintUSDA
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

  let userToken0Balance = await getUserTokenBalance(
    inputToken0,
    chainId,
    account,
    library
  ).catch(err => {
    console.log("Failed to load balance, error param: ", inputToken0.address, inputToken0.symbol, inputToken0.decimals, err);
  })

  let userHasSufficientBalance;
  try {
    userHasSufficientBalance = userToken0Balance > inputToken0.amount
    console.log('inputToken0.balance', inputToken0.balance, 'inputToken0.amount', inputToken0.amount)
    console.log('amuserHasSufficientBalanceount', userHasSufficientBalance)
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
      let token1Amount = estimateAmount * inputToken0.amount
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
  setisTransactionSucc,
  setSwapButtonContent,
) {
  const { amount } = inputToken0
  if (swapMode == 'redeem') {
    if (inputToken1.symbol == 'USDT') {
      const isRedeemSucc = await redeemUSDAtoUSDT(inputToken1.address, amount, library, account)
      console.log('@@@isRedeemSucc', isRedeemSucc)
      setSwapButtonContent('Created transaction')

      setisTransactionSucc(true)
    } else if (inputToken1.symbol == 'USDC') {
      const isRedeemSucc = await redeemUSDAtoUSDC(inputToken1.address, amount, library, account)
      setSwapButtonContent('Created transaction')
      setisTransactionSucc(true)
    } else if (inputToken1.symbol == 'DAI') {
      const isRedeemSucc = await redeemUSDAtoDAI(inputToken1.address, amount, library, account)
      setSwapButtonContent('Created transaction')
      setisTransactionSucc(true)
    }
  } else {
    let Allowance = await getAllowance(inputToken0, library, account)
    console.log('Allowance', Allowance)
    let needApprove = (Allowance < amount) ? true : false
    if (needApprove) {
      getApprove(inputToken0, library, account)
    }
    const isRedeemSucc = await mintUSDA(inputToken0,library, account)
    setSwapButtonContent('Created transaction')
    setisTransactionSucc(true)
  }
}
