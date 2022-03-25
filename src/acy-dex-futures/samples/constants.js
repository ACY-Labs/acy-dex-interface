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


export const glpManagerAddress = "0x321F653eED006AD1C29D174e17d96351BDe22649"
export const rewardRouterAddress = "0xA906F338CB21815cBc4Bc87ace9e68c87eF8d8F1"
export const rewardReaderAddress = "0xe725Ad0ce3eCf68A7B93d8D8091E83043Ff12e9A"
export const stakedGlpTrackerAddress = "0x1aDDD80E6039594eE970E5872D247bf0414C8903"
export const feeGlpTrackerAddress = "0x4e971a87900b931fF39d1Aad67697F49835400b6"
export const glpVesterAddress = "0xA75287d2f8b217273E7FCD7E86eF07D33972042E"