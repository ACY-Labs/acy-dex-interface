import { abi as usdaABI } from '../abis/USDA.json'
import { abi as vaultAdminABI } from '../abis/VaultAdmin.json'
import { abi as vaultCoreABI } from '../abis/VaultCore.json'
import ERC20ABI from '../abis/ERC20.json';

import { getAddress } from '@ethersproject/address'
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Contract } from '@ethersproject/contracts';
import { AddressZero, MaxUint256 } from '@ethersproject/constants';

import { JSBI, Token, TokenAmount, Percent, ETHER, CurrencyAmount, Fetcher, Pair } from '@acyswap/sdk';

import { constantInstance, ROUTER_ADDRESS, FARMS_ADDRESS, FLASH_ARBITRAGE_ADDRESS, FACTORY_ADDRESS, INIT_CODE_HASH, RPC_URL, CHAINID, TOKENLIST, API_URL, NATIVE_CURRENCY, MARKET_TOKEN_LIST } from "@/constants";
import { columnsPool } from '@/pages/Dao/Util';
import { USDAProxyAddress, vaultProxyAddress } from './address';

export function isAddress(value) {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

export function getSigner(library, account) {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library, account) {
  return account ? getSigner(library, account) : library;
}

export function getContract(address, ABI, library, account) {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account));
}
export function getUSDAContract(library, account) {
  return getContract(USDAProxyAddress, usdaABI, library, account);
}
export function getVaultAdminContract(library, account) {
  return getContract(vaultProxyAddress, vaultAdminABI, library, account);
}
export function getVaultCoreContract(library, account) {
  return getContract(vaultProxyAddress, vaultCoreABI, library, account);
}

// get user token balance in BigNumber
export async function getUserTokenBalanceRaw(token, account, library) {

  const contractToCheckForBalance = getContract(token.address, usdaABI, library, account);
  return contractToCheckForBalance.balanceOf(account);
}

// get user token balance in readable string foramt
export async function getUserTokenBalance(token, chainId, account, library) {
  let { address, symbol, decimals } = token;

  if (!token) return;

  return formatUnits(
    await getUserTokenBalanceRaw(
      new Token(chainId, address, decimals, symbol),
      account,
      library
    ),
    decimals
  );
}
export async function getEstimateAmount(swapMode, token, library, account) {
  const { address, decimals } = token
  // export async function getEstimateAmount(swapMode, address, library, account) {
  const vault = getVaultAdminContract(library, account)
  // const contractToGetEstimateAmount = getContract(address, vaultAdminABI, library, account);
  let estimateOutputAmount
  if (swapMode == 'mint') {
    estimateOutputAmount = vault.priceUSDMint(address);
  } else {
    estimateOutputAmount = vault.priceUSDRedeem(address);
    // console.log('aaaaa',estimateOutputAmount.toNumber())
  }

  return formatUnits(
    await estimateOutputAmount,
    18
  )

  // return estimateOutputAmount;
}

export class CustomError {
  getErrorText() {
    return this.errorText;
  }

  constructor(errorText) {
    this.errorText = errorText;
  }
}
export async function getAllowance(token, library, account) {
  const { address, amount, decimals } = token
  const contractToken = getContract(token.address, usdaABI, library, account);
  const allowance = await contractToken.connect(getProviderOrSigner(library, account)).allowance(account, vaultProxyAddress)
  return formatUnits(allowance, decimals)
}
export async function getApprove(token, library, account) {
  const { address, amount, decimals } = token
  const contractToken = getContract(address, usdaABI, library, account);
  const approveAmount = parseUnits(amount, decimals)
  console.log('approveAmount', approveAmount)
  const appr = contractToken.connect(getProviderOrSigner(library, account)).approve(vaultProxyAddress, approveAmount)
  console.log('appr', appr)
  return appr
}
export async function mintUSDA(token, library, account) {
  const { address, amount, decimals } = token
  const tokenAmount = parseUnits(amount, decimals)
  const minAmount = parseUnits('0', decimals)
  const contractToMint = getVaultCoreContract(library, account)
  const mint = contractToMint.connect(getProviderOrSigner(library, account)).mint(address, tokenAmount, minAmount)
  return mint
}

export async function redeemUSDA(token, library, acount) {
  const {address, amount} = token
  const redeemAmount = parseUnits(amount, 18)
  const minAmount = parseUnits('0', 18)
  const contractToRedeem = getVaultCoreContract(library, acount)
  console.log('@@@contractToRedeem',contractToRedeem)

  const res = contractToRedeem.connect(getProviderOrSigner(library, acount)).redeeemUnique(address,redeemAmount, minAmount)
  return res
}