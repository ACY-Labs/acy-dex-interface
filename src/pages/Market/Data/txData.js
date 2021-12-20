import { GET_GLOBAL_TRANSACTIONS , FILTERED_TRANSACTIONS } from './query';
import { TransactionType, sortTable } from '../Util';
import { convertTx } from './util';
import axios from 'axios';
import {getTransactionsByAccount} from '@/utils/txData'
import { getLibrary } from '../ConnectWallet';

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

async function parseGlobalTransaction(userList,library){
   let txList = [];
   let finalTxList = [];

  for (const user of userList) {
     console.log(user)
     const userSwapTx = await getTransactionsByAccount(user,library,'SWAP');
     const _swaptx = userSwapTx.map((item) => {
       return {
        account: user,
        coin1: item.inputTokenSymbol,
        coin1Amount: item.inputTokenNum,
        coin2: item.outTokenSymbol,
        coin2Amount: item.outTokenNum,
        time: item.transactionTime,
        totalValue: item.totalToken,
        transactionID: item.hash,
        type: "Swap"
       }
     })
     const userLiquidityTx = await getTransactionsByAccount(user,library, 'LIQUIDITY');

     const _liquiditytx = userLiquidityTx.map((item) => {
      return {
       account: user,
       coin1: item.token1Symbol,
       coin1Amount: item.token1Number,
       coin2: item.token2Symbol,
       coin2Amount: item.token2Number,
       time: item.transactionTime,
       totalValue: item.totalToken,
       transactionID: item.hash,
       type: item.action
      }
    })

     txList.push(..._swaptx);
     txList.push(..._liquiditytx);
   }

   return sortTable(txList, "time", true);
}

export async function fetchGlobalTransaction(library){
  try{
    let request = 'https://api.acy.finance/api/users/all';
    // let request = 'http://localhost:3001/api/users/all';
    let response = await fetch(request);
    let data = await response.json();
    console.log(data.data);
    let globalTransactions = await parseGlobalTransaction(data.data,library);
    return globalTransactions;
  }catch (e){
    console.log('service not available yet',e);
    return null;
  }
}

async function parseAccountTransaction(user,library){
  let txList = [];
  let finalTxList = [];

    const userSwapTx = await getTransactionsByAccount(user,library,'SWAP');
    const _swaptx = userSwapTx.map((item) => {
      return {
       account: user,
       coin1: item.inputTokenSymbol,
       coin1Amount: item.inputTokenNum,
       coin2: item.outTokenSymbol,
       coin2Amount: item.outTokenNum,
       time: item.transactionTime,
       totalValue: item.totalToken,
       transactionID: item.hash,
       type: "Swap"
      }
    })
    const userLiquidityTx = await getTransactionsByAccount(user,library, 'LIQUIDITY');

    const _liquiditytx = userLiquidityTx.map((item) => {
     return {
      account: user,
      coin1: item.token1Symbol,
      coin1Amount: item.token1Number,
      coin2: item.token2Symbol,
      coin2Amount: item.token2Number,
      time: item.transactionTime,
      totalValue: item.totalToken,
      transactionID: item.hash,
      type: item.action
     }
   })

  txList.push(..._swaptx);
  txList.push(..._liquiditytx);

  return sortTable(txList, "time", true);
}

export async function fetchAccountTransaction(account, library) {
  try{
    let accountTransactions = await parseAccountTransaction(account, library);
    return accountTransactions;
  }catch (e){
    console.log('service not available yet',e);
    return null;
  }
}


async function parseTopExchangeVolume(userList,library){
  let txList = [];
  let finalTxList = [];

 for (const user of userList) {
    console.log(user)
    const userSwapTx = await getTransactionsByAccount(user,library,'SWAP');
    const _swaptx = userSwapTx.map((item) => {
      return {
       account: user,
       coin1: item.inputTokenSymbol,
       coin1Amount: item.inputTokenNum,
       coin2: item.outTokenSymbol,
       coin2Amount: item.outTokenNum,
       time: item.transactionTime,
       totalValue: item.totalToken,
       transactionID: item.hash,
       type: "Swap"
      }
    })
    const userLiquidityTx = await getTransactionsByAccount(user,library, 'LIQUIDITY');

    const _liquiditytx = userLiquidityTx.map((item) => {
     return {
      account: user,
      coin1: item.token1Symbol,
      coin1Amount: item.token1Number,
      coin2: item.token2Symbol,
      coin2Amount: item.token2Number,
      time: item.transactionTime,
      totalValue: item.totalToken,
      transactionID: item.hash,
      type: item.action
     }
   })

    txList.push(..._swaptx);
    txList.push(..._liquiditytx);
  }

  return sortTable(txList, "totalValue", true);
}

export async function fetchTopExchangeVolume(library){
 try{
   let request = 'https://api.acy.finance/api/users/all';
   let response = await fetch(request);
   let data = await response.json();
   console.log(data.data);
   let topExchangeVolume = await parseTopExchangeVolume(data.data,library);
   return topExchangeVolume;
 }catch (e){
   console.log('service not available yet',e);
   return null;
 }
}

// get all transactions
// export async function fetchGlobalTransaction(client) {
//   const { loading, error, data } = await client.query({
//     query: GET_GLOBAL_TRANSACTIONS,
//     variables: {
//       txAmount: TRANSACTION_AMOUNT,
//     },
//   });

//   if (loading) return null;
//   if (error) return `Error! ${error}`;

//   let globalTransactions = [];
//   let mints = data.mints
//   let burns = data.burns
//   let swaps = data.swaps


//   // get all burns
//   for (let j = 0; j < burns.length; j++) {
//     globalTransactions.push(
//       convertTx(burns[j], burns[j].transaction.id, burns[j].transaction.timestamp, TransactionType.REMOVE)
//     );
//   }

//   // get all mints
//   for (let j = 0; j < mints.length; j++) {
//     globalTransactions.push(
//       convertTx(mints[j], mints[j].transaction.id, mints[j].transaction.timestamp, TransactionType.ADD)
//     );
//   }

//   // get all swaps
//   for (let j = 0; j < swaps.length; j++) {
//     globalTransactions.push(
//       convertTx(swaps[j], swaps[j].transaction.id, swaps[j].transaction.timestamp, TransactionType.SWAP)
//     );
//   }

//   return sortTable(globalTransactions, "time", true);
// }

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
  for (let j = 0; j < burns.length; j++) {
    globalTransactions.push(
      convertTx(burns[j], burns[j].transaction.id, burns[j].transaction.timestamp, TransactionType.REMOVE)
    );
  }

  // get all mints
  for (let j = 0; j < mints.length; j++) {
    globalTransactions.push(
      convertTx(mints[j], mints[j].transaction.id, mints[j].transaction.timestamp, TransactionType.ADD)
    );
  }

  // get all swaps
  for (let j = 0; j < swaps.length; j++) {
    globalTransactions.push(
      convertTx(swaps[j], swaps[j].transaction.id, swaps[j].transaction.timestamp, TransactionType.SWAP)
    );
  }

  return sortTable(globalTransactions, "time", true);
}
