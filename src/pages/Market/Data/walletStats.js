import axios from 'axios';

export async function fetchTotalValueSwapped(account){
  try {
      // TODO: api for totalValueSwapped
      let request = 'https://api.acy.finance/api/users/all';
      let response = await fetch(request);
      let data = await response.json();

      // get totalValueSwapped (dummy data)
      let totalValueSwapped = 10000; 
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
      // TODO: api for totalFeesPaid
      let request = 'https://api.acy.finance/api/users/all';
      let response = await fetch(request);
      let data = await response.json();

      // get totalFeesPaid (dummy data)
      let totalFeesPaid = 10; 
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
      // TODO: api for totalTransactions
      let request = 'https://api.acy.finance/api/users/all';
      let response = await fetch(request);
      let data = await response.json();

      // get totalTransactions (dummy data)
      let totalTransactions = 10000; 
      let totalTransactionsStr;
      if (totalTransactions >= 1000000) {
        totalTransactionsStr = `$${(totalTransactions / 1000000).toFixed(2)}mil`;
      } else if (totalTransactions >= 1000) {
        totalTransactionsStr = `$${(totalTransactions / 1000).toFixed(2)}k`;
      } else {
        totalTransactionsStr = `$${(totalTransactions).toFixed(2)}`;
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
    // TODO: api for liquidityIncludingFees
    let request = 'https://api.acy.finance/api/users/all';
    let response = await fetch(request);
    let data = await response.json();

    // get liquidityIncludingFees (dummy data)
    let liquidityIncludingFees = 10; 
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