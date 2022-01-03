import { fetchMarketData } from './marketData';
import { fetchGlobalTransaction, fetchTransactionsForPair,fetchTransactionsForToken, fetchAccountTransaction, fetchTopExchangeVolume } from './txData';
import {
  fetchGeneralTokenInfo,
  fetchTokenDayData,
  fetchTokenInfo,
  fetchTokenSearch,
  fetchTokensFromId,
  fetchTokenDaySimple,
  fetchSearchCoinReturns,
} from './tokenData';
import {
  fetchGeneralPoolInfoDay,
  fetchPoolDayData,
  fetchPoolDayDataForPair,
  fetchPoolInfo,
  fetchPoolSearch,
  fetchPoolsFromId,
  fetchSearchPoolReturns,
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
import {
  fetchTotalFeesPaid,
  fetchLiqudityIncludingFees,
  fetchTotalValueSwapped,
  fetchTotalTransactions
} from './walletStats';

const DataFetch = {
  marketClient,
  fetchMarketData,
  fetchGlobalTransaction,
  fetchGeneralTokenInfo,
  fetchGeneralPoolInfoDay,
  fetchTokenDayData,
  fetchPoolDayData,
  fetchPoolDayDataForPair,
  fetchTransactionsForPair,
  fetchTransactionsForToken,
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
  fetchTopExchangeVolume,
  fetchAccountTransaction,
  fetchTotalFeesPaid,
  fetchLiqudityIncludingFees,
  fetchTotalValueSwapped,
  fetchTotalTransactions,
  fetchSearchCoinReturns,
  fetchSearchPoolReturns,
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
  fetchPoolDayDataForPair,
  fetchTransactionsForPair,
  fetchTransactionsForToken,
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
  fetchTopExchangeVolume,
  fetchTotalFeesPaid,
  fetchLiqudityIncludingFees,
  fetchTotalValueSwapped,
  fetchTotalTransactions,
  fetchSearchCoinReturns,
  fetchSearchPoolReturns,
};
