import { GET_GLOBAL_TRANSACTIONS , FILTERED_TRANSACTIONS } from './query';
import { TransactionType, sortTable } from '../Util';
import { convertTx, ACY_ROUTER } from './util';
import axios from 'axios';
import {getTransactionsByAccount} from '@/utils/txData'
import { getLibrary } from '../ConnectWallet';

import {getAllSuportedTokensPrice, getAllSuportedTokensPrice_forMarket} from "@/acy-dex-swap/utils"
import { totalInUSD } from '@/utils/utils';
import {API_URL, MARKET_API_URL} from '@/constants';
// const apiUrlPrefix = API_URL();    
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

//function to parse tx list to fit in datasource
async function parseTransactionList(data){


  const tokensPriceUSD = await getAllSuportedTokensPrice_forMarket();

  let _txList = data.filter(item=>item.token1Number!=null);

  console.log("pringting filtered tx",_txList);
    
  _txList = _txList.map((item) => {
    let totalValue;
    item.action == 'Swap' ? 
    
    totalValue = totalInUSD([{
      token : item.token1Symbol,
      amount : item.token1Number
    }],tokensPriceUSD) 
    
    : totalValue = totalInUSD([{
      token : item.token1Symbol,
      amount : item.token1Number}
      ,

      {token : item.token2Symbol,
      amount : item.token2Number
    }],tokensPriceUSD);

    return {
      account: item.address,
      coin1: item.token1Symbol,
      coin1Amount: item.token1Number,
      coin2: item.token2Symbol,
      coin2Amount: item.token2Number,
      time: item.transactionTime,
      totalValue: totalValue,
      transactionID: item.hash,
      type: item.action
    }
  })

  return _txList.filter(item => item.coin1Amount !=0 );
}



export async function fetchGlobalTransaction(){
  try{
    //let request = API_URL()+'/txlist/all?'+'range=50';
    let request = MARKET_API_URL()+'/txlist/all?'+'range=50';
    // let request = 'http://localhost:3001/api/users/all';

    let response = await fetch(request);
    let data = await response.json();

    // console.log(data.data);
    return await parseTransactionList(data.data);
  }catch (e){
    console.log('service not available yet',e);
    return [];
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
   //let request = `${API_URL()}/users/all`;
   let request = `${MARKET_API_URL()}/users/all`;
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
    //let request = API_URL()+'/txlist/pair?'+'token1='+token1+'&&token2='+token2+'&&range=50';
    let request = MARKET_API_URL()+'/txlist/pair?'+'token1='+token1+'&&token2='+token2+'&&range=50';
    // let request = 'http://localhost:3001/api/users/all';
    let response = await fetch(request);
    let data = await response.json();
    // console.log(data.data);
    return await parseTransactionList(data.data);
  }catch (e){
    console.log('service not available yet',e);
    return [];
  }
}

export async function fetchTransactionsForToken(token){
  console.log("fetching txlist for tokens ", token);
  try{
    //let request = API_URL()+'/txlist/token?'+'symbol='+token+'&&range=50';
    let request = MARKET_API_URL()+'/txlist/token?'+'symbol='+token+'&&range=50';
    // let request = 'http://localhost:3001/api/users/all';
    let response = await fetch(request);
    let data = await response.json();
    // console.log(data.data);
    return await parseTransactionList(data.data);
  }catch (e){
    console.log('service not available yet',e);
    return [];
  }
}