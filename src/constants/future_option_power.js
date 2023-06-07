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
    NATIVE_TOKEN: '0x49941617e8D6014568b789D78Dc159A8D9e70b5A',

    oracleManager: '0x0682E645A264c7Afba84b79365A4f6c0D4a38765',
    pool: '0x17C930cA189b4ae30B52A387fE2E9276639fdDdE',
    poolImplementation: '0x9F25cf90F0BF9828f0b472Cd281D71b997e5Bbees',
    symbolManager: "0xAd3a726c70bEDF463996fdd8484c2350403ac0bc",
    symbolManagerImplementation: "0x4712C4F56991EdE8C8a27E7a45496912547788F0",
    alp: "0xD3CB938cE8CEA584B63dA0e5a7F4C230d8Aa83a1",
    symbolsLens: "0x5Ac237B55D872076Ee9fA98f7798f42bF9336fAf",
    reader: "0x73298651AEB48344b43a08Fd577350fa4c4E6f8b",
    router: "0xcd628fEe33E06d1A53a2fAebe791eD8fB8aC620b",

    orderbook: "0xEBcBcfC385841bF5053d8313AD3f84b6E4A1deb0",
  },
  421613: {
    Vault: '0x4B3C4C41c2B5Be2e5126b9EF124D6b705cbF03eD',
    NATIVE_TOKEN: '0xE971616d94335dec2E54939118AdFcB68E6dCAd6',

    oracleManager: '0xc13D02F8134F4AeA81e9434DA0cBf37D101FC58E',
    pool: '0x941c97E5A11B6674549965057cB61E5dB0D6E5c2',
    poolImplementation: '0x0528C05204096D1F240c6Af7bDEfD899F07A9784',
    symbolManager: "0x42aD6CB121eDAF9B05551DC5D0F1cB4B422DC3aa",
    symbolManagerImplementation: "0x0c9c80A9B88A628284392B7Fe470EB377580C5aa",
    alp: "0xC759054466d321e2F93137657435B1c752c2e427",
    symbolsLens: "0x3227CC3235C41a62aAD597b56A9174984b1040C0",
    reader: "0x545FE5455e37977960E4d5c2A6e5feaC2cbFBf55",
    router: "0xcd628fEe33E06d1A53a2fAebe791eD8fB8aC620b",

    orderbook: "0xeC3142E07C211FCB261D37eB82B20e0A595EbB25",
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
};

export const INITIAL_ALLOWED_SLIPPAGE = 50;

export const getTokens = (chainId) => {
  return tokenLists[chainId];
}

export const getContract = (chainId, name) => {
  return contracts[chainId][name];
}