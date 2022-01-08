import {
  CurrencyAmount,
  ETHER,
  Fetcher,
  InsufficientReservesError,
  Percent,
  Token,
  TokenAmount,
  WETH,
} from '@acyswap/sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import {
  CustomError,
  calculateGasMargin,
  calculateSlippageAmount,
  checkTokenIsApproved,
  getRouterContract,
  getTokenTotalSupply,
  getUserTokenBalanceRaw,
} from '../utils';
import { constantInstance, NATIVE_CURRENCY } from "@/constants";

// get the estimated amount of the other token required when adding liquidity, in readable string.
export async function getEstimated(
  inputToken0,
  inputToken1,
  allowedSlippage,
  exactIn = true,
  chainId,
  library,
  account,
  setToken0Amount,
  setToken1Amount,
  setNeedApproveToken0,
  setNeedApproveToken1,
  setApproveAmountToken0,
  setApproveAmountToken1,
  setApproveToken0ButtonShow,
  setApproveToken1ButtonShow,
  setLiquidityBreakdown,
  setButtonContent,
  setButtonStatus,
  setLiquidityStatus,
  setPair,
  setNoLiquidity,
  setPairToAddOnServer,
  setParsedToken0Amount,
  setParsedToken1Amount,
  setArgs,
  setValue
) {
  let status = await (async () => {
    setNeedApproveToken0(false);
    setNeedApproveToken1(false);
    setApproveAmountToken0('0');
    setApproveAmountToken1('0');
    setApproveToken0ButtonShow(false);
    setApproveToken1ButtonShow(false);
    setLiquidityBreakdown('');
    setButtonContent('Loading...');
    setButtonStatus(false);
    setLiquidityStatus('');

    let router = getRouterContract(library, account);
    let slippage = allowedSlippage * 0.01;
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

    inToken0Amount = inToken0Amount || '0';
    inToken1Amount = inToken1Amount || '0';

    if (!account || !library) return new CustomError('Connect to your wallet');
    if (!inputToken0.symbol || !inputToken1.symbol) return new CustomError('Please choose tokens');
    if (exactIn && inToken0Amount == '0') return new CustomError('Please enter amount');
    if (!exactIn && inToken1Amount == '0') return new CustomError('Please enter amount');
    if (exactIn && inToken0Amount == '') return new CustomError('Please enter amount');
    if (!exactIn && inToken1Amount == '') return new CustomError('Please enter amount');
    if (exactIn && isNaN(parseFloat(inToken0Amount))) return new CustomError('Please enter amount');
    if (!exactIn && isNaN(parseFloat(inToken1Amount)))
      return new CustomError('Please enter amount');

    // let token0IsETH = inToken0Symbol === 'ETH';
    // let token1IsETH = inToken1Symbol === 'ETH';

    const nativeCurrencySymbol = NATIVE_CURRENCY();
    const wrappedCurrencySymbol = `W${nativeCurrencySymbol}`;

    let token0IsETH = inToken0Symbol === nativeCurrencySymbol;
    let token1IsETH = inToken1Symbol === nativeCurrencySymbol;

    console.log(inputToken0);
    console.log(inputToken1);
    if (token0IsETH && token1IsETH) {
      setButtonContent(`Doesn't support ${nativeCurrencySymbol} to ${nativeCurrencySymbol}`);
      setButtonStatus(false);
      return new CustomError(`Doesn't support ${nativeCurrencySymbol} to ${nativeCurrencySymbol}`);
    }
    if ((token0IsETH && inToken1Symbol === wrappedCurrencySymbol) || (inToken0Symbol === wrappedCurrencySymbol && token1IsETH)) {
      setButtonContent(`Invalid pair ${wrappedCurrencySymbol}/${nativeCurrencySymbol}`);
      setButtonStatus(false);
      return new CustomError(`Invalid pair ${wrappedCurrencySymbol}/${nativeCurrencySymbol}`);
    }
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20

    console.log('ADD LIQUIDITY');
    console.log('------------------ CONSTRUCT TOKEN ------------------');

    // use WETH for ETHER to work with Uniswap V2 SDK
    const token0 = token0IsETH
      ? WETH[chainId]
      : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
    const token1 = token1IsETH
      ? WETH[chainId]
      : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);

    if (token0.equals(token1)) {
      setButtonContent('Equal tokens');
      setButtonStatus(false);
      return new CustomError('Equal tokens!');
    }
    // get pair using our own provider
    console.log("TEST TOKEN0 TOKEN1:",token0, token1);
    const pair = await Fetcher.fetchPairData(token0, token1, library, chainId)
      .then(pair => {
        console.log(pair.reserve0.raw.toString());
        console.log(pair.reserve1.raw.toString());
        return pair;
      })
      .catch(e => {
        return new CustomError(
          `${token0.symbol} - ${token1.symbol} pool does not exist. Create one?`
        );
      });

    console.log('pair');
    console.log(pair);
    setPair(pair);

    let noLiquidity = false;
    if (pair instanceof CustomError) {
      noLiquidity = true;
    }
    setNoLiquidity(noLiquidity);

    // check if user has balance in the pair, will handle this in callback function
    // const userPoolBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library);
    // if (userPoolBalance.isZero()) {
    //   setPairToAddOnServer({"token0": inToken0Address, "token1": inToken0Address});
    //   console.log("test add to server", {"token0": inToken0Address, "token1": inToken0Address})
    // } else {
    //   setPairToAddOnServer(null);
    //   console.log("test do not add")
    // }
    setPairToAddOnServer({ "token0": inToken0Address, "token1": inToken1Address });
    console.log("test add to server", { "token0": inToken0Address, "token1": inToken1Address })

    console.log('------------------ PARSE AMOUNT ------------------');
    // convert typed in amount to BigNumber using ethers.js's parseUnits,

    let parsedAmount;
    try {
      parsedAmount = exactIn
        ? new TokenAmount(token0, parseUnits(inToken0Amount, inToken0Decimal))
        : new TokenAmount(token1, parseUnits(inToken1Amount, inToken1Decimal));
    } catch (e) {
      console.log('parsedAmount');
      console.log(e);
      setButtonStatus(false);
      if (e.fault === 'underflow') {
        setButtonContent('Value too small');
        return new CustomError(e.fault);
      }

      if (noLiquidity) setButtonContent('Enter both values');
      else setButtonContent('Unhandled error');
      return new CustomError('Amount error');
    }

    let parsedToken0Amount;
    let parsedToken1Amount;

    // this is have pool
    if (!noLiquidity) {
      console.log('estimated dependent amount');
      let dependentTokenAmount;
      if (exactIn) {
        dependentTokenAmount = pair.priceOf(token0).quote(parsedAmount);

        let token0TokenAmount;
        try {
          token0TokenAmount = new TokenAmount(token0, parseUnits(inToken0Amount, inToken0Decimal));
        } catch (e) {
          setButtonStatus(false);
          if (e.fault === 'underflow') {
            setButtonContent(e.fault);
            return new CustomError(e.fault);
          } else {
            setButtonContent('Token or amount missing');
            return new CustomError('Token or amount missing');
          }
        }

        parsedToken0Amount =
          token0 === ETHER ? CurrencyAmount.ether(token0TokenAmount.raw) : token0TokenAmount;

        parsedToken1Amount =
          token1 === ETHER ? CurrencyAmount.ether(dependentTokenAmount.raw) : dependentTokenAmount;
        setToken1Amount(dependentTokenAmount.toFixed(5));
        inToken1Amount = dependentTokenAmount.toExact();
      } else {
        dependentTokenAmount = pair.priceOf(token1).quote(parsedAmount);

        let token1TokenAmount;
        try {
          token1TokenAmount = new TokenAmount(token1, parseUnits(inToken1Amount, inToken1Decimal));
        } catch (e) {
          console.log('token0TokenAmount');
          console.log(e);
          setButtonStatus(false);
          if (e.fault === 'underflow') {
            setButtonContent(e.fault);
            return new CustomError(e.fault);
          } else {
            setButtonContent('Token or amount missing');
            return new CustomError('Token or amount missing');
          }
        }

        parsedToken0Amount =
          token0 === ETHER ? CurrencyAmount.ether(dependentTokenAmount.raw) : dependentTokenAmount;

        parsedToken1Amount =
          token1 === ETHER ? CurrencyAmount.ether(token1TokenAmount.raw) : token1TokenAmount;
        setToken0Amount(dependentTokenAmount.toFixed(5));
        inToken0Amount = dependentTokenAmount.toExact();
      }
    } else {
      // this is to create new pools
      if (inToken0Amount === '0' || inToken1Amount === '0') {
        if (noLiquidity) {
          setButtonStatus(false);
          setButtonContent('Create new pool');

          return new CustomError('Creating a new pool, please enter both amounts');
        } else {
          setButtonStatus(false);
          setButtonContent('Add liquidity');
          return new CustomError("One field is empty, it's probably a new pool");
        }
      }

      try {
        parsedToken0Amount = new TokenAmount(token0, parseUnits(inToken0Amount, inToken0Decimal));

        parsedToken1Amount = new TokenAmount(token1, parseUnits(inToken1Amount, inToken1Decimal));
      } catch (e) {
        console.log('parsedToken0Amount and parsedToken1Amount');
        console.log(e);
        setButtonStatus(false);
        if (e.fault === 'underflow') {
          setButtonContent(e.fault);
          return new CustomError(e.fault);
        } else {
          setButtonContent('Value must be a number');
          return new CustomError('Value must be a number');
        }
      }
    }
    setParsedToken0Amount(parsedToken0Amount);
    setParsedToken1Amount(parsedToken1Amount);

    // check user account balance
    console.log('------------------ CHECK BALANCE ------------------');
    let userToken0Balance = await getUserTokenBalanceRaw(
      token0IsETH ? ETHER : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol),
      account,
      library
    );

    let userToken1Balance = await getUserTokenBalanceRaw(
      token1IsETH ? ETHER : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol),
      account,
      library
    );

    console.log('token0 balance');
    console.log(userToken0Balance);

    console.log('token1 balance');
    console.log(userToken1Balance);

    let userHasSufficientBalance;
    try {
      userHasSufficientBalance =
        userToken0Balance.gte(parseUnits(inToken0Amount, inToken0Decimal)) &&
        userToken1Balance.gte(parseUnits(inToken1Amount, inToken1Decimal));
    } catch (e) {
      console.log(userHasSufficientBalance);
      console.log(e);
      setButtonStatus(false);
      if (e.fault === 'underflow') {
        setButtonContent(e.fault);
        return new CustomError(e.fault);
      } else {
        setButtonContent('userHasSufficientBalance');
        return new CustomError('unknow error');
      }
    }

    // quit if user doesn't have enough balance, otherwise this will cause error
    if (!userHasSufficientBalance) {
      setButtonContent('Not enough balance');
      setButtonStatus(false);
      return new CustomError('Not enough balance');
    }

    console.log('------------------ BREAKDOWN ------------------');
    if (!noLiquidity) {
      let totalSupply = await getTokenTotalSupply(pair.liquidityToken, library, account);
      console.log('Liquidity Minted');
      console.log(pair.liquidityToken);

      try {
        let liquidityMinted = pair.getLiquidityMinted(
          totalSupply,
          parsedToken0Amount,
          parsedToken1Amount
        );
        let poolTokenPercentage = new Percent(
          liquidityMinted.raw,
          totalSupply.add(liquidityMinted).raw
        ).toFixed(4);

        setLiquidityBreakdown([
          // `Slippage tolerance : ${slippage}%`,
          `Pool reserve: ${pair.reserve0.toFixed(3)} ${pair.token0.symbol == "WETH" ? wrappedCurrencySymbol : pair.token0.symbol
          } + ${pair.reserve1.toFixed(3)} ${pair.token1.symbol == "WETH" ? wrappedCurrencySymbol : pair.token1.symbol}`,
          `Pool share: ${poolTokenPercentage}%`,
        ]);
      } catch (e) {
        if (e instanceof InsufficientReservesError) {
          setButtonContent('Insufficient reserve!');
          setButtonStatus(false);
          return new CustomError('Insufficient reserve!');
        }
        console.log(">> test unhandled exception", parsedToken0Amount, parsedToken0Amount.toFixed(2))
        if (parsedToken0Amount.toExact() == 0 || parsedToken1Amount.toExact() == 0) {
          // setButtonContent('Zero as input');
          return new CustomError('Zero as input');
        }
        console.log("add liquidity unhandled exception", e)
        setButtonContent('Unhandled exception!');
        setButtonStatus(false);
        return new CustomError('Unhandled exception!');
      }
    } else {
      setLiquidityBreakdown([
        `Ready to create ${inToken0Symbol} ${inToken1Symbol} liquidity pool.`,
      ]);
    }
    console.log('------------------ ALLOWANCE ------------------');
    let approveStatus = 0;
    if (!token0IsETH) {
      let token0approval = await checkTokenIsApproved(
        inToken0Address,
        parsedToken0Amount.raw.toString(),
        library,
        account
      );
      console.log('token 0 approved?', token0approval);

      if (!token0approval) {
        console.log('Not enough allowance');
        setApproveAmountToken0(parsedToken0Amount.raw.toString());
        setNeedApproveToken0(true);
        setApproveToken0ButtonShow(true);
        approveStatus += 1;
      }
    }
    if (!token1IsETH) {
      console.log(`Inside addLiquidity, amount needed: ${parsedToken1Amount.raw.toString()}`);
      let token1approval = await checkTokenIsApproved(
        inToken1Address,
        parsedToken1Amount.raw.toString(),
        library,
        account
      );
      console.log('token 1 approved?', token1approval);

      if (!token1approval) {
        console.log('Not enough allowance for token1');
        setApproveAmountToken1(parsedToken1Amount.raw.toString());
        setNeedApproveToken1(true);
        setApproveToken1ButtonShow(true);
        approveStatus += 2;
      }
    }
    if (approveStatus > 0) {
      setButtonStatus(false);
      setButtonContent('Need approval');

      return new CustomError(
        `Need approve ${approveStatus === 1
          ? inToken0Symbol
          : approveStatus === 2
            ? inToken1Symbol
            : `${inToken0Symbol} and ${inToken1Symbol}`
        }`
      );
    }
    setButtonStatus(true);
    if (noLiquidity) {
      setButtonContent('Create a new pool');
    } else {
      setButtonContent('Add liquidity');
    }

    console.log('------------------ PREPARE ADD LIQUIDITY ------------------');
    console.log('parsed token 0 amount');
    console.log(parsedToken0Amount.raw);
    console.log('parsed token 1 amount');
    console.log(parsedToken1Amount.raw);
    console.log('slippage');
    console.log(allowedSlippage);
    // FIXME: slippage in utils/index calculateSlippageAmount() is represented by a fraction with 10000 as denominator
    // 0.5% slippage should become 500/10000. We should handle this explicitly. Do it more elegantly in future fix.
    allowedSlippage = allowedSlippage * 100;

    let estimate;
    let method;
    let args;
    let value;

    if (token0IsETH || token1IsETH) {
      estimate = router.estimateGas.addLiquidityETH;
      method = router.addLiquidityETH;
      let nonETHToken = token0IsETH ? token1 : token0;

      let parsedNonETHTokenAmount = token0IsETH ? parsedToken1Amount : parsedToken0Amount;

      let minETH = token0IsETH
        ? calculateSlippageAmount(
          parsedToken0Amount,
          noLiquidity ? 0 : allowedSlippage
        )[0].toString()
        : calculateSlippageAmount(
          parsedToken1Amount,
          noLiquidity ? 0 : allowedSlippage
        )[0].toString();

      args = [
        nonETHToken.address,
        parsedNonETHTokenAmount.raw.toString(),
        calculateSlippageAmount(
          parsedNonETHTokenAmount,
          noLiquidity ? 0 : allowedSlippage
        )[0].toString(),
        minETH,
        account,
        `0x${(Math.floor(new Date().getTime() / 1000) + 1800).toString(16)}`,
      ];
      value = BigNumber.from(
        (token1IsETH ? parsedToken1Amount : parsedToken0Amount).raw.toString()
      );
      console.log("addLiquidityETH args")
      console.log(args);
      console.log("addLiquidityETH payable amount")
      console.log(value)
    } else {
      estimate = router.estimateGas.addLiquidity;
      method = router.addLiquidity;
      args = [
        inToken0Address,
        inToken1Address,
        parsedToken0Amount.raw.toString(),
        parsedToken1Amount.raw.toString(),
        calculateSlippageAmount(
          parsedToken0Amount,
          noLiquidity ? 0 : allowedSlippage
        )[0].toString(),
        calculateSlippageAmount(
          parsedToken1Amount,
          noLiquidity ? 0 : allowedSlippage
        )[0].toString(),
        account,
        `0x${(Math.floor(new Date().getTime() / 1000) + 1800).toString(16)}`,
      ];
      value = null;
    }
    console.log('args');
    console.log(args);
    console.log('estimate');
    console.log(estimate);
    console.log('method');
    console.log(method);
    console.log('value');
    console.log(value);

    setArgs(args);
    setValue(value);
    //  end of
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
  })();

  if (status instanceof CustomError) {
    setButtonContent(status.getErrorText());
  } else {
    console.log(status);
  }
}

