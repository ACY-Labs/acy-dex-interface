import { abi as IUniswapV2Router02ABI } from "../abis/IUniswapV2Router02.json";
import { abi as IUniswapV2PairABI } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import ERC20ABI from "../abis/ERC20.json";
import { getAddress } from "@ethersproject/address";
import { Contract } from "@ethersproject/contracts";
import { AddressZero } from "@ethersproject/constants";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits, formatUnits } from "@ethersproject/units";
import {
  JSBI,
  Token,
  TokenAmount,
  TradeType,
  Route,
  Trade,
  Fetcher,
  Percent,
  WETH,
  ETHER,
  CurrencyAmount,
  InsufficientReservesError,
} from "@uniswap/sdk";
import { MaxUint256 } from "@ethersproject/constants";

export const INITIAL_ALLOWED_SLIPPAGE = 50; //bips

export const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
// export const ROUTER_ADDRESS = "0xF3726d6acfeda3E73a6F2328b948834f3Af39A2B";

export const  supportedTokens= [
  {
    symbol: "USDC",
    address: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
    decimal: 6,
  },
  {
    symbol: "ETH",
    address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    decimal: 18,
  },
  {
    symbol: "WETH",
    address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    decimal: 18,
  },
  {
    symbol: "UNI",
    address: "0x03e6c12ef405ac3f642b9184eded8e1322de1a9e",
    decimal: 18,
  },
  {
    symbol: "DAI",
    address: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
    decimal: 18,
  },
  {
    symbol: "cDAI",
    address: "0x6d7f0754ffeb405d23c51ce938289d4835be3b14",
    decimal: 8,
  },
  {
    symbol: "WBTC",
    address: "0x577d296678535e4903d59a4c929b718e1d575e0a",
    decimal: 8,
  },
];


export function isAddress(value) {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

// account is not optional
export function getSigner(library, account) {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library, account) {
  return account ? getSigner(library, account) : library;
}

// account is optional
export function getContract(address, ABI, library, account) {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account));
}

export function getRouterContract(library, account) {
  return getContract(ROUTER_ADDRESS, IUniswapV2Router02ABI, library, account);
}

// return gas with 10% added margin in BigNumber
export function calculateGasMargin(value) {
  return value
      .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
      .div(BigNumber.from(10000));
}

// check if hex string is zero
export function isZero(hexNumberString) {
  return /^0x0*$/.test(hexNumberString);
}

// return token allowance in BigNumber
export async function getAllowance(
    tokenAddress,
    owner,
    spender,
    library,
    account
) {
  let tokenContract = getContract(tokenAddress, ERC20ABI, library, account);
  let allowance = await tokenContract.allowance(owner, spender);
  console.log(allowance);
  return allowance;
}

// a custom error class for custom error text and handling
export class ACYSwapErrorStatus {
  getErrorText() {
    return this.errorText;
  }
  constructor(errorText) {
    this.errorText = errorText;
  }
}

// taken from Uniswap, used for price impact and realized liquid provider fee
export function computeTradePriceBreakdown(trade) {
  const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000));
  const ONE_HUNDRED_PERCENT = new Percent(
      JSBI.BigInt(10000),
      JSBI.BigInt(10000)
  );
  const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE);

  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
      ? undefined
      : ONE_HUNDRED_PERCENT.subtract(
          trade.route.pairs.reduce(
              (currentFee) => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
              ONE_HUNDRED_PERCENT
          )
      );

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction =
      trade && realizedLPFee
          ? trade.priceImpact.subtract(realizedLPFee)
          : undefined;

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
      ? new Percent(
          priceImpactWithoutFeeFraction?.numerator,
          priceImpactWithoutFeeFraction?.denominator
      )
      : undefined;

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
      realizedLPFee &&
      trade &&
      (trade.inputAmount instanceof TokenAmount
          ? new TokenAmount(
              trade.inputAmount.token,
              realizedLPFee.multiply(trade.inputAmount.raw).quotient
          )
          : CurrencyAmount.ether(
              realizedLPFee.multiply(trade.inputAmount.raw).quotient
          ));

  return {
    priceImpactWithoutFee: priceImpactWithoutFeePercent,
    realizedLPFee: realizedLPFeeAmount,
  };
}

// get user token balance in BigNumber
export async function getUserTokenBalanceRaw(token, account, library) {
  if (token === ETHER) {
    return await library.getBalance(account);
  } else {
    let contractToCheckForBalance = getContract(
        token.address,
        ERC20ABI,
        library,
        account
    );
    return await contractToCheckForBalance.balanceOf(account);
  }
}

// get user token balance in readable string foramt
export async function getUserTokenBalance(token, chainId, account, library) {
  let { address, symbol, decimal } = token;

  if (!token) return;
  let tokenIsETH = symbol === "ETH";

  return formatUnits(
      await getUserTokenBalanceRaw(
          tokenIsETH ? ETHER : new Token(chainId, address, decimal, symbol),
          account,
          library
      ),
      decimal
  );
}

