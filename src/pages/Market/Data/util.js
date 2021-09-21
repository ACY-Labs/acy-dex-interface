import { TransactionType } from '../Util';

// {
//   coin1: 'ETH',
//   coin2: 'PAX',
//   address: 'ba70cce92fb2df0a297d746015c847945fe1e95f801d3fc1c6fa4462e4775fa4',
//   percent: 0.3,
//   tvl: 302461443.1,
//   volume24h: 52872054.23,
//   volume7d: 757759877.3,
//   price: 691103.2117,
// }


export function convertPoolForList(raw, volume7d) {
  return {
    coin1: raw.token0.symbol,
    coin2: raw.token1.symbol,
    address: raw.pairAddress,
    percent: 0,
    tvl: parseFloat(raw.reserveUSD),
    volume24h: parseFloat(raw.dailyVolumeUSD),
    volume7d: parseFloat(volume7d),
    price: 0
  };
}


export function convertTokenForList(raw, dayDataSimple) {
  // calculate the price change
  let priceToday = parseFloat(raw.priceUSD);
  let pricePrev = parseFloat(dayDataSimple.priceUSD);
  let priceChange = ((priceToday - pricePrev) / pricePrev) * 100;

  return {
    name: raw.token.name,
    short: raw.token.symbol,
    address: raw.token.id,
    price: priceToday,
    priceChange: priceChange,
    volume24h: parseFloat(raw.dailyVolumeUSD),
    tvl: parseFloat(raw.totalLiquidityUSD),
  };
}

// converts raw tx form into frontend compatible
export function convertTx(raw, id, time, type) {
  return {
    coin1: raw.pair.token0.symbol,
    coin2: raw.pair.token1.symbol,
    type: type,
    totalValue: parseFloat(raw.amountUSD),
    coin1Amount: type == TransactionType.SWAP ? Math.abs(parseFloat(raw.amount0In)) : Math.abs(parseFloat(raw.amount0)),
    coin2Amount: type == TransactionType.SWAP ? Math.abs(parseFloat(raw.amount1Out)) : Math.abs(parseFloat(raw.amount1)),
    account: raw.sender,
    time: new Date(time * 1000).toISOString(),
    transactionID: id,
  };
}
