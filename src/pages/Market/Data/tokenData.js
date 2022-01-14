import {
  GET_TOKEN_DAY_DATA,
  GET_TOKEN_LIST,
  GET_TOKEN_DAY_SIMPLE,
  GET_TOKEN_INFO,
  GET_TOKEN_FROM_ID,
  TOKEN_SEARCH,
} from './query';
import { convertTokenForList } from './util';
import { sortTable } from '../Util';
import { getBlockFromTimestamp } from './blocks';

import {getAllSuportedTokensPrice, getAllSuportedTokensPrice_forMarket} from '@/acy-dex-swap/utils/index';
import {findTokenWithAddress} from '@/utils/txData';
import {totalInUSD} from '@/utils/utils';
import { symbol } from 'prop-types';

import axios from "axios";
import { getAddress } from '@ethersproject/address';
import { API_URL, TOKENLIST, MARKET_API_URL, MARKET_TOKEN_LIST} from '@/constants';


export async function fetchTokenInfo(client, tokenAddress, timestamp) {
  const block = await getBlockFromTimestamp(timestamp);

  console.log('TOKEN ADDRESS', tokenAddress);

  const { loading, error, data } = await client.query({
    query: GET_TOKEN_INFO,
    variables: {
      address: tokenAddress,
      block: parseInt(block.number),
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  console.log(data);

  return data.tokens[0];
}

export async function fetchTokenDayData(tokenId) {
  //const uniqueTokens = TOKENLIST();
  const uniqueTokens = MARKET_TOKEN_LIST();
  // get USDT/USDC address for calculating historical price
  const USDTaddr = getAddress(uniqueTokens.find(t => t.symbol == "USDT" || t.symbol == "USDC").address);
  tokenId = getAddress(tokenId);
  const tokenIsUSDT = tokenId == USDTaddr;

  const getTokenUSDPrice = (data) => {
    
    if (tokenIsUSDT) {
      return [];
    }

    console.log(USDTaddr,tokenId);
    
    const tokenPairWithUSD = data.find(p => (p.token0 == tokenId && p.token1 == USDTaddr) || (p.token1 == tokenId && p.token0 == USDTaddr))
    console.log("tokenPairWithUSD", tokenPairWithUSD)
    const token0IsUSD = tokenPairWithUSD.token0 == USDTaddr;
    // calculate price of token
    const tokenUSDPriceDict = {}
    for (const h of tokenPairWithUSD.historicalData) {
      const usdtReserve = token0IsUSD ? h.reserves.token0 : h.reserves.token1;
      const tokenReserve = token0IsUSD ? h.reserves.token1 : h.reserves.token0;
      tokenUSDPriceDict[h.date] = usdtReserve / tokenReserve;
    }
    
    return tokenUSDPriceDict;
  }

  // filter out pools with tokenId token, (could be token0 or token1 of pool)
  // flatten the pool's history into an array of object, containing daily volume and reserves
  // sums up in a json and return
  const aggregateStats = (data, fieldName, tokenPrice, outputStats) => {
    const pair = data.filter(d => d[fieldName] == tokenId);

    const pairHistoryFlat = pair.reduce((prev,cur) => [...prev, ...cur.historicalData], []);
    console.log("flat history", pairHistoryFlat)
    
    for (const pdata of pairHistoryFlat) {
      console.log()
      const parsedPdata = {
        date: pdata.date, 
        dailyVolumeUSD: tokenIsUSDT ? pdata.volume24h[fieldName] : pdata.volume24h[fieldName] * tokenPrice[pdata.date] || 0, 
        totalLiquidityUSD: tokenIsUSDT ? pdata.reserves[fieldName] : pdata.reserves[fieldName] * tokenPrice[pdata.date] || 0
      }
      console.log("parsedPdata", pdata, tokenPrice[pdata.date], parsedPdata)
      console.log("check if data for date exists", outputStats[parsedPdata.date])
      if (!outputStats[parsedPdata.date]) {
        outputStats[parsedPdata.date] = parsedPdata;
        continue;
      }

      outputStats[parsedPdata.date].dailyVolumeUSD += parsedPdata.dailyVolumeUSD;
      outputStats[parsedPdata.date].totalLiquidityUSD += parsedPdata.totalLiquidityUSD;
    }
    return outputStats
  }

  //return await axios.get(`${API_URL()}/poolchart/historical/all`).then(res => {
  return await axios.get(`${MARKET_API_URL()}/poolchart/historical/all`).then(res => {
    const data = res.data.data;
    console.log("tokenData return data from server", data)

    const tokenPriceDict = getTokenUSDPrice(data);
    console.log("token price dict", tokenPriceDict)
    
    let aggregatedTokenStats = {};
    aggregatedTokenStats = aggregateStats(data, "token0", tokenPriceDict, aggregatedTokenStats);
    aggregatedTokenStats = aggregateStats(data, "token1", tokenPriceDict, aggregatedTokenStats);
    
    console.log("final aggregatedTokenStats", aggregatedTokenStats);

    const parsedTokenStats = Object.keys(aggregatedTokenStats).map(key => ({
      date: new Date(aggregatedTokenStats[key].date).getTime()/1000,
      priceUSD: tokenIsUSDT ? 1 : tokenPriceDict[aggregatedTokenStats[key].date],
      dailyVolumeUSD: aggregatedTokenStats[key].dailyVolumeUSD,
      totalLiquidityUSD: aggregatedTokenStats[key].totalLiquidityUSD
    }))
    console.log("final parsedTokenStats", parsedTokenStats)
    
    return parsedTokenStats
  })

  // data
        // dailyVolumeToken: "336153.802688237119753424"
        // dailyVolumeUSD: "5610888.377159581473889737524083496"
        // date: 1640217600
        // id: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984-18984"
        // mostLiquidPairs: []
        // priceUSD: "17.29920828219531842792396080605194"
        // token: {__typename: 'Token', id: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', symbol: 'UNI', name: 'Uniswap'}
        // totalLiquidityToken: "1693735.720308796254431288"
        // totalLiquidityUSD: "29300287.00061598156031768802958171"
        // __typename: "TokenDayData"
  
  // pairs0, pairs1
        // id: "0xd3d2e2692501a5c9ca623199d38826e513033a17"
        // token0: {__typename: 'Token', symbol: 'UNI'}
        // token1: {__typename: 'Token', symbol: 'WETH'}
        // __typename: "Pair"
}

export async function fetchTokenDaySimple(client, tokenId) {
  const { loading, error, data } = await client.query({
    query: GET_TOKEN_DAY_SIMPLE,
    variables: {
      tokenId: tokenId,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;
  console.log('swaptokenDayData2',data,tokenId);
  return data;
}

// fetch general token info
// top 10, etc

/* I WANT SOMETHING LIKE THIS
address: "0x72e5390edb7727e3d4e3436451dadaff675dbcc0"
name: "Hanu Yokia"
price: 0.0000040829740792660185
priceChange: -1.3222036097103693
short: "HANU"
tvl: 2017258489.0114584
volume24h: 10312.741117738939
*/

var tokensPriceUSD ;

function parseTokenData (data){

  //INIT TOKEN LIST;
  let newData = [];

  MARKET_TOKEN_LIST().forEach(element => {
    newData.push({
      address : element.address,
      name : element.name,
      price : tokensPriceUSD[element.symbol] ? tokensPriceUSD[element.symbol] : 1,
      priceChange : -0,
      short : element.symbol,
      logoURL : element.logoURI,
      tvl : 0,
      volume24h : 0

    })
  });

  data.forEach(element => {
      let index0 = newData.findIndex(item => item.address.toLowerCase() == element.token0.toLowerCase() );
      let index1 = newData.findIndex(item => item.address.toLowerCase() == element.token1.toLowerCase() );

      if(index0>=0 && index0<newData.length){

          newData[index0].tvl += totalInUSD([
            {
              token : newData[index0].short,
              amount : element.lastReserves.token0
            }
          ],tokensPriceUSD);
    
          newData[index0].volume24h += totalInUSD([
            {
              token : newData[index0].short,
              amount : element.lastVolume.token0
            }
          ],tokensPriceUSD);

      }

      if(index1>=0 && index1<newData.length){
          newData[index1].tvl += totalInUSD([
            {
              token : newData[index1].short,
              amount : element.lastReserves.token1
            }
          ],tokensPriceUSD);
    
          newData[index1].volume24h += totalInUSD([
            {
              token : newData[index1].short,
              amount : element.lastVolume.token1
            }
          ],tokensPriceUSD);
      }


  });

  console.log("token data",newData);

  return sortTable(newData,'volume24h',true);
  
}

export async function fetchGeneralTokenInfo() {
  // FOLLOWING CODE WILL BE WORKING ONCE THE SERVICE IS ON !
  tokensPriceUSD = await getAllSuportedTokensPrice_forMarket();
  try{
    //let request = `${API_URL()}/poolchart/all`;
    let request = `${MARKET_API_URL()}/poolchart/all`;
    // let request = 'http://localhost:3001/api/poolchart/all';
    let response = await fetch(request);
    let data = await response.json();
    return parseTokenData(data.data);
  }catch (e){
    console.log('service not available yet',e);
    return null;
  }
}

// fetch individual token from string (search)
export async function fetchTokenSearch(client, searchQuery) {
  const { loading, error, data } = await client.query({
    query: TOKEN_SEARCH,
    variables: {
      value: searchQuery ? searchQuery.toUpperCase() : '',
      id: searchQuery,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  // return sortTable(
  //   [...data.asAddress, ...data.asSymbol, ...data.asName]
  //     .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
  //     .map(item => ({
  //       id: item.id,
  //       name: item.name,
  //       symbol: item.symbol,
  //       txCount: parseInt(item.txCount)
  //     })),
  //   'txCount',
  //   true
  // );
  return sortTable(
    [...data.asAddress, ...data.asSymbol, ...data.asName]
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
      .map(item => ({
        id: "1223",
        name: "abcusd",
        symbol: "BNB",
        txCount: parseInt(item.txCount)
      })),
    'txCount',
    true
  );
}

// fetch individual token info from id
export async function fetchTokensFromId(client, id){
  const { loading, error, data } = await client.query({
    query: GET_TOKEN_FROM_ID,
    variables: {
      id: id,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  return data

}

function parseSearchCoinReturns (data, key){
  //INIT TOKEN LIST;
  let newData = [];
  const uniqueTokens = MARKET_TOKEN_LIST();
  uniqueTokens.forEach(element => {
    newData.push({
      address : element.address,
      name : element.name,
      price : tokensPriceUSD[element.symbol] ? tokensPriceUSD[element.symbol] : 1,
      priceChange : -0,
      short : element.symbol,
      logoURL : element.logoURI,
      tvl : 0,
      volume24h : 0

    })
  });

  data.forEach(element => {
      let index0 = newData.findIndex(item => item.address.toLowerCase() == element.token0.toLowerCase() );
      let index1 = newData.findIndex(item => item.address.toLowerCase() == element.token1.toLowerCase() );
      newData[index0].tvl += totalInUSD([
        {
          token : newData[index0].short,
          amount : element.lastReserves.token0
        }
      ],tokensPriceUSD);

      newData[index0].volume24h += totalInUSD([
        {
          token : newData[index0].short,
          amount : element.lastVolume.token0
        }
      ],tokensPriceUSD);

      newData[index1].tvl += totalInUSD([
        {
          token : newData[index1].short,
          amount : element.lastReserves.token1
        }
      ],tokensPriceUSD);

      newData[index1].volume24h += totalInUSD([
        {
          token : newData[index1].short,
          amount : element.lastVolume.token1
        }
      ],tokensPriceUSD);

  });

  return sortTable(newData, key, true);
  
}

// fetch tokens for search
export async function fetchSearchCoinReturns(key) {
  tokensPriceUSD = await getAllSuportedTokensPrice_forMarket();
  try{
    //let request = `${API_URL()}/poolchart/all`;
    let request = `${MARKET_API_URL()}/poolchart/all`;
    let response = await fetch(request);
    let data = await response.json(); 
    let parsed = parseSearchCoinReturns(data.data, key);
    let searchCoinReturns = parsed.map(tokenList => ({
      logoURL: tokenList.logoURL,
      address: tokenList.address,
      name: tokenList.name,
      short: tokenList.short,
    }))
    return searchCoinReturns;
  }catch (e){
    console.log('service not available yet',e);
    return null;
  }
}



// fetch individual token history
