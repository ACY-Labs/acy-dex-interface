import { abi as IUniswapV2PairABI } from '@acyswap/v1-core/build/IUniswapV2Pair.json';
import { getAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts';
import { AddressZero, MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Interface } from '@ethersproject/abi';
import { JSBI, Token, TokenAmount, Percent, ETHER, CurrencyAmount, Fetcher, Pair } from '@acyswap/sdk';
import ACYRouterABI from '../abis/AcyV1Router02.json';
import FlashArbitrageABI from '../abis/AcyV1FlashArbitrage.json';
import { abi as FarmsABI } from '../abis/ACYMultiFarm.json';
import ERC20ABI from '../abis/ERC20.json';
import axios from 'axios';
import { JsonRpcProvider } from "@ethersproject/providers";
import ConstantLoader from '@/constants';
const tokenList = ConstantLoader().tokenList;
const farmSetting = ConstantLoader().farmSetting;

export const INITIAL_ALLOWED_SLIPPAGE = farmSetting.INITIAL_ALLOWED_SLIPPAGE;
export const ROUTER_ADDRESS = farmSetting.ROUTER_ADDRESS;
export const FARMS_ADDRESS  = farmSetting.FARMS_ADDRESS;
export const FLASH_ARBITRAGE_ADDRESS = farmSetting.FLASH_ARBITRAGE_ADDRESS;
export const BLOCK_TIME = farmSetting.BLOCK_TIME;
export const BLOCKS_PER_YEAR = farmSetting.BLOCKS_PER_YEAR;
export const BLOCKS_PER_MONTH = farmSetting.BLOCKS_PER_MONTH; 
export const RPC_URL = farmSetting.RPC_URL;
export const API_URL = farmSetting.API_URL;

//old farm address 0xf132Fdd642Afa79FDF6C1B77e787865C652eC824
//new farm address 0x96c13313aB386BCB16168Dee3D2d86823A990770
//latest address   0x11B64a91fA3eedfe0977a64D908BB8B8faf903a4

// a custom error class for custom error text and handling
export class CustomError {
  getErrorText() {
    return this.errorText;
  }

  constructor(errorText) {
    this.errorText = errorText;
  }
}

// (RICK NOTES) need address on ethereum network to get price
export const supportedTokens = [
  {
    symbol: 'USDC',
    address: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
    addressOnEth: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/USDC.svg',
  },
  {
    symbol: 'ETH',
    address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    addressOnEth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/ETH.svg',
  },
  {
    symbol: 'WETH',
    address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    addressOnEth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/ETH.svg',
  },
  {
    symbol: 'UNI',
    address: '0x03e6c12ef405ac3f642b9184eded8e1322de1a9e',
    addressOnEth: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/UNI.svg',
  },
  {
    symbol: 'DAI',
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    addressOnEth: '0x6b175474e89094c44da98b954eedeac495271d0f',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/DAI.svg',
  },
  {
    symbol: 'cDAI',
    address: '0x6d7f0754ffeb405d23c51ce938289d4835be3b14',
    addressOnEth: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
    decimals: 8,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/DAI.svg',
  },
  {
    symbol: 'WBTC',
    address: '0x577d296678535e4903d59a4c929b718e1d575e0a',
    addressOnEth: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimals: 8,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/WBTC.svg',
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
  return getContract(ROUTER_ADDRESS, ACYRouterABI, library, account);
}

export function getFarmsContract(library, account) {
  return getContract(FARMS_ADDRESS, FarmsABI, library, account);
}

export function getTokenContract(tokenAddress, library, account) {
  return getContract(tokenAddress, ERC20ABI, library, account);
}

export function getPairContract(pairAddress, library, account) {
  return getContract(pairAddress, IUniswapV2PairABI, library, account);
}

// return gas with 10% added margin in BigNumber
export function calculateGasMargin(value) {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000));
}

// check if hex string is zero
export function isZero(hexNumberString) {
  return /^0x0*$/.test(hexNumberString);
}

// return token allowance in BigNumber
export async function getAllowance(tokenAddress, owner, spender, library, account) {
  const tokenContract = getContract(tokenAddress, ERC20ABI, library, account);
  const allowance = await tokenContract.allowance(owner, spender);
  return allowance;
}

// taken from Uniswap, used for price impact and realized liquid provider fee
export function computeTradePriceBreakdown(trade) {
  const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000));
  const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000));
  const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE);

  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
      trade.route.pairs.reduce(
        currentFee => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
        ONE_HUNDRED_PERCENT
      )
    );

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction =
    trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined;

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
      : CurrencyAmount.ether(realizedLPFee.multiply(trade.inputAmount.raw).quotient));

  return {
    priceImpactWithoutFee: priceImpactWithoutFeePercent,
    realizedLPFee: realizedLPFeeAmount,
  };
}

// get user token balance in BigNumber
export async function getUserTokenBalanceRaw(token, account, library) {
  if (token === ETHER) {
    return library.getBalance(account);
  }

  const contractToCheckForBalance = getContract(token.address, ERC20ABI, library, account);
  // 9753573
  // console.log("contractToCheckForBalance:",)
  return contractToCheckForBalance.balanceOf(account);
}