// return slippage adjusted amount for arguments when adding liquidity. Returns JSBI
export function calculateSlippageAmount(value, slippage) {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`);
  }
  return [
    JSBI.divide(
        JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)),
        JSBI.BigInt(10000)
    ),
    JSBI.divide(
        JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)),
        JSBI.BigInt(10000)
    ),
  ];
}

// approve an ERC-20 token
export async function approve(tokenAddress, requiredAmount, library, account) {
  if (requiredAmount === "0") {
    console.log("Unncessary call to approve");
    return;
  }

  let allowance = await getAllowance(
      tokenAddress,
      account, // owner
      ROUTER_ADDRESS, //spender
      library, // provider
      account // active account
  );

  console.log(`ALLOWANCE FOR TOKEN ${tokenAddress}`);
  console.log(allowance);

  console.log("REquired amount");
  console.log(requiredAmount);
  if (allowance.lt(BigNumber.from(requiredAmount))) {
    let tokenContract = getContract(tokenAddress, ERC20ABI, library, account);
    let useExact = false;
    console.log("NOT ENOUGH ALLOWANCE");
    // try to get max allowance
    let estimatedGas = await tokenContract.estimateGas["approve"](
        ROUTER_ADDRESS,
        MaxUint256
    ).catch(() => {
      // general fallback for tokens who restrict approval amounts
      useExact = true;
      return tokenContract.estimateGas.approve(
          ROUTER_ADDRESS,
          requiredAmount.raw.toString()
      );
    });

    console.log(`Exact? ${useExact}`);
    await tokenContract.approve(
        ROUTER_ADDRESS,
        useExact ? requiredAmount.raw.toString() : MaxUint256,
        {
          gasLimit: calculateGasMargin(estimatedGas),
        }
    );
  } else {
    console.log("Allowance sufficient");
    return;
  }
}

// should be used in polling to check status of token approval every n seconds
export async function checkTokenIsApproved(
    tokenAddress,
    requiredAmount,
    library,
    account
) {
  let allowance = await getAllowance(
      tokenAddress,
      account, // owner
      ROUTER_ADDRESS, //spender
      library, // provider
      account // active account
  );

  console.log("REQUIRED AMOUNT:");
  console.log(requiredAmount);
  console.log(`ALLOWANCE FOR TOKEN ${tokenAddress}:`);
  console.log(allowance);

  return allowance.gte(BigNumber.from(requiredAmount));
}




// get total supply of a ERC-20 token, can be liquidity token
export async function getTokenTotalSupply(token, library, account) {
  let tokenContract = getContract(token.address, ERC20ABI, library, account);
  let totalSupply = await tokenContract.totalSupply();
  let parsedResult = new TokenAmount(token, totalSupply.toString());

  return parsedResult;
}

export function usePairContract(pairAddress, library, account) {
  return getContract(pairAddress, IUniswapV2PairABI, library, account);
}

export async function getUserRemoveLiquidityBalance(
    tokenA,
    tokenB,
    chainId,
    account,
    library,
    setUserLiquidityPosition,
    setToken0Balance,
    setToken1Balance
) {

  let {
    address: token0Address,
    symbol: token0Symbol,
    decimal: token0Decimal,
  } = tokenA;
  let {
    address: token1Address,
    symbol: token1Symbol,
    decimal: token1Decimal,
  } = tokenB;


  const token0 = new Token(
      chainId,
      token0Address,
      token0Decimal,
      token0Symbol
  );
  const token1 = new Token(
      chainId,
      token1Address,
      token1Decimal,
      token1Symbol
  );

  if(token0.equals(token1)) {
    setUserLiquidityPosition("two token can't be the same");
    return;
  }

  let checkLiquidityPositionTasks=[];
  let userNonZeroLiquidityPositions = [];

  // queue get pair task
  const pairTask = Fetcher.fetchPairData(token0, token1, library);
  checkLiquidityPositionTasks.push(pairTask);

  let pairs = await Promise.allSettled(checkLiquidityPositionTasks);

  for(let pair of pairs){
    if (pair.status === "rejected") {
      setUserLiquidityPosition("this pair's fetch is reject");
      return;
    }
    pair=pair.value;
    let userPoolBalance = await getUserTokenBalanceRaw(
        pair.liquidityToken,
        account,
        library
    );

    if (userPoolBalance.isZero()) {
      setToken0Balance("0");
      setToken1Balance("0");
      setUserLiquidityPosition("user pool balance is zero");
      return;
    }

    userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

    let totalPoolTokens = await getTokenTotalSupply(
        pair.liquidityToken,
        library,
        account
    );

    let token0Deposited = pair.getLiquidityValue(
        pair.token0,
        totalPoolTokens,
        userPoolBalance,
        false
    );
    let token1Deposited = pair.getLiquidityValue(
        pair.token1,
        totalPoolTokens,
        userPoolBalance,
        false
    );
    let totalSupply = await getTokenTotalSupply(
        pair.liquidityToken,
        library,
        account
    );

    let liquidityMinted = pair.getLiquidityMinted(
        totalSupply,
        token0Deposited,
        token1Deposited
    );

    let poolTokenPercentage = new Percent(
        liquidityMinted.raw,
        totalSupply.raw
    ).toFixed(4);


    userNonZeroLiquidityPositions.push({
      pool: `${pair.token0.symbol}/${pair.token1.symbol}`,
      token0Amount: `${token0Deposited.toSignificant(6)} ${pair.token0.symbol}`,
      token1Amount: `${token1Deposited.toSignificant(6)} ${pair.token1.symbol}`,
      token0Reserve: `${pair.reserve0.toExact()} ${pair.token0.symbol}`,
      token1Reserve: `${pair.reserve1.toExact()} ${pair.token1.symbol}`,
      share: `${poolTokenPercentage}%`,
    });

    console.log("token pairs that user has positions:");
    console.log(userNonZeroLiquidityPositions);

    setToken0Balance(`${token0Deposited.toSignificant(6)} ${pair.token0.symbol}`);
    setToken1Balance(`${token1Deposited.toSignificant(6)} ${pair.token1.symbol}`);

    setUserLiquidityPosition(" your balance is showed ");

    return;
  }
}

// get the estimated amount of the other token required when adding liquidity, in readable string.
export async function removeLiquidityGetEstimated(
    inputToken0,
    inputToken1,
    exactIn = true,
    chainId,
    library
) {
  let {
    address: token0Address,
    symbol: token0Symbol,
    decimal: token0Decimal,
    amount: token0Amount,
  } = inputToken0;
  let {
    address: token1Address,
    symbol: token1Symbol,
    decimal: token1Decimal,
    amount: token1Amount,
  } = inputToken1;

  if (exactIn && (isNaN(parseFloat(token0Amount)) || token0Amount === ""))
    return;
  if (!exactIn && (isNaN(parseFloat(token1Amount)) || token1Amount === ""))
    return;
  let token0IsETH = token0Symbol === "ETH";
  let token1IsETH = token1Symbol === "ETH";

  if (
      (token0IsETH && token1Symbol === "WETH") ||
      (token0Symbol === "WETH" && token1IsETH)
  ) {
    return;
  }
  // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20
  else {
    // use WETH for ETHER to work with Uniswap V2 SDK
    const token0 = token0IsETH
        ? WETH[chainId]
        : new Token(chainId, token0Address, token0Decimal, token0Symbol);
    const token1 = token1IsETH
        ? WETH[chainId]
        : new Token(chainId, token1Address, token1Decimal, token1Symbol);

    if (token0.equals(token1)) return;

    // get pair using our own provider
    const pair = await Fetcher.fetchPairData(token0, token1, library)
        .then((pair) => {
          console.log(pair.reserve0.raw.toString());
          console.log(pair.reserve1.raw.toString());
          return pair;
        })
        .catch((e) => {
          return new ACYSwapErrorStatus(
              `${token0.symbol} - ${token1.symbol} pool does not exist. Create one?`
          );
        });
    if (pair instanceof ACYSwapErrorStatus)
      return exactIn ? token1Amount : token0Amount;
    console.log(pair);

    console.log("------------------ PARSE AMOUNT ------------------");
    // convert typed in amount to BigNumber rusing ethers.js's parseUnits then to string,
    let parsedAmount = exactIn
        ? new TokenAmount(
            token0,
            parseUnits(token0Amount, token0Decimal)
        ).raw.toString(16)
        : new TokenAmount(
            token1,
            parseUnits(token1Amount, token1Decimal)
        ).raw.toString(16);

    let inputAmount;

    // CurrencyAmount instance is required for Trade contructor if input is ETHER
    if ((token0IsETH && exactIn) || (token1IsETH && !exactIn)) {
      inputAmount = new CurrencyAmount(ETHER, `0x${parsedAmount}`);
    } else {
      inputAmount = new TokenAmount(
          exactIn ? token0 : token1,
          `0x${parsedAmount}`
      );
    }

    console.log(exactIn ? "Exact input" : "Exact output");
    console.log("inputAmount");
    console.log(inputAmount.raw.toString());
    console.log("estimated dependent amount");

    let dependentTokenAmount;
    let parsed;

    if (exactIn) {
      dependentTokenAmount = pair
          .priceOf(token0)
          .quote(new TokenAmount(token0, inputAmount.raw));

      parsed =
          token1 === ETHER
              ? CurrencyAmount.ether(dependentTokenAmount.raw)
              : dependentTokenAmount;
    } else {
      dependentTokenAmount = pair
          .priceOf(token1)
          .quote(new TokenAmount(token1, inputAmount.raw));

      parsed =
          token0 === ETHER
              ? CurrencyAmount.ether(dependentTokenAmount.raw)
              : dependentTokenAmount;
    }

    console.log(parsed.toExact());
    return parsed.toExact();
  }
}
