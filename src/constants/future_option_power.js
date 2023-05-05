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
    Vault: '0x24B918F5ee6E8Fc464a0fBBf5F5433C39a2e6522',
    NATIVE_TOKEN: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',

    oracleManager: '0x1F9c627BD3E8ef0b7152e4a3fAbD0B3eF1676821',
    pool: '0xA6177E34ab046007b75e887569108aa7809EE50F',
    poolImplementation: '0x133B3425033759C649F8A894983D21B44A0Fb732',
    symbolManager: "0x9CC0b982f427b1dE01E46610d8247F4b10a81AAf",
    symbolManagerImplementation: "0xbEe6eDABcC42Ed8c0B46b6fcA8Ec04decaDc0A09",
    alp: "0x002d190863243E09e83245FEE736B0B463Af5a74",
    symbolsLens: "0x0FDa27b043793e2658Bf0F795400c65aF7Aa8A2A",
    reader: "0xb3565532BB41e646970D6EDdCf869EAe1A767736",
    router: "0x97685f833dDFF1Ce50C028Cd795bfF32D6cbbBb9",
    orderBook: "0x9e6a49898F719B6491A64B2e23Fafa465C5Bd1D1"
  },
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