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

async function parseGlobalTransaction(address,library){

    let txList = [];

    const [userSwapTx,userLiquidityTx] = await getTransactionsByAccount(address,library,'ALL');
    const _swaptx = userSwapTx.map((item) => {
      return {
      account: item.address,
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

    const _liquiditytx = userLiquidityTx.map((item) => {
    return {
      account: item.address,
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

export async function fetchGlobalTransaction(library){
  try{
    // let request = 'https://api.acy.finance/api/users/all';
    // let request = 'http://localhost:3001/api/users/all';
    // let response = await fetch(request);
    let ACY_ROUTER = "0x4DCa8E42634abdE1925ebB7f82AC29Ea00d34bA2";
    // let data = await response.json();
    // console.log(data.data);
    let globalTransactions = await parseGlobalTransaction(ACY_ROUTER,library);
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
// get transaction from pool
export async function fetchFilteredTransaction(symbol) {
  const range = 50;
  return await axios.get(`${apiUrlPrefix}/txlist/token?symbol=${symbol}&range=${range}`).then(async res => {
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
        const data = res.data.data;
        // FIXME: now using current token price to calculate
        const priceDict = await getAllSuportedTokensPrice();

        const formattedTransactions = data.map(tx => {
          const {
            address: account, 
            hash: transactionID, 
            token1Number: coin1Amount, 
            token1Symbol: coin1, 
            token2Number: coin2Amount, 
            token2Symbol: coin2, 
            transactionTime: time, 
            action: type
          } = tx;
          
          let typeEnum;
          switch (type) {
            case "Swap": typeEnum = TransactionType.SWAP; break;
            case "Add": typeEnum = TransactionType.ADD; break;
            case "Remove": typeEnum = TransactionType.REMOVE; break;
            default: typeEnum = TransactionType.ALL; break;
          }
          
          const totalValue = priceDict[coin2] * coin2Amount;
          return {account, transactionID, coin1Amount, coin1, coin2Amount, coin2, time, type: typeEnum}
        })
        
        return formattedTransactions;
      })

  
}
