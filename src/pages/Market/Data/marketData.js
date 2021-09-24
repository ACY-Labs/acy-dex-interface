import { useQuery } from '@apollo/client';
import {GET_MARKET_DATA} from './query'


// get market info snapshot
export async function fetchMarketInfo(client, timestamp){
    return;
}

// get general market data
export async  function fetchMarketData(client){

    const { loading, error, data } = await client.query({
        query: GET_MARKET_DATA,
        variables: {
            "startTime": 1619170975,
            "skip": 0
        },
    });


    if (loading) return null;
    if (error) return `Error! ${error}`;

    // convert data in to graph-compatible format (SEE SAMPLE graphSampleData)
    let dataDict = {
        tvl: [],
        volume24h: [],
    }

    let dayData = data.uniswapDayDatas
    let remappedData = dayData.map(item => [new Date(item.date * 1000).toLocaleDateString('en-CA'), parseFloat(item.dailyVolumeUSD)])
    dataDict.volume24h = remappedData

    remappedData = dayData.map(item => [new Date(item.date * 1000).toLocaleDateString('en-CA'), parseFloat(item.totalLiquidityUSD)])
    dataDict.tvl = remappedData

    return dataDict
}