import React, { Component, useEffect } from 'react';
import { Conflux } from 'js-conflux-sdk/dist/js-conflux-sdk.umd.min.js';
import ERC20ABI from '@/acy-dex-swap/abis/ERC20.json';
import { abi as ROUTERABI } from '@/acy-dex-swap/abis/IUniswapV2Router02.json';
import { abi as FACTORYABI } from '@/acy-dex-swap/abis/IUniswapV2Factory.json';
import {
  CustomError,
  calculateGasMargin,
  calculateSlippageAmount,
  checkTokenIsApproved,
  getRouterContract,
  getTokenTotalSupply,
  getUserTokenBalanceRaw,
  INITIAL_ALLOWED_SLIPPAGE,
} from '/src/acy-dex-swap/utils/index.js';


//success router
const ROUTER_ADDRESS = 'cfxtest:acez2pf23veg3h978v6czc2gcrhdapwzdau7gjcrgu';
const FACTORY_ADDRESS = 'cfxtest:accwxxbxrvdvnywtawe80jsaeua0g2p7mynjsdzkbh';

// const token0Address = 'cfxtest:accn7py5k3255sr7e1jxx9z9cg9z0gducevgnjfnkv'; // USD Coin
// const token1Address = 'cfxtest:accvfzzwkxxps79xu01uh1aa80zvzmptrph4epwwzm'; // ACY

//mine
const token0Address = 'cfxtest:accy2y4xv3g9du0j6kt9uuk353g6vrz03ubtssgsju'; // USD Coin
const token1Address = 'cfxtest:acd2f05trwk0wnvazm40jc3tucn362w3bemw8gd0dy'; // ACY

// const token0Address = 'cfxtest:acfjzzdszf3xfetfy0z8t4tbxf02gbcwna2fpeadma'; // USD Coin
// const token1Address = 'cfxtest:acafsjaaysy2j6f60zf25rthmx8xmmp3ppt8ptvugj'; // ACY

async function approve(tokenAddress, spenderAddress) {
  const conflux = new Conflux();
  const confluxPortal = window.conflux;

  conflux.provider = confluxPortal;

  confluxPortal.enable();

  const accounts = await confluxPortal.send('cfx_requestAccounts');
  console.log('accounts');
  console.log(accounts);

  const account = accounts[0];
  console.log(account);

  const tokenContract = conflux.Contract({
    abi: ERC20ABI,
    address: tokenAddress,
  });

  const approveArgs = [spenderAddress, 100000000];

  const result = await tokenContract.approve(...approveArgs).sendTransaction({
    from: account, to : tokenAddress 
  });

  console.log(result);
}

function addLiquidity() {
  async function main() {
    const conflux = new Conflux({
      url: "https://test.confluxrpc.com",
      networkId: 1,
    });
    const confluxPortal = window.conflux;
    conflux.provider = confluxPortal;

    confluxPortal.enable();

    const accounts = await confluxPortal.send({ method: 'cfx_accounts' });
    console.log('accounts');
    console.log(accounts);

    const account = accounts[0];

    const routerContract = conflux.Contract({
      abi: ROUTERABI,
      address: ROUTER_ADDRESS,
    });
    const factoryContract = conflux.Contract({
      abi: FACTORYABI,
      address: FACTORY_ADDRESS,
    });

    console.log(routerContract);
    console.log(typeof(token0Address));
    const Token0Contract = conflux.Contract({
      abi: ERC20ABI,
      address: token0Address,
    });

    
    //=====================approve check
    //const check = await Token0Contract.approve(ROUTER_ADDRESS,100000).sendTransaction({from:account});

    const check0 = await Token0Contract.allowance(account,ROUTER_ADDRESS);
    console.log(check0);


    const Token1Contract = conflux.Contract({
      abi: ERC20ABI,
      address: token1Address,
    });
    // const check1 = await Token1Contract.approve(ROUTER_ADDRESS,100000).sendTransaction({from:account});
    const check2 = await Token1Contract.allowance(account,ROUTER_ADDRESS);

    console.log(check2);


    //====================approve check
        //  let token0approval = await Token1Contract.approve( account,'100000').sendTransaction({from:account, to :token1Address, nonce:25, gasPrice:1});
        //  console.log(token0approval);

    const args = [
      token0Address,
      token1Address,
      100000,
      10000,
      0,
      0,
      account,
      99999999999,
    ];

    console.log("done");
    console.log(account);

    //swapExactTokensForTokens(1000,10,[token0Address,token1Address],account,9999999999)
    const estimate = await routerContract.addLiquidity(...args).sendTransaction({from:account, to:ROUTER_ADDRESS,gas:5000000,gasPrice:1, storageLimit:10000})
    //estimateGasAndCollateral({from:account})
    //sendTransaction({from:account, to:ROUTER_ADDRESS,gas:4000000,gasPrice:1, storageLimit:15000, value:125})
    .catch(error => {
                                console.log("failed addliquidity");
                                throw error
                              });
    console.log(estimate);
    // //const transactionHash = await routerContract.addLiquidity(...args).estimateGasAndCollateral({from: account, to : ROUTER_ADDRESS,nonce:8, });
    // const transactionHash = await routerContract.addLiquidity(...args).sendTransaction({from:account ,gas:15000000, nonce:22, storageLimit:5000}).confirmed()
    //                         .catch(error => {
    //                           console.log("failed addliquidity");
    //                           throw error
    //                         });
    // //console.log('factory address');

    // console.log(transactionHash); // 0xb31eb095b62bed1ef6fee6b7b4ee43d4127e4b42411e95f761b1fdab89780f1a
  }
  main();
}


const ConfluxComponent = () => {
  useEffect(() => {
    // approve(
    //   token0Address,
    //   ROUTER_ADDRESS
    // );
    // approve(
    //   token1Address,
    //   ROUTER_ADDRESS
    // );

  addLiquidity();
  }, []);
  return <div>This is Conflux</div>;
};

export default ConfluxComponent;