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

import tokenList from '@/constants/TokenList'

//^mark
import { connect } from 'umi';

import styles from './styles.less';
import { sortAddress } from '@/utils/utils';

import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import React, { useState, useEffect, useCallback } from 'react';

import {
  supportedTokens,
  getRouterContract,
  calculateGasMargin,
  getTokenTotalSupply,
  ACYSwapErrorStatus,
  approve,
  checkTokenIsApproved,
  getUserTokenBalanceRaw,
  getUserTokenBalance,
  calculateSlippageAmount,
  INITIAL_ALLOWED_SLIPPAGE,
} from '@/acy-dex-swap/utils/index';

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
import { Row, Col, Button, Alert, Input } from 'antd';

import { getEstimated, addLiquidity } from '@/acy-dex-swap/core/addLiquidity';

const { AcyTabPane } = AcyTabs;

const AddLiquidityComponent = props => {
  const { dispatch, onLoggedIn } = props;
  // 选择货币的弹窗
  const [visible, setVisible] = useState(null);
  // 选择货币前置和后置
  const [before, setBefore] = useState(true);

  // 交易对前置货币
  let [token0, setToken0] = useState(tokenList[0]);
  // 交易对后置货币
  let [token1, setToken1] = useState(tokenList[1]);
  // 交易对前置货币余额
  let [token0Balance, setToken0Balance] = useState('0');
  // 交易对后置货币余额
  let [token1Balance, setToken1Balance] = useState('0');
  // 交易对前置货币兑换量
  let [token0Amount, setToken0Amount] = useState();
  // 交易对后置货币兑换量
  let [token1Amount, setToken1Amount] = useState();
  let [token0BalanceShow, setToken0BalanceShow] = useState(false);
  let [token1BalanceShow, setToken1BalanceShow] = useState(false);

  // true 指前面的，false指后面的
  let [exactIn, setExactIn] = useState(true);

  let [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [inputSlippageTol, setInputSlippageTol] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [slippageError, setSlippageError] = useState('');

  let [needApproveToken0, setNeedApproveToken0] = useState(false);
  let [needApproveToken1, setNeedApproveToken1] = useState(false);

  let [approveAmountToken0, setApproveAmountToken0] = useState('0');
  let [approveAmountToken1, setApproveAmountToken1] = useState('0');

  let [approveToken0ButtonShow, setApproveToken0ButtonShow] = useState(false);
  let [approveToken1ButtonShow, setApproveToken1ButtonShow] = useState(false);

  let [liquidityBreakdown, setLiquidityBreakdown] = useState();
  let [buttonContent, setButtonContent] = useState('connect to wallet');
  let [buttonStatus, setButtonStatus] = useState(true);
  let [liquidityStatus, setLiquidityStatus] = useState();

  let [pair, setPair] = useState();
  let [noLiquidity, setNoLiquidity] = useState();
  let [parsedToken0Amount, setParsedToken0Amount] = useState();
  let [parsedToken1Amount, setParsedToken1Amount] = useState();

  let [args, setArgs] = useState();
  let [value, setValue] = useState();

  let [userLiquidityPositions, setUserLiquidityPositions] = useState([]);

  const individualFieldPlaceholder = 'Enter amount';
  const dependentFieldPlaceholder = 'Estimated value';
  const slippageTolerancePlaceholder = 'please input a number from 1.00 to 100.00';

  // 连接钱包函数
  const { account, chainId, library, activate } = useWeb3React();
  // 连接钱包时支持的货币id
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });

  // 初始化函数时连接钱包
  useEffect(
    () => {
      activate(injected);
    },
    [account]
  );

  let t0Changed = useCallback(
    async () => {
      if (!token0 || !token1) return;
      if (!exactIn) return;
      await getEstimated(
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
        setToken0Amount,
        setToken1Amount,
        setNeedApproveToken0,
        setNeedApproveToken1,
        setApproveAmountToken0,
        setApproveAmountToken1,
        setApproveToken0ButtonShow,
        setApproveToken1ButtonShow,
        setLiquidityBreakdown,
        setButtonContent,
        setButtonStatus,
        setLiquidityStatus,
        setPair,
        setNoLiquidity,
        setParsedToken0Amount,
        setParsedToken1Amount,
        setArgs,
        setValue
      );
    },
    [
      token0,
      token1,
      token0Amount,
      token1Amount,
      slippageTolerance,
      exactIn,
      chainId,
      library,
      account,
    ]
  );
  let t1Changed = useCallback(
    async () => {
      if (!token0 || !token1) return;
      if (exactIn) return;
      await getEstimated(
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
        setToken0Amount,
        setToken1Amount,
        setNeedApproveToken0,
        setNeedApproveToken1,
        setApproveAmountToken0,
        setApproveAmountToken1,
        setApproveToken0ButtonShow,
        setApproveToken1ButtonShow,
        setLiquidityBreakdown,
        setButtonContent,
        setButtonStatus,
        setLiquidityStatus,
        setPair,
        setNoLiquidity,
        setParsedToken0Amount,
        setParsedToken1Amount,
        setArgs,
        setValue
      );
    },
    [
      token0,
      token1,
      token0Amount,
      token1Amount,
      slippageTolerance,
      exactIn,
      chainId,
      library,
      account,
    ]
  );
  useEffect(
    () => {
      t0Changed();
    },
    [
      token0,
      token1,
      token0Amount,
      token1Amount,
      slippageTolerance,
      exactIn,
      chainId,
      library,
      account,
    ]
  );
  useEffect(
    () => {
      t1Changed();
    },
    [
      token0,
      token1,
      token0Amount,
      token1Amount,
      slippageTolerance,
      exactIn,
      chainId,
      library,
      account,
    ]
  );

  useEffect(
    () => {
      if (account == undefined) {
        setButtonStatus(true);
        setButtonContent('Connect to Wallet');
      } else {
        setButtonContent('Choose tokens and amount');
        setButtonStatus(false);
        // set login state to true
        onLoggedIn();
      }
    },
    [chainId, library, account]
  );

  const onClickCoin = () => {
    setVisible(true);
  };
  const onCancel = () => {
    setVisible(false);
  };

  const ConnectWallet = () => {
    activate(injected);
  };

  useEffect(
    () => {
      if (!account || !chainId || !library) return;
      console.log('get balances in liquidity');
      async function getTokenBalances() {
        setToken0BalanceShow(true);
        setToken1BalanceShow(true);
        setToken0Balance(await getUserTokenBalance(token0, chainId, account, library));
        setToken1Balance(await getUserTokenBalance(token1, chainId, account, library));
      }
      getTokenBalances();
    },
    [account, chainId, library, token0, token1]
  );

  const onTokenClick = async token => {
    onCancel();
    // if (before) {
    //   if (account == undefined) {
    //     alert('Please connect to your account');
    //   } else {
    //     setToken0(token);
    //     setToken0Balance(await getUserTokenBalance(token, chainId, account, library));
    //     setToken0BalanceShow(true);
    //   }
    // } else {
    //   if (account == undefined) {
    //     alert('Please connect to your account');
    //   } else {
    //     setToken1(token);
    //     setToken1Balance(await getUserTokenBalance(token, chainId, account, library));
    //     setToken1BalanceShow(true);
    //   }
    // }
  };

  const [favTokenList, setFavTokenList] = useState([]);

  const setTokenAsFav = index => {
    setFavTokenList(prevState => {
      const prevFavTokenList = [...prevState];
      prevFavTokenList.push(tokenList[index]);
      return prevFavTokenList;
    });
  };
  const addLiquidityCallback = status => {
    // 循环获取交易结果
    //     dispatch({
    //       type:'transaction/addTransaction',
    //       payload:{
    //         status:'交易完成',
    //         transactions:[...transactions,receipt]
    //       }
    //     });
    // let lists=[{
    //   hash:status.hash,
    //   receipt
    // },
    // {
    //   hash:status.hash,
    //   receipt
    // }];
    //     const sti = setInterval(() => {
    //       library.getTransactionReceipt(status.hash).then(receipt => {
    //         // receipt is not null when transaction is done
    //         const {transaction:{transactions}}=props;
    //         console.log('transactions',transactions);
    //         if (receipt) {
    //           clearInterval(sti);
    //            dispatch({
    //               type:'transaction/addTransaction',
    //               payload:{
    //                 status:'交易完成',
    //                 transactions:[...transactions,receipt]
    //               }
    //             });
    //         }
    //         else{
    //           dispatch({
    //             type:'transaction/addTransaction',
    //             payload:{
    //               status:'交易中...'
    //             }
    //           });
    //         }
    //       });
    //     }, 500);
  };
  return (
    <div>
      <AcyCuarrencyCard
        icon="eth"
        title={token0BalanceShow && `Balance: ${parseFloat(token0Balance).toFixed(5)}`}
        coin={(token0 && token0.symbol) || 'Select'}
        yuan="566.228"
        dollar={`${token0Balance}`}
        token={token0Amount}
        onChoseToken={async () => {
          onClickCoin();
          setBefore(true);
        }}
        onChangeToken={e => {
          setExactIn(true);
          setToken0Amount(e);
        }}
      />
      <div style={{ margin: '12px auto', textAlign: 'center' }}>
        <AcyIcon width={21.5} name="plus_light" />
      </div>

      <AcyCuarrencyCard
        icon="eth"
        title={token1BalanceShow && `Balance: ${parseFloat(token1Balance).toFixed(5)}`}
        coin={(token1 && token1.symbol) || 'Select'}
        yuan="566.228"
        dollar={`${token1Balance}`}
        token={token1Amount}
        onChoseToken={async () => {
          onClickCoin();
          setBefore(false);
        }}
        onChangeToken={e => {
          setExactIn(false);
          setToken1Amount(e);
        }}
      />

      <AcyDescriptions>
        {liquidityBreakdown && (
          <>
            <div className={styles.breakdownTopContainer}>
              <div className={styles.slippageContainer}>
                <span style={{ fontWeight: 600 }}>Slippage tolerance</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '7px' }}>
                  <Button type="link" style={{ marginRight: '5px' }}>
                    Auto
                  </Button>
                  <Input
                    value={inputSlippageTol || ''}
                    onChange={e => {
                      setInputSlippageTol(e.target.value);
                    }}
                    suffix={<strong>%</strong>}
                  />
                  <Button
                    type="primary"
                    style={{ marginLeft: '10px' }}
                    onClick={() => {
                      if (isNaN(inputSlippageTol)) {
                        setSlippageError('Please input valid slippage value!');
                      } else {
                        setSlippageError('');
                        setSlippageTolerance(parseFloat(inputSlippageTol));
                      }
                    }}
                  >
                    Set
                  </Button>
                </div>
                {slippageError.length > 0 && (
                  <span style={{ fontWeight: 600, color: '#c6224e' }}>{slippageError}</span>
                )}
              </div>
            </div>

            <div className={styles.acyDescriptionContainer}>
              {/* <AcyDescriptions.Item>
              <div className={styles.acyDescriptionTitle}>
                liquidity breakdown
              </div>
            </AcyDescriptions.Item> */}
              {liquidityBreakdown.map(info => (
                <AcyDescriptions.Item>
                  <div className={styles.acyDescriptionItem}>{info}</div>
                </AcyDescriptions.Item>
              ))}
            </div>
          </>
        )}
      </AcyDescriptions>

      {approveToken0ButtonShow == true && (
        <div>
          <AcyButton
            variant="warning"
            onClick={async () => {
              let state = await approve(token0.address, approveAmountToken0, library, account);

              if (state == true) {
                setNeedApproveToken0(false);

                await getEstimated(
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
                  setToken0Amount,
                  setToken1Amount,
                  setNeedApproveToken0,
                  setNeedApproveToken1,
                  setApproveAmountToken0,
                  setApproveAmountToken1,
                  setApproveToken0ButtonShow,
                  setApproveToken1ButtonShow,
                  setLiquidityBreakdown,
                  setButtonContent,
                  setButtonStatus,
                  setLiquidityStatus,
                  setPair,
                  setNoLiquidity,
                  setParsedToken0Amount,
                  setParsedToken1Amount,
                  setArgs,
                  setValue
                );

                if (needApproveToken1 == false) {
                  if (!noLiquidity) setButtonContent('add liquidity');
                  else setButtonStatus('create new pool');
                  setButtonStatus(true);
                }
              }
            }}
            disabled={!needApproveToken0}
          >
            Approve {token0 && token0.symbol}
          </AcyButton>{' '}
        </div>
      )}
      {approveToken1ButtonShow == true && (
        <div>
          <AcyButton
            variant="warning"
            onClick={async () => {
              let state = await approve(token1.address, approveAmountToken1, library, account);
              if (state == true) {
                setNeedApproveToken1(false);
                await getEstimated(
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
                  setToken0Amount,
                  setToken1Amount,
                  setNeedApproveToken0,
                  setNeedApproveToken1,
                  setApproveAmountToken0,
                  setApproveAmountToken1,
                  setApproveToken0ButtonShow,
                  setApproveToken1ButtonShow,
                  setLiquidityBreakdown,
                  setButtonContent,
                  setButtonStatus,
                  setLiquidityStatus,
                  setPair,
                  setNoLiquidity,
                  setParsedToken0Amount,
                  setParsedToken1Amount,
                  setArgs,
                  setValue
                );

                if (needApproveToken0 == false) {
                  if (!noLiquidity) setButtonContent('add liquidity');
                  else setButtonStatus('create new pool');
                  setButtonStatus(true);
                }
              }
            }}
            disabled={!needApproveToken1}
          >
            Approve {token1 && token1.symbol}
          </AcyButton>
        </div>
      )}

      <AcyButton
        variant="success"
        disabled={!buttonStatus}
        onClick={async () => {
          if (account == undefined) {
            activate(injected);
            setButtonContent('Choose tokens and amount');
            setButtonStatus(false);
          } else {
            await addLiquidity(
              {
                ...token0,
                amount: token0Amount,
              },
              {
                ...token1,
                amount: token1Amount,
              },
              100 * slippageTolerance,
              exactIn,
              chainId,
              library,
              account,
              pair,
              noLiquidity,
              parsedToken0Amount,
              parsedToken1Amount,
              args,
              value,
              setLiquidityStatus,
              addLiquidityCallback
            );
          }
        }}
      >
        {buttonContent}
      </AcyButton>
      <AcyDescriptions>
        {liquidityStatus && <AcyDescriptions.Item>Liquidity Status</AcyDescriptions.Item>}
        {liquidityStatus && <AcyDescriptions.Item>{liquidityStatus}</AcyDescriptions.Item>}
      </AcyDescriptions>

      <AcyModal onCancel={onCancel} width={400} visible={visible}>
        <div className={styles.title}>Select a token</div>
        <div className={styles.search}>
          <Input
            size="large"
            style={{
              backgroundColor: '#373739',
              borderRadius: '40px',
            }}
            placeholder="Enter the token symbol or address"
          />
        </div>

        <div className={styles.coinList}>
          <AcyTabs>
            <AcyTabPane tab="All" key="1">
              {tokenList.map((token, index) => (
                <AcyCoinItem
                  data={token}
                  key={index}
                  customIcon={false}
                  setAsFav={() => setTokenAsFav(index)}
                  selectToken={() => {
                    onTokenClick(token);
                  }}
                />
              ))}
            </AcyTabPane>
            <AcyTabPane tab="Favorite" key="2">
              {favTokenList.map((supToken, index) => (
                <AcyCoinItem
                  data={supToken}
                  key={index}
                  selectToken={() => setTokenAsFav(index)}
                  customIcon={false}
                  index={index}
                  setAsFav={() => setTokenAsFav(index)}
                  hideFavButton
                />
              ))}
            </AcyTabPane>
          </AcyTabs>
        </div>
      </AcyModal>
    </div>
  );
};

export default connect(({ global, transaction, loading }) => ({
  global,
  transaction,
  loading: loading.global,
}))(AddLiquidityComponent);
