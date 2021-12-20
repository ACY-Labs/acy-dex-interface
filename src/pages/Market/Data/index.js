import { fetchMarketData } from './marketData';
import { fetchGlobalTransaction, fetchFilteredTransaction, fetchAccountTransaction } from './txData';
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
} from './poolData';
import {
  fetchTopLP,
  fetchUserSnapshot,
  fetchPoolsFromAccount,
  fetchTopExchangeVolumes,
} from './accountData';
import { getBlocksFromTimestamps } from './blocks';
import { marketClient } from './client';
import { fetchEthPrice } from './eth';

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
  fetchUserSnapshot,
  fetchEthPrice,
  fetchTopExchangeVolumes,
  fetchAccountTransaction,
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
  fetchUserSnapshot,
  fetchEthPrice,
  fetchTopExchangeVolumes,
  fetchAccountTransaction,
};
