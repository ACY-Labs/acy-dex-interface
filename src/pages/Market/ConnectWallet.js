
import { useWeb3React } from '@web3-react/core';
import { binance } from '@/connectors';
import React, { useEffect, useState } from 'react';

const ConnectWallet = () => {
    const { account, chainId, library, activate } = useWeb3React();

    useEffect(() => {
        activate(binance);
    },[])
    return null // component does not render anything
}
export default ConnectWallet;
