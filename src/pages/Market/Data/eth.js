import dayjs from 'dayjs';
import { getBlockFromTimestamp } from './blocks';
import { ETH_PRICE } from './query';
import { getPercentChange } from './util';

export const fetchEthPrice = async client => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime
    .subtract(1, 'day')
    .startOf('minute')
    .unix();

  console.log('utcOneDayBack');
  console.log(utcOneDayBack);

  let ethPrice = 0;
  let ethPriceOneDay = 0;
  let priceChangeETH = 0;

  try {
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
    const result = await client.query({
      query: ETH_PRICE(),
      fetchPolicy: 'cache-first',
    });
    const resultOneDay = await client.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: 'cache-first',
    });
    const currentPrice = result?.data?.bundles[0]?.ethPrice;
    const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPrice;
    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice);
    ethPrice = currentPrice;
    ethPriceOneDay = oneDayBackPrice;
  } catch (e) {
    console.log(e);
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH];
};
