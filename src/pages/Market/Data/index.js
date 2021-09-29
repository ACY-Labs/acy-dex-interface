import { fetchMarketData } from './marketData';
import { fetchGlobalTransaction, fetchFilteredTransaction } from './txData';
import {
  fetchGeneralTokenInfo,
  fetchTokenDayData,
  fetchTokenInfo,
  fetchTokenSearch,
  fetchTokensFromId,
  fetchTokenDaySimple
} from './tokenData';
import {
  fetchGeneralPoolInfoDay,
  fetchPoolDayData,
  fetchPoolInfo,
  fetchPoolSearch,
  fetchPoolsFromId,
} from './poolData';
import {
  fetchTopLP
} from './accountData'
import { getBlocksFromTimestamps } from './blocks';
import { marketClient } from './client';

const DataFetch = {
  marketClient,
  fetchMarketData,
  fetchGlobalTransaction,
  fetchGeneralTokenInfo,
  fetchGeneralPoolInfoDay,
  fetchTokenDayData,
  fetchPoolDayData,
  fetchFilteredTransaction,
  fetchPoolInfo,
  fetchTokenInfo,
  fetchTokenSearch,
  fetchPoolSearch,
  fetchTokensFromId,
  fetchPoolsFromId,
  fetchTokenDaySimple,
  fetchTopLP
};

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
  fetchPoolInfo,
  fetchTokenInfo,
  fetchTokenSearch,
  fetchPoolSearch,
  fetchTokensFromId,
  fetchPoolsFromId,
  fetchTokenDaySimple,
  fetchTopLP
};