// get user token balance in readable string foramt
export async function getUserTokenBalance(token, chainId, account, library) {
  let { address, symbol, decimals } = token;

  if (!token) return;
  // let tokenIsETH = symbol === 'ETH';
  let tokenIsETH = symbol === 'BNB';

  return formatUnits(
    await getUserTokenBalanceRaw(
      tokenIsETH ? ETHER : new Token(chainId, address, decimals, symbol),
      account,
      library
    ),
    decimals
  );
}

export async function getUserTokenBalanceWithAddress(address, chainId, account, library) {
  const tokenContract = getTokenContract(address, library, account);
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  return getUserTokenBalance({ address, symbol, decimals }, chainId, account, library);
}

// return slippage adjusted amount for arguments when adding liquidity. Returns JSBI
export function calculateSlippageAmount(value, slippage) {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`);
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ];
}

// approve an ERC-20 token
export async function approve(tokenAddress, requiredAmount, library, account) {
  if (requiredAmount === '0') {
    console.log('Unncessary call to approve');
    return true;
  }

  let allowance = await getAllowance(
    tokenAddress,
    account, // owner
    ROUTER_ADDRESS, //spender
    library, // provider
    account // active account
  );

  if (allowance.lt(BigNumber.from(requiredAmount))) {
    let tokenContract = getContract(tokenAddress, ERC20ABI, library, account);
    let useExact = false;
    // try to get max allowance
    let estimatedGas = await tokenContract.estimateGas['approve'](ROUTER_ADDRESS, MaxUint256).catch(
      async () => {
        // general fallback for tokens who restrict approval amounts
        useExact = true;
        let result = await tokenContract.estimateGas.approve(
          ROUTER_ADDRESS,
          requiredAmount.raw.toString()
        );
        return result;
      }
    );

    console.log(`Exact? ${useExact}`);
    let res = await tokenContract
      .approve(ROUTER_ADDRESS, useExact ? requiredAmount.raw.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas),
      })
      .catch(() => {
        console.log('not approve success');
        return false;
      });
    console.log(res);

    if (res == false) {
      return false;
    }

    let flag = false;

    while (1) {
      let newAllowance = await getAllowance(
        tokenAddress,
        account, // owner
        ROUTER_ADDRESS, //spender
        library, // provider
        account // active account
      );

      if (newAllowance.gte(BigNumber.from(requiredAmount))) {
        flag = true;
        break;
      }
    }
    if (flag) return true;
  } else {
    console.log('Allowance sufficient');
    return true;
  }
}

// should be used in polling to check status of token approval every n seconds
export async function checkTokenIsApproved(tokenAddress, requiredAmount, library, account) {
  let allowance = await getAllowance(
    tokenAddress,
    account, // owner
    ROUTER_ADDRESS, // spender
    library, // provider
    account // active account
  );

  console.log('REQUIRED AMOUNT:');
  console.log(requiredAmount);
  console.log(`ALLOWANCE FOR TOKEN ${tokenAddress}`);
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

export async function approveTokenWithSpender(tokenAddress, spender, library, account) {
  const tokenContract = getContract(tokenAddress, ERC20ABI, library, account);
  const estimatedGas = await tokenContract.estimateGas['approve'](spender, MaxUint256);

  const res = await tokenContract.approve(spender, MaxUint256, {
    gasLimit: calculateGasMargin(estimatedGas),
  });
  return res;
}

export async function disapproveTokenWithSpender(tokenAddress, spender, library, account) {
  const tokenContract = getContract(tokenAddress, ERC20ABI, library, account);
  const estimatedGas = await tokenContract.estimateGas['approve'](spender, 0);

  const res = await tokenContract.approve(spender, 0, {
    gasLimit: calculateGasMargin(estimatedGas),
  });
}

export async function checkTokenIsApprovedWithSpender(
  tokenAddress,
  spender,
  requiredAmount,
  library,
  account
) {
  let allowance = await getAllowance(
    tokenAddress,
    account, // owner
    spender, // spender
    library, // provider
    account // active account
  );

  console.log('REQUIRED AMOUNT:');
  console.log(requiredAmount);
  console.log(`ALLOWANCE FOR TOKEN ${tokenAddress}`);
  console.log(allowance);
  return allowance.gte(BigNumber.from(requiredAmount));
}

export async function checkUserHasSufficientLPBalance(lpTokenAddr, amount, library, account) {
  if (!account || !library) return;
  const pair = getPairContract(lpTokenAddr, library, account);
  const decimals = (await pair.decimals()).toNumber();
  const balance = pair.balanceOf(account);
  const requiredAmount = parseUnits(amount, decimals);
  if (balance.lt(requiredAmount)) return false;
  return true;
}

export function parseArbitrageLog({ data, topics }) {
  const eventABI = [
    'event flashArbitrageSwapPath(address inToken,uint amountIn,address outToken,address[] allPath, uint[] XiArr)',
  ];
  const iface = new Interface(eventABI);
  let parsedLogs = iface.parseLog({ data, topics }).args;
  debugger
  const nonZeroToken = [];
  const nonZeroTokenAmount = [];
  console.log(parsedLogs);
  parsedLogs.XiArr.forEach((amount, index) => {
    if (!amount.isZero()) {
      nonZeroToken.push(parsedLogs.allPath[index]);
      nonZeroTokenAmount.push(amount);
    }
  });

  return {
    inTokenAddr: parsedLogs[0],
    amount: parsedLogs[1],
    outTokenAddr: parsedLogs[2],
    nonZeroToken,
    nonZeroTokenAmount,
  };
}
// pass token symbol
export function getTokenPrice(symbol) {
  const token = tokenList.find(token => token.symbol == symbol);
  if (!token) return 0;
  axios.get("https://api.coingecko.com/api/v3/simple/price?ids=shiba-inu&vs_currencies=usd")
}
export async function getAllSuportedTokensPrice() {
  const library = new JsonRpcProvider(RPC_URL, 56);
  const searchIdsArray = tokenList.map(token => token.idOnCoingecko);
  const searchIds = searchIdsArray.join('%2C');
  const tokensPrice = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${searchIds}&vs_currencies=usd`
  ).then(async (result) => {
    const data = result.data;
    console.log("tokensPrice:",data);
    const tokensPrice = {};
    tokenList.forEach(token => {
      tokensPrice[token.symbol] = data[token.idOnCoingecko]['usd'];
    })
    tokensPrice['ACY'] = await getACYPrice(library);//dont know acy price now;

    return tokensPrice;
  });
  console.log("TOKEN PRICE1:", tokensPrice, library);
  return tokensPrice;
}

