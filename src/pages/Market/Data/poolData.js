import {
  GET_TOP_POOL,
  GET_POOL_DAY_DATA,
  GET_POOL_INFO,
  POOL_SEARCH,
  GET_POOL_FROM_ID,
  USER_POSITIONS,
} from './query';
import { convertPoolForList } from './util';
import { getBlockFromTimestamp } from './blocks';
import { sortTable } from '../Util';

export async function fetchPoolInfo(client, address, timestamp) {
  const block = await getBlockFromTimestamp(timestamp);

  const { loading, error, data } = await client.query({
    query: GET_POOL_INFO,
    variables: {
      pairAddress: address,
      block: parseInt(block.number),
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  console.log(data);

  return data.pairs[0];
}

export async function fetchPoolDayData(client, address, timespan) {
  const { loading, error, data } = await client.query({
    query: GET_POOL_DAY_DATA,
    variables: {
      timespan: timespan,
      pairAddress: address,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  return data.pairDayDatas;
}

// fetch general pool info
// top 10, etc
export async function fetchGeneralPoolInfoDay(client) {
  let todayDateObj = new Date();
  let todayTime = Math.floor(todayDateObj.getTime() / 1000 / 86400) * 86400;

  const { loading, error, data } = await client.query({
    query: GET_TOP_POOL,
    variables: {
      date: todayTime,
      poolAmount: 50,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  let rawPoolList = data.pairDayDatas;
  let poolLength = rawPoolList.length;
  let poolListProcessed = [];
  for (let i = 0; i < poolLength; i++) {
    try {
      const rawWeekDatas = await fetchPoolDayData(client, rawPoolList[i].pairAddress, 7);
      let weekDatas = rawWeekDatas;
      let weekDataLength = weekDatas.length;
      let volume7d = 0;

      for (let i = 0; i < weekDataLength; i++) {
        volume7d += parseFloat(weekDatas[i].dailyVolumeUSD);
      }

      poolListProcessed.push(convertPoolForList(rawPoolList[i], volume7d));
    } catch (err) {
      console.log(err);
    }
  }

  return poolListProcessed;
}

// get pools from string (search)
export async function fetchPoolSearch(client, searchQuery, tokens) {
  const { loading, error, data } = await client.query({
    query: POOL_SEARCH,
    variables: {
      tokens: tokens,
      id: searchQuery,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  return sortTable(
    [...data.asAddress, ...data.as0, ...data.as1]
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
      .map(item => ({
        id: item.id,
        token0: item.token0.symbol,
        token1: item.token1.symbol,
        txCount: parseInt(item.txCount),
      })),
    'txCount',
    true
  );
}

// get individual pool info from id
export async function fetchPoolsFromId(client, id) {
  const { loading, error, data } = await client.query({
    query: GET_POOL_FROM_ID,
    variables: {
      id: id,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  return data;
}

// get individual pool info from token

// pool history

// get user pool positions
export async function fetchPoolsFromAccount(client, account) {
  const { loading, error, data } = await client.query({
    query: USER_POSITIONS,
    variables: {
      user: account,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  console.log('fetchPoolsFromAccount');
  console.log(data);
  return data;
}
