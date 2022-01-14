import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { FortmaticConnector } from '@web3-react/fortmatic-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { TorusConnector } from '@web3-react/torus-connector';
import { LedgerConnector } from '@web3-react/ledger-connector';
import { TrezorConnector } from '@web3-react/trezor-connector';
import { BscConnector } from '@binance-chain/bsc-connector';

import { FortmaticConnector_test} from './fortmaticToBinance'
import { PortisConnector_test} from './portisToBinance'
import {NaboxConnector} from './naboxWallet'

const RPC_URLS = {
  1: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  4: 'https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2',
  56: 'https://bsc-dataseed1.binance.org/',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  137: 'https://polygon-rpc.com'
};
const POLLING_INTERVAL = 12000;

// 连接钱包时支持的货币id
const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97, 137, 80001],
  //supportedChainIds: [56, 97, 137, 80001],
  // supportedChainIds: [56, 97],
});

const nabox = new NaboxConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 10, 137, 69, 420, 80001, 56, 97],
})


const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS['1'],4: RPC_URLS['4'], 56: RPC_URLS['56'], 97: RPC_URLS['97'], 137:RPC_URLS['137'] },
  //rpc: { 1: RPC_URLS['1']},
  bridge: "https://pancakeswap.bridge.walletconnect.org/",
  qrcode: true,
});

const walletlink = new WalletLinkConnector({
  url: RPC_URLS['56'],
  appName: 'ACY swap',
  supportedChainIds: [1, 3, 4, 5, 42, 10, 137, 69, 420, 80001, 56, 97],
});
/*const fortmatic = new FortmaticConnector({ 
  apiKey: 'pk_test_1897AD5B792BA339', 
  //rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/', 
  chainId: 4,
});*/

const fortmatic = new FortmaticConnector_test({ 
  apiKey: 'pk_test_1897AD5B792BA339', 
  //rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/', 
  chainId: 56,
});

const portisToBinanceTest = { //useless
  nodeUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  chainId: 56,
};
/*const portis = new PortisConnector({
  dAppId: 'c474625b-8239-4ce8-ab42-bd16489873c3',
  networks: [4], // uses mainet by default
});*/

const portis = new PortisConnector_test({
  dAppId: 'c474625b-8239-4ce8-ab42-bd16489873c3',
  networks: [56], // uses mainet by default
});

// const torus = new TorusConnector({ chainId: 4, initOptions: { network: { host: 'rinkeby' } } });

const torus = new TorusConnector({ chainId: 56, initOptions: { network: { host: 'https://bsc-dataseed.binance.org/', chainId: 56, networkName: 'Binance Smart Chain' } } });
//const torus = new TorusConnector({ chainId: 56 , initOptions: { network: { host: 'rinkeby' } } })
const binance = new BscConnector({
  supportedChainIds: [56, 97],
});


// 硬件钱包
const ledger = new LedgerConnector({
  chainId: 4,
  url: RPC_URLS[4],
  pollingInterval: POLLING_INTERVAL,
});

const trezor = new TrezorConnector({
  chainId: 4,
  url: RPC_URLS[4],
});

export { injected, walletconnect, walletlink, fortmatic, portis, torus, ledger, trezor, binance, nabox };
