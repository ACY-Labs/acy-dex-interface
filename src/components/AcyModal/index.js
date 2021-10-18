import {useEffect} from 'react';
import { Modal } from 'antd';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import styles from './style.less';
import { rest } from 'lodash-decorators';

const AcyModal = ({ children, ...rest }) => {
  // const { account, chainId, library, activate } = useWeb3React();
  // const injected = new InjectedConnector({
  //   supportedChainIds: [1, 3, 4, 5, 42],
  // });

  // let supportedTokens = [
  //   {
  //     symbol: "USDC",
  //     address: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
  //     decimals: 6,
  //   },
  //   {
  //     symbol: "ETH",
  //     address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
  //     decimals: 18,
  //   },
  //   {
  //     symbol: "WETH",
  //     address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
  //     decimals: 18,
  //   },
  //   {
  //     symbol: "UNI",
  //     address: "0x03e6c12ef405ac3f642b9184eded8e1322de1a9e",
  //     decimals: 18,
  //   },
  //   {
  //     symbol: "DAI",
  //     address: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  //     decimals: 18,
  //   },
  //   {
  //     symbol: "cDAI",
  //     address: "0x6d7f0754ffeb405d23c51ce938289d4835be3b14",
  //     decimals: 8,
  //   },
  //   {
  //     symbol: "WBTC",
  //     address: "0x577d296678535e4903d59a4c929b718e1d575e0a",
  //     decimals: 8,
  //   },
  // ];

  // useEffect(() => {
  //   activate(injected);
  // }, []);
  return (
    <Modal
      className={styles.acymodal}
      bodyStyle={{
        padding: '21px',
        background: rest.backgroundColor ? rest.backgroundColor : '#2e3032',
        // backgroundColor: '#1b1b1c',
        borderRadius: ' 20px',
        boxShadow: '0 0 14px #2d2d2d'
      }}
      footer={null}
      closable={false}
      {...rest}
    >
        {/* <h1>{account}</h1> */}
      {children}
    </Modal>
  );
};
export default AcyModal;
