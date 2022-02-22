interface TokenInfo {
  name: string,
  symbol: string,
  address: string,
  addressOnEth?: string, 
  decimals: number,
  logoURI: string,
  idOnCoingecko: string
}

const BscMainNetTokenList: Array<TokenInfo> = [
  {
    name: 'USD Tether',
    symbol: 'USDT',
    address: '0x55d398326f99059ff775485246999027b3197955',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/USDT.svg',
    idOnCoingecko: "tether",
  },
  {
    name: 'ACY',
    symbol: 'ACY',
    address: '0xc94595b56e301f3ffedb8ccc2d672882d623e53a',
    decimals: 18,
    logoURI: 'https://acy.finance/static/media/logo.78c0179c.svg',
    idOnCoingecko: "acy-finance",
  },
  {
    name: 'Bit Store',
    symbol: 'STORE',
    address: '0x65d9033cff96782394dab5dbef17fa771bbe1732',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/5bec74db-774b-4b8a-b735-f08a5ec1c1e6-bucket/tokenlist/bitstore-min.svg',
    idOnCoingecko: "bit-store-coin",
  },
  {
    name: 'Owl Analytics',
    symbol: 'OWLA',
    address: '0x6E78D6831303A9e53a0F1C92389aA5128Bc38A09',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/5bec74db-774b-4b8a-b735-f08a5ec1c1e6-bucket/tokenlist/OWLA-min.png',
    idOnCoingecko: "undefined",
  },
  // {
  //   name: 'DX Spot',
  //   symbol: 'DXS',
  //   address: '0xBd9A43BA37a748b89331BD5Df2Ab5BC7815Cc6Bb',
  //   decimals: 8,
  //   logoURI: 'https://storageapi.fleek.co/5bec74db-774b-4b8a-b735-f08a5ec1c1e6-bucket/tokenlist/DXSpot-min.png',
  //   idOnCoingecko: "undefined",
  // },
  {
    name: 'Binance Coin',
    symbol: 'BNB',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=014',
    idOnCoingecko: "binancecoin",
  },
  {
    name: 'Binance USD',
    symbol: 'BUSD',
    address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/binance-usd-busd-logo.svg?v=014',
    idOnCoingecko: "tether",
  },
  {
    name: 'Wrapped BNB',
    symbol: 'WBNB',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=014',
    idOnCoingecko: "binancecoin",
  },

  {
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=014',
    idOnCoingecko: "ethereum",
  },
  {
    name: 'Binance Bitcoin',
    symbol: 'BTCB',
    address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=014',
    idOnCoingecko: "binance-bitcoin",
  },
];

