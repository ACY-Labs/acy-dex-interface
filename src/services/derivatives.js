import { ethers } from 'ethers'
import * as Api from '@/acy-dex-futures/Api';
import { bigNumberify } from '@/acy-dex-futures/utils'

export async function addMargin(
  chainId,
  library,
  routerAddress,
  Router,
  token,
  tokenAmount,
  symbol,
) {
  const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner())

  let method = "addMargin"
  let params = [
    token.address,  //token address
    ethers.utils.parseUnits(tokenAmount, token.decimals),  //amount
    symbol,  //token symbol
    [], //oracleSignature
  ]

  const successMsg = `Order Submitted!`

  if (token.address === ethers.constants.AddressZero) {     // native token
    let value = ethers.utils.parseUnits(tokenAmount, token.decimals)
    Api.callContract(chainId, contract, method, params, {
      value: value,
      sentMsg: `Submitted.`,
      failMsg: `Failed.`,
      successMsg,
    })
      .then(() => { })
      .catch(e => { console.log(e) })
  } else {                                               // other ERC20 token, e.g. BTC
    Api.callContract(chainId, contract, method, params, {
      sentMsg: `Submitted.`,
      failMsg: `Failed.`,
      successMsg,
    })
      .then(() => { })
      .catch(e => { console.log(e) })
  }

}

export async function removeMargin(
  chainId,
  library,
  routerAddress,
  Router,
  token,
  tokenAmount,
  symbol,
) {
  const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner())

  let method = "removeMargin"
  let params = [
    token.address,  //token address
    ethers.utils.parseUnits(tokenAmount, token.decimals),  //amount
    symbol,  //token symbol
    [], //oracleSignature
  ]

  const successMsg = `Order Submitted!`

  if (token.address === ethers.constants.AddressZero) {     // native token
    let value = ethers.utils.parseUnits(tokenAmount, token.decimals)
    Api.callContract(chainId, contract, method, params, {
      value: value,
      sentMsg: `Submitted.`,
      failMsg: `Failed.`,
      successMsg,
    })
      .then(() => { })
      .catch(e => { console.log(e) })
  } else {                                               // other ERC20 token, e.g. BTC
    Api.callContract(chainId, contract, method, params, {
      sentMsg: `Submitted.`,
      failMsg: `Failed.`,
      successMsg,
    })
      .then(() => { })
      .catch(e => { console.log(e) })
  }
}

export async function transfer(
  chainId,
  library,
  routerAddress,
  Router,
  token,
  tokenAmount,
  fromSymbol,
  toSymbol,
) {
  const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner())

  let method = "transfer"
  let params = [
    token.address,
    ethers.utils.parseUnits(tokenAmount, token.decimals),
    fromSymbol,
    toSymbol,
    [],
  ]

  const successMsg = `Order Submitted!`

  if (token.address === ethers.constants.AddressZero) {
    let value = ethers.utils.parseUnits(tokenAmount, token.decimals)
    Api.callContract(chainId, contract, method, params, {
      value: value,
      senMsg: `Submitted.`,
      failMsg: `Failed.`,
      successMsg,
    })
      .then(() => { })
      .catch(e => { console.log(e) })
  } else {
    Api.callContract(chainId, contract, method, params, {
      sentMsg: `Submitted.`,
      failMsg: `Failed.`,
      successMsg,
    })
      .then(() => { })
      .catch(e => { console.log(e) })
  }

}

export async function addLiquidity(
  chainId,
  library,
  routerAddress,
  Router,
  token,
  tokenAmount,
  minLp,
  setIsSubmitting,
) {
  const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner())

  let method = "addLiquidity"
  let params = [
    token.address,  //token address
    tokenAmount,  //amount
    minLp,  //minLp
    [], //oracleSignature
  ]

  const successMsg = `Order Submitted!`

  if (token.address === ethers.constants.AddressZero) {     // native token
    let value = ethers.utils.parseUnits(tokenAmount, token.decimals)
    Api.callContract(chainId, contract, method, params, {
      value: value,
      sentMsg: `Submitted.`,
      failMsg: `Failed.`,
      successMsg,
    })
      .then(() => { })
      .catch(e => { console.log(e) })
      .finally(()=>{setIsSubmitting(false)})
  } else {                                               // other ERC20 token, e.g. BTC
    Api.callContract(chainId, contract, method, params, {
      sentMsg: `Submitted.`,
      failMsg: `Failed.`,
      successMsg,
    })
      .then(() => { })
      .catch(e => { console.log(e) })
      .finally(()=>{setIsSubmitting(false)})
  }
}

