import {ethers} from 'ethers';;

export const longTokenList =  [
  {
    name: "Wrapped Bitcoin",
    symbol: "BTC",
    decimals: 8,
    address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    isShortable: true
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    address: ethers.constants.AddressZero,
    isNative: true,
    isShortable: true
  },
  {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
    address: "0x20865e63B111B2649ef829EC220536c82C58ad7B",
    isShortable: true
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0xE971616d94335dec2E54939118AdFcB68E6dCAd6",
    isStable: true
  },
  {
    name: "Tether",
    symbol: "USDT",
    decimals: 18,
    address: "0xF82eEeC2C58199cb409788E5D5806727cf549F9f",
    isStable: true
  },

]
// export default [
//     {
//       name: "Ethereum",
//       symbol: "ETH",
//       decimals: 18,
//       address: ethers.constants.AddressZero,
//       isNative: true,
//       isShortable: true
//     },
//     {
//       name: "Wrapped Ethereum",
//       symbol: "WETH",
//       decimals: 18,
//       address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
//       isWrapped: true,
//       baseSymbol: "ETH"
//     },
//     {
//       name: "Wrapped Bitcoin",
//       symbol: "BTC",
//       decimals: 8,
//       address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
//       isShortable: true
//     },
//     {
//       name: "Chainlink",
//       symbol: "LINK",
//       decimals: 18,
//       address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
//       isStable: false
//     },
//     {
//       name: "Uniswap",
//       symbol: "UNI",
//       decimals: 18,
//       address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
//       isStable: false
//     },
//     {
//       name: "USD Coin",
//       symbol: "USDC",
//       decimals: 6,
//       address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
//       isStable: true
//     },
//     {
//       name: "Tether",
//       symbol: "USDT",
//       decimals: 6,
//       address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
//       isStable: true
//     },
//     {
//       name: "Dai",
//       symbol: "DAI",
//       decimals: 18,
//       address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
//       isStable: true
//     },
//     {
//       name: "Magic Internet Money",
//       symbol: "MIM",
//       decimals: 18,
//       address: "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A",
//       isStable: true
//     },
//     {
//       name: "Frax",
//       symbol: "FRAX",
//       decimals: 18,
//       address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
//       isStable: true
//     }
//   ]

export default [
  {
    name: "Binance Coin",
    symbol: "BNB",
    decimals: 18,
    address: ethers.constants.AddressZero,
    isNative: true,
    isShortable: true
  },
  {
    name: "Wrapped Bitcoin",
    symbol: "BTC",
    decimals: 8,
    address: "0x6E59735D808E49D050D0CB21b0c9549D379BBB39",
    isShortable: true
  },
  {
    name: "Wrapped BNB",
    symbol: "WBNB",
    decimals: 18,
    address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    isWrapped: true,
    baseSymbol: "BNB"
  },
  {
    name: "Wrapped ETH",
    symbol: "ETH",
    decimals: 18,
    address: "0xF471F7051D564dE03F3736EeA037D2dA2fa189c1",
    isShortable: true,
    isStable: false
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0xE971616d94335dec2E54939118AdFcB68E6dCAd6",
    isStable: true
  },
  {
    name: "Tether",
    symbol: "USDT",
    decimals: 18,
    address: "0xF82eEeC2C58199cb409788E5D5806727cf549F9f",
    isStable: true
  },
]
