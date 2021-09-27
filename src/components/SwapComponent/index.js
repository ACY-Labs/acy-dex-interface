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
  AcySmallButton,
} from '@/components/Acy';

import { Input } from 'antd';
import { connect } from 'umi';
import styles from './styles.less';
import { sortAddress, abbrNumber } from '@/utils/utils';
import axios from 'axios';

import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Error,
  approve,
  calculateGasMargin,
  checkTokenIsApproved,
  computeTradePriceBreakdown,
  getAllowance,
  getContract,
  getRouterContract,
  getUserTokenBalance,
  getUserTokenBalanceRaw,
  INITIAL_ALLOWED_SLIPPAGE,
  isZero,
  ROUTER_ADDRESS,
  supportedTokens,
} from '@/acy-dex-swap/utils/index';

import { swapGetEstimated, swap } from '@/acy-dex-swap/core/swap';

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

const { AcyTabPane } = AcyTabs;
import { Row, Col, Button, Icon } from 'antd';
import { Alert } from 'antd';
import spinner from '@/assets/loading.svg';
import INITIAL_TOKEN_LIST from '@/constants/TokenList';
import moment from 'moment';

const SwapComponent = props => {
  const { dispatch, onSelectToken0, onSelectToken1, onSelectToken } = props;

  // 选择货币的弹窗
  const [visible, setVisible] = useState(null);

  // 选择货币前置和后置
  const [before, setBefore] = useState(true);

  // 交易对前置货币
  const [token0, setToken0] = useState(INITIAL_TOKEN_LIST[0]);
  // 交易对后置货币
  const [token1, setToken1] = useState(INITIAL_TOKEN_LIST[1]);

  // 交易对前置货币余额
  const [token0Balance, setToken0Balance] = useState('0');
  // 交易对后置货币余额
  const [token1Balance, setToken1Balance] = useState('0');

  // 交易对前置货币兑换量
  const [token0Amount, setToken0Amount] = useState();
  // 交易对后置货币兑换量
  const [token1Amount, setToken1Amount] = useState();

  const [token0BalanceShow, setToken0BalanceShow] = useState(false);
  const [token1BalanceShow, setToken1BalanceShow] = useState(false);

  const [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [inputSlippageTol, setInputSlippageTol] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [slippageError, setSlippageError] = useState('');

  // when exactIn is true, it means the firt line
  // when exactIn is false, it means the second line
  const [exactIn, setExactIn] = useState(true);

  const [needApprove, setNeedApprove] = useState(false);
  const [approveAmount, setApproveAmount] = useState('0');
  const [approveButtonStatus, setApproveButtonStatus] = useState(true);

  // Breakdown shows the estimated information for swap

  // let [estimatedStatus,setEstimatedStatus]=useState();
  const [swapBreakdown, setSwapBreakdown] = useState();
  const [swapButtonState, setSwapButtonState] = useState(true);
  const [swapButtonContent, setSwapButtonContent] = useState('Connect to Wallet');
  const [swapStatus, setSwapStatus] = useState();

  const [pair, setPair] = useState();
  const [route, setRoute] = useState();
  const [trade, setTrade] = useState();
  const [slippageAdjustedAmount, setSlippageAdjustedAmount] = useState();
  const [minAmountOut, setMinAmountOut] = useState();
  const [maxAmountIn, setMaxAmountIn] = useState();
  const [wethContract, setWethContract] = useState();
  const [wrappedAmount, setWrappedAmount] = useState();
  const [showSpinner, setShowSpinner] = useState(false);

  const [tokenSearchInput, setTokenSearchInput] = useState('');
  const [tokenList, setTokenList] = useState(INITIAL_TOKEN_LIST);

  // method to update the value of token search input field,
  // and filter the token list based on the comparison of the value of search input field and token symbol.
  const onTokenSearchChange = e => {
    setTokenSearchInput(e.target.value);
    setTokenList(
      INITIAL_TOKEN_LIST.filter(token => token.symbol.includes(e.target.value.toUpperCase()))
    );
  };

  const individualFieldPlaceholder = 'Enter amount';
  const dependentFieldPlaceholder = 'Estimated value';
  const slippageTolerancePlaceholder = 'Please input a number from 1.00 to 100.00';

  const { account, chainId, library, activate } = useWeb3React();

  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });

  // setSwapButtonContent
  // 监听钱包的连接
  useEffect(() => {
    activate(injected);
  }, []);

  useEffect(
    () => {
      if (!account || !chainId || !library) {
        setToken0BalanceShow(false);
        setToken1BalanceShow(false);
        return;
      }
      async function refreshBalances() {
        setToken0Balance(await getUserTokenBalance(token0, chainId, account, library));
        setToken0BalanceShow(true);
        setToken1Balance(await getUserTokenBalance(token1, chainId, account, library));
        setToken1BalanceShow(true);
      }

      refreshBalances();
    },
    [account, chainId, library]
  );

  const [favTokenList, setFavTokenList] = useState([]);

  const setTokenAsFav = index => {
    setFavTokenList(prevState => {
      const prevFavTokenList = [...prevState];
      prevFavTokenList.push(tokenList[index]);
      return prevFavTokenList;
    });
  };

  // token1Amount is changed according to token0Amount
  const t0Changed = useCallback(
    async () => {
      if (!token0 || !token1) return;
      if (!exactIn) return;
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
        setToken0Amount,
        setToken1Amount,
        setNeedApprove,
        setApproveAmount,
        setApproveButtonStatus,
        setSwapBreakdown,
        setSwapButtonState,
        setSwapButtonContent,
        setSwapStatus,
        setPair,
        setRoute,
        setTrade,
        setSlippageAdjustedAmount,
        setMinAmountOut,
        setMaxAmountIn,
        setWethContract,
        setWrappedAmount
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
  // token0Amount is changed according to token1Amount
  const t1Changed = useCallback(
    async () => {
      if (!token0 || !token1) return;
      if (exactIn) return;
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
        setToken0Amount,
        setToken1Amount,
        setNeedApprove,
        setApproveAmount,
        setApproveButtonStatus,
        setSwapBreakdown,
        setSwapButtonState,
        setSwapButtonContent,
        setSwapStatus,
        setPair,
        setRoute,
        setTrade,
        setSlippageAdjustedAmount,
        setMinAmountOut,
        setMaxAmountIn,
        setWethContract,
        setWrappedAmount
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
        setSwapButtonState(true);
        setSwapButtonContent('Connect to Wallet');
      } else {
        setSwapButtonState(false);
        setSwapButtonContent('Choose tokens and amount');
      }
    },
    [account]
  );

  const onCoinClick = async token => {
    onCancel();
    if (before) {
      if (account == undefined) {
        alert('Please connect to your account');
      } else {
        console.log('SET TOKEN 0');
        console.log(onSelectToken0);
        onSelectToken0(token);
        setToken0(token);
        setToken0Balance(await getUserTokenBalance(token, chainId, account, library));
        setToken0BalanceShow(true);
      }
    } else {
      if (account == undefined) {
        alert('Please connect to your account');
      } else {
        onSelectToken1(token);
        setToken1(token);
        setToken1Balance(await getUserTokenBalance(token, chainId, account, library));
        setToken1BalanceShow(true);
      }
    }
  };

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

  const onSwitchCoinCard = () => {
    let tempToken = token1;
    let tempAmount = token1Amount;
    let tempBalance = token1Balance;

    setToken1(token0);
    setToken1Amount(token0Amount);
    setToken1Balance(token0Balance);

    setToken0(tempToken);
    setToken0Amount(tempAmount);
    setToken0Balance(tempBalance);
  };

  const ConnectWallet = () => {
    activate(injected);
  };
  // swap的交易状态
  const swapCallback = async (status, inputToken, outToken) => {
    // 循环获取交易结果
    const {
      transaction: { transactions },
    } = props;
    // 检查是否包含交易
    const transLength = transactions.filter(item => item.hash == status.hash).length;
    if (transLength == 0) {
      dispatch({
        type: 'transaction/addTransaction',
        payload: {
          transactions: [...transactions, { hash: status.hash }],
        },
      });
    }
    // let lists=[{
    //   hash:status.hash,
    //   receipt
    // },
    // {
    //   hash:status.hash,
    //   receipt
    // }];

    const sti = setInterval(() => {
      library.getTransactionReceipt(status.hash).then(async receipt => {
        console.log('receiptreceipt', receipt);
        // receipt is not null when transaction is done
        if (receipt) {
          props.onGetReceipt(receipt);
          clearInterval(sti);
          let newData = transactions.filter(item => item.hash != status.hash);
          let transactionTime = '',
            inputTokenNum,
            outTokenNum,
            totalToken;
          await library.getBlock(receipt.logs[0].blockNumber).then(data => {
            transactionTime = moment(parseInt(data.timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
          });
          receipt.logs.map(item => {
            if (item.address == inputToken.address) {
              // inputtoken 数量
              // inputTokenNum=BigNumber.from(item.data).div(BigNumber.from(parseUnits("1.0",inputToken.decimal))).toString();
              inputTokenNum = item.data / Math.pow(10, inputToken.decimal).toString();
            }
            if (item.address == outToken.address) {
              // outtoken 数量
              // outTokenNum=BigNumber.from(item.data).div(BigNumber.from(parseUnits("1.0", outToken.decimal))).toString();
              outTokenNum = item.data / Math.pow(10, outToken.decimal).toString();
            }
          });
          // 获取美元价值
          await axios
            .post(
              `https://api.acy.finance/api/chart/swap?token0=${inputToken.addressOnEth}&token1=${
                outToken.addressOnEth
              }&range=1D`
            )
            .then(data => {
              totalToken = abbrNumber(
                inputTokenNum * data.data.data.swaps[data.data.data.swaps.length - 1].rate
              );

              // const { swaps } = data.data.data;
              // const lastDataPoint = swaps[swaps.length - 1];
              // console.log('ROUTE PRICE POINT', lastDataPoint);
              // this.setState({
              //   pricePoint: lastDataPoint.rate,
              // });
            });
          dispatch({
            type: 'transaction/addTransaction',
            payload: {
              transactions: [
                ...newData,
                {
                  hash: status.hash,
                  inputTokenNum,
                  inputTokenSymbol: inputToken.symbol,
                  outTokenNum,
                  outTokenSymbol: outToken.symbol,
                  totalToken,
                  transactionTime,
                },
              ],
            },
          });
          // 保存到loac
          localStorage.setItem(
            'transactions',
            JSON.stringify([
              ...newData,
              {
                hash: status.hash,
                inputTokenNum,
                inputTokenSymbol: inputToken.symbol,
                outTokenNum,
                outTokenSymbol: outToken.symbol,
                totalToken,
                transactionTime,
              },
            ])
          );

          // 读取数据：localStorage.getItem(key);
        }
      });
    }, 500);
  };
  return (
    <div className={styles.sc}>
      <AcyCuarrencyCard
        icon="eth"
        title={token0BalanceShow && `Balance: ${parseFloat(token0Balance).toFixed(3)}`}
        coin={(token0 && token0.symbol) || 'Select'}
        logoURI={token0 && token0.logoURI}
        yuan="566.228"
        dollar={`${token0Balance}`}
        token={token0Amount}
        onChoseToken={() => {
          onClickCoin();
          setBefore(true);
        }}
        onChangeToken={e => {
          setToken0Amount(e);
          setExactIn(true);
        }}
      />

      <div
        className={styles.arrow}
        onClick={() => {
          onSwitchCoinCard();
        }}
      >
        <Icon style={{ fontSize: '16px' }} type="arrow-down" />
      </div>

      <AcyCuarrencyCard
        icon="eth"
        title={token1BalanceShow && `Balance: ${parseFloat(token1Balance).toFixed(3)}`}
        coin={(token1 && token1.symbol) || 'Select'}
        logoURI={token1 && token1.logoURI}
        yuan="566.228"
        dollar={`${token1Balance}`}
        token={token1Amount}
        onChoseToken={() => {
          onClickCoin();
          setBefore(false);
        }}
        onChangeToken={e => {
          // setToken1ApproxAmount(e);
          setToken1Amount(e);
          setExactIn(false);
        }}
      />

      <AcyDescriptions>
        {swapBreakdown && (
          <>
            <div className={styles.breakdownTopContainer}>
              <div className={styles.slippageContainer}>
                <span style={{ fontWeight: 600 }}>Slippage tolerance</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '7px' }}>
                  <Button
                    type="link"
                    style={{ marginRight: '5px' }}
                    onClick={() => {
                      setInputSlippageTol(INITIAL_ALLOWED_SLIPPAGE / 100);
                      setSlippageTolerance(INITIAL_ALLOWED_SLIPPAGE / 100);
                    }}
                  >
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
              <div className={styles.slippageContainer}>
                <span style={{ fontWeight: 600, marginBottom: '10px' }}>Transaction deadline</span>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '50%',
                    marginTop: '7px',
                  }}
                >
                  <Input placeholder={30} suffix={<strong>minutes</strong>} />
                </div>
              </div>
            </div>
            <div className={styles.acyDescriptionContainer}>
              <AcyDescriptions.Item>
                {/* <div className={styles.acyDescriptionTitle}>
                  Swap Breakdown
                </div> */}
              </AcyDescriptions.Item>
              {swapBreakdown.map(info => (
                <AcyDescriptions.Item>
                  <div className={styles.acyDescriptionItem}>{info}</div>
                </AcyDescriptions.Item>
              ))}
            </div>
          </>
        )}
      </AcyDescriptions>

      {needApprove == true && (
        <div>
          <AcyButton
            onClick={async () => {
              setShowSpinner(true);
              setApproveButtonStatus(false);
              const state = await approve(token0.address, approveAmount, library, account);
              setApproveButtonStatus(true);
              setShowSpinner(false);

              if (state) {
                setSwapButtonState(true);
                setSwapButtonContent('Swap');
                setApproveButtonStatus(false);
              }
            }}
            disabled={!approveButtonStatus}
          >
            approve{' '}
            {showSpinner && (
              <img
                style={{ width: 30, height: 30 }}
                src={spinner}
                className={styles.spinner}
                alt="spinner"
              />
            )}
          </AcyButton>{' '}
        </div>
      )}

      {
        <AcyButton
          style={{ marginTop: '25px' }}
          disabled={!swapButtonState}
          onClick={() => {
            if (account == undefined) {
              activate(injected);
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
                pair,
                route,
                trade,
                slippageAdjustedAmount,
                minAmountOut,
                maxAmountIn,
                wethContract,
                wrappedAmount,
                setSwapStatus,
                swapCallback
              );
            }
          }}
        >
          {swapButtonContent}
        </AcyButton>
      }

      <AcyDescriptions>
        {swapStatus && <AcyDescriptions.Item> {swapStatus}</AcyDescriptions.Item>}
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
              {tokenList.map((token, index) => {
                return (
                  <AcyCoinItem
                    data={token}
                    key={index}
                    customIcon={false}
                    // setAsFav={() => setTokenAsFav(index)}
                    setAsFav={() => console.log(index)}
                    selectToken={() => {
                      onCoinClick(token);
                    }}
                  />
                );
              })}
            </AcyTabPane>
            <AcyTabPane tab="Favorite" key="2">
              {favTokenList.map((supToken, index) => (
                <AcyCoinItem
                  data={supToken}
                  key={index}
                  selectToken={() => {
                    onCoinClick(supToken);
                  }}
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
  account: global.account,
  loading: loading.global,
}))(SwapComponent);
