import axios from 'axios';
import { getAddress } from '@ethersproject/address';
import {API_URL} from "@/constants";
// const apiUrlPrefix = API_URL();

export async function fetchTotalValueSwapped(account){
  try {
      let request = `${API_URL()}/users/stats?address=${account}`;
      let response = await fetch(request);
      let data = await response.json();
      console.log(data.data)
      // user does not exist
      if (data.data === null) {
        return "$0"
      }

      // get totalValueSwapped
      let totalValueSwapped = data.data.totalSwappedValue; 
      let totalValueSwappedStr;
      if (totalValueSwapped >= 1000000) {
        totalValueSwappedStr = `$${(totalValueSwapped / 1000000).toFixed(2)}mil`;
      } else if (totalValueSwapped >= 1000) {
        totalValueSwappedStr = `$${(totalValueSwapped / 1000).toFixed(2)}k`;
      } else {
        totalValueSwappedStr = `$${(totalValueSwapped).toFixed(2)}`;
      }
      return totalValueSwappedStr;
    }catch (e){
      console.log('service not available yet',e);
      return null;
    }
}

export async function fetchTotalFeesPaid(account){
  try {
      let request = `${API_URL()}/users/stats?address=${account}`;
      let response = await fetch(request);
      let data = await response.json();

      if (data.data === null) {
        return "$0"
      }
    
      // get totalFeesPaid 
      let totalFeesPaid = data.data.totalFeesPaid; 
      let totalFeesPaidStr;
      if (totalFeesPaid >= 1000000) {
        totalFeesPaidStr = `$${(totalFeesPaid / 1000000).toFixed(2)}mil`;
      } else if (totalFeesPaid >= 1000) {
        totalFeesPaidStr = `$${(totalFeesPaid / 1000).toFixed(2)}k`;
      } else {
        totalFeesPaidStr = `$${(totalFeesPaid).toFixed(2)}`;
      }
      return totalFeesPaidStr;
    }catch (e){
      console.log('service not available yet',e);
      return null;
    }
}

export async function fetchTotalTransactions(account){
  try {
      let request = `${API_URL()}/users/stats?address=${account}`;
      let response = await fetch(request);
      let data = await response.json();

      if (data.data === null) {
        return "0"
      }
      // get totalTransactions (dummy data)
      let totalTransactions = data.data.totalTransactions; 
      let totalTransactionsStr;
      if (totalTransactions >= 1000000) {
        totalTransactionsStr = `${(totalTransactions / 1000000).toFixed(2)}mil`;
      } else if (totalTransactions >= 1000) {
        totalTransactionsStr = `${(totalTransactions / 1000).toFixed(2)}k`;
      } else {
        totalTransactionsStr = `${(totalTransactions)}`;
      }
      return totalTransactionsStr;
    }catch (e){
      console.log('service not available yet',e);
      return null;
    }
}
  
export async function fetchLiqudityIncludingFees(account) {
  console.log(account)
  try {
    let request = `${API_URL()}/users/stats?address=${account}`;
    let response = await fetch(request);
    let data = await response.json();

    if (data.data === null) {
      return "$0"
    }
    
    // get liquidityIncludingFees (dummy data)
    let liquidityIncludingFees = 0; 
    let liquidityIncludingFeesStr;
    if (liquidityIncludingFees >= 1000000) {
      liquidityIncludingFeesStr = `$${(liquidityIncludingFees / 1000000).toFixed(2)}mil`;
    } else if (liquidityIncludingFees >= 1000) {
      liquidityIncludingFeesStr = `$${(liquidityIncludingFees / 1000).toFixed(2)}k`;
    } else {
      liquidityIncludingFeesStr = `$${(liquidityIncludingFees).toFixed(2)}`;
    }
    return liquidityIncludingFeesStr;
  }catch (e){
    console.log('service not available yet',e);
    return null;
  }
}