export async function removeLiquidity(
  chainId,
  library,
  routerAddress,
  Router,
  token,
  tokenAmount,
  minOut,
  setIsSubmitting,
) {
  const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner())

  let method = "removeLiquidity"
  let params = [
    token.address,  //token address
    tokenAmount,  //amount
    minOut,  //minOut
    [], //oracleSignature
  ]

  const successMsg = `Order Submitted!`

  if (token.address === ethers.constants.AddressZero) {     // native token
    let value = ethers.utils.parseUnits(tokenAmount, token.decimals)
    Api.callContract(chainId, contract, method, params, {
      value: value,
      sentMsg: `Submitted.`,
      failMsg: `Failed.`,
      successMsg,
    })
      .then(() => { })
      .catch(e => { console.log(e) })
      .finally(()=>{setIsSubmitting(false)})
  } else {                                               // other ERC20 token, e.g. BTC
    Api.callContract(chainId, contract, method, params, {
      sentMsg: `Submitted.`,
      failMsg: `Failed.`,
      successMsg,
    })
      .then(() => { })
      .catch(e => { console.log(e) })
      .finally(()=>{setIsSubmitting(false)})
  }
}

export async function trade(
  chainId,
  library,
  poolAddress,
  IPool,
  account,
  symbol,
  amount,
  priceLimit,
  oracleSignatures
) {
  const contract = new ethers.Contract(poolAddress, IPool.abi, library.getSigner())
  let method = "trade"
  let params = [
    account,
    symbol,
    amount,
    priceLimit,
    oracleSignatures,   //oracleSignature
  ]
  
  const successMsg = `Order Submitted!`
  Api.callContract(chainId, contract, method, params, {
    sentMsg: `Submitted.`,
    failMsg: `Failed.`,
    successMsg,
  })
    .then(() => { })
    .catch(e => { console.log(e) })
}

export async function createTradeOrder(
  chainId,
  library,
  orderbookAddress,
  OrderBook,
  symbolName,
  tradeVolume,
  triggerPrice,
  triggerAboveThreshold,
  priceLimit,
  minExecutionFee,
) {

  const contract = new ethers.Contract(orderbookAddress, OrderBook.abi, library.getSigner())
  let method = "createTradeOrder"
  let params = [
    symbolName,
    tradeVolume,
    triggerPrice,
    triggerAboveThreshold,
    priceLimit,
  ]

  const successMsg = `Order Submitted!`
  Api.callContract(chainId, contract, method, params, {
    sentMsg: `Submitted.`,
    failMsg: `Failed.`,
    successMsg,
    value: minExecutionFee,
  })
    .then(() => { })
    .catch(e => { console.log(e) })

}

export async function cancelTradeOrder(
  chainId,
  library,
  orderbookAddress,
  OrderBook,
  orderIndex,
) {

  const contract = new ethers.Contract(orderbookAddress, OrderBook.abi, library.getSigner())
  let method = "cancelTradeOrder"
  let params = [
    orderIndex
  ]

  const successMsg = `Order Submitted!`
  Api.callContract(chainId, contract, method, params, {
    sentMsg: `Submitted.`,
    failMsg: `Failed.`,
    successMsg,
  })
    .then(() => { })
    .catch(e => { console.log(e) })

}

export async function approveTokens(
  chainId,
  library,
  routerAddress,
  ERC20,
  tokenAddress,
  tokenAmount,
  setIsWaitingForApproval,
  setIsApproving,
) {
  const contract = new ethers.Contract(tokenAddress, ERC20.abi, library.getSigner());

  let method = "approve"
  let params = [
    routerAddress,
    ethers.constants.MaxUint256
  ]

  const successMsg = `Order Submitted!`
  Api.callContract(chainId, contract, method, params, {
    sentMsg: `Submitted.`,
    failMsg: `Failed.`,
    successMsg,
  })
    .then(() => { setIsWaitingForApproval(true) })
    .catch(e => { console.error(e) })
    .finally(() => { setIsApproving(false) });
}