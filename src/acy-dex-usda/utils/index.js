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

export const supportedTokens = [{
  name: 'USD Tether',
  symbol: 'USDT',
  address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  decimals: 6,
  logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/USDT.svg', // not changed
  idOnCoingecko: "tether",
},
{
  name: 'USD Coin',
  symbol: 'USDC',
  address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',//0xe9e7cea3dedca5984780bafc599bd69add087d56
  decimals: 6,
  logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/USDC.svg',
  idOnCoingecko: "usd-coin",
},
{
  name: 'stable coin',
  symbol: 'USDA',
  address: '0x45a2DFF9569F7fAA29015897ea956A5A48068273',
  decimals: 18,
  logoURI: 'https://storageapi2.fleek.co/5bec74db-774b-4b8a-b735-f08a5ec1c1e6-bucket/tokenlist/USDA-min.svg',
  idOnCoingecko: "tether",
}]
const vaultAddress = '0x9a9248BA8A6A75B808dc86CC61848a2bFE8859C6'
const USDAAddress = '0xC5b4CC3d3B43647c3B91677Db76790e25673411D'
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
  return getContract(USDAAddress, usdaABI, library, account);
}
export function getVaultAdminContract(library, account) {
  return getContract(vaultAddress, vaultAdminABI, library, account);
}
export function getVaultCoreContract(library, account) {
  return getContract(vaultAddress, vaultCoreABI, library, account);
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

export async function getEstimateAmount(swapMode, address, library, account) {
  const vault = getVaultAdminContract(library, account)
  // const contractToGetEstimateAmount = getContract(address, vaultAdminABI, library, account);
  console.log('###vault',vault)
  let estimateOutputAmount
  if (swapMode == 'mint') {
    estimateOutputAmount = vault.priceUSDMint(address);
  } else {
    estimateOutputAmount = vault.priceUSDRedeem(address);
    console.log('aaaaa',estimateOutputAmount)
  }
  return estimateOutputAmount;
}

export class CustomError {
  getErrorText() {
    return this.errorText;
  }

  constructor(errorText) {
    this.errorText = errorText;
  }
}
