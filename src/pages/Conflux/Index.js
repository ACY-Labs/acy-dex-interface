import React, { Component, useEffect } from 'react';
//import { Conflux } from 'js-conflux-sdk/dist/js-conflux-sdk.umd.min.js';
import ERC20ABI from '@/acy-dex-swap/abis/ERC20.json';
import { abi as ROUTERABI } from '@/acy-dex-swap/abis/IUniswapV2Router02.json';

// import conflux
const { Conflux } = require('js-conflux-sdk');

const ROUTER_ADDRESS = 'cfxtest:aceh5g5vgx6c9stfk8war5mrv870utgwjj2cxnrvmg';

const token0Address = 'cfxtest:accn7py5k3255sr7e1jxx9z9cg9z0gducevgnjfnkv'; // USD Coin
const token1Address = 'cfxtest:accvfzzwkxxps79xu01uh1aa80zvzmptrph4epwwzm'; // ACY

const conflux = new Conflux({
  url: 'https://test.confluxrpc.com', // testnet provider
  logger: console, // for debug: this will log all the RPC request and response to console
  networkId: 1,
  // timeout: 300 * 1000, // request timeout in ms, default 300*1000 ms === 5 minute
});
async function approve(tokenAddress, spenderAddress) {

  const confluxPortal = window.conflux;
  conflux.provider = confluxPortal;

  confluxPortal.enable();

  const accounts = await confluxPortal.send({ method: 'cfx_accounts' });
  console.log('accounts');
  console.log(accounts);

  const account = accounts[0];

  const tokenContract = conflux.Contract({
    abi: ERC20ABI,
    address: tokenAddress,
  });

  const approveArgs = [spenderAddress, '100000000000000000'];

  const result = await tokenContract.approve(...approveArgs).sendTransaction({
    from: account,to:spenderAddress,value:0
  });

  console.log(result);
}

function addLiquidity() {
  async function main() {
    const conflux = new Conflux();
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

    console.log(routerContract);

    const args = [
      token0Address,
      token1Address,
      '10000',
      '10000',
      '9000',
      '9000',
      account,
      99999999999,
    ];

    console.log(args);

    const transactionHash = await routerContract.addLiquidity(...args).sendTransaction({
      from: account,
    });

    console.log(transactionHash); // 0xb31eb095b62bed1ef6fee6b7b4ee43d4127e4b42411e95f761b1fdab89780f1a
  }
  main();
}

const ConfluxComponent = () => {
  useEffect(() => {
    // approve(
    //   'cfxtest:accvfzzwkxxps79xu01uh1aa80zvzmptrph4epwwzm',
    //   ROUTER_ADDRESS
    // );

    addLiquidity();
  }, []);
  return <div>This is Conflux</div>;
};

export default ConfluxComponent;
