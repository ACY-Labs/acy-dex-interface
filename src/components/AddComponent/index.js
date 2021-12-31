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
import TokenSelectorModal from "@/components/TokenSelectorModal";

import {useConstantLoader} from '@/constants';

//^mark
import { connect } from 'umi';
import axios from 'axios';

import styles from './styles.less';
import { sortAddress } from '@/utils/utils';

import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
  supportedTokens,
  getRouterContract,
  calculateGasMargin,
  getTokenTotalSupply,
  CustomError,
  approve,
  checkTokenIsApproved,
  getUserTokenBalanceRaw,
  getUserTokenBalance,
  calculateSlippageAmount,
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
} from '@acyswap/sdk';

import { MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import { Row, Col, Button, Alert, Input } from 'antd';

import { getEstimated, addLiquidity } from '@/acy-dex-swap/core/addLiquidity';
import spinner from '@/assets/loading.svg';
import { Icon } from "antd";
import moment from 'moment';

import {
  binance,
  injected,
} from '@/connectors';

const { AcyTabPane } = AcyTabs;

const AddLiquidityComponent = props => {
  const { account, chainId, library, tokenList: INITIAL_TOKEN_LIST, farmSetting: {API_URL: apiUrlPrefix, INITIAL_ALLOWED_SLIPPAGE}} = useConstantLoader();

  const { dispatch, token, onLoggedIn, isFarm = false } = props;
  // 选择货币的弹窗
  const [visible, setVisible] = useState(null);
  // 选择货币前置和后置
  const [before, setBefore] = useState(true);


  let token0pass = INITIAL_TOKEN_LIST[0];
  let token1pass = INITIAL_TOKEN_LIST[1];

  // Check if token is passed from Farm
  for (var i = 0; i < INITIAL_TOKEN_LIST.length; i++) {
    if (INITIAL_TOKEN_LIST[i].symbol == token?.token1) {
      token0pass = INITIAL_TOKEN_LIST[i];
    }
    if (INITIAL_TOKEN_LIST[i].symbol == token?.token2) {
      token1pass = INITIAL_TOKEN_LIST[i];
    }
  }
  // 交易对前置货币
  let [token0, setToken0] = useState(token0pass);
  // 交易对后置货币
  let [token1, setToken1] = useState(token1pass);
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
  let [buttonContent, setButtonContent] = useState('Connect to wallet');
  let [buttonStatus, setButtonStatus] = useState(false);
  let [liquidityStatus, setLiquidityStatus] = useState();

  let [pair, setPair] = useState();
  let [noLiquidity, setNoLiquidity] = useState();
  let [pairToAddOnServer, setPairToAddOnServer] = useState(null);
  let [parsedToken0Amount, setParsedToken0Amount] = useState();
  let [parsedToken1Amount, setParsedToken1Amount] = useState();

  let [args, setArgs] = useState();
  let [value, setValue] = useState();

  const [tokenSearchInput, setTokenSearchInput] = useState('');
  const [tokenList, setTokenList] = useState(INITIAL_TOKEN_LIST);

  const [showSpinner0, setShowSpinner0] = useState(false);
  const [showSpinner1, setShowSpinner1] = useState(false);

  // shake this component when tokens are changed via page model "props.liquidity"
  const [shake, setShake] = useState(false);

  // method to update the value of token search input field,
  // and filter the token list based on the comparison of the value of search input field and token symbol.
  const onTokenSearchChange = e => {
    setTokenSearchInput(e.target.value);
    setTokenList(
      INITIAL_TOKEN_LIST.filter(token => token.symbol.includes(e.target.value.toUpperCase()))
    );
  };

  let [userLiquidityPositions, setUserLiquidityPositions] = useState([]);

  const individualFieldPlaceholder = 'Enter amount';
  const dependentFieldPlaceholder = 'Estimated value';
  const slippageTolerancePlaceholder = 'please input a number from 1.00 to 100.00';

  // 连接钱包函数
  const { activate } = useWeb3React();

  // 初始化函数时连接钱包
  useEffect(
    () => {
      //read the fav tokens code in storage
      var tokens_symbol = JSON.parse(localStorage.getItem('tokens_symbol'));
      //set to fav token
      if (tokens_symbol != null) {
        setFavTokenList(
          INITIAL_TOKEN_LIST.filter(token => tokens_symbol.includes(token.symbol))
        );
      }
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
        setPairToAddOnServer,
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
        setPairToAddOnServer,
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
        setButtonStatus(false);
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

  useEffect(
    () => {
      // focus search input every time token modal is opened.
      // setTimeout is used as a workaround as document.getElementById always return null without  some delay.
      const focusSearchInput = () =>
        document.getElementById('liquidity-token-search-input').focus();
      if (visible === true) setTimeout(focusSearchInput, 100);
    },
    [visible]
  );

  const onClickCoin = () => {
    setVisible(true);
  };
  const onCancel = () => {
    setVisible(false);
  };

  const ConnectWallet = () => {
    activate(binance);
    activate(injected);
  };

  useEffect(
    () => {
      if (!account || !chainId || !library) return;
      console.log('get balances in liquidity');
      const _token0 = INITIAL_TOKEN_LIST[0];
      const _token1 = INITIAL_TOKEN_LIST[1];
      setToken0(_token0);
      setToken1(_token1);
      setTokenList(INITIAL_TOKEN_LIST)

      async function getTokenBalances() {
        setToken0BalanceShow(true);
        setToken1BalanceShow(true);
        setToken0Balance(await getUserTokenBalance(_token0, chainId, account, library).catch(e => console.log("useEffect getUserTokenBalance error", e)));
        setToken1Balance(await getUserTokenBalance(_token1, chainId, account, library).catch(e => console.log("useEffect getUserTokenBalance error", e)));
      }
      getTokenBalances();
    },
    [account, chainId, library]
  );

  const onTokenClick = async token => {
    onCancel();
    if (before) {
      if (account == undefined) {
        alert('Please connect to your account');
      } else {
        setToken0(token);
        setToken0Balance(await getUserTokenBalance(token, chainId, account, library));
        setToken0BalanceShow(true);
      }
    } else {
      if (account == undefined) {
        alert('Please connect to your account');
      } else {
        setToken1(token);
        setToken1Balance(await getUserTokenBalance(token, chainId, account, library));
        setToken1BalanceShow(true);
      }
    }
  };

  const [favTokenList, setFavTokenList] = useState([]);

  const setTokenAsFav = token => {
    setFavTokenList(prevState => {
      const prevFavTokenList = [...prevState];
      if (prevFavTokenList.includes(token)) {
        var tokens = prevFavTokenList.filter(value => value != token);
        localStorage.setItem('token', JSON.stringify(tokens.map(e => e.addressOnEth)));
        localStorage.setItem('tokens_symbol', JSON.stringify(tokens.map(e => e.symbol)));
        return tokens
      }
      prevFavTokenList.push(token);
      localStorage.setItem('token', JSON.stringify(prevFavTokenList.map(e => e.addressOnEth)));
      localStorage.setItem('tokens_symbol', JSON.stringify(prevFavTokenList.map(e => e.symbol)));

      return prevFavTokenList;
    });
  };

  const addLiquidityCallback = status => {
    try {
      console.log("test status:", status);
      const transactions = props.transaction.transactions;
      const isCurrentTransactionDispatched = transactions.filter(item => item.hash == status.hash).length;
      console.log("is current dispatched? ", isCurrentTransactionDispatched);
      // // trigger loading spin on top right
      // if (isCurrentTransactionDispatched == 0) {
      //   dispatch({
      //     type: "transaction/addTransaction",
      //     payload: {
      //       transactions: [...transactions, status.hash]
      //     }
      //   })
      // }

      // const pastTransaction = JSON.parse(localStorage.getItem("transactions"));
      // pastTransaction.push(status.hash);
      // localStorage.setItem("transactions", JSON.stringify(pastTransaction));

      console.log("test test see how many times setInterval is called");
      const checkStatusAndFinish = async () => {
        await library.getTransactionReceipt(status.hash).then(async receipt => {
          console.log("receipt ", receipt);

          if (!receipt) {
            setTimeout(checkStatusAndFinish, 500);
          } else {
            // update backend userPool record
            console.log("test pair to add on server", pairToAddOnServer);
            props.onGetReceipt(receipt.transactionHash);
            if (pairToAddOnServer) {
              const { token0, token1 } = pairToAddOnServer;
              axios.post(
                // fetch valid pool list from remote
                `${apiUrlPrefix}/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
                // `http://localhost:3001/api/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
              ).then(res => {
                console.log("add to server return: ", res);

                // refresh the table
                dispatch({
                  type: "liquidity/setRefreshTable",
                  payload: true,
                });

              }).catch(e => console.log("error: ", e));
            }

            // clear top right loading spin
            const newData = transactions.filter(item => item.hash != status.hash);

            dispatch({
              type: "transaction/addTransaction",
              payload: {
                transactions: newData
              }
            });

            // disable button after each transaction on default, enable it after re-entering amount to add
            console.log(buttonContent);
            setButtonContent("Done");

            // store to localStorage
          }
        })
      };
      // const sti = setInterval(, 500);
      checkStatusAndFinish();
    } catch (e) {
      console.log("swap callback error", e)
    }
  };

  // link to liquidity position table
  const { liquidity } = props;
  useEffect(async () => {
    console.log("liquidity updated");
    console.log("liquidity state: ", liquidity);

    let { token0: modelToken0, token1: modelToken1 } = liquidity;
    console.log("new tokens to set in addComponent, ", modelToken0, modelToken1)
    if (modelToken0 && modelToken1) {
      // shake the component
      setShake(true);
      setTimeout(() => setShake(false), 1000);

      // fetch the token data structure 
      modelToken0 = INITIAL_TOKEN_LIST.filter(item => item.symbol === modelToken0.symbol)[0]
      modelToken1 = INITIAL_TOKEN_LIST.filter(item => item.symbol === modelToken1.symbol)[0]
      console.log("fetched token ds", modelToken0, modelToken1)

      setToken0(modelToken0);
      setToken0Balance(await getUserTokenBalance(modelToken0, chainId, account, library));
      setToken0BalanceShow(true);
      setToken1(modelToken1);
      setToken1Balance(await getUserTokenBalance(modelToken1, chainId, account, library));
      setToken1BalanceShow(true);

    }
  }, [liquidity.token0, liquidity.token1]);

  return (
    <div className={shake ? styles.shake : null}>
      <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
        <div className={styles.addLiquidity}>
          <div className={styles.addComponent}>
            <AcyCuarrencyCard
              icon="eth"
              title={token0BalanceShow && `Balance: ${parseFloat(token0Balance).toFixed(5)}`}
              logoURI={token0 && token0.logoURI}
              coin={(token0 && token0.symbol) || 'Select'}
              yuan="566.228"
              dollar={`${token0Balance}`}
              token={token0Amount}
              showBalance={token1BalanceShow}
              onChoseToken={async () => {
                onClickCoin();
                setBefore(true);
              }}
              onChangeToken={e => {
                console.log("onChangeToken")
                setExactIn(true);
                setToken0Amount(e);
              }}
              isLocked={isFarm}
              library={library}
            />
            <div style={{ margin: '12px auto', textAlign: 'center' }}>
              <AcyIcon width={21.5} name="plus_light" />
            </div>

            <AcyCuarrencyCard
              icon="eth"
              title={token1BalanceShow && `Balance: ${parseFloat(token1Balance).toFixed(5)}`}
              logoURI={token1 && token1.logoURI}
              coin={(token1 && token1.symbol) || 'Select'}
              yuan="566.228"
              dollar={`${token1Balance}`}
              token={token1Amount}
              showBalance={token1BalanceShow}
              onChoseToken={async () => {
                onClickCoin();
                setBefore(false);
              }}
              onChangeToken={e => {
                setExactIn(false);
                setToken1Amount(e);
              }}
              isLocked={isFarm}
              library={library}
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
                          style={{
                            marginLeft: '10px',
                            background: '#2e3032',
                            borderColor: 'transparent',
                          }}
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
            <div>

              <div style={{ display: "flex" }}>
                {(approveToken1ButtonShow || approveToken0ButtonShow) ?
                  (
                    <>
                      <AcyButton
                        variant="warning"
                        onClick={async () => {
                          setShowSpinner0(true);
                          setNeedApproveToken0(false);
                          let state = await approve(token0.address, approveAmountToken0, library, account);
                          setNeedApproveToken0(true);
                          setShowSpinner0(false);

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
                              setPairToAddOnServer,
                              setParsedToken0Amount,
                              setParsedToken1Amount,
                              setArgs,
                              setValue
                            );

                            if (needApproveToken1 == false) {
                              if (!noLiquidity) setButtonContent('Add liquidity');
                              else setButtonStatus('Create new pool');
                              setButtonStatus(true);
                            }
                          }
                        }}
                        disabled={!needApproveToken0}
                      >
                        Approve {token0 && token0.symbol}
                        {showSpinner0 && (
                          <img
                            style={{ width: 30, height: 30, marginLeft: '1%' }}
                            src={spinner}
                            className={styles.spinner}
                            alt="spinner"
                          />
                        )}
                      </AcyButton>

                      <div style={{ width: "1rem" }} />

                      <AcyButton
                        variant="warning"
                        onClick={async () => {
                          setShowSpinner1(true);
                          setNeedApproveToken1(false);
                          let state = await approve(token1.address, approveAmountToken1, library, account);
                          setNeedApproveToken1(true);
                          setShowSpinner1(false);

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
                              setPairToAddOnServer,
                              setParsedToken0Amount,
                              setParsedToken1Amount,
                              setArgs,
                              setValue
                            );

                            if (needApproveToken0 == false) {
                              if (!noLiquidity) setButtonContent('Add liquidity');
                              else setButtonStatus('Create new pool');
                              setButtonStatus(true);
                            }
                          }
                        }}
                        disabled={!needApproveToken1}
                      >
                        Approve {token1 && token1.symbol}
                        {showSpinner1 && (
                          <img
                            style={{ width: 30, height: 30, marginLeft: '1%' }}
                            src={spinner}
                            className={styles.spinner}
                            alt="spinner"
                          />
                        )}
                      </AcyButton>
                    </>
                  ) :

                  <AcyButton
                    variant="success"
                    disabled={!buttonStatus}
                    onClick={async () => {
                      if (account == undefined) {
                        activate(binance);
                        activate(injected);
                        setButtonContent('Choose tokens and amount');
                        setButtonStatus(false);
                      } else {
                        setButtonStatus(false);
                        setButtonContent(<>Processing <Icon type="loading" /></>);
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
                          setButtonContent,
                          addLiquidityCallback
                        );
                      }
                    }}
                  >
                    {buttonContent}
                  </AcyButton>
                }

              </div>

              <AcyDescriptions>
                {liquidityStatus && <AcyDescriptions.Item>{liquidityStatus}</AcyDescriptions.Item>}
              </AcyDescriptions>

            </div>

            <TokenSelectorModal
              onCancel={onCancel} width={400} visible={visible} onCoinClick={onTokenClick}
            />
          </div>
        </div>
      </AcyCard>
    </div>
  );
};

export default connect(({ global, transaction, loading, liquidity }) => ({
  global,
  transaction,
  loading: loading.global,
  liquidity
}))(AddLiquidityComponent);
