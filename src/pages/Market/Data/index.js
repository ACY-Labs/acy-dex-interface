import {fetchMarketData} from './marketData'
import {fetchGlobalTransaction} from './txData'
import {fetchGeneralTokenInfo} from './tokenData'
import {marketClient} from './client'

const DataFetch = {
    marketClient, 
    fetchMarketData,
    fetchGlobalTransaction,
    fetchGeneralTokenInfo
}

export {
    DataFetch as default,
    fetchMarketData,
    marketClient,
    fetchGlobalTransaction,
    fetchGeneralTokenInfo
}