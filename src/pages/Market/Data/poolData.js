import { GET_TOP_POOL, GET_POOL_DAY_DATA, GET_POOL_INFO } from './query';
import { convertPoolForList } from './util';
import {getBlockFromTimestamp} from './blocks'

export async function fetchPoolInfo(client, address, timestamp){

  const block = await getBlockFromTimestamp(timestamp)

  const { loading, error, data } = await client.query({
    query: GET_POOL_INFO,
    variables: {
      pairAddress: address,
      block: parseInt(block.number)
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  console.log(data)

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

// get individual pool info from id

// get individual pool info from token

// pool history
