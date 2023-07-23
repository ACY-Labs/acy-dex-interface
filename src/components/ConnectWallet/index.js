
import {
    injected,
    walletconnect,
    walletlink,
    fortmatic,
    portis,
    torus,
    trezor,
    ledger,
    binance,
    nabox,
} from '@/connectors';
import { useWeb3React } from '@web3-react/core';
import { useState, useCallback, useMemo } from "react"
import { switchNetwork, useChainId } from '@/utils/helpers';
import { useHistory } from 'umi';

// // temporarily commented out. Current focus is on Metamask
// export const useConnectWallet=()=> {
//     const { activate, deactivate } = useWeb3React();
//     const connectWalletByLocalStorage = useCallback(
//         () => {
//             const walletName = localStorage.getItem("wallet");
//             const login_status = localStorage.getItem("login_status");
//             console.log('ymj', walletName, login_status);
//             if (login_status == 'off'){
//                 return;
//             }
//             if (walletName === 'metamask' || walletName === 'opera' || walletName === 'bitkeep') {
//                 activate(injected);
//             } else if (walletName === 'walletconnect') {
//                 activate(walletconnect);
//             } else if (walletName === 'coinbase') {
//                 activate(walletlink);
//             } else if (walletName === 'fortmatic') {
//                 activate(fortmatic);
//             } else if (walletName === 'portis') {
//                 activate(portis);
//             } else if (walletName === 'torus') {
//                 activate(torus);
//             } else if (walletName === 'trezor') {
//                 activate(trezor);
//             } else if (walletName === 'ledger') {
//                 activate(ledger);
//             } else if (walletName === 'binance') {
//                 activate(binance);
//             } else if (walletName === 'nabox') {
//                 activate(nabox);
//             } 
//             else {
//                 console.log("wallet ERROR");
//                 activate(injected);
//             }
//             localStorage.setItem("login_status", "on")
//         },
//         [activate],
//     )

//     return connectWalletByLocalStorage;
// }

const usePageDefaultChains = () => {
    const history = useHistory()
    const pageName = history.location.pathname
    const defaultChains = useMemo(() => {
        const mapping = {
            "/future": 421613,
            "/options": 421613,
            "/powers": 421613,
            "/overview": 421613
        }
        return mapping[pageName] || 80001
    }, [pageName])
    return defaultChains
}

export const useConnectWallet = () => {
    const { activate } = useWeb3React();
    const defaultChainId = usePageDefaultChains();
    const { chainId, isFallbackChainId } = useChainId(defaultChainId);

    const connectWallet = useCallback(async () => {
        if (isFallbackChainId) {
            await switchNetwork(chainId);
        }
        activate(injected);
    }, [chainId, isFallbackChainId, activate])

    return connectWallet;
}