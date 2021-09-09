import {TransactionType} from './Util.js'

export const dataSourceCoin = [
  {
    "name": "Ether",
    "short": "ETH",
    "price": 3170,
    "priceChange": -0.79,
    "volume24h": 804110000,
    "tvl": 899640000
  },
  {
    "name": "USD Coin",
    "short": "USDC",
    "price": 1,
    "priceChange": 0,
    "volume24h": 741750000,
    "tvl": 547500000
  },
  {
    "name": "Wrapped BTC",
    "short": "WBTC",
    "price": 47960,
    "priceChange": -0.88,
    "volume24h": 47960000,
    "tvl": 220550000
  },
  {
    "name": "Tether USD",
    "short": "USDT",
    "price": 1,
    "priceChange": 0,
    "volume24h": 210430000,
    "tvl": 217030000
  },
  {
    "name": "Dai Stablecoin",
    "short": "DAI",
    "price": 1,
    "priceChange": 0.53,
    "volume24h": 804110000,
    "tvl": 899640000
  },
  {
    "name": "Frax",
    "short": "FRAX",
    "price": 1,
    "priceChange": 0.32,
    "volume24h": 741750000,
    "tvl": 547500000
  },
  {
    "name": "Uniswap",
    "short": "UNI",
    "price": 24.15,
    "priceChange": -16.04,
    "volume24h": 47960000,
    "tvl": 220550000
  },
  {
    "name": "Paxos Standard",
    "short": "PAX",
    "price": 1,
    "priceChange": -0.29,
    "volume24h": 210430000,
    "tvl": 217030000
  },
  {
    "name": "ChainLink Token",
    "short": "LINK",
    "price": 28.14,
    "priceChange": 18.67,
    "volume24h": 741750000,
    "tvl": 547500000
  }
 ]

export const dataSourcePool = [
    {
        coin1:"USDC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000,
        price: 3570
    },
    {
        coin1:"WBTC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000,
        price: 23523
    },
    {
        coin1:"USDC",
        coin2:"ETH",
        tvl: 370900000,
        volume24h: 68680000,
        volume7d:667220000,
        price: 3523
    },
    {
      coin1:"USDC",
      coin2:"ETH",
      tvl: 370900000,
      volume24h: 68680000,
      volume7d:667220000,
      price: 3570
  },
  {
      coin1:"WBTC",
      coin2:"ETH",
      tvl: 370900000,
      volume24h: 68680000,
      volume7d:667220000,
      price: 23523
  },
  {
      coin1:"USDC",
      coin2:"ETH",
      tvl: 37464000,
      volume24h: 68680000,
      volume7d:667220000,
      price: 3523
  },
  {
    coin1:"USDC",
    coin2:"ETH",
    tvl: 170900000,
    volume24h: 68680000,
    volume7d:667220000,
    price: 3570
  },
  {
      coin1:"WBTC",
      coin2:"ETH",
      tvl: 970900000,
      volume24h: 68680000,
      volume7d:667220000,
      price: 23523
  },
  {
      coin1:"USDC",
      coin2:"ETH",
      tvl: 370900000,
      volume24h: 68680000,
      volume7d:667220000,
      price: 3523
  },
]

