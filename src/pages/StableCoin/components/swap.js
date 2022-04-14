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
  getVaultAdminContract,
  getEstimateAmount,
  withExactInEstimateOutAmount
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
    if(inputToken0.amount == '' || inputToken0 == '0'){
      setSwapButtonState(false)
      setSwapButtonContent('Enter an amount');
      return new CustomError('Enter an amount');
    }
  if(inputToken0.symbol == inputToken1.symbol){
    setSwapButtonState(false)
    setSwapButtonContent('tokens are same');
    return new CustomError('tokens are same');
  }

  let userToken0Balance = await getUserTokenBalanceRaw(
    inputToken0,
    account,
    library
  );

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
  if (!userHasSufficientBalance) {
    setSwapButtonState(false);
    setSwapButtonContent('Not enough balance');
    return new CustomError('Not enough balance');
  }
  setSwapButtonState(false);
  setSwapButtonContent('Loading...');
  let vault = getVaultAdminContract(library,account)

  if(swapMode == 'redeem'){
    const  estimateAmount = await getEstimateAmount(swapMode,inputToken1.address,library,account)
    console.log('@@@token1Amount',estimateAmount)
  } else{
    const estimateAmount = await getEstimateAmount(swapMode,inputToken0.address,library,account)
    console.log('@@@token1Amount',estimateAmount)
  }
  setSwapButtonContent('swap');
  setSwapButtonState(true);


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
  allowedSlippage,
  exactIn = true,
  chainId,
  library,
  account,
  pair,
  route,
  trade,
  slippageAdjustedAmount,
  minAmountOut,
  maxAmountIn,
  wethContract,
  wrappedAmount,
  deadline,
  setSwapStatus,
  setSwapButtonContent,
  setSwapButtonState,
  swapCallback,
  methodName,
  isUseArb,
  midTokenAddress,
  poolExist,
) {

  const {
    address: inToken0Address,
    symbol: inToken0Symbol,
    decimals: inToken0Decimal,
    amount: inToken0Amount,
  } = inputToken0;
  const {
    address: inToken1Address,
    symbol: inToken1Symbol,
    decimals: inToken1Decimal,
    amount: inToken1Amount,
  } = inputToken1;
  const [swapMode, setSwapMode] = useState('')
  const [buyCoin, setBuyCoin] = useState('')
  const [buyCointAmount, setBuyCoinAmount] = useState(0)
  const [redeemCoin, setRedeemCoin] = useState('')
  const [redeemCoinAmount, setRedeemCoinAmount] = useState(0)
  // const method = inputToken0.symbol === 'USDA'?'mint':'redeem'
  // setSwapMode(method)
  // useEffect(()=>{
  //   if(swapMode === 'mint'){
  //     setRedeemCoin(inputToken0)
  //     setBuyCoin(inputToken1)
  //     let amount = truncateDecimals(inputToken0.amount,inputToken0.decimals)
  //     amount = parseFloat(amount)
  //   } else{
  //     setBuyCoin(inputToken0)
  //   }
  // },[swapMode])

  const status = await (async () => {
    // change slippage from bips (0.01%) into percentage
    allowedSlippage = new Percent(allowedSlippage, 10000);

    const contract = getVaultAdminContract(library, account);

    const nativeCurrencySymbol = NATIVE_CURRENCY();
    const wrappedCurrencySymbol = `W${nativeCurrencySymbol}`;

    const token0IsETH = inToken0Symbol === nativeCurrencySymbol;
    const token1IsETH = inToken1Symbol === nativeCurrencySymbol;


    if (token0IsETH && token1IsETH) return new CustomError(`Doesn't support ${nativeCurrencySymbol} to ${nativeCurrencySymbol}`);

    const token0 = token0IsETH
      ? WETH[chainId]
      : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
    const token1 = token1IsETH
      ? WETH[chainId]
      : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);
    console.log(token0);
    console.log(token1);
    // quit if the two tokens are equivalent, i.e. have the same chainId and address
    if (token0.equals(token1)) return new CustomError('Equal tokens!');
    // helper function from uniswap sdk to get pair address, probably needed if want to replace fetchPairData
    // get pair using our own provider
    // console.log('FETCH');
    // console.log(pair);
    // console.log('------------------ CONSTRUCT ROUTE ------------------');
    // This is where we let Uniswap SDK know we are not using WETH but ETHER
    // console.log(route);
    // console.log('------------------ PARSE AMOUNT ------------------');

    // console.log('------------------ CONSTRUCT TRADE ------------------');
    // console.log(trade);
    // console.log('------------------ SLIPPAGE CALCULATE ------------------');
    // console.log(slippageAdjustedAmount);
    // console.log(minAmountOut);
    // console.log(maxAmountIn);
    // console.log('------------------ ALLOWANCE ------------------');
    // console.log('say something about allowance');
    // console.log('------------------ PREPARE SWAP ------------------');

    deadline = deadline || 30;
    // console.log("deadline", deadline);
    let date = new Date();
    let expiredTime = Math.round(date / 1000) + deadline * 60
    let finalMethodName, args, value, options = null;
    options = {};
    if (!isUseArb) {
      if (poolExist) {
        const param = Router.swapCallParameters(trade, {
          feeOnTransfer: false,
          allowedSlippage,
          recipient: account,
          ttl: deadline * 60,
        });
        finalMethodName = param.methodName;
        args = param.args;
        value = param.value;
        options = !value || isZero(value) ? {} : { value };
      } else {
        finalMethodName = methodName;
        if (methodName == "swapExactETHForTokens") {
          options = { value: parseUnits(inToken0Amount.toString(), inToken0Decimal).toHexString() };
          args = [
            minAmountOut,
            [inToken0Address, midTokenAddress, inToken1Address],
            account,
            `0x${expiredTime.toString(16)}`
          ]
        } else if (methodName == "swapExactTokensForETH") {
          args = [
            parseUnits(inToken0Amount.toString(), inToken0Decimal).toHexString(),
            minAmountOut,
            [inToken0Address, midTokenAddress, inToken1Address],
            account,
            `0x${expiredTime.toString(16)}`
          ]
        } else if (methodName == "swapExactTokensForTokens") {
          args = [
            parseUnits(inToken0Amount.toString(), inToken0Decimal).toHexString(),
            minAmountOut,
            [inToken0Address, midTokenAddress, inToken1Address],
            account,
            `0x${expiredTime.toString(16)}`
          ]
        } else if (methodName == "swapTokensForExactETH") {
          args = [
            parseUnits(inToken1Amount.toString(), inToken1Decimal).toHexString(),
            maxAmountIn,
            [inToken0Address, midTokenAddress, inToken1Address],
            account,
            `0x${expiredTime.toString(16)}`
          ]
        } else if (methodName == "swapTokensForExactTokens") {
          args = [
            parseUnits(inToken1Amount.toString(), inToken1Decimal).toHexString(),
            maxAmountIn,
            [inToken0Address, midTokenAddress, inToken1Address],
            account,
            `0x${expiredTime.toString(16)}`
          ]
        } else if (methodName == "swapETHForExactTokens") {
          options = { value: maxAmountIn };
          args = [
            parseUnits(inToken1Amount.toString(), inToken1Decimal).toHexString(),
            [inToken0Address, midTokenAddress, inToken1Address],
            account,
            `0x${expiredTime.toString(16)}`
          ]
        }
      }

    } else {
      finalMethodName = methodName;
      if (methodName == "swapExactETHForTokensByArb") {
        options = { value: parseUnits(inToken0Amount.toString(), inToken0Decimal).toHexString() };
        args = [
          minAmountOut,
          [inToken0Address, inToken1Address],
          account,
          `0x${expiredTime.toString(16)}`
        ]
      } else if (methodName == "swapExactTokensForETHByArb") {
        args = [
          parseUnits(inToken0Amount.toString(), inToken0Decimal).toHexString(),
          minAmountOut,
          [inToken0Address, inToken1Address],
          account,
          `0x${expiredTime.toString(16)}`
        ]
      } else if (methodName == "swapExactTokensForTokensByArb") {
        args = [
          parseUnits(inToken0Amount.toString(), inToken0Decimal).toHexString(),
          minAmountOut,
          [inToken0Address, inToken1Address],
          account,
          `0x${expiredTime.toString(16)}`
        ]
      } else if (methodName == "swapTokensForExactETHByArb") {
        args = [
          parseUnits(inToken1Amount.toString(), inToken1Decimal).toHexString(),
          maxAmountIn,
          [inToken0Address, inToken1Address],
          account,
          `0x${expiredTime.toString(16)}`
        ]
      } else if (methodName == "swapTokensForExactTokensByArb") {
        args = [
          parseUnits(inToken1Amount.toString(), inToken1Decimal).toHexString(),
          maxAmountIn,
          [inToken0Address, inToken1Address],
          account,
          `0x${expiredTime.toString(16)}`
        ]
      } else if (methodName == "swapETHForExactTokensByArb") {
        options = { value: maxAmountIn };
        args = [
          parseUnits(inToken1Amount.toString(), inToken1Decimal).toHexString(),
          [inToken0Address, inToken1Address],
          account,
          `0x${expiredTime.toString(16)}`
        ]
      }
    }

    const result = await contract.estimateGas[finalMethodName](...args, options)
      .then(gasEstimate =>
        contract[finalMethodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...options,
        })
      )
      .catch(e => {

        return new CustomError('CustomError in transaction');
      });
    return result;
  })();

  if (status instanceof CustomError) {
    let text = status.getErrorText();
    setSwapStatus(text);
    setSwapButtonContent("Please try again");
  } else {
    // console.log("TEST status:");
    if ((status.error && status.error.code == 4001) || status.code == 4001) {
      setSwapButtonContent("Swap");
      setSwapButtonState(true);
    } else if ((status.error && status.error.code == -32603) || status.code == -32603) {
      console.log("error status -32603", status)
      let text = null;
      if (exactIn) {
        // "The actual output might be less than your acceptable slippage tolerance setting, please adjust slippage to continue!"
        text = "The amount of the output token is less than your slippage tolerance rate, please set more slippage tolerance if you want to continue!"
      } else {
        text = "The amount of the input token is over than your slippage tolerance rate, please set more slippage tolerance if you want to continue!"
      }
      setSwapStatus(text);
      setSwapButtonContent("Please try again");
    } else {


      // console.log("this is swap data: ", status);

      const scanUrlPrefix = SCAN_URL_PREFIX();
      const url = `${scanUrlPrefix}/tx/${status.hash}`;

      setSwapStatus(
        <div>
          <a href={url} target="_blank" rel="noreferrer">
            View it on {SCAN_NAME()}
          </a>
        </div>
      );

      try {

        swapCallback(status, inputToken0, inputToken1);
      } catch (err) {
        console.log("error caught", err)
      }

      // Pass swap rate to backend
      var tempToken0 = inToken0Symbol
      var tempToken1 = inToken1Symbol

      var rate = (parseFloat(inToken0Amount) / parseFloat(inToken1Amount));
      var tempDate = new Date();
      var time = tempDate.getTime();
      if (tempToken0 > tempToken1) {
        var temp = tempToken0;
        tempToken0 = tempToken1;
        tempToken1 = temp;
        rate = 1 / rate;
      }
      console.log("rate", rate)

      const apiUrlPrefix = API_URL();
      axios.post(
        `${apiUrlPrefix}/chart/add?token0=${tempToken0}&token1=${tempToken1
        }&rate=${rate}&time=${time}`
      )
        .then(data => {
          console.log(data);
        })
        .catch(e => {
          console.log(e);
        });


    }
  }
}
