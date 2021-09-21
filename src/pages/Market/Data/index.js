import {fetchMarketData} from './marketData'
import {fetchGlobalTransaction} from './txData'
import {fetchGeneralTokenInfo} from './tokenData'
import {fetchGeneralPoolInfoDay} from './poolData'
import {marketClient} from './client'

const DataFetch = {
    marketClient, 
    fetchMarketData,
    fetchGlobalTransaction,
    fetchGeneralTokenInfo,
    fetchGeneralPoolInfoDay
}

export {
    DataFetch as default,
    fetchMarketData,
    marketClient,
    fetchGlobalTransaction,
    fetchGeneralTokenInfo,
    fetchGeneralPoolInfoDay
}