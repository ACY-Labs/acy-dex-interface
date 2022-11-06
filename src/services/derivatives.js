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
) {
  const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner())

  let method = "addMargin"
  let params = [
    token.address,  //token address
    ethers.utils.parseUnits(tokenAmount, token.decimals),  //amount
    token.symbol,  //token symbol
    [], //oracleSignature
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

export async function removeMargin(
  chainId,
  library,
  routerAddress,
  Router,
  token,
  tokenAmount,
) {
  const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner())

  let method = "removeMargin"
  let params = [
    token.address,  //token address
    ethers.utils.parseUnits(tokenAmount, token.decimals),  //amount
    token.symbol,  //token symbol
    [], //oracleSignature
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

export async function addLiquidity(
  chainId,
  library,
  routerAddress,
  Router,
  token,
  tokenAmount,
  minLp,
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

  Api.callContract(chainId, contract, method, params, {
    sentMsg: `Submitted.`,
    failMsg: `Failed.`,
    successMsg,
  })
    .then(() => { })
    .catch(e => { console.log(e) })

}

export async function removeLiquidity(
  chainId,
  library,
  routerAddress,
  Router,
  token,
  tokenAmount,
  minOut,
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

  Api.callContract(chainId, contract, method, params, {
    sentMsg: `Submitted.`,
    failMsg: `Failed.`,
    successMsg,
  })
    .then(() => { })
    .catch(e => { console.log(e) })
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
) {
  const contract = new ethers.Contract(poolAddress, IPool.abi, library.getSigner())
  let method = "trade"
  let params = [
    account,
    symbol,
    amount,
    priceLimit,
    [],   //oracleSignature
  ]

  const successMsg = `Order Submitted!`

  let value = bigNumberify(0)
  Api.callContract(chainId, contract, method, params, {
    value,
    sentMsg: `Submitted.`,
    failMsg: `Failed.`,
    successMsg,
  })
    .then(() => { })
    .catch(e => { console.log(e) })
}

export async function approveTokens(
  library,
  poolAddress,
  Token,
  tokenAddress,
  setIsWaitingForApproval,
  setIsApproving,
) {
  const contract = new ethers.Contract(tokenAddress, Token.abi, library.getSigner()
  );
  contract.approve(poolAddress, ethers.constants.MaxUint256)
    .then(() => { setIsWaitingForApproval(true) })
    .catch(e => { console.error(e) })
    .finally(() => { setIsApproving(false) });
}