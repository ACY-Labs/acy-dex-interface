import { ethers } from "ethers"

const contracts = {
  56: { // bsc mainnet
    Reader: "",
  },
  137: {
    // TODO: this is placeholder
    Reader: '',
  },
  97: {

  },
  80001: {
    Vault: '0x49941617e8D6014568b789D78Dc159A8D9e70b5A',
    NATIVE_TOKEN: '0x95E9b1583eb004F02F16a9449455dd605e834a55',

    oracleManager: '0x0682E645A264c7Afba84b79365A4f6c0D4a38765',
    pool: '0x17C930cA189b4ae30B52A387fE2E9276639fdDdE',
    poolImplementation: '0x03a1Eda3Ee03DC0bafC403fCBa6bd029D9E055CF',
    symbolManager: "0xAd3a726c70bEDF463996fdd8484c2350403ac0bc",
    symbolManagerImplementation: "0x4712C4F56991EdE8C8a27E7a45496912547788F0",
    alp: "0xD3CB938cE8CEA584B63dA0e5a7F4C230d8Aa83a1",
    symbolsLens: "0x5Ac237B55D872076Ee9fA98f7798f42bF9336fAf",
    reader: "0x73298651AEB48344b43a08Fd577350fa4c4E6f8b",
    router: "0xCE0CF7Fd78D44cC2C2C2dB4070FCEb4411cc21A4",

    orderbook: "0xEBcBcfC385841bF5053d8313AD3f84b6E4A1deb0",
  },
  421613:{
    Vault: '0xc89372b126B8BC57AEE971097bA4e31acc418195',
    NATIVE_TOKEN: '0x036ff7176ffFB9Cd025e618ee8088D942C4B6714',

    oracleManager: '0x1553497f478820359852335de50182D72dCaCB0b',
    pool: '0x709eea8f973ce668ccED36e71A634Fe0C2C45FF7',
    poolImplementation: '0x5129cE242232Bb907882f93487F308C324ef0911',
    symbolManager: "0x28AE6Ae39C9f5431ec82caC4008d3206d210133b",
    symbolManagerImplementation: "0x95a68beB1b1aFE0A7fA0378dD2c74af0516B1E5A",
    alp: "0xac582b54A4fE361eb3E1aECc95Dc4B2Ee1161706",
    symbolsLens: "0x93603F4a3ae3472E177e9848872D7cE3572C30cE",
    reader: "0xC0CA4C86802414DeD474c69fC6fd98fe252878ec",
    router: "0x5D084F651794A37B0C53f20B657dbB52e0Ee44AF",

    orderbook: "0xe44278ACe07452e45373D93e458a00aded87AD8a",
  }
}

const tokenLists = {
  56: [
    {
      name: "Binance Coin",
      symbol: "BNB",
      decimals: 18,
      address: ethers.constants.AddressZero,
      logoURI: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=014',
      isNative: true,
      isShortable: true
    },
    {
      name: "Wrapped Bitcoin",
      symbol: "BTC",
      decimals: 8,
      address: "0x6E59735D808E49D050D0CB21b0c9549D379BBB39",
      logoURI: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=014',
      isShortable: true
    },
    {
      name: "Wrapped BNB",
      symbol: "WBNB",
      decimals: 18,
      address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
      logoURI: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=014',
      isWrapped: true,
      baseSymbol: "BNB"
    },
    {
      name: "Wrapped ETH",
      symbol: "ETH",
      decimals: 18,
      address: "0xF471F7051D564dE03F3736EeA037D2dA2fa189c1",
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=014',
      isShortable: true,
      isStable: false
    },
    {
      name: "Tether",
      symbol: "USDT",
      decimals: 18,
      address: "0xF82eEeC2C58199cb409788E5D5806727cf549F9f",
      logoURI: 'https://storageapi2.fleek.co/chwizdo-team-bucket/ACY Token List/USDT.svg',
      isStable: true
    },
  ],
  97: [
    {
      name: "Binance Coin",
      symbol: "BNB",
      decimals: 18,
      address: ethers.constants.AddressZero,
      logoURI: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=014',
      isNative: true,
      isShortable: true
    },
    {
      name: "Wrapped Bitcoin",
      symbol: "BTC",
      decimals: 8,
      address: "0x6E59735D808E49D050D0CB21b0c9549D379BBB39",
      logoURI: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=014',
      isShortable: true
    },
    {
      name: "Wrapped BNB",
      symbol: "WBNB",
      decimals: 18,
      address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
      logoURI: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=014',
      isWrapped: true,
      baseSymbol: "BNB"
    },
    {
      name: "Wrapped ETH",
      symbol: "ETH",
      decimals: 18,
      address: "0xF471F7051D564dE03F3736EeA037D2dA2fa189c1",
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=014',
      isShortable: true,
      isStable: false
    },
    {
      name: "Tether",
      symbol: "USDT",
      decimals: 18,
      address: "0xF82eEeC2C58199cb409788E5D5806727cf549F9f",
      logoURI: 'https://storageapi2.fleek.co/chwizdo-team-bucket/ACY Token List/USDT.svg',
      isStable: true
    },
  ],
  137: [
    {symbol: "USDT", address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"},
    {symbol: "USDC", address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
  ],
  80001: [
    {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
      address: ethers.constants.AddressZero,
      logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=017',
      isNative: true,
      isShortable: true
    },
    {
      name: "Wrapped Bitcoin",
      symbol: "BTC",
      decimals: 18,
      address: "0x3c9851dBf202C8917F4d20a3666426d56de0E53b",
      logoURI: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=014',
      isShortable: true
    },
    {
      name: "Wrapped MATIC",
      symbol: "WMATIC",
      decimals: 18,
      address: "0x243a88F700a962aE8cdf8039d63b4948DC2B8ef1",
      logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=017',
      isWrapped: true,
      baseSymbol: "MATIC"
    },
    {
      name: "Wrapped ETH",
      symbol: "ETH",
      decimals: 18,
      address: "0x5EAf72A6cDC4eFE93f9D4FE891AF8dE498eb1d8c",
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=014',
      isShortable: true,
      isStable: false
    },
    {
      name: "Tether",
      symbol: "USDT",
      decimals: 18,
      address: "0x3C8e6FCaB51e01bd6e70A8e3d7A579c37d69f971",
      logoURI: 'https://storageapi2.fleek.co/chwizdo-team-bucket/ACY Token List/USDT.svg',
      isStable: true
    },  
  ],
  421613: [
    {
      name: "Arbitrum Coin",
      symbol: "ARB",
      decimals: 18,
      address: ethers.constants.AddressZero,
    },
    {
      name: "Binance USD",
      symbol: "BUSD",
      decimals: 18,
      address: "0xA0868b1EE3DA3E822cc79fAFDd88594EeaBfB806",
    }
  ] 
};

export const INITIAL_ALLOWED_SLIPPAGE = 50;

export const getTokens = (chainId) => {
  return tokenLists[chainId];
}

export const getContract = (chainId, name) => {
  return contracts[chainId][name];
}