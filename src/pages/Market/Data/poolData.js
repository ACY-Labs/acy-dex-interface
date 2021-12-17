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
import {getAllSuportedTokensPrice} from '@/acy-dex-swap/utils/index';

import {findTokenWithAddress} from '@/utils/txData';

import {totalInUSD} from '@/utils/utils'

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

var tokensPriceUSD ;

function parsePoolData (data){

  let _data = data.map((item)=>{


    let _token0 = findTokenWithAddress(item.token0).symbol;
    let _token1 = findTokenWithAddress(item.token1).symbol;


    let _tvl = totalInUSD ( [
      {
        token : _token0,
        amount : item.lastReserves.token0
      },
      {
        token : _token1,
        amount : item.lastReserves.token1
      }
    ],tokensPriceUSD);

    let _volume24h = totalInUSD ( [
      {
        token : _token0,
        amount : item.lastVolume.token0
      },
      {
        token : _token1,
        amount : item.lastVolume.token1
      }
    ],tokensPriceUSD);

    return {
      coin1 : _token0,
      coin2 : _token1,
      tvl : _tvl ,
      volume24h : _volume24h,
      volume7d : 0
    }
  });
  let allsums = 0;
  let allvolumes = 0;
  _data.forEach(element => {
    allsums += element.tvl;
    allvolumes += element.volume24h;
  });

  return sortTable(_data,'volume24h',true);
}

export async function fetchGeneralPoolInfoDay() {
  // FOLLOWING CODE WILL BE WORKING ONCE THE SERVICE IS ON !
  tokensPriceUSD = await getAllSuportedTokensPrice();
  try{
    let request = 'https://api.acy.finance/api/poolchart/all';
    // let request = 'http://localhost:3001/api/poolchart/all';
    let response = await fetch(request);
    let data = await response.json();
    return parsePoolData(data.data);
  }catch (e){
    console.log('service not available yet',e);
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
