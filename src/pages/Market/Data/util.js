// {
//     name: 'Ether',
//     short: 'ETH',
//     address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
//     price: 3170,
//     priceChange: -0.79,
//     volume24h: 804110000,
//     tvl: 899640000,
// }

// {
//     "__typename": "Token",
//     "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
//     "name": "Wrapped Ether",
//     "symbol": "WETH",
//     "tokenDayData": [
//         {
//             "__typename": "TokenDayData",
//             "priceUSD": "3476.190764446508102047799565521447",
//             "totalValueLockedUSD": "749554259.8372589886468377087802052",
//             "volumeUSD": "409263095.6236356359045315223905004"
//         },
//         {
//             "__typename": "TokenDayData",
//             "priceUSD": "3395.978715228595111367358465395642",
//             "totalValueLockedUSD": "754865392.6839205136480065150718067",
//             "volumeUSD": "934084113.4675034288665388972464707"
//         }
//     ]
// }

export function convertToken(raw) {
  // calculate the price change
  let priceToday = parseFloat(raw.tokenDayData[0].priceUSD);
  let pricePrev = parseFloat(raw.tokenDayData[1].priceUSD);
  let priceChange = ((priceToday - pricePrev) / pricePrev) * 100;

  return {
    name: raw.name,
    short: raw.symbol,
    address: raw.id,
    price: priceToday,
    priceChange: priceChange,
    volume24h: parseFloat(raw.tokenDayData[0].volumeUSD),
    tvl: parseFloat(raw.tokenDayData[0].totalValueLockedUSD),
  };
}

// converts raw tx form into frontend compatible
export function convertTx(raw, id, time, type) {
  return {
    coin1: raw.pool.token0.symbol,
    coin2: raw.pool.token1.symbol,
    type: type,
    totalValue: parseFloat(raw.amountUSD),
    coin1Amount: Math.abs(parseFloat(raw.amount0)),
    coin2Amount: Math.abs(parseFloat(raw.amount1)),
    account: raw.origin,
    time: new Date(time * 1000).toISOString(),
    transactionID: id,
  };
}
