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
import { findTokenWithAddress_market, parseTransactionData } from '@/utils/txData';
import {getAllSuportedTokensPrice, getAllSuportedTokensPrice_forMarket, getPairAddress} from '@/acy-dex-swap/utils/index';

import {findTokenWithAddress} from '@/utils/txData';

import {totalInUSD} from '@/utils/utils'
import {TOKENLIST, API_URL, MARKET_API_URL, MARKET_TOKEN_LIST} from '@/constants';


// this variable is assigned with price data when calling functions e.g. fetchPoolInfo()
var tokensPriceUSD ;
// var ACY_API='http://localhost:3001/api/';

// export async function fetchPoolInfo(client, address, timestamp) {
//   const block = await getBlockFromTimestamp(timestamp);

//   const { loading, error, data } = await client.query({
//     query: GET_POOL_INFO,
//     variables: {
//       pairAddress: address,
//       block: parseInt(block.number),
//     },
//   });

//   if (loading) return null;
//   if (error) return `Error! ${error}`;

//   console.log(data);

//   return data.pairs[0];
// }

function parsePoolInfo(data){

    let _token0 = findTokenWithAddress_market(data.token0);
    let _token1 = findTokenWithAddress_market(data.token1);

    let _logoURL1 = _token0.logoURI;
    let _logoURL2 = _token1.logoURI;

    _token0 = _token0.symbol;
    _token1 = _token1.symbol;

    let _tvl = totalInUSD ( [
      {
        token : _token0,
        amount : data.lastReserves.token0
      },
      {
        token : _token1,
        amount : data.lastReserves.token1
      }
    ],tokensPriceUSD);

    let _volume24h = totalInUSD ( [
      {
        token : _token0,
        amount : data.lastVolume.token0
      },
      {
        token : _token1,
        amount : data.lastVolume.token1
      }
    ],tokensPriceUSD);

    let _token0USD = totalInUSD( [
      {
        token : _token0,
        amount : 1
      }
    ],tokensPriceUSD)

    let _token1USD = totalInUSD( [
      {
        token : _token1,
        amount : 1
      }
    ],tokensPriceUSD)

    const parsed = {
      reserve0: data.lastReserves.token0.toString(),
      reserve1: data.lastReserves.token1.toString(),
      reserveUSD: _tvl.toString(),
      token0: {
        symbol:  _token0 , logoURI : _logoURL1, id: data.token0
      },
      token0Price: _token0USD.toString(),
      token1: {
        symbol:  _token1 , logoURI : _logoURL2, id: data.token1
      },
      token1Price: _token1USD.toString(),
      untrackedVolumeUSD: "0",
      volumeUSD: _volume24h.toString()
    }
    return parsed
}

