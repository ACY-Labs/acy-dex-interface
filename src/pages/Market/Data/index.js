import { fetchMarketData } from './marketData';
import { fetchGlobalTransaction, fetchTransactionsForPair, fetchAccountTransaction, fetchTopExchangeVolume } from './txData';
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
import { fetchTotalFeesPaid, fetchLiqudityIncludingFees, fetchTotalValueSwapped, fetchTotalTransactions} from './walletStats';

const DataFetch = {
  marketClient,
  fetchMarketData,
  fetchGlobalTransaction,
  fetchGeneralTokenInfo,
  fetchGeneralPoolInfoDay,
  fetchTokenDayData,
  fetchPoolDayData,
  fetchTransactionsForPair,
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
  fetchTransactionsForPair,
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
};
