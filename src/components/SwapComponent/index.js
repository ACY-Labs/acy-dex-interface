/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-return-await */
/* eslint-disable no-restricted-globals */
/* eslint-disable consistent-return */
import {
  AcyCard,
  AcyIcon,
  AcyPeriodTime,
  AcyTabs,
  AcyCuarrencyCard,
  AcyConnectWalletBig,
  AcyModal,
  AcyInput,
  AcyCoinItem,
  AcyLineChart,
  AcyConfirm,
  AcyApprove,
} from '@/components/Acy';

import { connect } from 'umi';
import styles from './styles.less';
import { sortAddress } from '@/utils/utils';

import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useState, useEffect, useCallback } from 'react';

import {
  supportedTokens,
  getRouterContract,
  calculateGasMargin,
  getContract,
  isZero,
  ROUTER_ADDRESS,
  getAllowance,
  ACYSwapErrorStatus,
  computeTradePriceBreakdown,
  getUserTokenBalanceRaw,
  swapGetEstimated,
  approve,
  checkTokenIsApproved,
  getUserTokenBalance,
  INITIAL_ALLOWED_SLIPPAGE,
} from '@/acy-dex-swap/utils/index';

import { swap } from '@/acy-dex-swap/components/SwapComponent';

import ERC20ABI from '@/abis/ERC20.json';
import WETHABI from '@/abis/WETH.json';

import {
  Token,
  TokenAmount,
  Pair,
  TradeType,
  Route,
  Trade,
  Fetcher,
  Percent,
  Router,
  WETH,
  ETHER,
  CurrencyAmount,
  InsufficientReservesError,
  FACTORY_ADDRESS,
} from '@uniswap/sdk';

import { MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';

const { AcyTabPane } = AcyTabs;
import { Row, Col, Button } from 'antd';
import { Alert } from 'antd';

const MyComponent = props => {
  const { dispatch } = props;
  // 选择货币的弹窗
  const [visible, setVisible] = useState(null);

  // 选择货币前置和后置
  const [before, setBefore] = useState(true);

  // 交易对前置货币
  const [token0, setToken0] = useState(null);
  // 交易对前置货币余额
  const [token0Balance, setToken0Balance] = useState('0');
  // 交易对前置货币兑换量
  const [token0Amount, setToken0Amount] = useState('0');

  // 交易对后置货币
  const [token1, setToken1] = useState(null);
  // 交易对后置货币余额
  const [token1Balance, setToken1Balance] = useState('0');
  // 交易对后置货币兑换量
  const [token1Amount, setToken1Amount] = useState('0');

  // swap交易信息分析 Price impact,LP FEE,Min received
  const [swapBreakdown, setSwapBreakdown] = useState();
  // swap交易状态
  const [swapStatus, setSwapStatus] = useState();

  // 授权,这里指交易对的授权操作
  const [needApprove, setNeedApprove] = useState(false);
  // 授权量
  const [approveAmount, setApproveAmount] = useState('0');
  // 交易对前置货币授权量
  const [token0ApproxAmount, setToken0ApproxAmount] = useState('0');
  // 交易对后置货币授权量
  const [token1ApproxAmount, setToken1ApproxAmount] = useState('0');

  let [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  // 是否需要精度的计算方式
  const [exactIn, setExactIn] = useState(true);

  // 占位符
  const individualFieldPlaceholder = 'Enter amount';
  const dependentFieldPlaceholder = 'Estimated value';

  // 连接钱包函数
  const { account, chainId, library, activate } = useWeb3React();
  // 连接钱包时支持的货币id
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  });

  // 初始化函数时连接钱包
  useEffect(() => {
    activate(injected);
  }, []);

  const t0Changed = useCallback(
    async () => {
      if (!token0 || !token1) return;
      console.log('token0 is changing!');
      setToken1ApproxAmount(
        await swapGetEstimated(
          {
            ...token0,
            amount: token0Amount,
          },
          {
            ...token1,
            amount: token1Amount,
          },

          true,
          chainId,
          library
        )
      );
    },
    [token0, token1, token0Amount, token1Amount, chainId, library]
  );

  const t1Changed = useCallback(
    async () => {
      if (!token0 || !token1) return;
      setToken0ApproxAmount(
        await swapGetEstimated(
          {
            ...token0,
            amount: token0Amount,
          },
          {
            ...token1,
            amount: token1Amount,
          },

          false,
          chainId,
          library
        )
      );
    },
    [token0, token1, token0Amount, token1Amount, chainId, library]
  );

  useEffect(
    () => {
      t0Changed();
    },
    [token0Amount]
  );

  useEffect(
    () => {
      t1Changed();
    },
    [token1Amount]
  );

  const checkApprovalStatus = useCallback(async () => {
    debugger;
    if (token0 && token1) {
      const approved = await checkTokenIsApproved(
        token0.address,
        parseUnits(token0Amount, token0.decimals),
        library,
        account
      );

      if (approved) {
        setNeedApprove(false);
      }

      console.log(`Token 0 is approved? ${approved}`);
    }
  });

  const onClickCoin = () => {
    setVisible(true);
  };
  const onCancel = () => {
    setVisible(false);
  };

  const ConnectWallet = () => {
    activate(injected);
  };

  return (
    <div>
      <Button type="primary" onClick={ConnectWallet}>
        connect
      </Button>
      <br />
      <alert type="success">{account} </alert>
      {/*<Row>*/}
      {/*  <Col span={24}>*/}
      {/*    <AcyCuarrencyCard*/}
      {/*      icon="eth"*/}
      {/*      title={`Balance: ${token0Balance}`}*/}
      {/*      coin={(token0 && token0.symbol) || 'In token'}*/}
      {/*      yuan="566.228"*/}
      {/*      dollar={`${token0Balance}`}*/}
      {/*      token={token0ApproxAmount}*/}
      {/*      onChoseToken={()=>{*/}
      {/*        onClickCoin();*/}
      {/*        setBefore(false);*/}
      {/*      }}*/}
      {/*      onChangeToken={e => {*/}
      {/*        setToken0ApproxAmount(e.target.value);*/}
      {/*        setToken0Amount(e.target.value);*/}
      {/*        setExactIn(true);*/}
      {/*      }}*/}
      {/*    />*/}
      {/*  </Col>*/}
      {/*</Row>*/}
      <br />
      <AcyCuarrencyCard
        icon="eth"
        title={`Balance: ${token0Balance}`}
        coin={(token0 && token0.symbol) || 'In token'}
        yuan="566.228"
        dollar={`${token0Balance}`}
        token={token0ApproxAmount}
        onChoseToken={() => {
          onClickCoin();
          setBefore(false);
        }}
        onChangeToken={e => {
          setToken0ApproxAmount(e.target.value);
          setToken0Amount(e.target.value);
          setExactIn(true);
        }}
      />
      <AcyIcon name="double-right" />
      <AcyCuarrencyCard
        icon="eth"
        title={`Balance: ${token1Balance}`}
        coin={(token1 && token1.symbol) || 'Out token'}
        yuan="566.228"
        dollar={`${token1Balance}`}
        token={token1ApproxAmount}
        onChoseToken={() => {
          onClickCoin();
          setBefore(true);
        }}
        onChangeToken={e => {
          setToken1ApproxAmount(e.target.value);
          setToken1Amount(e.target.value);
          setExactIn(true);
        }}
      />
      <AcyConnectWalletBig onClick={ConnectWallet}>
        {(account && sortAddress(account)) || 'Connect Wallet'}
      </AcyConnectWalletBig>
      <br />
      <div>the Slippage Tolerance you choose is [ {slippageTolerance}% ]</div>
      <br />
      <Button
        type="primary"
        onClick={() => {
          approve(token0.address, approveAmount, library, account);
        }}
      >
        approve
      </Button>{' '}
      <Button
        type="primary"
        onClick={() => {
          swap(
            {
              ...token0,
              amount: token0Amount,
            },
            {
              ...token1,
              amount: token1Amount,
            },
            slippageTolerance * 100,
            exactIn,
            chainId,
            library,
            account,
            setNeedApprove,
            setApproveAmount,
            setSwapStatus,
            setSwapBreakdown,
            setToken0Amount,
            setToken1Amount
          );
        }}
      >
        Swap
      </Button>
      <AcyModal onCancel={onCancel} width={600} height={400} visible={visible}>
        <div className={styles.title}>
          <AcyIcon name="back" /> Select a token
        </div>
        <div className={styles.search}>
          <AcyInput
            placeholder="Enter the token symbol or address"
            suffix={<AcyIcon name="search" />}
          />
        </div>
        <div className={styles.coinList}>
          <AcyTabs>
            <AcyTabPane tab="All" key="1">
              {supportedTokens.map((token, index) => (
                <AcyCoinItem
                  data={token}
                  key={index}
                  onClick={async () => {
                    if (!before) {
                      setToken0(token);
                      setToken0Balance(await getUserTokenBalance(token, chainId, account, library));
                      onCancel();
                    } else {
                      setToken1(token);
                      setToken1Balance(await getUserTokenBalance(token, chainId, account, library));
                      onCancel();
                    }
                  }}
                />
                // <Dropdown.Item
                //   key={index}
                //   onClick={async () => {
                //     setToken0(token);
                //     setToken0Balance(await getUserTokenBalance(token, chainId, account, library));
                //   }}
                // >
                //   {token.symbol}
                // </Dropdown.Item>
              ))}
            </AcyTabPane>
            <AcyTabPane tab="Favorite" key="2" />
            <AcyTabPane tab="Index" key="3" />
            <AcyTabPane tab="Synth" key="4" />
          </AcyTabs>
        </div>
      </AcyModal>
    </div>
  );
};

export default connect(({ global, loading }) => ({
  global,
  loading: loading.global,
}))(MyComponent);
