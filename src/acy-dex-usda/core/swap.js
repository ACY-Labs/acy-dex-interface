import { parseUnits, formatUnits } from '@ethersproject/units';
import {
  getUserTokenBalance,
  getUserTokenBalanceRaw,
  CustomError,
  getEstimateAmount,
  getApprove,
  getAllowance,
  redeemUSDA,
  mintUSDA,
  redeemAll,
} from '../utils'
import { useEffect, useState } from 'react';
import { SCAN_URL_PREFIX, SCAN_NAME, ConstantLoader } from '@/constants';

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
  setIsMax,
  setNeedApprove,
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
    userHasSufficientBalance = userToken0Balance >= inputToken0.amount
  } catch (e) {
    setSwapButtonState(false);
    if (e.fault === 'underflow') setSwapButtonContent(e.fault);
    else setSwapButtonContent('Failed to get balance');
    return new CustomError(e.fault);
  }
  if (userToken0Balance == inputToken0.amount) {
    setIsMax(true)
  } else {
    setIsMax(false)
  }
  setSwapButtonState(false);
  setSwapButtonContent('Loading...');
  try {
    if (swapMode == 'redeem') {
      const estimateAmount = await getEstimateAmount(swapMode, inputToken1, library, account).catch(err => { console.log('failed to get estimate,', err) })
      let token1Amount = estimateAmount * inputToken0.amount
      token1Amount = token1Amount.toFixed(3)
      setToken1Amount(token1Amount)
    } else {
      const estimateAmount = await getEstimateAmount(swapMode, inputToken0, library, account).catch(err => { console.log('failed to get estimate,', err) })
      let token1Amount = estimateAmount * inputToken0.amount
      token1Amount = token1Amount.toFixed(3)
      setToken1Amount(token1Amount)
      let Allowance = await getAllowance(inputToken0, library, account)
        .catch(err => {
          setSwapButtonContent('Failed to transaction')
          return err
        })
      console.log('@@@allowance', Allowance)
      let needApprove = (Allowance < inputToken0.amount) ? true : false
      console.log('@@@needApprove', needApprove)
      if (needApprove && userHasSufficientBalance) {
        setNeedApprove(true)
        setSwapButtonState(true)
        setSwapButtonContent('approve')
        return new CustomError('need approve');
      }
    }
    console.log('@@@111')
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

export async function swap(
  inputToken0,
  inputToken1,
  swapMode,
  library,
  account,
  isMax,
  setSwapButtonContent,
  setSwapButtonState,
  setSwapStatus,
) {
  const { amount } = inputToken0
  const transactionRes = await (async () => {
    if (swapMode == 'redeem') {
      if (isMax) {
        const isRedeemSucc = await redeemAll(inputToken1, library, account)
          .catch(err => {
            setSwapButtonContent('Failed to transaction')
            return err
          })
        console.log('@@@redeemres', isRedeemSucc)
        return isRedeemSucc
      }
      const isRedeemSucc = await redeemUSDA(inputToken1, amount, library, account)
        .catch(err => {
          setSwapButtonContent('Failed to transaction')
          return err
        })
      console.log('@@@redeemres', isRedeemSucc)
      return isRedeemSucc
    } else {
      const isMintSucc = await mintUSDA(inputToken0, library, account)
        .catch(err => {
          setSwapButtonContent('Failed to transaction')
          return err
        })
      return isMintSucc
    }
  })()
  if (transactionRes instanceof CustomError) {
    let text = transactionRes.getErrorText();
    console.log('text', text)
    setSwapButtonContent("Please try again");
  } else {
    console.log("TEST status:");
    if ((transactionRes.error && transactionRes.error.code == 4001) || transactionRes.code == 4001) {
      setSwapButtonContent("Swap");
      setSwapButtonState(true);
    } else if ((transactionRes.error && transactionRes.error.code == -32603) || transactionRes.code == -32603) {
      console.log("error status -32603", transactionRes)
      let text = null;
      setSwapButtonContent("Please try again");
    } else {
      const scanUrlPrefix = SCAN_URL_PREFIX();
      const url = `${scanUrlPrefix}/tx/${transactionRes.hash}`;
      console.log('@@@SCAN', url)
      const view = (
        <div>
          <a href={url} target="_blank" rel="noreferrer">
            View it on {SCAN_NAME()}
          </a>
        </div>
      )
      setSwapStatus(view);
      setSwapButtonContent('Created transaction')
    }
  }
}

