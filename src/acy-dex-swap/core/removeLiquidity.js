import { InjectedConnector } from '@web3-react/injected-connector';
import { getAddress } from '@ethersproject/address';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Dropdown, Form, FormControl, InputGroup } from 'react-bootstrap';
import { ETHER, Fetcher, Percent, Token, TokenAmount, WETH, CurrencyAmount } from '@acyswap/sdk';

import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import { splitSignature } from '@ethersproject/bytes';
import {
  CustomError,
  approve,
  calculateGasMargin,
  calculateSlippageAmount,
  checkTokenIsApproved,
  getAllowance,
  getPairContract,
  getRouterContract,
  getTokenTotalSupply,
  getUserTokenBalanceRaw,
  supportedTokens,
} from '../utils';
import {constantInstance, ROUTER_ADDRESS, NATIVE_CURRENCY} from '@/constants';

export async function getEstimated(
  inputToken0,
  inputToken1, // 这里是不包含amount信息的
  token0Amount,
  token1Amount,
  index,
  percent,
  amount,
  allowedSlippage,
  chainId,
  library,
  account,
  setToken0Amount,
  setToken1Amount,
  setBalance,
  setBalanceShow,
  setPercent,
  setAmount,
  setBreakdown,
  setNeedApprove,
  setButtonStatus,
  setButtonContent,
  setRemoveStatus,
  setArgs
) {
  let { address: inToken0Address, symbol: inToken0Symbol, decimals: inToken0Decimal } = inputToken0;
  let { address: inToken1Address, symbol: inToken1Symbol, decimals: inToken1Decimal } = inputToken1;

  if (!inToken0Symbol || !inToken1Symbol) {
    setToken0Amount('0');
    setToken1Amount('0');
    setBalance('0');
    setBalanceShow(false);
    setNeedApprove(false);
    setButtonStatus(false);
    setButtonContent('One or more token is missing');
    return false;
  }
  //init
  setToken0Amount('loading...');
  setToken1Amount('loading...');
  setBalance('0');
  setBalanceShow(false);
  setBreakdown('');
  setNeedApprove(false);
  setButtonStatus(false);
  setButtonContent('loading...');
  setRemoveStatus('');

  const nativeCurrencySymbol = NATIVE_CURRENCY();
  const wrappedCurrencySymbol = `W${nativeCurrencySymbol}`;

  let token0IsETH = inToken0Symbol === nativeCurrencySymbol;
  let token1IsETH = inToken1Symbol === nativeCurrencySymbol;
  if (token0IsETH && token1IsETH) {
    setToken0Amount('0');
    setToken1Amount('0');
    setNeedApprove(false);
    setButtonStatus(false);
    setButtonContent(`Both tokens are ${nativeCurrencySymbol}`);
    return;
  }
  if ((token0IsETH && inToken1Symbol === wrappedCurrencySymbol) || (inToken0Symbol === wrappedCurrencySymbol && token1IsETH)) {
    setToken0Amount('0');
    setToken1Amount('0');
    setNeedApprove(false);
    setButtonStatus(false);
    setButtonContent(`Invalid pair of ${nativeCurrencySymbol}/${wrappedCurrencySymbol}`);
    return;
  }
  // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20

  // use WETH for ETHER to work with Uniswap V2 SDK
  const token0 = token0IsETH
    ? WETH[chainId]
    : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
  const token1 = token1IsETH
    ? WETH[chainId]
    : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);

  if (token0.equals(token1)) {
    setToken0Amount('0');
    setToken1Amount('0');
    setBalanceShow(false);
    setNeedApprove(false);
    setButtonStatus(false);
    setButtonContent("Tokens can't be the same");
    return;
  }

  // get pair using our own provider
  let pair = await Fetcher.fetchPairData(token0, token1, library, chainId)
    .then(pair => {
      console.log(pair.reserve0.raw.toString());
      console.log(pair.reserve1.raw.toString());
      return pair;
    })
    .catch(e => {
      return new CustomError(
        `${token0.symbol} - ${token1.symbol} pool does not exist. Create one?`
      );
    });
  if (pair instanceof CustomError) {
    setToken0Amount('0');
    setToken1Amount('0');
    setBalance('');
    setBalanceShow(false);
    setNeedApprove(false);
    setButtonStatus(false);
    setButtonContent('Pool does not exist');
    return;
  }

  console.log('this is pair');
  console.log(pair);
  // 流动性代币的总量
  let totalPoolTokens = await getTokenTotalSupply(pair.liquidityToken, library, account);

  let userPoolBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library);

  if (userPoolBalance.isZero()) {
    setToken0Amount('0');
    setToken1Amount('0');
    setBalance('0');
    setBalanceShow(true);
    setNeedApprove(false);
    setButtonStatus(false);
    setButtonContent('User has no pool share');
    return;
  }
  // 用户拥有的流动性代币
  userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

  console.log(userPoolBalance);
  console.log(userPoolBalance.toExact());

  setBalance(userPoolBalance.toExact());
  setBalanceShow(true);

  console.log(token0);
  console.log(pair.token0);
  console.log(token0 == pair.token0);

  let token0Deposited = pair.getLiquidityValue(token0, totalPoolTokens, userPoolBalance, false);
  let token1Deposited = pair.getLiquidityValue(token1, totalPoolTokens, userPoolBalance, false);
  console.log(token0Deposited);
  console.log(token1Deposited);

  // 这个也是用户拥有的流动代币的总值？
  /*
        这是错误的，因为getLiquidityValue的输出不能作为 liqudityMinted的输入
        let liquidityMinted = pair.getLiquidityMinted(
            totalSupply,
            token0Deposited,
            token1Deposited
        );
        */

  console.log('----------------------------');
  console.log(userPoolBalance.raw);
  console.log(userPoolBalance.toExact());

  let liquidityAmount;
  let percentToRemove;

  if (index === 0) {
    let shang = percent * 100;
    percentToRemove = new Percent(shang.toString(), '10000');

    console.log(shang.toString());
    console.log('10000');
    console.log(percentToRemove.toSignificant());

    liquidityAmount = new TokenAmount(
      userPoolBalance.token,
      percentToRemove.multiply(userPoolBalance.raw).quotient
    );

    setAmount(liquidityAmount.toExact());
  } else {
    liquidityAmount = new TokenAmount(
      userPoolBalance.token,
      parseUnits(amount, userPoolBalance.token.decimals)
    );

    percentToRemove = new Percent(liquidityAmount.raw, userPoolBalance.raw);
    console.log('hello');
    console.log(liquidityAmount.raw);
    console.log(userPoolBalance.raw);
    setPercent(percentToRemove.toSignificant(2));
  }

  let first = new TokenAmount(token0, parseUnits('1', inToken0Decimal));
  let firstPrice = pair.priceOf(token0).quote(first);
  let second = new TokenAmount(token1, parseUnits('1', inToken1Decimal));
  let secondPrice = pair.priceOf(token1).quote(second);

  let token0TokenAmount = new TokenAmount(
    token0,
    percentToRemove.multiply(token0Deposited.raw).quotient
  );

  let token1TokenAmount = new TokenAmount(
    token1,
    percentToRemove.multiply(token1Deposited.raw).quotient
  );

  let parsedToken0Amount;
  let parsedToken1Amount;

  parsedToken0Amount =
    token0 === ETHER ? CurrencyAmount.ether(token0TokenAmount.raw) : token0TokenAmount;
  parsedToken1Amount =
    token1 === ETHER ? CurrencyAmount.ether(token1TokenAmount.raw) : token1TokenAmount;

  setToken0Amount(parsedToken0Amount.toExact(6));
  setToken1Amount(parsedToken1Amount.toExact(6));

  console.log('CHECK IF HAVE ENOUGH BALANCE');
  console.log(pair.liquidityToken);
  let pairBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library);
  let needAmount = parseUnits(amount, pair.liquidityToken.decimals);
  console.log(pairBalance);
  console.log(needAmount);

  let userHasSufficientBalance = pairBalance.gte(needAmount);

  if (!userHasSufficientBalance) {
    setNeedApprove(false);
    setButtonStatus(false);
    setButtonContent('Not enough balance');
    return;
  }

  console.log("------- SLIPPAGE TOLERANCE ------");

  const amountsMin = {
    ['CURRENCY_A']: calculateSlippageAmount(parsedToken0Amount, allowedSlippage*100)[0],
    ['CURRENCY_B']: calculateSlippageAmount(parsedToken1Amount, allowedSlippage*100)[0],
  };

  console.log("slippage, amountIn and output amountsMin", allowedSlippage, {amountAIn: parsedToken0Amount.toExact(), amountBIn: parsedToken1Amount.toExact()}, {amountAOutmin: amountsMin.CURRENCY_A.toString(), amountBOutmin: amountsMin.CURRENCY_B.toString() })

  console.log("------ PREPARING ARGS ------");

  let oneCurrencyIsETH = token0IsETH || token1IsETH;
  let methodNames, args;
  if (oneCurrencyIsETH) {
    console.log('333');
    methodNames = [
      'removeLiquidityETHWithPermit',
      'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens',
    ];
    args = [
      token1IsETH ? inToken0Address : inToken1Address,
      liquidityAmount.raw.toString(),
      amountsMin[token0IsETH ? 'CURRENCY_B' : 'CURRENCY_A'].toString(),
      amountsMin[token1IsETH ? 'CURRENCY_A' : 'CURRENCY_B'].toString(),
      account,
      // deadlineTime, false, signature v, r, s will be added in SignOrApprove
    ];
  } else {
    console.log('444');
    methodNames = ['removeLiquidityWithPermit'];
    args = [
      inToken0Address,
      inToken1Address,
      liquidityAmount.raw.toString(),
      amountsMin['CURRENCY_A'].toString(),
      amountsMin['CURRENCY_B'].toString(),
      account,
      // deadlineTime, false, signature v, r, s will be added in SignOrApprove
    ];
  }

  setArgs(args);

  const minAmount0 = new TokenAmount(inputToken0, amountsMin['CURRENCY_A']);
  const minAmount1 = new TokenAmount(inputToken1, amountsMin['CURRENCY_B']);
  setBreakdown([
    'You will receive at least',
    `${minAmount0.toExact(2)} ${inToken0Symbol}`,
    `${minAmount1.toExact(2)} ${inToken1Symbol}`,
  ]);

  console.log('GET ALLOWANCE');
  let liquidityApproval = await checkTokenIsApproved(
    liquidityAmount.token.address,
    liquidityAmount.raw.toString(),
    library,
    account
  );

  console.log("liquidityApproval", liquidityApproval);

  if (!liquidityApproval) {
    setNeedApprove(true);
    setButtonStatus(true);
    setButtonContent('Need sign');
    return;
  }

  setNeedApprove(false);
  setButtonStatus(true);
  setButtonContent('Remove Liquidity');
}

