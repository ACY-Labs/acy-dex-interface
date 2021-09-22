import { abi as IUniswapV2PairABI } from '@acyswap/v1-core/build/IUniswapV2Pair.json';
import { getAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts';
import { AddressZero, MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { JSBI, Token, TokenAmount, Percent, ETHER, CurrencyAmount } from '@acyswap/sdk';
import { abi as IUniswapV2Router02ABI } from '../abis/IUniswapV2Router02.json';
import ERC20ABI from '../abis/ERC20.json';

export const INITIAL_ALLOWED_SLIPPAGE = 50; // bips

export const ROUTER_ADDRESS = '0xc858026830a9A060beC7A408B8b4b4852c10B189';

// (RICK NOTES) need address on ethereum network to get price
export const supportedTokens = [
  {
    symbol: 'USDC',
    address: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
    addressOnEth: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimal: 6,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/USDC.svg',
  },
  {
    symbol: 'ETH',
    address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    addressOnEth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimal: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/ETH.svg',
  },
  {
    symbol: 'WETH',
    address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    addressOnEth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimal: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/ETH.svg',
  },
  {
    symbol: 'UNI',
    address: '0x03e6c12ef405ac3f642b9184eded8e1322de1a9e',
    addressOnEth: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    decimal: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/UNI.svg',
  },
  {
    symbol: 'DAI',
    address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    addressOnEth: '0x6b175474e89094c44da98b954eedeac495271d0f',
    decimal: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/DAI.svg',
  },
  {
    symbol: 'cDAI',
    address: '0x6d7f0754ffeb405d23c51ce938289d4835be3b14',
    addressOnEth: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
    decimal: 8,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/DAI.svg',
  },
  {
    symbol: 'WBTC',
    address: '0x577d296678535e4903d59a4c929b718e1d575e0a',
    addressOnEth: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimal: 8,
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
  return getContract(ROUTER_ADDRESS, IUniswapV2Router02ABI, library, account);
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
    return await library.getBalance(account);
  }
  const contractToCheckForBalance = getContract(token.address, ERC20ABI, library, account);
  return await contractToCheckForBalance.balanceOf(account);
}

// get user token balance in readable string foramt
export async function getUserTokenBalance(token, chainId, account, library) {
  let { address, symbol, decimal } = token;

  if (!token) return;
  let tokenIsETH = symbol === 'ETH';

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
    ROUTER_ADDRESS, //spender
    library, // provider
    account // active account
  );

  console.log('REQUIRED AMOUNT:');
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
