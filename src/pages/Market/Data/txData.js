import { GET_GLOBAL_TRANSACTIONS } from './query';
import { TransactionType } from '../Util';
import { convertTx } from './util';

// SAMPLE TRANSACTION DATA
// {
//     coin1: 'USDC',
//     coin2: 'WBTC',
//     type: TransactionType.SWAP,
//     totalValue: 57385063.19,
//     coin1Amount: 63.52037022,
//     coin2Amount: 93.65125987,
//     account: '0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f',
//     time: '2021-09-01T04:02:39Z',
//     transactionID: ''
// }

const TRANSACTION_AMOUNT = 250;
// get all transactions
export async function fetchGlobalTransaction(client) {
  const { loading, error, data } = await client.query({
    query: GET_GLOBAL_TRANSACTIONS,
    variables: {
      txAmount: TRANSACTION_AMOUNT,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  let globalTransactions = [];
  let transactionsRaw = data.transactions;

  for (let i = 0; i < TRANSACTION_AMOUNT; i++) {
    let txId = transactionsRaw[i].id;
    let txTime = parseInt(transactionsRaw[i].timestamp);

    // get all burns
    for (let j = 0; j < transactionsRaw[i].burns.length; j++) {
      globalTransactions.push(
        convertTx(transactionsRaw[i].burns[j], txId, txTime, TransactionType.REMOVE)
      );
    }

    // get all mints
    for (let j = 0; j < transactionsRaw[i].mints.length; j++) {
      globalTransactions.push(
        convertTx(transactionsRaw[i].mints[j], txId, txTime, TransactionType.ADD)
      );
    }

    // get all swaps
    for (let j = 0; j < transactionsRaw[i].swaps.length; j++) {
      globalTransactions.push(
        convertTx(transactionsRaw[i].swaps[j], txId, txTime, TransactionType.SWAP)
      );
    }
  }

  return globalTransactions;
}

// get transaction from token

// get transaction from pool
