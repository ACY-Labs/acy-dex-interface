import { useQuery } from '@apollo/client';
import {GET_MARKET_DATA} from './query';
import axios from 'axios';
import {getAllSuportedTokensPrice, getAllSuportedTokensPrice_forMarket} from '@/acy-dex-swap/utils/index';

import {findTokenWithAddress, findTokenWithAddress_market} from '@/utils/txData';
import {totalInUSD} from '@/utils/utils'
import {API_URL, MARKET_API_URL} from '@/constants';

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
    d.setDate(d.getDate()-49);
    for (let i=0;i<50;i++){
        tvlArr.push([d.toISOString().substring(0, 10),0]);
        volArr.push([d.toISOString().substring(0, 10),0]);
        d.setDate(d.getDate()+1);
    }
    data.forEach(element => {
        //let _token0 = findTokenWithAddress(element.token0).symbol;
        //let _token1 = findTokenWithAddress(element.token1).symbol;

        let _token0 = findTokenWithAddress_market(element.token0).symbol;
        let _token1 = findTokenWithAddress_market(element.token1).symbol;

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
  //tokensPriceUSD = await getAllSuportedTokensPrice();
  tokensPriceUSD = await getAllSuportedTokensPrice_forMarket();
  try{
    //const apiUrlPrefix = API_URL();
    const apiUrlPrefix = MARKET_API_URL();
    let request = `${apiUrlPrefix}/poolchart/historical/all`;
    let response = await fetch(request);
    let data = await response.json();
    console.log("BUG HERE:",request,data)
    return parseMarketData(data.data);
  }catch (e){
    console.log('service not available yet',e);
    return null;
  }
}

export async function fetchMarketData_ver2() {
    tokensPriceUSD = await getAllSuportedTokensPrice();
    try {
        
    } catch (error) {
        console.log('service not available yet',error);
        return null;
    }
    
}