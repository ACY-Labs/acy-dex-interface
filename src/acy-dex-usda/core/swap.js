import { parseUnits, formatUnits } from '@ethersproject/units';
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
} from '../utils'
import { useEffect, useState } from 'react';
import { SCAN_URL_PREFIX,SCAN_NAME, ConstantLoader } from '@/constants';

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

export async function swap(
  inputToken0,
  inputToken1,
  swapMode,
  library,
  account,
  setSwapButtonContent,
  setSwapButtonState,
  setSwapStatus,
) {
  const { amount } = inputToken0
  const transactionRes = await (async () => {
    if (swapMode == 'redeem') {
      if (inputToken1.symbol == 'USDT') {
        const isRedeemSucc = await redeemUSDAtoUSDT(inputToken1.address, amount, library, account)
        .catch(err => {
          setSwapButtonContent('Failed to transaction')
          return err
        })
        (true)
        return isRedeemSucc

      } else if (inputToken1.symbol == 'USDC') {
        const isRedeemSucc = await redeemUSDAtoUSDC(inputToken1.address, amount, library, account)
        .catch(err => {
          setSwapButtonContent('Failed to transaction')
          return err
        })
        return isRedeemSucc
      } else if (inputToken1.symbol == 'DAI') {
        const isRedeemSucc = await redeemUSDAtoDAI(inputToken1.address, amount, library, account)
        .catch(err => {
          setSwapButtonContent('Failed to transaction')
          return err
        })
        return isRedeemSucc
      }
    } else {
      let Allowance = await getAllowance(inputToken0, library, account)
      .catch(err => {
        setSwapButtonContent('Failed to transaction')
        return err
      })
      let needApprove = (Allowance < amount) ? true : false
      if (needApprove) {
        getApprove(inputToken0, library, account)
      }
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
    console.log('text',text)
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


      console.log("this is swap data: ", transactionRes);

      const scanUrlPrefix = SCAN_URL_PREFIX();
      const url = `${scanUrlPrefix}/tx/${transactionRes.hash}`;

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

