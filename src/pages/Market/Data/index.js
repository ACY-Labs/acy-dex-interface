import {fetchMarketData} from './marketData'
import {marketClient} from './client'

const DataFetch = {
    marketClient, 
    fetchMarketData
}

export {
    DataFetch as default,
    fetchMarketData,
    marketClient
}