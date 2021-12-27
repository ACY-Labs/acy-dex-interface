import { GET_GLOBAL_TRANSACTIONS , FILTERED_TRANSACTIONS } from './query';
import { TransactionType, sortTable } from '../Util';
import { convertTx } from './util';
import axios from 'axios';
import {getTransactionsByAccount} from '@/utils/txData'
import { getLibrary } from '../ConnectWallet';
import {getAllSuportedTokensPrice} from "@/acy-dex-swap/utils"
import ConstantLoader from "@/constants";
const apiUrlPrefix = ConstantLoader().farmSetting.API_URL;

const TRANSACTION_AMOUNT = 250;
const FILTERED_AMOUNT = 50;

//function to parse tx list to fit in datasource
function parseTransactionList(data){
    
  const _txList = data.map((item) => {
    return {
      account: item.address,
      coin1: item.token1Symbol,
      coin1Amount: item.token1Number,
      coin2: item.token2Symbol,
      coin2Amount: item.token2Number,
      time: item.transactionTime,
      totalValue: 0,
      transactionID: item.hash,
      type: item.action
    }
  })

  return _txList;
}



export async function fetchGlobalTransaction(){
  try{
    let request = ACY_API+'txlist/all?'+'range=50';
    // let request = 'http://localhost:3001/api/users/all';
    let response = await fetch(request);
    let data = await response.json();
    // console.log(data.data);
    return parseTransactionList(data.data);
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
// get transaction from pool
export async function fetchTransactionsForPair(token1,token2){
  console.log("fetching txlist for tokens ", token1, token2);
  try{
    let request = ACY_API+'txlist/pair?'+'token1='+token1+'&&token2='+token2+'&&range=50';
    // let request = 'http://localhost:3001/api/users/all';
    let response = await fetch(request);
    let data = await response.json();
    // console.log(data.data);
    return parseTransactionList(data.data);
  }catch (e){
    console.log('service not available yet',e);
    return null;
  }
}
