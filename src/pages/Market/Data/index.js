import {fetchMarketData} from './marketData'
import {fetchGlobalTransaction, fetchFilteredTransaction} from './txData'
import {fetchGeneralTokenInfo, fetchTokenDayData} from './tokenData'
import {fetchGeneralPoolInfoDay, fetchPoolDayData, fetchPoolInfo} from './poolData'
import {getBlocksFromTimestamps} from './blocks'
import {marketClient} from './client'

const DataFetch = {
    marketClient, 
    fetchMarketData,
    fetchGlobalTransaction,
    fetchGeneralTokenInfo,
    fetchGeneralPoolInfoDay,
    fetchTokenDayData,
    fetchPoolDayData,
    fetchFilteredTransaction,
    fetchPoolInfo
}

export {
    DataFetch as default,
    fetchMarketData,
    marketClient,
    fetchGlobalTransaction,
    fetchGeneralTokenInfo,
    fetchGeneralPoolInfoDay,
    fetchTokenDayData,
    fetchPoolDayData,
    fetchFilteredTransaction,
    fetchPoolInfo
}