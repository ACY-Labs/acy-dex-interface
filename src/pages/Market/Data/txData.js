import { GET_GLOBAL_TRANSACTIONS , FILTERED_TRANSACTIONS } from './query';
import { TransactionType, sortTable } from '../Util';
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
const FILTERED_AMOUNT = 50;

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
  let mints = data.mints
  let burns = data.burns
  let swaps = data.swaps


  // get all burns
  for (let j = 0; j < TRANSACTION_AMOUNT; j++) {
    globalTransactions.push(
      convertTx(burns[j], burns[j].transaction.id, burns[j].transaction.timestamp, TransactionType.REMOVE)
    );
  }

  // get all mints
  for (let j = 0; j < TRANSACTION_AMOUNT; j++) {
    globalTransactions.push(
      convertTx(mints[j], mints[j].transaction.id, mints[j].transaction.timestamp, TransactionType.ADD)
    );
  }

  // get all swaps
  for (let j = 0; j < TRANSACTION_AMOUNT; j++) {
    globalTransactions.push(
      convertTx(swaps[j], swaps[j].transaction.id, swaps[j].transaction.timestamp, TransactionType.SWAP)
    );
  }

  return sortTable(globalTransactions, "time", true);
}

// get transaction from pool
export async function fetchFilteredTransaction(client, pairAddresses) {
  const { loading, error, data } = await client.query({
    query: FILTERED_TRANSACTIONS,
    variables: {
      txAmount: FILTERED_AMOUNT,
      allPairs: pairAddresses
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  let globalTransactions = [];
  let mints = data.mints
  let burns = data.burns
  let swaps = data.swaps


  // get all burns
  for (let j = 0; j < FILTERED_AMOUNT; j++) {
    globalTransactions.push(
      convertTx(burns[j], burns[j].transaction.id, burns[j].transaction.timestamp, TransactionType.REMOVE)
    );
  }

  // get all mints
  for (let j = 0; j < FILTERED_AMOUNT; j++) {
    globalTransactions.push(
      convertTx(mints[j], mints[j].transaction.id, mints[j].transaction.timestamp, TransactionType.ADD)
    );
  }

  // get all swaps
  for (let j = 0; j < FILTERED_AMOUNT; j++) {
    globalTransactions.push(
      convertTx(swaps[j], swaps[j].transaction.id, swaps[j].transaction.timestamp, TransactionType.SWAP)
    );
  }

  return sortTable(globalTransactions, "time", true);
}
