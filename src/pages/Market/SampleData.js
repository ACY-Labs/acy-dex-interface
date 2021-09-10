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
    "coin1": "ETH",
    "coin2": "USDC",
    "percent": 0.3,
    "tvl": 972222638.8,
    "volume24h": 813970883,
    "volume7d": 907971574.1,
    "price": 708346.8123
  },
  {
    "coin1": "USDC",
    "coin2": "WBTC",
    "percent": 0.05,
    "tvl": 888255400.9,
    "volume24h": 34449058.39,
    "volume7d": 208220529.7,
    "price": 127726.6362
  },
  {
    "coin1": "WBTC",
    "coin2": "DAI",
    "percent": 1,
    "tvl": 446757782.9,
    "volume24h": 34192693.42,
    "volume7d": 147279386.6,
    "price": 210930.6196
  },
  {
    "coin1": "USDT",
    "coin2": "FRAX",
    "percent": 0.3,
    "tvl": 634528077,
    "volume24h": 689411747.7,
    "volume7d": 396148381.3,
    "price": 421768.3635
  },
  {
    "coin1": "DAI",
    "coin2": "LINK",
    "percent": 0.05,
    "tvl": 515606057.1,
    "volume24h": 576917442.5,
    "volume7d": 6349541.128,
    "price": 297634.1985
  },
  {
    "coin1": "FRAX",
    "coin2": "USDC",
    "percent": 1,
    "tvl": 531799537.4,
    "volume24h": 627493459.4,
    "volume7d": 705891372.1,
    "price": 917345.6726
  },
  {
    "coin1": "ETH",
    "coin2": "WBTC",
    "percent": 0.3,
    "tvl": 53279519.34,
    "volume24h": 800649774.2,
    "volume7d": 842992352.8,
    "price": 535262.3893
  },
  {
    "coin1": "USDC",
    "coin2": "DAI",
    "percent": 0.05,
    "tvl": 980634673,
    "volume24h": 516153361.9,
    "volume7d": 141835422.4,
    "price": 439530.2421
  },
  {
    "coin1": "PAX",
    "coin2": "ETH",
    "percent": 1,
    "tvl": 810735237.5,
    "volume24h": 700159296.9,
    "volume7d": 82831255.56,
    "price": 801927.1678
  },
  {
    "coin1": "USDT",
    "coin2": "LINK",
    "percent": 0.3,
    "tvl": 375871750.2,
    "volume24h": 97460504.51,
    "volume7d": 116914847.5,
    "price": 933039.8118
  },
  {
    "coin1": "DAI",
    "coin2": "USDC",
    "percent": 0.05,
    "tvl": 129060949.9,
    "volume24h": 688505196.7,
    "volume7d": 706704808.6,
    "price": 322601.71
  },
  {
    "coin1": "LINK",
    "coin2": "WBTC",
    "percent": 1,
    "tvl": 57305552.19,
    "volume24h": 872917441.7,
    "volume7d": 342511411.1,
    "price": 803051.6241
  },
  {
    "coin1": "PAX",
    "coin2": "DAI",
    "percent": 0.3,
    "tvl": 841769283.6,
    "volume24h": 678298707.3,
    "volume7d": 334869531.6,
    "price": 714063.5277
  },
  {
    "coin1": "USDC",
    "coin2": "ETH",
    "percent": 0.05,
    "tvl": 99284768.63,
    "volume24h": 142962794.1,
    "volume7d": 986303538.6,
    "price": 740296.3839
  },
  {
    "coin1": "WBTC",
    "coin2": "LINK",
    "percent": 1,
    "tvl": 250455419.3,
    "volume24h": 502948968.5,
    "volume7d": 389946804.5,
    "price": 665595.3588
  },
  {
    "coin1": "USDT",
    "coin2": "LINK",
    "percent": 1,
    "tvl": 977539327.5,
    "volume24h": 541683520.3,
    "volume7d": 331193232.8,
    "price": 153029.103
  },
  {
    "coin1": "DAI",
    "coin2": "PAX",
    "percent": 0.05,
    "tvl": 255235278.1,
    "volume24h": 851467955.3,
    "volume7d": 819032728.6,
    "price": 676205.7962
  },
  {
    "coin1": "LINK",
    "coin2": "DAI",
    "percent": 1,
    "tvl": 491275261.2,
    "volume24h": 234093143.4,
    "volume7d": 837812275.4,
    "price": 202705.2485
  },
  {
    "coin1": "ETH",
    "coin2": "PAX",
    "percent": 0.3,
    "tvl": 302461443.1,
    "volume24h": 52872054.23,
    "volume7d": 757759877.3,
    "price": 691103.2117
  },
  {
    "coin1": "USDC",
    "coin2": "LINK",
    "percent": 0.05,
    "tvl": 622344842.6,
    "volume24h": 508790338.1,
    "volume7d": 703020085.3,
    "price": 698767.8487
  }
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
  
