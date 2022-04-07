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
  CustomError,
  calculateGasMargin,
  checkTokenIsApproved,
  computeTradePriceBreakdown,
  getAllowance,
  getContract,
  getRouterContract,
  getUserTokenBalance,
  getUserTokenBalanceRaw,
  isZero,
  withExactInEstimateOutAmount,
  withExactOutEstimateInAmount
} from '@/acy-dex-swap/utils';
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
  allowedSlippage,
  exactIn = true,
  chainId,
  library,
  account,
  setToken0Amount,
  setToken1Amount,
  setBonus0,
  setBonus1,
  setNeedApprove,
  setApproveAmount,
  setApproveButtonStatus,
  setSwapBreakdown,
  setSwapButtonState,
  setSwapButtonContent,
  setSwapStatus,
  setPair,
  setRoute,
  setTrade,
  setSlippageAdjustedAmount,
  setMinAmountOut,
  setMaxAmountIn,
  setWethContract,
  setWrappedAmount,
  setMethodName,
  setIsUseArb,
  setMidTokenAddress,
  setPoolExist
) {
  const status = await (async () => {
    // check uniswap
    // console.log('SWAP GET ESTIMATED');
    // change slippage from bips (0.01%) into percentage
    let slippage = allowedSlippage * 0.01;
    allowedSlippage = new Percent(allowedSlippage, 10000);
    setSwapBreakdown('');
    setSwapButtonState(false);
    setSwapButtonContent('Loading...');
    setSwapStatus('');

    let contract = getRouterContract(library, account);
    let {
      address: inToken0Address,
      symbol: inToken0Symbol,
      decimals: inToken0Decimal,
      amount: inToken0Amount,
    } = inputToken0;
    let {
      address: inToken1Address,
      symbol: inToken1Symbol,
      decimals: inToken1Decimal,
      amount: inToken1Amount,
    } = inputToken1;

    if (!account) return new CustomError('Connect to wallet');
    else if (!inputToken0.symbol || !inputToken1.symbol) return new CustomError('please choose tokens');
    if (exactIn && parseFloat(inToken0Amount) == '0') {
      setToken1Amount('');
      setBonus1(null);
      return new CustomError('Enter an amount');
    }
    else if (!exactIn && parseFloat(inToken1Amount) == '0') {
      setToken0Amount('');
      setBonus0(null);
      return new CustomError('Enter an amount');
    }
    if (exactIn && inToken0Amount == '') {
      setToken1Amount('');
      setBonus1(null);
      return new CustomError('Enter an amount');
    }
    else if (!exactIn && inToken1Amount == '') {
      setToken0Amount('');
      setBonus0(null);
      return new CustomError('Enter an amount');
    }

    console.log(`token0Amount: ${inToken0Amount}`);
    console.log(`token1Amount: ${inToken1Amount}`);

    const nativeCurrencySymbol = NATIVE_CURRENCY();
    const wrappedCurrencySymbol = `W${nativeCurrencySymbol}`
    let token0IsETH = inToken0Symbol === nativeCurrencySymbol;
    let token1IsETH = inToken1Symbol === nativeCurrencySymbol;

    console.log(token0IsETH);
    console.log(token0IsETH);
    if (token0IsETH && token1IsETH) {
      setSwapButtonState(false);
      setSwapButtonContent(`don't support ${nativeCurrencySymbol} to ${nativeCurrencySymbol}`);
      return new CustomError(`don't support ${nativeCurrencySymbol} to ${nativeCurrencySymbol}`);
    }
    // if one is ETH and other WETH, use WETH contract's deposit and withdraw
    // wrap ETH into WETH
    if (token0IsETH && inToken1Symbol === wrappedCurrencySymbol) {
      // UI should sync value of ETH and WETH
      if (exactIn) {
        setToken1Amount(toFixed4(inToken0Amount));
        inToken1Amount = inToken0Amount;
      } else {
        setToken0Amount(toFixed4(inToken1Amount));
        inToken0Amount = inToken1Amount;
      }
      console.log('------------------ CHECK BALANCE ------------------');
      // Big Number comparison

      let userToken0Balance = await getUserTokenBalanceRaw(
        token0IsETH ? ETHER : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol),
        account,
        library
      );

      let userHasSufficientBalance;
      try {
        userHasSufficientBalance = userToken0Balance.gte(
          parseUnits(inToken0Amount, inToken0Decimal)
        );
      } catch (e) {
        setSwapButtonState(false);
        if (e.fault === 'underflow') setSwapButtonContent(e.fault);
        else setSwapButtonContent('Failed to get balance');
        return new CustomError(e.fault);
      }

      console.log(userToken0Balance);
      console.log('token0Amount');
      console.log(inToken0Amount);
      console.log("test sufficient balance", userHasSufficientBalance)
      // quit if user doesn't have enough balance, otherwise this will cause error
      if (!userHasSufficientBalance) {
        setSwapButtonState(false);
        setSwapButtonContent('Not enough balance');
        setBonus0(null);
        setBonus1(null);
        return new CustomError('Not enough balance');
      }
      setSwapButtonState(true);
      setSwapButtonContent('Wrap');

      const wethContract = getContract(inToken1Address, WETHABI, library, account);
      let wrappedAmount;

      try {
        wrappedAmount = BigNumber.from(parseUnits(inToken0Amount, inToken0Decimal)).toHexString();
      } catch (e) {
        console.log('wrappedAmount!!');
        console.log(e);
        setSwapButtonState(false);
        if (e.fault === 'underflow') {
          setSwapButtonContent(e.fault);
          return new CustomError(e.fault);
        }
        setSwapButtonContent('Failed to parse amounts');
        return new CustomError('Failed to parse amounts');
      }

      setWethContract(wethContract);
      setWrappedAmount(wrappedAmount);

      return 'Wrap is ok';
    }
    if (inToken0Symbol === wrappedCurrencySymbol && token1IsETH) {
      console.log('UNWRAP');
      if (exactIn) {
        setToken1Amount(toFixed4(inToken0Amount));
        inToken1Amount = inToken0Amount;
      } else {
        setToken0Amount(toFixed4(inToken1Amount));
        inToken0Amount = inToken1Amount;
      }

      let userToken0Balance = await getUserTokenBalanceRaw(
        token0IsETH ? ETHER : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol),
        account,
        library
      );

      let userHasSufficientBalance;
      try {
        userHasSufficientBalance = userToken0Balance.gte(
          parseUnits(inToken0Amount, inToken0Decimal)
        );
      } catch (e) {
        console.log('userHasSufficientBalance!!!');
        console.log(e);
        setSwapButtonState(false);
        if (e.fault === 'underflow') {
          setSwapButtonContent(e.fault);
          return new CustomError(e.fault);
        }
        setSwapButtonContent('Failed to parse balance');
        return new CustomError('Failed to parse balance');
      }

      // quit if user doesn't have enough balance, otherwise this will cause error
      if (!userHasSufficientBalance) {
        setSwapButtonState(false);
        setSwapButtonContent('Not enough balance');
        setBonus0(null);
        setBonus1(null);
        return new CustomError('Not enough balance');
      }

      setSwapButtonState(true);
      setSwapButtonContent('Unwrap');

      const wethContract = getContract(inToken0Address, WETHABI, library, account);

      let wrappedAmount;
      try {
        wrappedAmount = BigNumber.from(parseUnits(inToken0Amount, inToken0Decimal)).toHexString();
      } catch (e) {
        console.log('wrappedAmount!!!');
        console.log(e);
        setSwapButtonState(false);
        if (e.fault === 'underflow') {
          setSwapButtonContent(e.fault);
          return new CustomError(e.fault);
        }
        setSwapButtonContent('Failed to parse wrap amount');
        return new CustomError('Failed to parse wrap amount');
      }
      setWethContract(wethContract);
      setWrappedAmount(wrappedAmount);

      return 'Unwrap is ok';
    }
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20

    console.log('SWAP');
    console.log('------------------ CONSTRUCT TOKEN ------------------');
    // use WETH for ETHER to work with Uniswap V2 SDK
    const token0 = token0IsETH
      ? WETH[chainId]
      : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
    const token1 = token1IsETH
      ? WETH[chainId]
      : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);

    if (token0.equals(token1)) {
      setSwapButtonState(false);
      setSwapButtonContent('tokens are same');
      return new CustomError('tokens are same');
    }

    console.log('------------------ PARSE AMOUNT ------------------');
    // convert typed in amount to BigNumbe rusing ethers.js's parseUnits then to string,
    console.log(inToken0Amount);
    console.log(inToken0Decimal);

    let parsedAmount;

    try {
      parsedAmount = exactIn
        ? new TokenAmount(token0, parseUnits(inToken0Amount, inToken0Decimal)).raw.toString(16)
        : new TokenAmount(token1, parseUnits(inToken1Amount, inToken1Decimal)).raw.toString(16);
    } catch (e) {
      console.log('parsedAmount!!!');
      console.log(e);
      setSwapButtonState(false);
      if (e.fault === 'underflow') {
        setSwapButtonContent(e.fault);
        return new CustomError(e.fault);
      }
      setSwapButtonContent('unknow error');
      return new CustomError('unknow error');
    }

    let inputAmount;
    // CurrencyAmount instance is required for Trade contructor if input is ETHER
    if ((token0IsETH && exactIn) || (token1IsETH && !exactIn)) {
      inputAmount = new CurrencyAmount(ETHER, `0x${parsedAmount}`);
    } else {
      inputAmount = new TokenAmount(exactIn ? token0 : token1, `0x${parsedAmount}`);
    }

    let poolExist = true;
    var methodsName = "";
    let slippageAdjustedAmount;
    let minAmountOut;
    let maxAmountIn;
    let token0Amount = inToken0Amount;
    let token1Amount = inToken1Amount;
    let isUseArb = false;
    let hasArb = true;

    let midTokenAddress = null;
    let ammOutput = null;
    let allPathAmountOut = null;

    let estimatedOutputAmount = null;
    let estimatedInputAmount = null;

    // get pair using our own provider
    const pair = await Fetcher.fetchPairData(token0, token1, library, chainId).catch(e => {
      return new CustomError(
        `Swap`
      );
    });
    if (pair instanceof CustomError) {
      poolExist = false;
      isUseArb = false;
    }

    setPoolExist(poolExist);

    // Determine to use FlashArbitrage or AMM
    try {
      if (exactIn) {
        // update UI with estimated output token amount
        const inToken0DecimalAmount = parseUnits(token0Amount, inToken0Decimal).toString();
        console.log("TEST estimatedOutputAmount in");
        let estimatedOutputAmount = await withExactInEstimateOutAmount(
          inToken0DecimalAmount,
          inToken0Address,
          inToken1Address,
          15,
          library,
          account
        );
        console.log("TEST estimatedOutputAmount out");
        hasArb = true;
        midTokenAddress = estimatedOutputAmount[0];
        ammOutput = parseFloat(formatUnits(estimatedOutputAmount.AMMOutput, inToken1Decimal));
        allPathAmountOut = parseFloat(formatUnits(estimatedOutputAmount.allPathAmountOut, inToken1Decimal));
        console.log("TEST2 estimatedOutputAmount:", estimatedOutputAmount);
        if (allPathAmountOut > ammOutput) {
          console.log("use arb in exactIn: FA / AMM", allPathAmountOut, ammOutput);
          isUseArb = true;
        } else {
          console.log("NOT use arb in exactIn: FA / AMM", allPathAmountOut, ammOutput);
          isUseArb = false;
        }
      } else {
        const inToken1DecimalAmount = parseUnits(token1Amount, inToken1Decimal).toString()
        console.log("TEST estimatedInputAmount in");
        let estimatedInputAmount = await withExactOutEstimateInAmount(
          inToken1DecimalAmount,
          inToken0Address,
          inToken1Address,
          15,
          library,
          account
        );
        console.log("TEST estimatedInputAmount out");
        hasArb = true;
        midTokenAddress = estimatedInputAmount[0];
        ammOutput = parseFloat(formatUnits(estimatedInputAmount.AMMOutput, inToken0Decimal));
        allPathAmountOut = parseFloat(formatUnits(estimatedInputAmount.allPathAmountOut, inToken0Decimal));
        console.log("TEST2 estimatedInputAmount:", estimatedInputAmount);
        if (allPathAmountOut < ammOutput) {
          console.log("use arb in exactOut: FA / AMM", allPathAmountOut, ammOutput);
          isUseArb = true;
        } else {
          console.log("NOT use arb in exactOut: FA / AMM", allPathAmountOut, ammOutput);
          isUseArb = false;
        }
      }
    }
    catch (e) {
      console.log("TEST ERROR HERE:", e);
      setSwapButtonState(false);
      if (!poolExist) {
        return new CustomError('Pool does not exist!');
      }
    }
    // AMM
    if (poolExist && !isUseArb) {

      console.log(pair);
      setPair(pair);
      console.log('------------------ CONSTRUCT ROUTE ------------------');
      // This is where we let Uniswap SDK know we are not using WETH but ETHER

      const route = new Route([pair], token0IsETH ? ETHER : token0, token1IsETH ? ETHER : token1);

      console.log(route);

      setRoute(route);

      console.log('------------------ CONSTRUCT TRADE ------------------');
      let trade;
      try {
        trade = new Trade(
          route,
          inputAmount,
          exactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
          chainId
        );
      } catch (e) {
        if (e instanceof InsufficientReservesError) {
          setSwapButtonState(false);
          setSwapButtonContent('Insufficient liquidity for this trade');
          console.log('Insufficient reserve!');
          setBonus0(null);
          setBonus1(null);
          return new CustomError('Insufficient reserve!');
        }
        setSwapButtonState(false);
        setSwapButtonContent('Unhandled exception!');
        console.log('Unhandled exception!');
        console.log(e);
        setBonus0(null);
        setBonus1(null);
        return new CustomError('Unhandled exception!');
      }

      console.log(trade, trade.outputAmount.toExact());
      setTrade(trade);
      console.log('------------------ SLIPPAGE CALCULATE ------------------');

      // calculate slippage adjusted amount
      if (exactIn) {
        console.log(`By algorithm, expected to get: ${trade.outputAmount.toExact()}`);
        // if provided exact token in, we want to know min out token amount
        minAmountOut = trade.minimumAmountOut(allowedSlippage);
        slippageAdjustedAmount = minAmountOut.raw.toString();

        // update UI with estimated output token amount
        setToken1Amount(trade.outputAmount.toFixed(4));
        console.log(`Minimum received: ${slippageAdjustedAmount}`);
      } else {
        console.log(`By algorithm, expected to get: ${trade.inputAmount.toExact()}`);
        maxAmountIn = trade.maximumAmountIn(allowedSlippage);
        slippageAdjustedAmount = maxAmountIn.raw.toString();
        setToken0Amount(trade.inputAmount.toFixed(4));
        console.log(`Maximum pay: ${slippageAdjustedAmount}`);
        // set token0Amount for later balance checking
        token0Amount = trade.inputAmount.toExact();
      }

      setBonus0(null);
      setBonus1(null);

      setSlippageAdjustedAmount(slippageAdjustedAmount);
      setMinAmountOut(minAmountOut);
      setMaxAmountIn(maxAmountIn);

      console.log('------------------ BREAKDOWN ------------------');
      let { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade);
      let breakdownInfo = [
        // `Slice Slippage tolerance:` ${allowedSlippage} %`
        // `Slippage tolerance : ${slippage}%`,
        `Price impact : ${priceImpactWithoutFee.toFixed(2)}%`,
        // `LP FEE : ${realizedLPFee?.toSignificant(6)} ${trade.inputAmount.currency.symbol}`,
        `${exactIn ? 'Min received:' : 'Max sold'} : ${exactIn ? minAmountOut.toSignificant(4) : maxAmountIn.toSignificant(4)
        } ${exactIn ? trade.outputAmount.currency.symbol : trade.inputAmount.currency.symbol}`,
      ];
      setSwapBreakdown(breakdownInfo);
    }
    // FA, or fall back to AMM
    let bonus0 = null;
    let bonus1 = null;
    console.log(">1 pool exists? ", poolExist)
    if (!poolExist || isUseArb) {
      setSwapButtonContent("Swap by arbitrage")
      if (exactIn) {
        if (inToken0Symbol == wrappedCurrencySymbol || inToken0Symbol == nativeCurrencySymbol) methodsName = isUseArb ? "swapExactETHForTokensByArb" : "swapExactETHForTokens";
        else if (inToken1Symbol == wrappedCurrencySymbol || inToken1Symbol == nativeCurrencySymbol) methodsName = isUseArb ? "swapExactTokensForETHByArb" : "swapExactTokensForETH";
        else methodsName = isUseArb ? "swapExactTokensForTokensByArb" : "swapExactTokensForTokens";

        if (allPathAmountOut > ammOutput) {
          // show basic AMM output in UI, with (FA-AMM)*40% as additional bonus
          // note that here trade.outputAmount is the same as formatUnits(ammOutput, inToken1Decimal)
          // console.log("test exact in, no arb: inputAmount, trade.output, FA, AMM", inputAmount.toExact(), trade.outputAmount.toExact(), formatUnits(allPathAmountOut, inToken1Decimal), formatUnits(ammOutput, inToken1Decimal))

          const FAfloat = allPathAmountOut;
          const AMMfloat = ammOutput;
          bonus1 = ((FAfloat - AMMfloat) * 0.4);
          console.log("test bonus", bonus1)

          isUseArb = true;
          token1Amount = ammOutput;
          minAmountOut = Math.ceil(allPathAmountOut * (1 - slippage / 100));
          minAmountOut = `0x${minAmountOut.toString(16)}`;
          slippageAdjustedAmount = minAmountOut;
        } else {
          isUseArb = false;
          setBonus1(null);
          token1Amount = ammOutput;
          minAmountOut = Math.ceil(ammOutput * (1 - slippage / 100));
          minAmountOut = `0x${minAmountOut.toString(16)}`;
          slippageAdjustedAmount = minAmountOut;
        }
        setMethodName(methodsName);
        setToken1Amount(toFixed4(token1Amount));
        setMidTokenAddress(midTokenAddress);
        setIsUseArb(isUseArb);
        setMinAmountOut(minAmountOut);
        setSlippageAdjustedAmount(minAmountOut);
      } else {
        if (inToken0Symbol == wrappedCurrencySymbol || inToken0Symbol == nativeCurrencySymbol) methodsName = isUseArb ? "swapETHForExactTokensByArb" : "swapETHForExactTokens";
        else if (inToken1Symbol == wrappedCurrencySymbol || inToken1Symbol == nativeCurrencySymbol) methodsName = isUseArb ? "swapTokensForExactETHByArb" : "swapTokensForExactETH";
        else methodsName = isUseArb ? "swapTokensForExactTokensByArb" : "swapTokensForExactTokens";

        if (allPathAmountOut < ammOutput) {
          // show basic AMM output in UI, with (FA-AMM)*40% as additional bonus
          // note that here trade.outputAmount is the same as formatUnits(ammOutput, inToken1Decimal)

          const FAfloat = allPathAmountOut;
          const AMMfloat = ammOutput;
          bonus0 = ((FAfloat - AMMfloat) * 0.4);
          console.log("test bonus, should be negative", bonus0)

          isUseArb = true;
          token0Amount = ammOutput;
          maxAmountIn = Math.floor(allPathAmountOut * (1 + slippage / 100));
          maxAmountIn = `0x${maxAmountIn.toString(16)}`;
          slippageAdjustedAmount = maxAmountIn;
        } else {
          isUseArb = false;
          setBonus0(null);
          token0Amount = ammOutput;
          maxAmountIn = Math.floor(ammOutput * (1 + slippage / 100));
          maxAmountIn = `0x${maxAmountIn.toString(16)}`;
          slippageAdjustedAmount = maxAmountIn;
        }

        setMethodName(methodsName);
        setToken0Amount(toFixed4(token0Amount));
        setMidTokenAddress(midTokenAddress);
        setIsUseArb(isUseArb);
        setMaxAmountIn(maxAmountIn);
        setSlippageAdjustedAmount(maxAmountIn);
      }
    }
    setIsUseArb(isUseArb);

    let userToken0Balance = await getUserTokenBalanceRaw(
      token0IsETH ? ETHER : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol),
      account,
      library
    );
    console.log("test white button", userToken0Balance.toString(), inToken0Amount, inToken1Amount)

    let userHasSufficientBalance;
    try {
      userHasSufficientBalance = userToken0Balance.gte(parseUnits(token0Amount, inToken0Decimal));
    } catch (e) {
      console.log('wrappedAmount!!!');
      console.log(e);
      setSwapButtonState(false);
      setSwapButtonContent(e.fault);
      return new CustomError(e.fault);
    }

    console.log("comparison", userHasSufficientBalance, token0Amount)

    // quit if user doesn't have enough balance, otherwise this will cause error
    if (!userHasSufficientBalance) {
      setBonus0(null);
      setBonus1(null);
      setSwapButtonState(false);
      setSwapButtonContent('Not Enough balance');
      console.log("to exit")
      return new CustomError('Not enough balance');
    }
    console.log("user has sufficient balance")
    if (bonus0 != null)
      setBonus0(bonus0.toFixed(4));
    if (bonus1 != null)
      setBonus1(bonus1.toFixed(4));


    console.log('------------------ ALLOWANCE ------------------');
    if (!token0IsETH) {
      console.log("before getAllowance")
      let allowance = await getAllowance(
        inToken0Address,
        account,
        ROUTER_ADDRESS(),
        library,
        account
      );

      console.log(`Current allowance for ${inToken0Symbol}: ${allowance}`);
      let token0AmountToApprove = exactIn ? inputAmount.raw.toString() : slippageAdjustedAmount;
      let token0approval = await checkTokenIsApproved(
        inToken0Address,
        token0AmountToApprove,
        library,
        account
      );
      console.log('token0approval',token0approval);
      if (!token0approval) {
        console.log('Not enough allowance');
        setApproveAmount(token0AmountToApprove);
        // when needApprove = true, please show the button of [Approve]
        setNeedApprove(true);
        setApproveButtonStatus(true);
        setSwapButtonState(false);
        setSwapButtonContent('Need approval');
        return 'approve is ok';
      } else {
        setNeedApprove(false);
      }
      setSwapButtonContent('Swap');
      setSwapButtonState(true);
      return 'swap is ok';
    } else {
      // console.log(`${nativeCurrencySymbol} does not need approve`)
      setNeedApprove(false);
    }
    if (isUseArb) {
      setSwapButtonContent('Swap');
    } else {
      setSwapButtonContent('Swap');
    }

    setSwapButtonState(true);
    return 'swap is ok';
  })();
  if (status instanceof CustomError) {
    setSwapButtonContent(status.getErrorText());
  } else {
    // console.log(status);
  }
}
function truncateDecimals(value, decimals){
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
  const [buyCoin,setBuyCoin] = useState('')
  const [buyCointAmount,setBuyCoinAmount] = useState(0)
  const [redeemCoin,setRedeemCoin] = useState('')
  const [redeemCoinAmount,setRedeemCoinAmount] = useState(0)
  const method = inputToken0.symbol === 'USDA'?'mint':'redeem'
  setSwapMode(method)
  useEffect(()=>{
    if(swapMode === 'mint'){
      setRedeemCoin(inputToken0)
      setBuyCoin(inputToken1)
      let amount = truncateDecimals(inputToken0.amount,inputToken0.decimals)
      amount = parseFloat(amount)
    } else{
      setBuyCoin(inputToken0)
    }
  },[swapMode])

  const status = await (async () => {
    // change slippage from bips (0.01%) into percentage
    allowedSlippage = new Percent(allowedSlippage, 10000);

    const contract = getRouterContract(library, account);

    // console.log(`token0Amount: ${inToken0Amount}`);
    // console.log(`token1Amount: ${inToken1Amount}`);

    const nativeCurrencySymbol = NATIVE_CURRENCY();
    const wrappedCurrencySymbol = `W${nativeCurrencySymbol}`;

    const token0IsETH = inToken0Symbol === nativeCurrencySymbol;
    const token1IsETH = inToken1Symbol === nativeCurrencySymbol;

    // console.log(inputToken0);
    // console.log(inputToken1);

    if (token0IsETH && token1IsETH) return new CustomError(`Doesn't support ${nativeCurrencySymbol} to ${nativeCurrencySymbol}`);
    // console.log('------------------ WRAP OR SWAP  ------------------');
    // if one is ETH and other WETH, use WETH contract's deposit and withdraw
    // wrap ETH into WETH
    if (token0IsETH && inToken1Symbol === wrappedCurrencySymbol) {
      // console.log('WRAP');
      // UI should sync value of ETH and WETH
      // if (exactIn) setToken1Amount(token0Amount);
      // else setToken0Amount(token1Amount);
      const result = await wethContract
        .deposit({
          value: wrappedAmount,
        })
        .catch(e => {
          // console.log(e);
          return new CustomError(`${wrappedCurrencySymbol} Deposit failed`);
        });

      return result;
    }
    // unwrap WETH into ETH
    if (inToken0Symbol === wrappedCurrencySymbol && token1IsETH) {
      // console.log('UNWRAP');

      // UI should sync value of ETH and WETH
      // if (exactIn) setToken1Amount(token0Amount);
      // else setToken0Amount(token1Amount);

      const result = await wethContract.withdraw(wrappedAmount).catch(e => {
        // console.log(e);
        return new CustomError('WETH Withdrawal failed');
      });
      return result;
    }
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20

    // console.log('SWAP');

    // console.log('------------------ CONSTRUCT TOKEN ------------------');
    // use WETH for ETHER to work with Uniswap V2 SDK
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
    // console.log('------------------ CONSTRUCT PAIR ------------------');
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

    // console.log("TEST call swap contract:", finalMethodName, args, options);
    // console.log('------------------ ARGUMENTS ------------------');
    // console.log(options);
    // console.log(args);

    // console.log(contract);
    // try {
    //   const result = await contract.swapExactTokensForETHByArb(
    //     "0x989680", 
    //     "0x2386F26FC10000", 
    //     ["0xA6983722023c67Ff6938FF2adc1d7fC61B5966f3", inToken1Address], 
    //     account, 
    //     "0x61bb585a"
    //   );
    //   return result;
    // } catch(e)  {new CustomError(`${methodName} failed with error ${e}`)};
    // return "ERROR";

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
