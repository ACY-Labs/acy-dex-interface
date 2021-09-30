import { fetchMarketData } from './marketData';
import { fetchGlobalTransaction, fetchFilteredTransaction } from './txData';
import {
  fetchGeneralTokenInfo,
  fetchTokenDayData,
  fetchTokenInfo,
  fetchTokenSearch,
  fetchTokensFromId,
  fetchTokenDaySimple,
} from './tokenData';
import {
  fetchGeneralPoolInfoDay,
  fetchPoolDayData,
  fetchPoolInfo,
  fetchPoolSearch,
  fetchPoolsFromId,
  fetchPoolsFromAccount,
} from './poolData';
import {
  fetchTopLP,
  fetchTopExchangeVolumes
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
  fetchPoolsFromAccount,
  fetchTokenDaySimple,
  fetchTopLP,
  fetchTopExchangeVolumes
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
  fetchPoolsFromAccount,
  fetchTokenDaySimple,
  fetchTopLP,
  fetchTopExchangeVolumes
};
