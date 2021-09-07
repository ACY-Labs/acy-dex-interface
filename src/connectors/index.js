import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { FortmaticConnector } from '@web3-react/fortmatic-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { TorusConnector } from '@web3-react/torus-connector';
import { NetworkConnector } from '@web3-react/network-connector';

const RPC_URLS = {
  1: 'https://mainnet.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2',
  4: 'https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2',
};
// 连接钱包时支持的货币id
const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

const network = new NetworkConnector({
  urls: { 1: RPC_URLS['1'], 4: RPC_URLS['4'] },
  defaultChainId: 4,
});

const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS['1'], 4: RPC_URLS['4'] },
  qrcode: true,
});
const walletlink = new WalletLinkConnector({
  url: RPC_URLS['4'],
  appName: 'ACY swap',
  supportedChainIds: [1, 3, 4, 5, 42, 10, 137, 69, 420, 80001],
});
const fortmatic = new FortmaticConnector({ apiKey: 'pk_test_1897AD5B792BA339', chainId: 4 });
const portis = new PortisConnector({
  dAppId: 'c474625b-8239-4ce8-ab42-bd16489873c3',
  networks: [4], // uses mainet by default
});
const torus = new TorusConnector({ chainId: 4, initOptions: { network: { host: 'rinkeby' } } });

export { injected, walletconnect, walletlink, fortmatic, portis, torus, network };