export async function addLiquidity(
  inputToken0,
  inputToken1,
  allowedSlippage,
  exactIn = true,
  chainId,
  library,
  account,
  pair,
  noLiquidity,
  parsedToken0Amount,
  parsedToken1Amount,
  args,
  value,
  setLiquidityStatus,
  setButtonContent,
  addLiquidityCallback
) {
  let status = await (async () => {
    // check uniswap
    let router = getRouterContract(library, account);

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

    // let token0IsETH = inToken0Symbol === 'ETH';
    // let token1IsETH = inToken1Symbol === 'ETH';
    const nativeCurrencySymbol = NATIVE_CURRENCY();
    const wrappedCurrencySymbol = `W${nativeCurrencySymbol}`;
    let token0IsETH = inToken0Symbol === nativeCurrencySymbol;
    let token1IsETH = inToken1Symbol === nativeCurrencySymbol;

    console.log('------------------ RECEIVED TOKEN ------------------');
    console.log('token0');
    console.log(inputToken0);
    console.log('token1');
    console.log(inputToken1);

    if (token0IsETH && token1IsETH) return new CustomError(`Doesn't support ${nativeCurrencySymbol} to ${nativeCurrencySymbol}`);

    // if ((token0IsETH && inToken1Symbol === 'WETH') || (inToken0Symbol === 'WETH' && token1IsETH)) {
    if ((token0IsETH && inToken1Symbol === wrappedCurrencySymbol) || (inToken0Symbol === wrappedCurrencySymbol && token1IsETH)) {
      // UI should sync value of ETH and WETH
      return new CustomError(`Invalid pair ${wrappedCurrencySymbol}/${nativeCurrencySymbol}`);
    }
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20

    console.log('ADD LIQUIDITY');
    console.log('------------------ CONSTRUCT TOKEN ------------------');
    // use WETH for ETHER to work with Uniswap V2 SDK
    const token0 = token0IsETH
      ? WETH[chainId]
      : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
    const token1 = token1IsETH
      ? WETH[chainId]
      : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);

    // quit if the two tokens are equivalent, i.e. have the same chainId and address
    if (token0.equals(token1)) return new CustomError('Equal tokens!');

    // get pair using our own provider
    console.log('------------------ CONSTRUCT PAIR ------------------');
    console.log('FETCH pair');
    // if an error occurs, because pair doesn't exists
    console.log(pair);
    console.log(noLiquidity);
    console.log('------------------ PARSE AMOUNT ------------------');
    console.log(parsedToken0Amount);
    console.log(parsedToken1Amount);
    console.log('------------------ CHECK BALANCE ------------------');
    console.log('------------------ BREAKDOWN ------------------');
    console.log('------------------ ALLOWANCE ------------------');
    console.log('------------------ PREPARE ADD LIQUIDITY ------------------');
    let estimate;
    let method;
    if (token0IsETH || token1IsETH) {
      estimate = router.estimateGas.addLiquidityETH;
      method = router.addLiquidityETH;
      console.log(args);
      console.log(value);
    } else {
      estimate = router.estimateGas.addLiquidity;
      method = router.addLiquidity;
      console.log(args);
      console.log(value);
    }

    console.log('parsed token 0 amount');
    console.log(parsedToken0Amount.raw);
    console.log('parsed token 1 amount');
    console.log(parsedToken1Amount.raw);
    console.log('slippage');
    console.log(allowedSlippage);

    console.log(estimate);
    console.log(method);
    console.log(args);
    console.log(value);

    let result = await estimate(...args, value ? { value } : {}).then(estimatedGasLimit =>
      method(...args, {
        ...(value ? { value } : {}),
        gasLimit: calculateGasMargin(estimatedGasLimit),
      }).catch(e => new CustomError('CustomError in transaction'))
    );
    return result;
  })();
  if (status instanceof CustomError) {
    setLiquidityStatus(status.getErrorText());
    setButtonContent("Please try again");
  } else {
    console.log('status');
    console.log(status);
    const scanUrlPrefix = constantInstance.scanUrlPrefix.scanUrl;
    let url = scanUrlPrefix + '/tx/' + status.hash;
    addLiquidityCallback(status);
    setLiquidityStatus(
      <a href={url} target={'_blank'}>
        View it on {constantInstance.scanUrlPrefix.scanName}
      </a>
    );
  }
  return;
}
