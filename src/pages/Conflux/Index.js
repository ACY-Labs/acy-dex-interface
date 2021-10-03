import React, { Component, useEffect } from 'react';
import { Conflux } from 'js-conflux-sdk/dist/js-conflux-sdk.umd.min.js';
import abi from '@/acy-dex-swap/abis/ERC20.json';

function confluxTest() {
  async function main() {
    const conflux = new Conflux();
    const confluxPortal = window.conflux;
    conflux.provider = confluxPortal;

    confluxPortal.enable();

    const accounts = await confluxPortal.send({ method: 'cfx_accounts' });
    console.log('accounts');
    console.log(accounts);

    // 1. initialize contract with abi and address
    const contract = conflux.Contract({
      abi,
      address: 'cfxtest:accvfzzwkxxps79xu01uh1aa80zvzmptrph4epwwzm',
    });
    // 2. call method to get contract state
    const name = await contract.name();
    console.log('---------- token name ------------');
    console.log(name); // MiniERC20
    // 3. user can set options by `contract.name().call({ from: account, ... })`

    // 4. call method with arguments
    const balance = await contract.balanceOf('cfxtest:aarh2340wg8cdka1kfh219sfz5g3y7vcp688nsuhhw');
    console.log('---------- token balance ------------');
    console.log(balance); // 10000n

    // 4. change contract state by send a transaction
    console.log(contract.transfer('cfxtest:aajjb1n1sf20echx77a4d21h4ydy2wvwxpcxsjep2j', 10));
    const transactionHash = await contract
      .transfer('cfxtest:aajjb1n1sf20echx77a4d21h4ydy2wvwxpcxsjep2j', '100000000')
      .sendTransaction({ from: 'cfxtest:aarh2340wg8cdka1kfh219sfz5g3y7vcp688nsuhhw' });
    console.log(transactionHash); // 0xb31eb095b62bed1ef6fee6b7b4ee43d4127e4b42411e95f761b1fdab89780f1a
  }
  main();
}

const ConfluxComponent = () => {
  useEffect(() => {
    confluxTest();
  }, []);
  return <div>This is Conflux</div>;
};

export default ConfluxComponent;