export async function signOrApprove(
  inputToken0,
  inputToken1,
  index,
  percent,
  amount,
  deadline,
  chainId,
  library,
  account,
  setNeedApprove,
  setButtonStatus,
  setButtonContent,
  setRemoveStatus,
  setSignatureData
) {
  const status = await (async () => {
    console.log('hhhh');
    console.log(inputToken0);
    console.log(inputToken1);

    // let router = await getRouterContract(library, account);
    const {
      symbol: inToken0Symbol,
      address: inToken0Address,
      decimals: inToken0Decimal,
    } = inputToken0;
    const {
      symbol: inToken1Symbol,
      address: inToken1Address,
      decimals: inToken1Decimal,
    } = inputToken1;

    const nativeCurrencySymbol = NATIVE_CURRENCY();
    const wrappedCurrencySymbol = `W${nativeCurrencySymbol}`;

    const token0IsETH = inToken0Symbol === nativeCurrencySymbol;
    const token1IsETH = inToken1Symbol === nativeCurrencySymbol;

    if (!inputToken0.symbol || !inputToken1.symbol)
      return new CustomError('One or more token input is missing');

    console.log('------------------ RECEIVED TOKEN ------------------');
    console.log('token0');
    console.log(inputToken0);
    console.log('token1');
    console.log(inputToken1);

    if (token0IsETH && token1IsETH) return new CustomError(`Doesn't support ${nativeCurrencySymbol} to ${nativeCurrencySymbol}`);

    if ((token0IsETH && inToken1Symbol === wrappedCurrencySymbol) || (inToken0Symbol === wrappedCurrencySymbol && token1IsETH)) {
      return new CustomError(`Invalid pair ${wrappedCurrencySymbol}/${nativeCurrencySymbol}`);
    }
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20

    console.log('ATTEMPT TO APPROVE');
    console.log('------------------ CONSTRUCT TOKEN ------------------');

    // use WETH for ETHER to work with Uniswap V2 SDK
    const token0 = token0IsETH
      ? WETH[chainId]
      : new Token(chainId, inToken0Address, inToken0Decimal, inToken0Symbol);
    const token1 = token1IsETH
      ? WETH[chainId]
      : new Token(chainId, inToken1Address, inToken1Decimal, inToken1Symbol);

    if (token0.equals(token1)) return new CustomError('Equal tokens!');

    // get pair using our own provider
    console.log('------------------ CONSTRUCT PAIR ------------------');
    console.log('FETCH');
    // if an error occurs, because pair doesn't exists
    const pair = await Fetcher.fetchPairData(token0, token1, library, chainId).catch(e => {
      console.log(e);
      return new CustomError(`${token0.symbol} - ${token1.symbol} pool does not exist.`);
    });
    console.log(pair);
    if (pair instanceof CustomError) {
      setRemoveStatus(pair.getErrorText());
      return pair;
    }

    const pairContract = await getPairContract(pair.liquidityToken.address, library, account);

    console.log(pairContract);

    // try to gather a signature for permission

    const totalPoolTokens = await getTokenTotalSupply(pair.liquidityToken, library, account);

    let userPoolBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library);

    userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

    console.log('getLiquidityValue');
    console.log(pair.token0);

    const shang = percent * 100;
    const percentToRemove = new Percent(shang.toString(), '10000');
    const liquidityAmount = new TokenAmount(
      userPoolBalance.token,
      percentToRemove.multiply(userPoolBalance.raw).quotient
    );

    console.log(userPoolBalance.toExact());
    console.log(percentToRemove.toSignificant(2));
    console.log(liquidityAmount.raw);

    //
    //
    //
    // console.log( liquidityAmount.raw.toString());
    // let state=await approve(liquidityAmount.token.address, liquidityAmount.raw.toString(), library, account);
    // if(state==true){
    //     setButtonStatus(true);
    // }
    // return "just approve";

    const nonce = await pairContract.nonces(account);

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];
    const domain = {
      name: 'Acy V1',
      version: '1',
      chainId,
      verifyingContract: pair.liquidityToken.address,
    };

    console.log('pair.liquidityToken.address');
    console.log(pair.liquidityToken.address);

    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];

    console.log("------- DEADLINE TIMER ------");
    const now = new Date();
    const deadlineDuration = deadline || 30;
    const deadlineTime = Math.floor(now.getTime() / 1000) + 60 * deadlineDuration;
    console.log('deadlineTime', deadlineTime);

    const message = {
      owner: account,
      spender: ROUTER_ADDRESS(),
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadlineTime,
    };

    console.log('message');
    console.log(message);

    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    });

    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then(signature => {
        console.log('sign!!!!!');
        console.log('signature');
        console.log(signature);
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadlineTime,
        });

        setNeedApprove(false);
        setButtonContent('Remove liquidity');
        setButtonStatus(true);
      })
      .catch(error => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (error.code != 4001) {
          // approveCallback();
          // const [approval, approveCallback] = useApproveCallback(
          //     liquidityAmount,
          //     ROUTER_ADDRESS(),
          //     library,
          //     account);
          // export async function approve(tokenAddress, requiredAmount, library, account) {
          alert('error code !=4001!');
          const state = approve(
            liquidityAmount.token.address,
            liquidityAmount.raw.toString(),
            library,
            account
          );
          if (state == true) {
            setNeedApprove(false);
            setButtonContent('Remove liquidity');
            setButtonStatus(true);
            return 'approve success';
          }
        } else {
          alert('error code 4001!');
          console.log('error code 4001!');
          setButtonContent('User rejected request');


          return new CustomError(
            ' 4001 (EIP-1193 user rejected request), fall back to manual approve'
          );
        }
      });

    return 'end';
  })();
  if (status instanceof CustomError) {
    setRemoveStatus(status.getErrorText());
    setButtonStatus(false);
    setButtonContent("Please try again");
  } else {
    setRemoveStatus('Please approve in your wallet');
    console.log(status);
  }
}

