import { abi as IUniswapV2Router02ABI } from "../abis/IUniswapV2Router02.json";
import ERC20ABI from "../abis/ERC20.json";
import { getAddress } from "@ethersproject/address";
import { Contract } from "@ethersproject/contracts";
import { AddressZero } from "@ethersproject/constants";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits, formatUnits } from "@ethersproject/units";
import {
  CurrencyAmount,
  ETHER,
  Fraction,
  JSBI,
  Percent,
  TokenAmount,
  Trade,
} from "@uniswap/sdk";

export const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
// export const ROUTER_ADDRESS = "0xF3726d6acfeda3E73a6F2328b948834f3Af39A2B";

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

// add 10%
export function calculateGasMargin(value) {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
    .div(BigNumber.from(10000));
}

export function isZero(hexNumberString) {
  return /^0x0*$/.test(hexNumberString);
}

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

export class ACYSwapErrorStatus {
  getErrorText() {
    return this.errorText;
  }
  constructor(errorText) {
    this.errorText = errorText;
  }
}

const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000));
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000));
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE);

export function computeTradePriceBreakdown(trade) {
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

export async function getUserTokenAmount(token, account, library) {
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

export async function getUserTokenAmountExact(token, account, library) {
  return formatUnits(
    await getUserTokenAmount(token, account, library),
    token.decimals
  );
}