export const dataSourceTransaction = [
    {
      "coin1": "ETH",
      "coin2": "WBTC",
      "type": TransactionType.SWAP,
      "totalValue": 47161258.74,
      "coin1Amount": 85.87749323,
      "coin2Amount": 54.80565495,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "USDC",
      "type": TransactionType.ADD,
      "totalValue": 4474529.957,
      "coin1Amount": 49.6015762,
      "coin2Amount": 43.15266777,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "WBTC",
      "type": TransactionType.REMOVE,
      "totalValue": 16327816.91,
      "coin1Amount": 84.65384009,
      "coin2Amount": 93.41124956,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "ETH",
      "type": TransactionType.SWAP,
      "totalValue": 87309303.84,
      "coin1Amount": 14.83691711,
      "coin2Amount": 39.48470716,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "WBTC",
      "type": TransactionType.ADD,
      "totalValue": 99005732.19,
      "coin1Amount": 29.01098914,
      "coin2Amount": 87.67634172,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "USDC",
      "type": TransactionType.REMOVE,
      "totalValue": 7473159.335,
      "coin1Amount": 55.39709945,
      "coin2Amount": 81.03417077,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "WBTC",
      "type": TransactionType.SWAP,
      "totalValue": 5613827.965,
      "coin1Amount": 70.82938395,
      "coin2Amount": 62.49065479,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "ETH",
      "type": TransactionType.ADD,
      "totalValue": 15457824.56,
      "coin1Amount": 53.76396751,
      "coin2Amount": 97.18653896,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2020-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "WBTC",
      "type": TransactionType.REMOVE,
      "totalValue": 76920106.68,
      "coin1Amount": 99.747006,
      "coin2Amount": 79.16787602,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-08-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "USDC",
      "type": TransactionType.SWAP,
      "totalValue": 29714083.38,
      "coin1Amount": 14.14255762,
      "coin2Amount": 1.538641803,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-07-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "WBTC",
      "type": TransactionType.ADD,
      "totalValue": 27964831.48,
      "coin1Amount": 22.24316101,
      "coin2Amount": 1.411491578,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T00:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "ETH",
      "type": TransactionType.REMOVE,
      "totalValue": 61016077.45,
      "coin1Amount": 54.64088962,
      "coin2Amount": 70.79323119,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "WBTC",
      "type": TransactionType.SWAP,
      "totalValue": 15447008.9,
      "coin1Amount": 85.32625649,
      "coin2Amount": 95.80244682,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "USDC",
      "type": TransactionType.ADD,
      "totalValue": 51389385.09,
      "coin1Amount": 45.10863203,
      "coin2Amount": 14.45977451,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "WBTC",
      "type": TransactionType.REMOVE,
      "totalValue": 62947249.33,
      "coin1Amount": 32.81104431,
      "coin2Amount": 18.84867075,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "ETH",
      "type": TransactionType.SWAP,
      "totalValue": 83789531.87,
      "coin1Amount": 55.22081984,
      "coin2Amount": 15.7711983,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "WBTC",
      "type": TransactionType.ADD,
      "totalValue": 88422526.24,
      "coin1Amount": 78.28128104,
      "coin2Amount": 88.20335576,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "ETH",
      "coin2": "USDC",
      "type": TransactionType.REMOVE,
      "totalValue": 95835971.82,
      "coin1Amount": 9.532991159,
      "coin2Amount": 40.64787591,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    },
    {
      "coin1": "USDC",
      "coin2": "WBTC",
      "type": TransactionType.SWAP,
      "totalValue": 57385063.19,
      "coin1Amount": 63.52037022,
      "coin2Amount": 93.65125987,
      "account": "0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f",
      "time": "2021-09-01T04:02:39Z"
    }
  ]

export let graphSampleData = [
    ['2000-06-05', 116],
    ['2000-06-06', 129],
    ['2000-06-07', 135],
    ['2000-06-08', 86],
    ['2000-06-09', 73],
    ['2000-06-10', 85],
    ['2000-06-11', 73],
    ['2000-06-12', 68],
    ['2000-06-13', 92],
    ['2000-06-14', 130],
    ['2000-06-15', 245],
    ['2000-06-16', 139],
    ['2000-06-17', 115],
    ['2000-06-18', 111],
    ['2000-06-19', 309],
    ['2000-06-20', 206],
    ['2000-06-21', 137],
    ['2000-06-22', 1000],
    ['2000-06-23', 85],
    ['2000-06-24', 94],
    ['2000-06-25', 71],
    ['2000-06-26', 106],
    ['2000-06-27', 84],
    ['2000-06-28', 93],
    ['2000-06-29', 85],
    ['2000-06-30', 73],
    ['2000-07-01', 83],
    ['2000-07-02', 125],
    ['2000-07-03', 107],
    ['2000-07-04', 82],
    ['2000-07-05', 44],
    ['2000-07-06', 72],
    ['2000-07-07', 106],
    ['2000-07-08', 107],
    ['2000-07-09', 66],
    ['2000-07-10', 91],
    ['2000-07-11', 92],
    ['2000-07-12', 113],
    ['2000-07-13', 107],
    ['2000-07-14', 131],
    ['2000-07-15', 111],
    ['2000-07-16', 64],
    ['2000-07-17', 69],
    ['2000-07-18', 88],
    ['2000-07-19', 77],
    ['2000-07-20', 83],
    ['2000-07-21', 111],
    ['2000-07-22', 57],
    ['2000-07-23', 55],
    ['2000-07-24', 60],
  ];
  
