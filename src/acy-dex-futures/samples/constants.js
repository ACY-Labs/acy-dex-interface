import { JsonRpcProvider } from "@ethersproject/providers"

//ARBITRUM contract addresses

export const readerAddress = '0xF09eD52638c22cc3f1D7F5583e3699A075e601B2'
export const vaultAddress = '0x489ee077994B6658eAfA855C308275EAd8097C4A'
export const usdgAddress = '0x45096e7aA921f27590f8F19e457794EB09678141'
export const nativeTokenAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'

export const orderBookAddress = '0x09f77E8A13De9a35a7231028187e9fD5DB8a2ACB';
export const routerAddress = '0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064'

export const tempLibrary = new JsonRpcProvider('https://arb1.arbitrum.io/rpc')
export const tempChainID = 42161;
