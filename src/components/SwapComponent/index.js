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
  AcyButton,
  AcyDescriptions,
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
  approve,
  checkTokenIsApproved,
  getUserTokenBalance,
  INITIAL_ALLOWED_SLIPPAGE,
} from '@/acy-dex-swap/utils/index';

import {
  checkSwapGetEstimated,
  swapGetEstimated,
  swap,
} from '@/acy-dex-swap/components/SwapComponent';

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
  // 交易对后置货币
  const [token1, setToken1] = useState(null);

  // 交易对前置货币余额
  const [token0Balance, setToken0Balance] = useState('0');
  // 交易对后置货币余额
  const [token1Balance, setToken1Balance] = useState('0');

  // 交易对前置货币兑换量
  const [token0Amount, setToken0Amount] = useState('0');
  // 交易对后置货币兑换量
  const [token1Amount, setToken1Amount] = useState('0');

  const [token0BalanceShow, setToken0BalanceShow] = useState(false);
  const [token1BalanceShow, setToken1BalanceShow] = useState(false);

  let [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);

  // when exactIn is true, it means the firt line
  // when exactIn is false, it means the second line
  let [exactIn, setExactIn] = useState(true);

  let [swapStatus, setSwapStatus] = useState();
  let [needApprove, setNeedApprove] = useState(false);
  let [approveAmount, setApproveAmount] = useState('0');
  // Breakdown shows the estimated information for swap
  let [swapBreakdown, setSwapBreakdown] = useState();

  let [swapButtonContent, setSwapButtonContent] = useState('Connect to Wallet');
  let [swapButtonState, setSwapButtonState] = useState(true);
  let [swapFunction, setSwapFunction] = useState(0);
  let [swapOperatorStatus, setSwapOperatorStatus] = useState('');
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
    // activate(injected);
  }, []);
  // 通知钱包连接成功
  useEffect(() => {
    // todo....
    if (account) {
      const { dispatch } = props;
      dispatch({
        type: 'global/updateAccount',
        payload: {
          account,
        },
      });
    }
  }, account);

  // token1Amount is changed according to token0Amount
  let t0Changed = useCallback(
    async () => {
      if (!token0 || !token1) return;
      if (!exactIn) return;

      let state = checkSwapGetEstimated(
        {
          ...token0,
          amount: token0Amount,
        },
        {
          ...token1,
          amount: token1Amount,
        },

        exactIn,
        chainId,
        library
      );
      if (state == false) return;

      await swapGetEstimated(
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
        setSwapStatus,
        setSwapBreakdown,
        setToken0Amount,
        setToken1Amount,
        setSwapButtonContent,
        setSwapButtonState,
        setNeedApprove,
        setApproveAmount
      );
    },
    [token0, token1, token0Amount, token1Amount, exactIn, chainId, library]
  );

  // token0Amount is changed according to token1Amount
  let t1Changed = useCallback(
    async () => {
      if (!token0 || !token1) return;
      if (exactIn) return;
      let state = checkSwapGetEstimated(
        {
          ...token0,
          amount: token0Amount,
        },
        {
          ...token1,
          amount: token1Amount,
        },
        exactIn,
        chainId,
        library
      );
      if (state == false) return;

      await swapGetEstimated(
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
        setSwapStatus,
        setSwapBreakdown,
        setToken0Amount,
        setToken1Amount,
        setSwapButtonContent,
        setSwapButtonState,
        setNeedApprove,
        setApproveAmount
      );
    },
    [token0, token1, token0Amount, token1Amount, exactIn, chainId, library]
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

  //
  //
  // const checkApprovalStatus = useCallback(async () => {
  //   debugger;
  //   if (token0 && token1) {
  //     const approved = await checkTokenIsApproved(
  //       token0.address,
  //       parseUnits(token0Amount, token0.decimals),
  //       library,
  //       account
  //     );
  //
  //     if (approved) {
  //       setNeedApprove(false);
  //     }
  //
  //     console.log(`Token 0 is approved? ${approved}`);
  //   }
  // });

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
    <div className={styles.sc}>
      <AcyCuarrencyCard
        icon="eth"
        title={`Balance: ${token0Balance}`}
        coin={(token0 && token0.symbol) || 'In token'}
        yuan="566.228"
        dollar={`${token0Balance}`}
        token={token0Amount}
        onChoseToken={() => {
          onClickCoin();
          setBefore(false);
        }}
        onChangeToken={e => {
          setToken0Amount(e.target.value);
          setExactIn(true);
        }}
      />

      <div style={{ margin: '12px auto', textAlign: 'center' }}>
        <AcyIcon width={21.5} name="double-down" />
      </div>

      <AcyCuarrencyCard
        icon="eth"
        title={`Balance: ${token1Balance}`}
        coin={(token1 && token1.symbol) || 'Out token'}
        yuan="566.228"
        dollar={`${token1Balance}`}
        token={token1Amount}
        onChoseToken={() => {
          onClickCoin();
          setBefore(true);
        }}
        onChangeToken={e => {
          // setToken1ApproxAmount(e.target.value);
          setToken1Amount(e.target.value);
          setExactIn(false);
        }}
      />

      <AcyDescriptions>
        {swapStatus && <AcyDescriptions.Item>swap status: </AcyDescriptions.Item>}
        {swapStatus && <AcyDescriptions.Item>{swapStatus}</AcyDescriptions.Item>}
      </AcyDescriptions>

      <AcyDescriptions>
        {swapBreakdown && <AcyDescriptions.Item>swap breakdown</AcyDescriptions.Item>}
        {swapBreakdown &&
          swapBreakdown.map(info => <AcyDescriptions.Item>{info}</AcyDescriptions.Item>)}
      </AcyDescriptions>

      {needApprove == true && (
        <mark>
          <AcyButton
            onClick={() => {
              approve(token0.address, approveAmount, library, account);
            }}
            disabled={!needApprove}
          >
            approve
          </AcyButton>{' '}
        </mark>
      )}

      {
        <AcyButton
          disabled={!swapButtonState}
          onClick={() => {
            if (swapFunction == 0) {
              activate(injected);
              setSwapFunction(1);
              setSwapButtonContent('choose tokens and amount');
              setSwapButtonState(false);
            } else {
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
                setSwapOperatorStatus
              );
            }
          }}
        >
          {swapButtonContent}
        </AcyButton>
      }

      <AcyDescriptions>
        {swapOperatorStatus && <AcyDescriptions.Item>swapOperatorStatus: </AcyDescriptions.Item>}
        {swapOperatorStatus && <AcyDescriptions.Item> {swapOperatorStatus}</AcyDescriptions.Item>}
      </AcyDescriptions>

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
                    onCancel();
                    if (!before) {
                      if (account == undefined) {
                        alert('please connect to your account');
                      } else if (chainId == undefined) {
                        alert('please connect to rinkey testnet');
                      } else if (library == undefined) {
                        alert('please get your library connected');
                      } else {
                        setToken0(token);
                        setToken0Balance(
                          await getUserTokenBalance(token, chainId, account, library)
                        );
                        setToken0BalanceShow(true);
                      }
                    } else {
                      if (account == undefined) {
                        alert('please connect to your account');
                      } else if (chainId == undefined) {
                        alert('please connect to rinkey testnet');
                      } else if (library == undefined) {
                        alert('please get your library connected');
                      } else {
                        setToken1(token);
                        setToken1Balance(
                          await getUserTokenBalance(token, chainId, account, library)
                        );
                        setToken1BalanceShow(true);
                      }
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