export async function getACYPrice(library){
  const ACY  = tokenList.find(token => token.symbol == "ACY");
  const BUSD = tokenList.find(token => token.symbol == "BUSD");
  const USDT = tokenList.find(token => token.symbol == "USDT");

  const acyToken  = new Token(56, "0xc94595b56e301f3ffedb8ccc2d672882d623e53a", 18, "ACY");
  const usdToken  = new Token(56, "0x55d398326f99059ff775485246999027b3197955", 18, "USDT");
  const busdToken = new Token(56, "0xe9e7cea3dedca5984780bafc599bd69add087d56", 18, "BUSD");
  const acyUsdtPair = await Fetcher.fetchPairData(acyToken, usdToken, library).catch(e => {
    return false
  });
  const acyBusdPair = await Fetcher.fetchPairData(acyToken, busdToken, library).catch(e => {
    return false
  });
  if(!acyUsdtPair && !acyBusdPair) {
    return 0.2;
  } else if(!acyUsdtPair) {
    const result = await getTokenPriceByPair(acyBusdPair, ACY.symbol, library);
    return result;
  } else if(!acyBusdPair) {
    const result = await getTokenPriceByPair(acyUsdtPair, ACY.symbol, library);
    return result;
  } else {
    const acyToUsdtPrice =  getTokenPriceByPair(acyUsdtPair, ACY.symbol, library);
    const acyToBusdPrice =  getTokenPriceByPair(acyBusdPair, ACY.symbol, library);
    let [result1, result2] = await Promise.all([acyToUsdtPrice, acyToBusdPrice]);
    const result = (result1+result2)/2;
    return result;
  }
}

export async function getTokenPriceByPair(pair, symbol, library) {
  const pair_contract = getPairContract(pair.liquidityToken.address, library)
  const totalSupply = await pair_contract.totalSupply();
  const totalAmount = new TokenAmount(pair.liquidityToken, totalSupply.toString());
  const allToken0 = pair.getLiquidityValue(
      pair.token0,
      totalAmount,
      totalAmount,
      false
  );
  const allToken1 = pair.getLiquidityValue(
      pair.token1,
      totalAmount,
      totalAmount,
      false
  );
  const allToken0Amount = parseFloat(allToken0.toExact());
  const allToken1Amount = parseFloat(allToken1.toExact());
  if(pair.token0.symbol == symbol) {
    return allToken1Amount / allToken0Amount ;
  } else {
    return allToken0Amount / allToken1Amount ;
  }
  return 0;
}

// return output field amount for swap component
export async function withExactInEstimateOutAmount(deltaX, xTokenAddress, yTokenAddress, maxPathNum = 15, library, account) {
  const flashArbitrageContract = getContract(FLASH_ARBITRAGE_ADDRESS, FlashArbitrageABI, library, account)
  console.log(deltaX, xTokenAddress, yTokenAddress, maxPathNum)
  const estimateOutputAmount = await flashArbitrageContract.calXiOutput(deltaX, xTokenAddress, yTokenAddress, maxPathNum);
  return estimateOutputAmount;
}

// return output field amount for swap component
export async function withExactOutEstimateInAmount(deltaY, xTokenAddress, yTokenAddress, maxPathNum = 15, library, account) {
  const flashArbitrageContract = getContract(FLASH_ARBITRAGE_ADDRESS, FlashArbitrageABI, library, account)
  const estimateInputAmount = await flashArbitrageContract.calYiOutput(deltaY, xTokenAddress, yTokenAddress, maxPathNum);
  return estimateInputAmount;
}