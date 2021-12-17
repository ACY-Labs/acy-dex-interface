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
import axios from 'axios';
import { parseTransactionData } from '@/utils/txData';
import supportedTokens from '@/constants/TokenList';

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
// FOLLOWING 2 FUNCTIONS GET DATA FROM API
/*
data is an array of items with following format : 
{
  token0 : String,
  token1 : string,
  lastReserves : formatted number,
  lastVolumes : formatted number
}

we want : 
  address: "0x21b8065d10f73ee2e260e5b47d3344d3ced7596e"
  coin1: "WISE"
  coin2: "WETH"
  percent: 0
  price: 0
  tvl: 396257257.00010574
  volume7d: 940097.9591566627
  volume24h: 86149.02125578691
*/
//::::TODO fetch price of tokens in USDC
function translateToUSD (token0, token1, amount0, amount1){
  return amount0 + amount1; 
}

function parsePoolData (data){
  let _data = data.map((item)=>{
    let _tvl = translateToUSD (item.token0,item.token1,item.lastReserves.token0,item.lastReserves.token1);
    let _volume24h = translateToUSD (item.token0,item.token1,item.lastVolume.token0,item.lastVolume.token1);
    return {
      coin1 : supportedTokens.find(token=>token.addressOnEth.toLowerCase() == item.token0.toLowerCase()).symbol,
      coin2 : supportedTokens.find(token=>token.addressOnEth.toLowerCase() == item.token1.toLowerCase()).symbol,
      tvl : _tvl ,
      volume24h : _volume24h,
      volume7d : 0
    }
  });
  return _data;
}

export async function fetchGeneralPoolInfoDay() {
  // FOLLOWING CODE WILL BE WORKING ONCE THE SERVICE IS ON !
  try{
    let request = 'http://3.143.250.42:6001/api/poolchart/all';
    let response = await fetch(request);
    let data = await response.json();
    return parsePoolData(data.data);
  }catch (e){
    return [];
    console.log('service not available yet');
    return [];
  }
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