const BscTestNetTokenList: Array<TokenInfo> = [
  {
    name: 'Test Coin',
    symbol: 'USDT',
    address: '0xF82eEeC2C58199cb409788E5D5806727cf549F9f',
    addressOnEth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/USDT.svg',
    idOnCoingecko: "usd-coin",
  },
  {
    name: 'Binance Coin',
    symbol: 'BNB',
    address: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
    addressOnEth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=014',
    idOnCoingecko: "binancecoin",
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0xE971616d94335dec2E54939118AdFcB68E6dCAd6',
    addressOnEth: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/USDC.svg',
    idOnCoingecko: "usd-coin",
  },
  {
    name: 'Wrapped BNB',
    symbol: 'WBNB',
    address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    addressOnEth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=014',
    idOnCoingecko: "binancecoin",
  },
  {
    name: 'ACY',
    symbol: 'ACY',
    address: '0x5cdbBA00D8b2a54FCB3328aBdb90F69E41ba826f',
    addressOnEth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    logoURI: 'https://acy.finance/static/media/logo.78c0179c.svg',
    idOnCoingecko: "acy-finance",
  },

  {
    name: 'Uniswap',
    symbol: 'UNI',
    address: '0x9036d746d3C3AFA8D6D948c071683F68eB53bCb9',
    addressOnEth: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/UNI.svg',
    idOnCoingecko: "unicorn-token",
  },
  {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    address: '0x5b8533c9a6C330EE1E376dba1AFe7b5e137a76a9',
    addressOnEth: '0x6b175474e89094c44da98b954eedeac495271d0f',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/DAI.svg',
    idOnCoingecko: "dai",
  },
  {
    name: 'Compound Dai',
    symbol: 'cDAI',
    address: '0xfe01074Ec94B62682eBbdcFd5808cEA1cbe6410d',
    addressOnEth: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
    decimals: 8,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/DAI.svg',
    idOnCoingecko: "cdai",
  },
  {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    address: '0x6E59735D808E49D050D0CB21b0c9549D379BBB39',
    addressOnEth: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimals: 8,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/WBTC.svg',
    idOnCoingecko: "wrapped-bitcoin",
  },
  {
    name: 'Aave',
    symbol: 'AAVE',
    address: '0x61Bb0f893e9DD3C282B80Fd121103258EfB4144d',
    addressOnEth: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/AAVE.svg',
    idOnCoingecko: "aave",
  },
  // token not exist in testnet
  // {
  //   "chainId": 1,
  //   "address": "0xfF20817765cB7f73d4bde2e66e067E58D11095C2",
  //   "name": "Amp",
  //   "symbol": "AMP",
  //   "decimals": 18,
  //   "logoURI": "https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/AMP.svg"
  // },
  {
    name: 'Aragon Network Token',
    symbol: 'ANT',
    address: '0xDadED6F2AcDb532dA15D2815E517f5DdeA5Eaaf1',
    addressOnEth: '0x960b236A07cf122663c4303350609A66A7B288C0',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/ANT.svg',
    idOnCoingecko: "aragon",
  },
  // balancer token address in testnet is not verified
  // address is chosen based on highest transactions
  {
    name: 'Balancer',
    symbol: 'BAL',
    address: '0xeBeD1f4576ADbb81f101bDC332EffD88ff99fCf7',
    addressOnEth: '0xba100000625a3754423978a60c9317c58a424e3D',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/BAL.svg',
    idOnCoingecko: "balancer",
  },
  // band protocol token address in testnet is not verified
  // address is chosen based on highest transactions
  {
    name: 'Band Protocol',
    symbol: 'BAND',
    address: '0x11e8A51a8Cd00F40e26E0B2785dfAD75aB29aca9',
    addressOnEth: '0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/BAND.svg',
    idOnCoingecko: "band-protocol",
  },
  // bancor network token address in testnet is not verified
  // address is chosen based on highest transactions
  {
    name: 'Bancor Network Token',
    symbol: 'BNT',
    address: '0x3D2c61C2Dd42f49FAE224657E1367A7c631E319a',
    addressOnEth: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/BNT.svg',
    idOnCoingecko: "bancor",
  },
  // compound token address in testnet is not verified
  // address is chosen based on highest transactions
  {
    name: 'Compound',
    symbol: 'COMP',
    address: '0x0c93Ee0015113e542d29c00bb7E2BB7249533Eb6',
    addressOnEth: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/COMP.svg',
    idOnCoingecko: "compound-coin",
  },
  {
    name: 'Curve DAO Token',
    symbol: 'CRV',
    address: '0x29304827874DFa721bFA50E65D063D4E7C8Ef559',
    addressOnEth: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/CRV.svg',
    idOnCoingecko: "curve-dao-token",
  },
  {
    name: 'Civic',
    symbol: 'CVC',
    address: '0xEA90E4235113c74B0AFE2ECb4D734E09f1F134Dc',
    addressOnEth: '0x41e5560054824eA6B0732E656E3Ad64E20e94E45',
    decimals: 8,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/CVC.svg',
    idOnCoingecko: "civic",
  },
  {
    name: 'district0x',
    symbol: 'DNT',
    address: '0xd6937E1Ff83e05d33ABe0af31FbDB2E26217b56c',
    addressOnEth: '0x0AbdAce70D3790235af448C88547603b945604ea',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/DNT.svg',
    idOnCoingecko: "district0x",
  },
  // gnosis token address in testnet is not verified
  // address is chosen based on highest transactions
  {
    name: 'Gnosis Token',
    symbol: 'GNO',
    address: '0xf8236365b3db2534B44C5989aEB49ddB95570f2a',
    addressOnEth: '0x6810e776880C02933D47DB1b9fc05908e5386b96',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/GNO.svg',
    idOnCoingecko: "gnosis",
  },
  // the graph token address in testnet is not verified
  // address is chosen based on highest transactions
  {
    name: 'The Graph',
    symbol: 'GRT',
    address: '0xCd559E6CDF3Aa1690343D64e3aa559C0829046AE',
    addressOnEth: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/GRT.svg',
    idOnCoingecko: "the-graph",
  },
  // keep network token address in testnet is not verified
  // address is chosen based on highest transactions
  {
    name: 'Keep Network',
    symbol: 'KEEP',
    address: '0xc13D02F8134F4AeA81e9434DA0cBf37D101FC58E',
    addressOnEth: '0x85Eee30c52B0b379b046Fb0F85F4f3Dc3009aFEC',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/KEEP.svg',
    idOnCoingecko: "keep-network",
  },
  // kyber network crystal token address in testnet is not verified
  // address is chosen based on highest transactions
  {
    name: 'Kyber Network Crystal',
    symbol: 'KNC',
    address: '0x164028f557339024d937687B5dFd2Fc65a47c48d',
    addressOnEth: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/KNC.svg',
    idOnCoingecko: "kyber-network-crystal",
  },
  {
    name: 'ChainLink Token',
    symbol: 'LINK',
    address: '0xe7A3a5d135637569FAC74b1CbdF5Ae7f672Baf11',
    addressOnEth: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/LINK.svg',
    idOnCoingecko: "chainlink",
  },
];

