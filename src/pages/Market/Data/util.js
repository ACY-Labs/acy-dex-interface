/* eslint-disable camelcase */
import { TransactionType } from '../Util';

export function convertPoolForList(raw, volume7d) {
  return {
    coin1: raw.token0.symbol,
    coin2: raw.token1.symbol,
    address: raw.pairAddress,
    percent: 0,
    tvl: parseFloat(raw.reserveUSD),
    volume24h: parseFloat(raw.dailyVolumeUSD),
    volume7d: volume7d,
    price: 0,
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
    coin1Amount:
      type == TransactionType.SWAP
        ? Math.abs(parseFloat(raw.amount0In))
        : Math.abs(parseFloat(raw.amount0)),
    coin2Amount:
      type == TransactionType.SWAP
        ? Math.abs(parseFloat(raw.amount1Out))
        : Math.abs(parseFloat(raw.amount1)),
    account: raw.sender,
    time: new Date(time * 1000).toISOString(),
    transactionID: id,
  };
}

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow, value24HoursAgo) => {
  const adjustedPercentChange =
    ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100;
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0;
  }
  return adjustedPercentChange;
};

const PRICE_DISCOVERY_START_TIMESTAMP = 1589747086;

export const priceOverrides = [
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
];

function formatPricesForEarlyTimestamps(position) {
  if (position.timestamp < PRICE_DISCOVERY_START_TIMESTAMP) {
    if (priceOverrides.includes(position?.pair?.token0.id)) {
      position.token0PriceUSD = 1;
    }
    if (priceOverrides.includes(position?.pair?.token1.id)) {
      position.token1PriceUSD = 1;
    }
    // WETH price
    if (position.pair?.token0.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      position.token0PriceUSD = 203;
    }
    if (position.pair?.token1.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      position.token1PriceUSD = 203;
    }
  }
  return position;
}

export function getMetricsForPositionWindow(positionT0, positionT1) {
  positionT0 = formatPricesForEarlyTimestamps(positionT0);
  positionT1 = formatPricesForEarlyTimestamps(positionT1);

  // calculate ownership at ends of window, for end of window we need original LP token balance / new total supply
  const t0Ownership = positionT0.liquidityTokenBalance / positionT0.liquidityTokenTotalSupply;
  const t1Ownership = positionT0.liquidityTokenBalance / positionT1.liquidityTokenTotalSupply;

  // get starting amounts of token0 and token1 deposited by LP
  const token0_amount_t0 = t0Ownership * positionT0.reserve0;
  const token1_amount_t0 = t0Ownership * positionT0.reserve1;

  // get current token values
  const token0_amount_t1 = t1Ownership * positionT1.reserve0;
  const token1_amount_t1 = t1Ownership * positionT1.reserve1;

  // calculate squares to find imp loss and fee differences
  const sqrK_t0 = Math.sqrt(token0_amount_t0 * token1_amount_t0);
  // eslint-disable-next-line eqeqeq
  const priceRatioT1 =
    positionT1.token0PriceUSD != 0 ? positionT1.token1PriceUSD / positionT1.token0PriceUSD : 0;

  const token0_amount_no_fees =
    positionT1.token1PriceUSD && priceRatioT1 ? sqrK_t0 * Math.sqrt(priceRatioT1) : 0;
  const token1_amount_no_fees =
    Number(positionT1.token1PriceUSD) && priceRatioT1 ? sqrK_t0 / Math.sqrt(priceRatioT1) : 0;
  const no_fees_usd =
    token0_amount_no_fees * positionT1.token0PriceUSD +
    token1_amount_no_fees * positionT1.token1PriceUSD;

  const difference_fees_token0 = token0_amount_t1 - token0_amount_no_fees;
  const difference_fees_token1 = token1_amount_t1 - token1_amount_no_fees;
  const difference_fees_usd =
    difference_fees_token0 * positionT1.token0PriceUSD +
    difference_fees_token1 * positionT1.token1PriceUSD;

  // calculate USD value at t0 and t1 using initial token deposit amounts for asset return
  const assetValueT0 =
    token0_amount_t0 * positionT0.token0PriceUSD + token1_amount_t0 * positionT0.token1PriceUSD;
  const assetValueT1 =
    token0_amount_t0 * positionT1.token0PriceUSD + token1_amount_t0 * positionT1.token1PriceUSD;

  const imp_loss_usd = no_fees_usd - assetValueT1;
  const uniswap_return = difference_fees_usd + imp_loss_usd;

  // get net value change for combined data
  const netValueT0 = t0Ownership * positionT0.reserveUSD;
  const netValueT1 = t1Ownership * positionT1.reserveUSD;

  return {
    hodleReturn: assetValueT1 - assetValueT0,
    netReturn: netValueT1 - netValueT0,
    uniswapReturn: uniswap_return,
    impLoss: imp_loss_usd,
    fees: difference_fees_usd,
  };
}
