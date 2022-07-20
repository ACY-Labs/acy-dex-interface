import { ethers } from 'ethers';;

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

const TOKENS = {
  56: [],
  97: [
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
  ],
  80001: [
    {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
      address: ethers.constants.AddressZero,
      isNative: true,
      isShortable: true
    },
    {
      name: "Wrapped Bitcoin",
      symbol: "BTC",
      decimals: 8,
      address: "0x05d6f705C80d9F812d9bc1A142A655CDb25e2571",
      isShortable: true
    },
    {
      name: "Wrapped MATIC",
      symbol: "WMATIC",
      decimals: 18,
      address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
      isWrapped: true,
      baseSymbol: "MATIC"
    },
    {
      name: "Wrapped ETH",
      symbol: "ETH",
      decimals: 18,
      address: "0xeBC8428DC717D440d5deCE1547456B115b868F0e",
      isShortable: true,
      isStable: false
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address: "0x7a96316B13bD7d0529e701d2ED8b9fC4E4fd8696",
      isStable: true
    },
    {
      name: "Tether",
      symbol: "USDT",
      decimals: 18,
      address: "0x158653b66fd72555F68eDf983736781E471639Cc",
      isStable: true
    },
  ],
};

// const CHAIN_IDS = [56, 97, 42161, 421611, 43114];
const CHAIN_IDS = [97, 80001];

const TOKENS_MAP = {};
const TOKENS_BY_SYMBOL_MAP = {};

for (let j = 0; j < CHAIN_IDS.length; j++) {
  const chainId = CHAIN_IDS[j];
  TOKENS_MAP[chainId] = {};
  TOKENS_BY_SYMBOL_MAP[chainId] = {};
  for (let i = 0; i < TOKENS[chainId].length; i++) {
    const token = TOKENS[chainId][i];
    token.address = token.address.toLowerCase()
    TOKENS_MAP[chainId][token.address] = token;
    TOKENS_BY_SYMBOL_MAP[chainId][token.symbol] = token;
  }
}

const WRAPPED_TOKENS_MAP = {};
const NATIVE_TOKENS_MAP = {};
for (const chainId of CHAIN_IDS) {
  for (const token of TOKENS[chainId]) {
    if (token.isWrapped) {
      WRAPPED_TOKENS_MAP[chainId] = token;
    } else if (token.isNative) {
      NATIVE_TOKENS_MAP[chainId] = token;
    }
  }
}
// done
export function getWrappedToken(chainId) {
  return WRAPPED_TOKENS_MAP[chainId];
}
// done
export function getNativeToken(chainId) {
  return NATIVE_TOKENS_MAP[chainId];
}
// done
export function getTokens(chainId) {
  return TOKENS[chainId];
}
// still in use by the Order data table
export function isValidToken(chainId, address) {
  if (!TOKENS_MAP[chainId]) {
    throw new Error(`Incorrect chainId ${chainId}`);
  }
  return address in TOKENS_MAP[chainId];
}
// done, multiple getToken function in various files
export function getToken(chainId, address) {
  if (!TOKENS_MAP[chainId]) {
    throw new Error(`Incorrect chainId ${chainId}`);
  }
  if (!TOKENS_MAP[chainId][address]) {
    throw new Error(`Incorrect address "${address}" for chainId ${chainId}`);
  }
  return TOKENS_MAP[chainId][address];
}

// done
export function getTokenBySymbol(chainId, symbol) {
  const token = TOKENS_BY_SYMBOL_MAP[chainId][symbol];
  if (!token) {
    throw new Error(`Incorrect symbol "${symbol}" for chainId ${chainId}`);
  }
  return token;
}

// done
export function getWhitelistedTokens(chainId) {
  console.log("debug whitelist", chainId, TOKENS)
  return TOKENS[chainId].filter(token => token.symbol !== "USDG");
}
