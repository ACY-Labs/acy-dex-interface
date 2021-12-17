
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import React, { useEffect, useState } from 'react';

const ConnectWallet = () => {
    const { account, chainId, library, activate } = useWeb3React();
    const injected = new InjectedConnector({
        supportedChainIds: [1, 3, 4, 5, 42, 80001],
    });
    const connectWallet = () => {
        activate(injected);
    };

    useEffect(() => {
        connectWallet();
    },[])
    return null // component does not render anything
}
export default ConnectWallet;
