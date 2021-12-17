import { useQuery } from '@apollo/client';
import {GET_MARKET_DATA} from './query';
import axios from 'axios';
import {getAllSuportedTokensPrice} from '@/acy-dex-swap/utils/index';

import {findTokenWithAddress} from '@/utils/txData';
import {totalInUSD} from '@/utils/utils'



// get market info snapshot
export async function fetchMarketInfo(client, timestamp){
    return;
}

// get general market data
// export async  function fetchMarketData(client){

//     const { loading, error, data } = await client.query({
//         query: GET_MARKET_DATA,
//         variables: {
//             "startTime": 1619170975,
//             "skip": 0
//         },
//     });


//     if (loading) return null;
//     if (error) return `Error! ${error}`;

//     // convert data in to graph-compatible format (SEE SAMPLE graphSampleData)
//     let dataDict = {
//         tvl: [],
//         volume24h: [],
//     }

//     let dayData = data.uniswapDayDatas
//     let remappedData = dayData.map(item => [new Date(item.date * 1000).toLocaleDateString('en-CA'), parseFloat(item.dailyVolumeUSD)])
//     dataDict.volume24h = remappedData

//     remappedData = dayData.map(item => [new Date(item.date * 1000).toLocaleDateString('en-CA'), parseFloat(item.totalLiquidityUSD)])
//     dataDict.tvl = remappedData

//     return dataDict
// }

var tokensPriceUSD ;

function parseMarketData (data){
    let tvlArr = [];
    let volArr = []
    var d = new Date();
    d.setDate(d.getDate()-19);
    for (let i=0;i<20;i++){
        tvlArr.push([d.toISOString().substring(0, 10),0]);
        volArr.push([d.toISOString().substring(0, 10),0]);
        d.setDate(d.getDate()+1);
    }
    data.forEach(element => {
        let _token0 = findTokenWithAddress(element.token0).symbol;
        let _token1 = findTokenWithAddress(element.token1).symbol;

        element.historicalData.forEach(item => {
            let at = tvlArr.findIndex(index => index[0] == item.date);
            let currTVL = totalInUSD([
                {
                    token : _token0,
                    amount : item.reserves.token0
                },
                {
                    token : _token1,
                    amount : item.reserves.token1
                }
            ], tokensPriceUSD);
            let currVolume = totalInUSD([
                {
                    token : _token0,
                    amount : item.volume24h.token0
                },
                {
                    token : _token1,
                    amount : item.volume24h.token1
                }
            ], tokensPriceUSD);

            if(at>=0){
                tvlArr[at][1] += currTVL;
                volArr[at][1] += currVolume;
            }
        })
    });

    let output = {
        tvl : tvlArr,
        volume24h : volArr,
    }

    return output;
}

export async  function fetchMarketData () {
    // FOLLOWING CODE WILL BE WORKING ONCE THE SERVICE IS ON !
  tokensPriceUSD = await getAllSuportedTokensPrice();
  try{
    // let request = 'https://api.acy.finance/api/poolchart/historical';
    let request = 'http://localhost:3001/api/poolchart/historical';
    let response = await fetch(request);
    let data = await response.json();
    return parseMarketData(data.data);
  }catch (e){
    console.log('service not available yet',e);
    return [];
  }
}