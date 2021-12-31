
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
} from '@/connectors';
import { useWeb3React } from '@web3-react/core';
const { account, chainId, activate, deactivate, active } = useWeb3React();
export function SelectWallet(walletName){
    
    if (walletName === 'metamask' || walletName === 'opera') {
        activate(injected);
    } else if (walletName === 'walletconnect') {
        activate(walletconnect);
    } else if (walletName === 'coinbase') {
        activate(walletlink);
    } else if (walletName === 'fortmatic') {
        activate(fortmatic);
    } else if (walletName === 'portis') {
        activate(portis);
    } else if (walletName === 'torus') {
        activate(torus);
    } else if (walletName === 'trezor') {
        activate(trezor);
    } else if (walletName === 'ledger') {
        activate(ledger);
    } else if (walletName === 'binance') {
        activate(binance);
    } else {
        console.log("wallet ERROR");
    }
    localStorage.setItem('wallet', walletName);
}