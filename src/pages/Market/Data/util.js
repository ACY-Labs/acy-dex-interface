import { TransactionType } from '../Util';

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