export async function removeLiquidity(
  inputToken0,
  inputToken1,
  index,
  percent,
  amount,
  allowedSlippage,
  chainId,
  library,
  account,
  args,
  setToken0Amount,
  setToken1Amount,
  signatureData,
  setNeedApprove,
  setButtonStatus,
  setButtonContent,
  setRemoveStatus,
  removeLiquidityCallback
) {
  const status = await (async () => {
    let router = getRouterContract(library, account);
    let { address: token0Address, symbol: token0Symbol, decimals: token0Decimal } = inputToken0;
    let { address: token1Address, symbol: token1Symbol, decimals: token1Decimal } = inputToken1;

    console.log(token0Address);
    token0Address = getAddress(token0Address);
    console.log(token0Address);

    console.log(token1Address);
    token1Address = getAddress(token1Address);
    console.log(token1Address);

    const nativeCurrencySymbol = NATIVE_CURRENCY();
    const wrappedCurrencySymbol = `W${nativeCurrencySymbol}`;

    let token0IsETH = token0Symbol === nativeCurrencySymbol;
    let token1IsETH = token1Symbol === nativeCurrencySymbol;

    if (!inputToken0.symbol || !inputToken1.symbol)
      return new CustomError('One or more token input is missing');

    if (index == 0 && percent == '0') return new CustomError('percent is 0');
    if (index == 1 && amount == '0') return new CustomError('amount is 0');
    if (index == 0 && percent == '') return new CustomError('percent is ""');
    if (index == 1 && amount == '') return new CustomError('amount is ""');
    if (index == 0 && isNaN(parseFloat(percent))) return new CustomError('percent is NaN');
    if (index == 1 && isNaN(parseFloat(amount))) return new CustomError('amount is NaN');

    console.log('------------------ RECEIVED TOKEN ------------------');
    console.log('token0');
    console.log(inputToken0);
    console.log('token1');
    console.log(inputToken1);

    if (token0IsETH && token1IsETH) return new CustomError(`Doesn't support ${nativeCurrencySymbol} to ${nativeCurrencySymbol}`);

    if ((token0IsETH && token1Symbol === wrappedCurrencySymbol) || (token0Symbol === wrappedCurrencySymbol && token1IsETH)) {
      return new CustomError(`Invalid pair ${wrappedCurrencySymbol}/${nativeCurrencySymbol}`);
    }
    // ETH <-> Non-WETH ERC20     OR     Non-WETH ERC20 <-> Non-WETH ERC20

    console.log('------------------ CONSTRUCT TOKEN ------------------');
    // use WETH for ETHER to work with Uniswap V2 SDK
    const token0 = token0IsETH
      ? WETH[chainId]
      : new Token(chainId, token0Address, token0Decimal, token0Symbol);
    const token1 = token1IsETH
      ? WETH[chainId]
      : new Token(chainId, token1Address, token1Decimal, token1Symbol);

    if (token0.equals(token1)) return new CustomError('Equal tokens!');

    // get pair using our own provider
    console.log('------------------ CONSTRUCT PAIR ------------------');
    console.log('FETCH');
    // if an error occurs, because pair doesn't exists
    const pair = await Fetcher.fetchPairData(token0, token1, library, chainId).catch(e => {
      console.log(e);
      return new CustomError(`${token0.symbol} - ${token1.symbol} pool does not exist.`);
    });
    console.log(pair);
    if (pair instanceof CustomError) {
      setRemoveStatus(pair.getErrorText());
      return pair;
    }

    let pairContract = getPairContract(pair.liquidityToken.address, library, account);

    console.log(pairContract);

    let totalPoolTokens = await getTokenTotalSupply(pair.liquidityToken, library, account);

    let userPoolBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library);

    userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

    let token0Deposited = pair.getLiquidityValue(
      pair.token0,
      totalPoolTokens,
      userPoolBalance,
      false
    );
    let token1Deposited = pair.getLiquidityValue(
      pair.token1,
      totalPoolTokens,
      userPoolBalance,
      false
    );
    // // 这是一个tokenAMount
    // console.log(token0Deposited);
    // console.log(token1Deposited);

    let shang = percent * 100;
    let percentToRemove = new Percent(shang.toString(), '10000');

    let liquidityAmount = new TokenAmount(
      userPoolBalance.token,
      percentToRemove.multiply(userPoolBalance.raw).quotient
    );

    let token0TokenAmount = new TokenAmount(
      token0,
      percentToRemove.multiply(token0Deposited.raw).quotient
    );

    // console.log('this is ok?');
    // console.log(percentToRemove.multiply(token0Deposited.raw).quotient);
    // console.log(token0TokenAmount.raw);
    // console.log(token0TokenAmount.toExact());
    // console.log(token0TokenAmount);

    let token1TokenAmount = new TokenAmount(
      token1,
      percentToRemove.multiply(token1Deposited.raw).quotient
    );

    let parsedToken0Amount;
    let parsedToken1Amount;

    // 先假设都不是ETH
    parsedToken0Amount =
      token0 === ETHER ? CurrencyAmount.ether(token0TokenAmount.raw) : token0TokenAmount;
    parsedToken1Amount =
      token1 === ETHER ? CurrencyAmount.ether(token1TokenAmount.raw) : token1TokenAmount;

    let liquidityApproval = await checkTokenIsApproved(
      liquidityAmount.token.address,
      liquidityAmount.raw.toString(),
      library,
      account
    );

    let oneCurrencyIsETH = token0IsETH || token1IsETH;
    // let estimate;
    // let methodNames;
    // let args;
    // let value;

    // console.log('allowedSlippage', allowedSlippage);

    const amountsMin = {
      ['CURRENCY_A']: calculateSlippageAmount(parsedToken0Amount, allowedSlippage)[0].toString(),
      ['CURRENCY_B']: calculateSlippageAmount(parsedToken1Amount, allowedSlippage)[0].toString(),
    };
    // console.log("test amountsMin", amountsMin);
    let methodNames;
    if (liquidityApproval) {
      console.log("remove liquidity is approved");
      if (oneCurrencyIsETH) {
          console.log('111');
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens'];
          args = [
            token1IsETH ? token0Address : token1Address,
            liquidityAmount.raw.toString(),
            amountsMin[token0IsETH ? 'CURRENCY_A' : 'CURRENCY_B'].toString(),
            amountsMin[token1IsETH ? 'CURRENCY_B' : 'CURRENCY_A'].toString(),
            // amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
            // amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
            account,
            `0x${(Math.floor(new Date().getTime() / 1000) + 60).toString(16)}`,
          ];
      } else {
          console.log('222');
        methodNames = ['removeLiquidity'];
          args = [
            token0Address,
            token1Address,
            liquidityAmount.raw.toString(),
            amountsMin['CURRENCY_A'].toString(),
            amountsMin['CURRENCY_B'].toString(),
            account,
            `0x${(Math.floor(new Date().getTime() / 1000) + 60).toString(16)}`,
          ];
      }
      
    }
    else if (signatureData !== null) {
      if (oneCurrencyIsETH) {
        console.log('333');
        methodNames = [
          'removeLiquidityETHWithPermit',
          'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens',
        ];
    //     args = [
    //       token1IsETH ? token0Address : token1Address,
    //       liquidityAmount.raw.toString(),
    //       amountsMin[token1IsETH ? 'CURRENCY_A' : 'CURRENCY_B'].toString(),
    //       amountsMin[token1IsETH ? 'CURRENCY_B' : 'CURRENCY_A'].toString(),
    //       account,
    //       signatureData.deadline,
    //       false,
    //       signatureData.v,
    //       signatureData.r,
    //       signatureData.s,
    //     ];
      } else {
        console.log('444');
        methodNames = ['removeLiquidityWithPermit'];
    //     args = [
    //       token0Address,
    //       token1Address,
    //       liquidityAmount.raw.toString(),
    //       amountsMin['CURRENCY_A'].toString(),
    //       amountsMin['CURRENCY_B'].toString(),
    //       account,
    //       signatureData.deadline,
    //       false,
    //       signatureData.v,
    //       signatureData.r,
    //       signatureData.s,
    //     ];
      }

      console.log("signatureData", signatureData)
      args = [...args, signatureData.deadline, false, signatureData.v, signatureData.r, signatureData.s];
      console.log("transaction args", args);
    }
    else {
      return new CustomError(
        'Attempting to confirm without approval or a signature. Please contact support.'
      );
    }


    let safeGasEstimates;

    let result;

    safeGasEstimates = await Promise.all(
      (result = methodNames.map(methodName =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch(error => {
            console.error(`estimateGas failed`, methodName, args, error);
            return new CustomError(console.error(`estimateGas failed`, methodName, args, error));
          })
      ))
    );

    console.log('i want to see');
    console.log(result);
    console.log(safeGasEstimates);

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
      BigNumber.isBigNumber(safeGasEstimate)
    );

    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.');
      return new CustomError('safeGasEstimates is wrong');
    }
    const methodName = methodNames[indexOfSuccessfulEstimation];
    const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];

    let removeLiquidityResult = await router[methodName](...args, {
      gasLimit: safeGasEstimate,
    })
      .then(response => {
        console.log(response);
        return response;
      })
      .catch(e => {

        return new CustomError('CustomError in transaction');
      });

    if (removeLiquidityResult instanceof CustomError) {
      console.log('result is error');
    }
    return removeLiquidityResult;
  })();


  if (status instanceof CustomError) {
    setRemoveStatus(status.getErrorText());
    setButtonContent("Please try again");

  } else {
    console.log(status);
    
    removeLiquidityCallback(status, percent);

    const scanUrlPrefix = constantInstance.scanUrlPrefix.scanUrl;
    const url = `${scanUrlPrefix}/tx/${status.hash}`;
    setRemoveStatus(
      <a href={url} target="_blank" rel="noreferrer">
        view it on {constantInstance.scanUrlPrefix.scanName}
      </a>
    );
  }
}
