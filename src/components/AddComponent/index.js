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

import INITIAL_TOKEN_LIST from '@/constants/TokenList';

//^mark
import { connect } from 'umi';
import axios from 'axios';

import styles from './styles.less';
import { sortAddress } from '@/utils/utils';

import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
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
} from '@acyswap/sdk';

import { MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import { Row, Col, Button, Alert, Input } from 'antd';

import { getEstimated, addLiquidity } from '@/acy-dex-swap/core/addLiquidity';
import spinner from '@/assets/loading.svg';
import {Icon} from "antd";
import moment from 'moment';

const { AcyTabPane } = AcyTabs;

const AddLiquidityComponent = props => {
  const { dispatch, onLoggedIn } = props;
  // 选择货币的弹窗
  const [visible, setVisible] = useState(null);
  // 选择货币前置和后置
  const [before, setBefore] = useState(true);

  // 交易对前置货币
  let [token0, setToken0] = useState(INITIAL_TOKEN_LIST[0]);
  // 交易对后置货币
  let [token1, setToken1] = useState(INITIAL_TOKEN_LIST[1]);
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
  let [buttonStatus, setButtonStatus] = useState(true);
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

  const setTokenAsFav = index => {
    setFavTokenList(prevState => {
      const prevFavTokenList = [...prevState];
      prevFavTokenList.push(tokenList[index]);
      return prevFavTokenList;
    });
  };

  const addLiquidityCallback = status => {
    console.log("test status:", status);
    const transactions = props.transaction.transactions;
    const isCurrentTransactionDispatched = transactions.filter(item => item.hash == status.hash).length;
    console.log("is current dispatched? ", isCurrentTransactionDispatched);
    // trigger loading spin on top right
    if (isCurrentTransactionDispatched == 0) {
      dispatch({
        type: "transaction/addTransaction",
        payload: {
          transactions: [...transactions, { hash: status.hash }]
        }
      })
    }

    console.log("test test see how many times setInterval is called");
    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {
        console.log("receipt ", receipt);

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          // clearInterval(sti);
          let transactionTime;
          await library.getBlock(receipt.logs[0].blockNumber).then(res => {
            transactionTime = moment(parseInt(res.timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
            console.log("test transactionTime: ", transactionTime)
          });

          // update table UI

          // clear top right loading spin
          const newData = transactions.filter(item => item.hash != status.hash);
          dispatch({
            type: "transaction/addTransaction",
            payload: {
              transactions: [
                ...newData,
                { hash: status.hash, transactionTime }
              ]
            }
          });
          setButtonStatus(true);
          console.log(buttonContent);
          setButtonContent(buttonContent);

          // update backend userPool record
          console.log("test pair to add on server", pairToAddOnServer);
          if (pairToAddOnServer) {
            const {token0, token1} = pairToAddOnServer;
            axios.post(
              // fetch valid pool list from remote
              `https://api.acy.finance/api/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
              // `http://localhost:3001/api/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
            ).then(res => {
              console.log("add to server return: ", res);
        
            }).catch(e => console.log("error: ", e));
          }

          // store to localStorage
        }
      })
    };
    // const sti = setInterval(, 500);
    checkStatusAndFinish();
  };

  // link to liquidity position table
  const {liquidity} = props;
  useEffect(async () => {
    console.log("liquidity updated");
    console.log("liquidity state: ", liquidity);
    // // set token0
    let {token0, token1} = liquidity;
    console.log("new tokens to set in addComponent, " , token0, token1)
    if (token0 && token1) {
      // fetch the token data structure 
      token0 = tokenList.filter(item => item.symbol === token0.symbol)[0]
      token1 = tokenList.filter(item => item.symbol === token1.symbol)[0]
      console.log("fetched token ds", token0, token1)

      setToken0(token0);
      setToken0Balance(await getUserTokenBalance(token0, chainId, account, library));
      setToken0BalanceShow(true);
      setToken1(token1);
      setToken1Balance(await getUserTokenBalance(token1, chainId, account, library));
      setToken1BalanceShow(true);

    }
  }, [liquidity]);

  return (
    <div>
      <AcyCuarrencyCard
        icon="eth"
        title={token0BalanceShow && `Balance: ${parseFloat(token0Balance).toFixed(5)}`}
        logoURI={token0 && token0.logoURI}
        coin={(token0 && token0.symbol) || 'Select'}
        yuan="566.228"
        dollar={`${token0Balance}`}
        token={token0Amount}
        onChoseToken={async () => {
          onClickCoin();
          setBefore(true);
        }}
        onChangeToken={e => {
          console.log("onChangeToken")
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
        logoURI={token1 && token1.logoURI}
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

      {approveToken0ButtonShow == true && (
        <div>
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
          </AcyButton>{' '}
        </div>
      )}
      {approveToken1ButtonShow == true && (
        <div>
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
                  slippageTolerance,
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
              addLiquidityCallback
            );
          }
        }}
      >
        {buttonContent}
      </AcyButton>
      <AcyDescriptions>
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
            value={tokenSearchInput}
            onChange={onTokenSearchChange}
            id="liquidity-token-search-input"
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

export default connect(({ global, transaction, loading, liquidity }) => ({
  global,
  transaction,
  loading: loading.global,
  liquidity
}))(AddLiquidityComponent);
