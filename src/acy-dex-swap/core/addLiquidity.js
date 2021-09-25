import {
  CurrencyAmount,
  ETHER,
  FACTORY_ADDRESS,
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
  Error,
  calculateGasMargin,
  calculateSlippageAmount,
  checkTokenIsApproved,
  getRouterContract,
  getTokenTotalSupply,
  getUserTokenBalanceRaw,
  INITIAL_ALLOWED_SLIPPAGE,
} from '../utils';
// get the estimated amount of the other token required when adding liquidity, in readable string.
export async function getEstimated(
  inputToken0,
  inputToken1,
  allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
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

    console.log(FACTORY_ADDRESS);

    let router = getRouterContract(library, account);
    let slippage = allowedSlippage * 0.01;
    let {
      address: inToken0Address,
      symbol: inToken0Symbol,
      decimal: inToken0Decimal,
      amount: inToken0Amount,
    } = inputToken0;
    let {
      address: inToken1Address,
      symbol: inToken1Symbol,
      decimal: inToken1Decimal,
      amount: inToken1Amount,
    } = inputToken1;

    if (!inputToken0.symbol || !inputToken1.symbol) return new Error('please choose tokens');
    if (exactIn && inToken0Amount == '0') return new Error('token0Amount is 0');
    if (!exactIn && inToken1Amount == '0') return new Error('token1Amount is 0');
    if (exactIn && inToken0Amount == '') return new Error('token0Amount is ""');
    if (!exactIn && inToken1Amount == '') return new Error('token1Amount is ""');
    if (exactIn && isNaN(parseFloat(inToken0Amount))) return new Error('token0Amount is NaN');
    if (!exactIn && isNaN(parseFloat(inToken1Amount))) return new Error('token1Amount is NaN');

    let token0IsETH = inToken0Symbol === 'ETH';
    let token1IsETH = inToken1Symbol === 'ETH';

    console.log(inputToken0);
    console.log(inputToken1);
    if (token0IsETH && token1IsETH) {
      setButtonContent("Doesn't support ETH to ETH");
      setButtonStatus(false);
      return new Error("Doesn't support ETH to ETH");
    } else if (
      (token0IsETH && inToken1Symbol === 'WETH') ||
      (inToken0Symbol === 'WETH' && token1IsETH)
    ) {
      setButtonContent('Invalid pair WETH/ETH');
      setButtonStatus(false);
      return new Error('Invalid pair WETH/ETH');
    }
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
    else {
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
        return new Error('Equal tokens!');
      }
      // get pair using our own provider
      const pair = await Fetcher.fetchPairData(token0, token1, library)
        .then(pair => {
          console.log(pair.reserve0.raw.toString());
          console.log(pair.reserve1.raw.toString());
          return pair;
        })
        .catch(e => {
          return new Error(`${token0.symbol} - ${token1.symbol} pool does not exist. Create one?`);
        });

      console.log('pair');
      console.log(pair);
      setPair(pair);

      let noLiquidity = false;
      if (pair instanceof Error) {
        noLiquidity = true;
      }
      setNoLiquidity(noLiquidity);
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
          setButtonContent(e.fault);
          return new Error(e.fault);
        } else {
          setButtonContent('unknow error');
          return new Error('unknow error');
        }
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
            token0TokenAmount = new TokenAmount(
              token0,
              parseUnits(inToken0Amount, inToken0Decimal)
            );
          } catch (e) {
            console.log('token0TokenAmount');
            console.log(e);
            setButtonStatus(false);
            if (e.fault === 'underflow') {
              setButtonContent(e.fault);
              return new Error(e.fault);
            } else {
              setButtonContent('unknow error');
              return new Error('unknow error');
            }
          }

          parsedToken0Amount =
            token0 === ETHER ? CurrencyAmount.ether(token0TokenAmount.raw) : token0TokenAmount;

          parsedToken1Amount =
            token1 === ETHER
              ? CurrencyAmount.ether(dependentTokenAmount.raw)
              : dependentTokenAmount;
          setToken1Amount(dependentTokenAmount.toFixed(5));
          inToken1Amount = dependentTokenAmount.toExact();
        } else {
          dependentTokenAmount = pair.priceOf(token1).quote(parsedAmount);

          let token1TokenAmount;
          try {
            token1TokenAmount = new TokenAmount(
              token1,
              parseUnits(inToken1Amount, inToken1Decimal)
            );
          } catch (e) {
            console.log('token0TokenAmount');
            console.log(e);
            setButtonStatus(false);
            if (e.fault === 'underflow') {
              setButtonContent(e.fault);
              return new Error(e.fault);
            } else {
              setButtonContent('unknow error');
              return new Error('unknow error');
            }
          }

          parsedToken0Amount =
            token0 === ETHER
              ? CurrencyAmount.ether(dependentTokenAmount.raw)
              : dependentTokenAmount;

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
            setButtonContent('create new pool');

            return new Error('Creating a new pool, please enter both amounts');
          } else {
            setButtonStatus(false);
            setButtonContent('add liquidity');
            return new Error("One field is empty, it's probably a new pool");
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
            return new Error(e.fault);
          } else {
            setButtonContent('unknow error');
            return new Error('unknow error');
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
          return new Error(e.fault);
        } else {
          setButtonContent('Unknown error');
          return new Error('unknow error');
        }
      }

      // quit if user doesn't have enough balance, otherwise this will cause error
      if (!userHasSufficientBalance) {
        setButtonContent('Not enough balance');
        setButtonStatus(false);
        return new Error('Not enough balance');
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
            `Pool reserve: ${pair.reserve0.toFixed(3)} ${
              pair.token0.symbol
            } + ${pair.reserve1.toFixed(3)} ${pair.token1.symbol}`,
            `Pool share: ${poolTokenPercentage}%`,
            // `${token0.symbol}: ${parsedToken0Amount.toExact()}`,
            // `${token1.symbol}: ${parsedToken1Amount.toExact()}`,
            // noLiquidity ? "100" : `${poolTokenPercentage?.toSignificant(4)}} %`,
          ]);
        } catch (e) {
          if (e instanceof InsufficientReservesError) {
            setButtonContent('Insufficient reserve!');
            setButtonStatus(false);
            // alert("something wrong !!!!");
            return new Error('Insufficient reserve!');
            console.log('Insufficient reserve!');
          } else {
            setButtonContent('Unhandled exception!');
            setButtonStatus(false);
            return new Error('Unhandled exception!');
            console.log('Unhandled exception!');
            console.log(e);
          }
        }
      } else {
        setLiquidityBreakdown(['new pool']);
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
        console.log('token 0 approved?');
        console.log(token0approval);

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
        console.log('token 1 approved?');
        console.log(token1approval);

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

        return new Error(
          `Need approve ${
            approveStatus === 1
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
          `0x${(Math.floor(new Date().getTime() / 1000) + 60).toString(16)}`,
        ];
        value = BigNumber.from(
          (token1IsETH ? parsedToken1Amount : parsedToken0Amount).raw.toString()
        );
        console.log(value);
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
          `0x${(Math.floor(new Date().getTime() / 1000) + 60).toString(16)}`,
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
    } //  end of
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
  })();

  if (status instanceof Error) {
    console.log(status.getErrorText());
  } else {
    console.log(status);
  }
}

export async function addLiquidity(
  inputToken0,
  inputToken1,
  allowedSlippage = INITIAL_ALLOWED_SLIPPAGE,
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
  addLiquidityCallback
) {
  let status = await (async () => {
    // check uniswap
    console.log(FACTORY_ADDRESS);
    let router = getRouterContract(library, account);

    const {
      address: inToken0Address,
      symbol: inToken0Symbol,
      decimal: inToken0Decimal,
      amount: inToken0Amount,
    } = inputToken0;
    const {
      address: inToken1Address,
      symbol: inToken1Symbol,
      decimal: inToken1Decimal,
      amount: inToken1Amount,
    } = inputToken1;

    let token0IsETH = inToken0Symbol === 'ETH';
    let token1IsETH = inToken1Symbol === 'ETH';

    console.log('------------------ RECEIVED TOKEN ------------------');
    console.log('token0');
    console.log(inputToken0);
    console.log('token1');
    console.log(inputToken1);

    if (token0IsETH && token1IsETH) return new Error("Doesn't support ETH to ETH");

    if ((token0IsETH && inToken1Symbol === 'WETH') || (inToken0Symbol === 'WETH' && token1IsETH)) {
      // UI should sync value of ETH and WETH
      return new Error('Invalid pair WETH/ETH');
    }
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
    else {
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
      if (token0.equals(token1)) return new Error('Equal tokens!');

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
        }).catch(e => {
          return new Error('Error in transaction');
        })
      );
      return result;
    }
  })();
  if (status instanceof Error) {
    setLiquidityStatus(status.getErrorText());
  } else {
    console.log('status');
    console.log(status);
    let url = 'https://rinkeby.etherscan.io/tx/' + status.hash;
    addLiquidityCallback(status);
    setLiquidityStatus(
      <a href={url} target={'_blank'}>
        View it on etherscan
      </a>
    );
  }
  return;
}
