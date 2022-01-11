
import { useWeb3React } from '@web3-react/core';
import { binance, injected } from '@/connectors';
import React, { useEffect, useState } from 'react';

const ConnectWallet = () => {
    const { account, chainId, library, activate } = useWeb3React();

    useEffect(() => {
        if(!account){
            //activate(binance);
            //activate(injected);   
        }
    },[])
    return null // component does not render anything
}
export default ConnectWallet;
