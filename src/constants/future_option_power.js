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
    Vault: '0x7FA5F8A97bb62A8D1Dc99c90527a9CdFF6771315',
    NATIVE_TOKEN: '0x7C8b81f157Af21895D164A8525e1EAD5c3dc13E9',
    oracleManager: '0xc0BdD12C31EAa30BDF08b61DdD91B21EEa35eb75',
    pool: '0x285dc02bC51f2fabCE08F9625B44802019583286',
    poolImplementation: '0xc7e11af7478D0b20d0C960008D23C7aA45a9C476',
    symbolManager: "0x14271E578634f8bfD68080831B664CB5A38c94b2",
    symbolManagerImplementation: "0x745b274D56d80e2EC7EC9C6A60d8ccD03fe38713",
    alp: "0xed923d1Cf854503ad699FA12005Deccc26C52966",
    symbolsLens: "0xb44EbD0761Ec63F06C26Ca2b42292b7b536a8905",
    reader: "0xb4C9d67c91D7c6ded1A8e92912D2FD71b48167b5",

    router: "0xd2f649eb4ab6399879534756526ac7c3d586be31",

    // INFO: Deployed USDT Address: 0x0ce4F0e47520aA8E58A0a3d33af00a17701DAE2C Gas Used: 1051112
    // INFO: Deployed BUSD Address: 0x7A7FbEb7211d2536E721cE2D91Cc1d391651E87E Gas Used: 1051112
    // INFO: Deployed BTC Address: 0x2c1FCE322232Bac2a803DE4e95960248D1AB3cd9 Gas Used: 1051136
    // INFO: Deployed ETH Address: 0xE28BE539B1a5E25182f8036ed3eF7ef7228E58F4 Gas Used: 1051088
    // INFO: Deployed CAKE Address: 0xF27E680fCD306C42bE86bdd025f69d584bF9359B Gas Used: 1051112
    // INFO: Deployed MATIC Address: 0x7C8b81f157Af21895D164A8525e1EAD5c3dc13E9 Gas Used: 1051136
    // INFO: Deployed WBNB Address: 0x4d5Cf8993b2A3c39864343A54588D02261b3173d Gas Used: 799517
    // INFO: Deployed WMATIC Address: 0x0274999f74EE316026fF8862a05d22a2d85ddE31 Gas Used: 799517
    // INFO: Deployed oracleBNBUSD Address: 0x728a054Ea475dd3A6E3592409A4D2cb05e038a1a Gas Used: 253613
    // INFO: Deployed oracleBUSDUSD Address: 0x0225935940B43c5973e8081Ec14065c75EA414d0 Gas Used: 253625
    // INFO: Deployed oracleCAKEUSD Address: 0x699586C23f6d1a02b6E494790E36A493b774d6D6 Gas Used: 253625
    // INFO: Deployed oracleBTCUSD Address: 0xfF9d2CBb3bc56237424975A3406b803834323168 Gas Used: 253613
    // INFO: Deployed oracleETHUSD Address: 0x27e15c46030c16Dd9E5D17DedFae2fAbFafa1EB0 Gas Used: 253613
    // INFO: Deployed oracleVOLBTCUSD Address: 0x875ef4A3368215d99D90d3d7fE503bdA608D1E37 Gas Used: 253661
    // INFO: Deployed oracleVOLETHUSD Address: 0x39f92C4b34689Af4989994C3cBe21FbC7269Cc8B Gas Used: 253661
    // INFO: Deployed oracleMATICUSD Address: 0xaD3FdeC7B7bf2b88848d0251B0524Db32520cAeB Gas Used: 253637
    // INFO: Deployed oracleCAKEUSD Address: 0xc19Cd298CB5Da44a8b372082920A8930D558C04E Gas Used: 253625
    // INFO: Deployed oracleBTCUSD Address: 0x97137BAF2e4FE1f843722027DeA99CE9006863AC Gas Used: 253613
    // INFO: Deployed oracleETHUSD Address: 0xb98890bed9D18E80477662f8197E4406263E3eE5 Gas Used: 253613
    // INFO: Deployed oracleVOLBTCUSD Address: 0x4f1eA08C532D22454F1129aF69819FA305c69Dce Gas Used: 253661
    // INFO: Deployed oracleVOLETHUSD Address: 0x9C0D5A1ca576F001dBcac5D5cf68fFA176A3b296 Gas Used: 253661
    // INFO: Deployed oracleMATICUSD Address: 0x4a28b3a7FBA6207a642c0320Ae4E36F42B4fAEA8 Gas Used: 253637

    // INFO: Deployed OracleManager Address: 0xc0BdD12C31EAa30BDF08b61DdD91B21EEa35eb75 Gas Used: 739664

    // INFO: Deployed Pool Address: 0x285dc02bC51f2fabCE08F9625B44802019583286 Gas Used: 433060
    // INFO: Deployed ALP Address: 0xed923d1Cf854503ad699FA12005Deccc26C52966 Gas Used: 871230
    // INFO: Deployed SymbolManager Address: 0x14271E578634f8bfD68080831B664CB5A38c94b2 Gas Used: 375458
    // INFO: Deployed SymbolManagerImplementation Address: 0x745b274D56d80e2EC7EC9C6A60d8ccD03fe38713 Gas Used: 1628404
    // INFO: Deployed Vault Address: 0x7FA5F8A97bb62A8D1Dc99c90527a9CdFF6771315 Gas Used: 145175
    // INFO: Deployed VaultImplementation Address: 0x8F19665cDa70001045ecbf9137cCe16B02AbD403 Gas Used: 785189
    // INFO: Deployed PoolImplementation Address: 0xc7e11af7478D0b20d0C960008D23C7aA45a9C476 Gas Used: 4479685

    // INFO: Deployed SymbolBTCUSD Address: 0x46a299de0dE207cc29C0EE4023aCbB93B8aE2368 Gas Used: 553246
    // INFO: Deployed SymbolImplementationBTCUSD Address: 0x55F17DDA157a15Ab2a431eB16613b67ed2a0c1A4 Gas Used: 2150598
    // INFO: Deployed SymbolETHUSD Address: 0x16f1f6f133C029cB2E290c388101A4caDa807056 Gas Used: 553246
    // INFO: Deployed SymbolImplementationETHUSD Address: 0x88CD14eEe07Cb7489217C64f43ebaeD097981984 Gas Used: 2150574
    // INFO: Deployed SymbolOptionBTCUSD Address: 0x78F657D7ac7fF2D2Dd387378C074B569F6808e27 Gas Used: 553342
    // INFO: Deployed SymbolImplementationOptionsBTCUSD Address: 0xC3943CDC9956408839fa6733A34E55A15497Be8F Gas Used: 3442034
    // INFO: Deployed SymbolOptionETHUSD Address: 0x1d10c160A81999C3380a7B01edFA335Ec6a2bF18 Gas Used: 553330
    // INFO: Deployed SymbolImplementationOptionsETHUSD Address: 0x8B6a3ba96EcEB6eCF0C6EdBc6841Fca3c7D825a9 Gas Used: 3441998

    // INFO: Deployed EverlastingOptionPricingLens Address: 0x62b3F71F253c5ec550760D8F449cA842d630725B Gas Used: 1170169
    // deployed reader with address: 0x62b3F71F253c5ec550760D8F449cA842d630725B
    // INFO: Deployed SymbolsLens Address: 0xb44EbD0761Ec63F06C26Ca2b42292b7b536a8905 Gas Used: 2698697
    // INFO: Deployed Reader Address: 0xb4C9d67c91D7c6ded1A8e92912D2FD71b48167b5 Gas Used: 3722249
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
    { symbol: "USDT", address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f" },
    { symbol: "USDC", address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174" },
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
      address: "0x2c1FCE322232Bac2a803DE4e95960248D1AB3cd9",
      logoURI: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=014',
      isShortable: true
    },
    {
      name: "Wrapped MATIC",
      symbol: "WMATIC",
      decimals: 18,
      address: "0x0274999f74EE316026fF8862a05d22a2d85ddE31",
      logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=017',
      isWrapped: true,
      baseSymbol: "MATIC"
    },
    {
      name: "Wrapped ETH",
      symbol: "ETH",
      decimals: 18,
      address: "0xE28BE539B1a5E25182f8036ed3eF7ef7228E58F4",
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=014',
      isShortable: true,
      isStable: false
    },
    {
      name: "Tether",
      symbol: "USDT",
      decimals: 18,
      address: "0x0ce4F0e47520aA8E58A0a3d33af00a17701DAE2C",
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