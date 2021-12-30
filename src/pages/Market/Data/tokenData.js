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

import {getAllSuportedTokensPrice} from '@/acy-dex-swap/utils/index';
import {findTokenWithAddress} from '@/utils/txData';
import {totalInUSD} from '@/utils/utils';
import { symbol } from 'prop-types';
import {constantInstance} from '@/constants';
const uniqueTokens = constantInstance.tokenList;
const apiUrlPrefix = constantInstance.farmSetting.API_URL;

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

export async function fetchTokenDayData(client, tokenId) {
  const { loading, error, data } = await client.query({
    query: GET_TOKEN_DAY_DATA,
    variables: {
      tokenId: tokenId,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  console.log(data);

  return [data.tokenDayDatas, data.pairs0, data.pairs1];
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

  console.log("token data",newData);

  return sortTable(newData,'volume24h',true);
  
}

export async function fetchGeneralTokenInfo() {
  // FOLLOWING CODE WILL BE WORKING ONCE THE SERVICE IS ON !
  tokensPriceUSD = await getAllSuportedTokensPrice();
  try{
    let request = `${apiUrlPrefix}/poolchart/all`;
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

  return sortTable(
    [...data.asAddress, ...data.asSymbol, ...data.asName]
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
      .map(item => ({
        id: item.id,
        name: item.name,
        symbol: item.symbol,
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

// fetch individual token history