const PolygonMainNetTokenList: Array<TokenInfo> = [
  {
    name: 'USD Tether',
    symbol: 'USDT',
    address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    decimals: 6,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/USDT.svg', // not changed
    idOnCoingecko: "tether",
  },
  {
    name: 'ACY',
    symbol: 'ACY',
    address: '0x8b1f836491903743fe51acd13f2cc8ab95b270f6',
    decimals: 18,
    logoURI: 'https://acy.finance/static/media/logo.78c0179c.svg',
    idOnCoingecko: "acy-finance",
  },
  {
    name: 'NULS',
    symbol: 'NULS',
    address: '0x8b8e48a8cc52389cd16a162e5d8bd514fabf4ba0',
    decimals: 8,
    logoURI: 'https://storageapi.fleek.co/5bec74db-774b-4b8a-b735-f08a5ec1c1e6-bucket/tokenlist/NULS-min.svg',
    idOnCoingecko: "nuls",
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
    name: 'Wrapped ETH',
    symbol: 'WETH',
    address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=014',
    idOnCoingecko: "weth",
  },
  {
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
    decimals: 8,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/WBTC.svg',
    idOnCoingecko: "wrapped-bitcoin",
  },
  {
    name: 'Polygon',
    symbol: 'MATIC',
    address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=014',
    idOnCoingecko: "matic-network",
  },
];

const PolygonTestNetTokenList: Array<TokenInfo> = [
  {
    name: 'Polygon',
    symbol: 'MATIC',
    address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=017', 
    idOnCoingecko: "matic-network",
  },
  {
    name: 'ACY',
    symbol: 'ACY',
    address: '0x95d4aA0324aABbF595F0C01F786c3bAB2A6a1b5e',
    decimals: 18,
    logoURI: 'https://acy.finance/static/media/logo.78c0179c.svg',
    idOnCoingecko: "acy-finance",
  },
  {
    name: 'USD Tether',
    symbol: 'USDT',
    address: '0x158653b66fd72555F68eDf983736781E471639Cc',
    decimals: 18,
    logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/USDT.svg',
    idOnCoingecko: "tether",
  },
  {
    name: 'Dummy Token',
    symbol: 'BNB',
    address: '0xfe4f5145f6e09952a5ba9e956ed0c25e3fa4c7f1',
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=014',
    idOnCoingecko: "binancecoin",
  }
];

const TokenListSelector = (arg: string) => {
  return {
    56: BscMainNetTokenList,
    97: BscTestNetTokenList,
    137: PolygonMainNetTokenList,
    80001: PolygonTestNetTokenList
  }[arg];
}

export default TokenListSelector;