export async function fetchPoolDayData(address) {
  // let newPair = {
    //           coin1: pairs0[i].token0.symbol,
    //           coin2: pairs0[i].token1.symbol,
    //           address: pairs0[i].id,
    //           percent: 0,
    //           tvl: parseFloat(pair0DayData[0].reserveUSD),
    //           volume24h: parseFloat(pair0DayData[0].dailyVolumeUSD),
    //           volume7d: p0VolumeWeek,
    //           price: 0,
    //         };
    // apiUrlPrefix = 'http://localhost:3001/api';
  //return await axios.get(`${API_URL()}/poolchart/all`).then(async res => {
  return await axios.get(`${MARKET_API_URL()}/poolchart/all`).then(async res => {
    const data = res.data.data;
    const tokenPool = data.filter(p => p.token0.toLowerCase() == address.toLowerCase() || p.token1.toLowerCase() == address.toLowerCase());

    const priceDict = await getAllSuportedTokensPrice_forMarket();
    
    //const supportedTokens = TOKENLIST();
    const supportedTokens = MARKET_TOKEN_LIST();
    const parsedPairData = [];
    for (const pool of tokenPool) {
      const token0 = supportedTokens.find(t => t.address.toLowerCase() == pool.token0.toLowerCase());
      const token1 = supportedTokens.find(t => t.address.toLowerCase() == pool.token1.toLowerCase())
      const token0Symbol = token0.symbol;
      const token1Symbol = token1.symbol
      const tvl = pool.lastReserves.token0 * 2 * priceDict[token0Symbol];
      const volume24h = pool.lastVolume.token0 * priceDict[token0Symbol] + pool.lastVolume.token1 * priceDict[token1Symbol];
      const newPair = {
              coin1: token0Symbol,
              coin2: token1Symbol,
              logoURL1: token0.logoURI,
              logoURL2: token1.logoURI,
              pairAddr: getPairAddress(pool.token0, pool.token1),
              percent: 0,
              tvl,
              volume24h,
              // volume7d: p0VolumeWeek,
              // price: 0,
            };
      parsedPairData.push(newPair);
    }
    return parsedPairData;
  })

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

function parsePoolData (data){

  let _data = data.map((item)=>{

    // console.log("mapping....",item.token0,item.token1);
    let _token0 = findTokenWithAddress_market(item.token0);
    let _token1 = findTokenWithAddress_market(item.token1);

    let _logoURL1 = _token0.logoURI;
    let _logoURL2 = _token1.logoURI;

    _token0 = _token0.symbol;
    _token1 = _token1.symbol;


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
      pairAddr : item.pairAddr,
      coin1 : _token0,
      coin2 : _token1,
      logoURL1 : _logoURL1,
      logoURL2 : _logoURL2,
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

function parsePoolDayInfoData(data){

  let _data = [];
  let _token0 = findTokenWithAddress_market(data.token0).symbol;
  let _token1 = findTokenWithAddress_market(data.token1).symbol;

  data.historicalData.forEach(element => {

    let currTVL = totalInUSD([
      {
          token : _token0,
          amount : element.reserves.token0
      },
      {
          token : _token1,
          amount : element.reserves.token1
      }
    ], tokensPriceUSD);

    let currVolume = totalInUSD([
      {
          token : _token0,
          amount : element.volume24h.token0
      },
      {
          token : _token1,
          amount : element.volume24h.token1
      }
    ], tokensPriceUSD);
      
    let myDate = element.date;
    myDate = myDate.split("-");
    var newDate = new Date( myDate[0], myDate[1]-1, myDate[2]);
    console.log(newDate);

    _data.push({
      dailyVolumeUSD : currVolume.toString(),
      date : newDate.getTime()/1000,
      reserveUSD: currTVL.toString(),
      token0 : {
        symbol : _token0
      },
      token1 : {
        symbol : _token1
      }
    })
  });

 _data.reverse();
 return _data;
}


export async function fetchPoolInfo(address){
  // FOLLOWING CODE WILL BE WORKING ONCE THE SERVICE IS ON !
  tokensPriceUSD = await getAllSuportedTokensPrice_forMarket();
  try{
    //let request = `${API_URL()}/poolchart/all`;
    let request = `${MARKET_API_URL()}/poolchart/all`;
    let response = await fetch(request);
    let data = await response.json();
    const pairData = data.data.find(p => p.pairAddr.toLowerCase() == address.toLowerCase())
    return parsePoolInfo(pairData);
  }catch (e){
    console.log('service not available yet',e);
    return null;
  }
}

export async function fetchPoolDayDataForPair(address) {
  // FOLLOWING CODE WILL BE WORKING ONCE THE SERVICE IS ON !
  tokensPriceUSD = await getAllSuportedTokensPrice_forMarket();
  try{
    console.log(">>> start to send")
    //let request = API_URL() +'/poolchart/historical/pair?pairAddr='+address;
    let request = MARKET_API_URL() +'/poolchart/historical/pair?pairAddr='+address;
    let response = await fetch(request);
    console.log(">>> done send", response)
    let data = await response.json();
    return parsePoolDayInfoData(data.data);
  }catch (e){
    console.log('service not available yet',e);
    return null;
  }
}

export async function fetchGeneralPoolInfoDay(address) {
  // FOLLOWING CODE WILL BE WORKING ONCE THE SERVICE IS ON !
  tokensPriceUSD = await getAllSuportedTokensPrice_forMarket();
  try{
    //let request = API_URL()+'/poolchart/all';
    let request = MARKET_API_URL()+'/poolchart/all';
    let response = await fetch(request);
    let data = await response.json();
    let parsed = parsePoolData(data.data);
    console.log(parsed);
    return parsed;
  }catch (e){
    console.log('service not available yet',e);
    return null;
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

function parseSearchPoolReturns(data, key){

  let _data = data.map((item)=>{

    console.log("mapping....",item.token0,item.token1);
    let _token0 = findTokenWithAddress_market(item.token0);
    let _token1 = findTokenWithAddress_market(item.token1);

    let _logoURL1 = _token0.logoURI;
    let _logoURL2 = _token1.logoURI;

    _token0 = _token0.symbol;
    _token1 = _token1.symbol;


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
    ], tokensPriceUSD);
    
    // Find pair addr
    let pairAddr = getPairAddress(item.token0, item.token1);
  
    return {
      coin1 : _token0,
      coin2: _token1,
      pairAddr: pairAddr,
      logoURL1 : _logoURL1,
      logoURL2 : _logoURL2,
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

  return sortTable(_data, key ,true);
}

// fetch search pool returns
export async function fetchSearchPoolReturns(key) {
  tokensPriceUSD = await getAllSuportedTokensPrice_forMarket();
  try{
    //let request = `${API_URL()}/poolchart/all`;
    let request = `${MARKET_API_URL()}/poolchart/all`;
    let response = await fetch(request);
    let data = await response.json();
    let parsed = parseSearchPoolReturns(data.data, key);
    let searchPoolReturns = parsed.map(tokenList => ({
      coin1: tokenList.coin1,
      coin2: tokenList.coin2,
      logoURL1: tokenList.logoURL1,
      logoURL2: tokenList.logoURL2,
      address: tokenList.pairAddr,
    }))
    console.log(searchPoolReturns)
    return searchPoolReturns;
  }catch (e){
    console.log('service not available yet',e);
    return null;
  }
}


// get individual pool info from token

 
