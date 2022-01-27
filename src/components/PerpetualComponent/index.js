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
import TokenSelectorModal from "@/components/TokenSelectorModal";
import { PriceBox } from './PriceBox';

import { connect } from 'umi';
import styles from './styles.less';
import { sortAddress, abbrNumber } from '@/utils/utils';
import axios from 'axios';

import { useWeb3React } from '@web3-react/core';
import { binance, injected } from '@/connectors';
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
  isZero,
  supportedTokens,
  parseArbitrageLog,
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
} from '@acyswap/sdk';

import { MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import { hexlify } from '@ethersproject/bytes';

const { AcyTabPane } = AcyTabs;
import { Row, Col, Button, Input, Icon, Radio, Tabs, Slider } from 'antd';
import { RiseOutlined, FallOutlined, LineChartOutlined, FieldTimeOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;

import { Alert } from 'antd';
import spinner from '@/assets/loading.svg';
import moment from 'moment';
import { useConstantLoader } from '@/constants';
import { useConnectWallet } from '@/components/ConnectWallet';

import { AcyRadioButton } from '@/components/AcyRadioButton';

import {MARKET, LIMIT, LONG, SHORT} from './constant'



// var CryptoJS = require("crypto-js");
const SwapComponent = props => {
  const { account, library, chainId, tokenList: INITIAL_TOKEN_LIST, farmSetting: { INITIAL_ALLOWED_SLIPPAGE } } = useConstantLoader(props);
  const { dispatch, onSelectToken0, onSelectToken1, onSelectToken, token, isLockedToken1 = false } = props;

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
  const [token0Amount, setToken0Amount] = useState('');
  // 交易对后置货币兑换量
  const [token1Amount, setToken1Amount] = useState('');
  // 交易中用户使用Flash Arbitrage的额外获利
  const [bonus0, setBonus0] = useState(null);
  const [bonus1, setBonus1] = useState(null);

  const [token0BalanceShow, setToken0BalanceShow] = useState(false);
  const [token1BalanceShow, setToken1BalanceShow] = useState(false);

  const [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);


  // when exactIn is true, it means the firt line
  // when exactIn is false, it means the second line
  const [exactIn, setExactIn] = useState(true);

  const [needApprove, setNeedApprove] = useState(false);
  const [approveAmount, setApproveAmount] = useState('0');
  const [approveButtonStatus, setApproveButtonStatus] = useState(true);

  // Breakdown shows the estimated information for swap

  // let [estimatedStatus,setEstimatedStatus]=useState();
  const [swapBreakdown, setSwapBreakdown] = useState();
  const [swapButtonState, setSwapButtonState] = useState(false);
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

  const [methodName, setMethodName] = useState();
  const [isUseArb, setIsUseArb] = useState(false);
  const [midTokenAddress, setMidTokenAddress] = useState();
  const [poolExist, setPoolExist] = useState(true);

  const [mode, setMode] = useState(LONG);
  const [type, setType] = useState(MARKET);

  const connectWalletByLocalStorage = useConnectWallet();

  useEffect(() => {
    if (!INITIAL_TOKEN_LIST) return
    console.log("resetting page states, new swapComponent token0, token1", INITIAL_TOKEN_LIST[0], INITIAL_TOKEN_LIST[1])
    setVisible(null);
    // 选择货币前置和后置
    setBefore(true);
    // 交易对前置货币
    setToken0(INITIAL_TOKEN_LIST[0]);
    // 交易对后置货币
    setToken1(INITIAL_TOKEN_LIST[1]);
    // 交易对前置货币余额
    setToken0Balance('0');
    // 交易对后置货币余额
    setToken1Balance('0');
    // 交易对前置货币兑换量
    setToken0Amount('');
    // 交易对后置货币兑换量
    setToken1Amount('');
    // 交易中用户使用Flash Arbitrage的额外获利
    setBonus0(null);
    setBonus1(null);
    setToken0BalanceShow(false);
    setToken1BalanceShow(false);
    setSlippageTolerance(INITIAL_ALLOWED_SLIPPAGE / 100);
    setExactIn(true);
    setNeedApprove(false);
    setApproveAmount('0');
    setApproveButtonStatus(true);
    // Breakdown shows the estimated information for swap
    // let [estimatedStatus,setEstimatedStatus]=useState();
    setSwapBreakdown();
    setSwapButtonState(false);
    setSwapButtonContent('Connect to Wallet');
    setSwapStatus();
    setPair();
    setRoute();
    setTrade();
    setSlippageAdjustedAmount();
    setMinAmountOut();
    setMaxAmountIn();
    setWethContract();
    setWrappedAmount();
    setShowSpinner(false);
    setMethodName();
    setIsUseArb(false);
    setMidTokenAddress();
    setPoolExist(true);
  }, [chainId])

  useEffect(() => {
    if (!INITIAL_TOKEN_LIST) return
    console.log("resetting page states, new swapComponent token0, token1", INITIAL_TOKEN_LIST[0], INITIAL_TOKEN_LIST[1])
    setVisible(null);
    // 选择货币前置和后置
    setBefore(true);
    // 交易对前置货币
    setToken0(INITIAL_TOKEN_LIST[0]);
    // 交易对后置货币
    setToken1(INITIAL_TOKEN_LIST[1]);
    // 交易对前置货币余额
    setToken0Balance('0');
    // 交易对后置货币余额
    setToken1Balance('0');
    // 交易对前置货币兑换量
    setToken0Amount('');
    // 交易对后置货币兑换量
    setToken1Amount('');
    // 交易中用户使用Flash Arbitrage的额外获利
    setBonus0(null);
    setBonus1(null);
    setToken0BalanceShow(false);
    setToken1BalanceShow(false);
    setSlippageTolerance(INITIAL_ALLOWED_SLIPPAGE / 100);
    setExactIn(true);
    setNeedApprove(false);
    setApproveAmount('0');
    setApproveButtonStatus(true);
    // Breakdown shows the estimated information for swap
    // let [estimatedStatus,setEstimatedStatus]=useState();
    setSwapBreakdown();
    setSwapButtonState(false);
    setSwapButtonContent('Connect to Wallet');
    setSwapStatus();
    setPair();
    setRoute();
    setTrade();
    setSlippageAdjustedAmount();
    setMinAmountOut();
    setMaxAmountIn();
    setWethContract();
    setWrappedAmount();
    setShowSpinner(false);
    setMethodName();
    setIsUseArb(false);
    setMidTokenAddress();
    setPoolExist(true);
  }, [chainId])

  // connect to page model, reflect changes of pair ratio in this component
  useEffect(() => {
    const { swap: { token0: modelToken0, token1: modelToken1 } } = props;
    setToken0(modelToken0);
    setToken1(modelToken1);
  }, [props.swap]);

  useEffect(() => {
    if (token) {
      setToken0(token.token0);
      setToken1(token.token1);
    }
  }, [token]);



  const individualFieldPlaceholder = 'Enter amount';
  const dependentFieldPlaceholder = 'Estimated value';
  const slippageTolerancePlaceholder = 'Please input a number from 1.00 to 100.00';

  const { activate } = useWeb3React();

  useEffect(
    () => {
      console.log("swapComp 239", account, chainId, library)
      if (!account || !chainId || !library) {
        setToken0BalanceShow(false);
        setToken1BalanceShow(false);
        return;
      }
      console.log("try to refresh balance", INITIAL_TOKEN_LIST, token0, token1)

      const _token0 = INITIAL_TOKEN_LIST[0];
      const _token1 = INITIAL_TOKEN_LIST[1];
      setToken0(_token0);
      setToken1(_token1);
      async function refreshBalances() {
        setToken0Balance(await getUserTokenBalance(_token0, chainId, account, library).catch(e => console.log("refrersh balances error", e)));
        setToken0BalanceShow(true);
        setToken1Balance(await getUserTokenBalance(_token1, chainId, account, library).catch(e => console.log("refrersh balances error", e)));
        setToken1BalanceShow(true);
      }
      try {
        refreshBalances();
      } catch {
        e => console.log("refrersh balances error", e)
      }
    },
    [account, INITIAL_TOKEN_LIST]
  );


  // token1Amount is changed according to token0Amount
  const t0Changed =
    async (e) => {
      if (!token0 || !token1) return;
      if (!exactIn) return;
      console.log("passed in t0 amount", e)
      await swapGetEstimated(
        {
          ...token0,
          amount: e,
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
        setBonus0,
        setBonus1,
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
        setWrappedAmount,
        setMethodName,
        setIsUseArb,
        setMidTokenAddress,
        setPoolExist
      );
    }

  // token0Amount is changed according to token1Amount
  const t1Changed =
    async (e) => {
      console.log("t1changed")
      if (!token0 || !token1) return;
      if (exactIn) return;
      console.log("t1changed entered", token0Amount, token1Amount)
      await swapGetEstimated(
        {
          ...token0,
          amount: token0Amount,
        },
        {
          ...token1,
          amount: e,
        },
        slippageTolerance * 100,
        exactIn,
        chainId,
        library,
        account,
        setToken0Amount,
        setToken1Amount,
        setBonus0,
        setBonus1,
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
        setWrappedAmount,
        setMethodName,
        setIsUseArb,
        setMidTokenAddress,
        setPoolExist
      );
    }

  useEffect(
    async () => {
      await t0Changed(token0Amount);
    },
    [
      token0,
      token1,
      slippageTolerance,
      exactIn,
      chainId,
      library,
      account,
    ]
  );
  useEffect(
    async () => {
      await t1Changed(token1Amount);
    },
    [
      token0,
      token1,
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
        setSwapButtonState(false);
        setSwapButtonContent('Connect to Wallet');
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

  // swap的交易状态
  const swapCallback = async (status, inputToken, outToken) => {
    // 循环获取交易结果
    const {
      transaction: { transactions },
    } = props;
    // 检查是否已经包含此交易
    const transLength = transactions.filter(item => item.hash == status.hash).length;
    // if (transLength == 0) {
    //   dispatch({
    //     type: 'transaction/addTransaction',
    //     payload: {
    //       transactions: [...transactions, status.hash],
    //     },
    //   });
    // }
    // let lists=[{
    //   hash:status.hash,
    //   receipt
    // },
    // {
    //   hash:status.hash,
    //   receipt
    // }];

    // FIXME: implement the following logic with setTimeout(). refer to AddComponent.js checkStatusAndFinish()

    const sti = async (hash) => {
      library.getTransactionReceipt(hash).then(async receipt => {
        console.log(`receiptreceipt for ${hash}: `, receipt);
        // receipt is not null when transaction is done
        if (!receipt)
          setTimeout(sti(hash), 500);
        else {

          if (!receipt.status) {
            setSwapButtonContent("Failed");
          } else {

            props.onGetReceipt(receipt.transactionHash, library, account);

            // set button to done and disabled on default
            setSwapButtonContent("Done");
          }

          const newData = transactions.filter(item => item.hash != hash);
          dispatch({
            type: 'transaction/addTransaction',
            payload: {
              transactions: newData
            },
          });

        }
      });
    }
    sti(status.hash);
  };

  useEffect(() => {
    console.log("transactions changed", props.transaction.transactions)
  }, [props.transaction.transactions]);

  useEffect(() => console.log("test slippage: ", slippageTolerance), [slippageTolerance]);



  // perpetual 部分参数信息
  const perpetualMode = [LONG, MARKET];
  const perpetualType = [{
    name: 'Market',
    icon: <LineChartOutlined />,
    id: MARKET,
  }, {
    name: 'Limit',
    icon: <FieldTimeOutlined />,
    id: LIMIT,
  }];
  // ymj
  const leverageSlider = {
    2: '2x',
    5: {
      style: {
        color: '#b5b6b6',
      },
      label: '5x'
    },
    10: {
      style: {
        color: '#b5b6b6',
      },
      label: '10x'
    },
    15: '15x',
    20: {
      style: {
        color: '#b5b6b6',
      },
      label: '20x'
    },
    25: '25x',
    30: {
      style: {
        color: '#b5b6b6',
      },
      label: '30x'
    }
  };
  const [fees, setFees] = useState(0.1);
  const [leverage, setLeverage] = useState(5);
  const [entryPriceLimit, setEntryPriceLimit,] = useState(0);
  const { profitsIn, liqPrice } = props;
  const { entryPriceMarket, exitPrice, borrowFee } = props;
  // LONG or SHORT
  const modeSelect = (input) => {
    setMode(input.target.value);
  }
  // MARKET or LIMIT
  const typeSelect = (input) => {
    setType(input);
  }
  const calculateFee = () => {
    return fees * 100;
  }
  const limitOnChange = (e) => {
    setEntryPriceLimit(e.target.value)
    if (!e.target.value) {
      setEntryPriceLimit(0);
    }
  };
  const leverageSliderOnChange = (e) =>{
    setLeverage(e);
  }
  useEffect(() => {
    if (type == MARKET && entryPriceMarket) {
      setEntryPriceLimit(entryPriceMarket);
    }
    else if (type == LIMIT) {
      setEntryPriceLimit(0)
    }

  }, [type]);

  return (
    <div>
      <div>
        <Radio.Group
          defaultValue={LONG} buttonStyle="solid" className={styles.modeSelector}
          onChange={modeSelect}>
          <Radio.Button value={LONG} className={styles.modeSubOption}><RiseOutlined />Long</Radio.Button>
          <Radio.Button value={SHORT} className={styles.modeSubOption}><FallOutlined />Short</Radio.Button>
        </Radio.Group>
      </div>
      <div>
        <Tabs defaultActiveKey={MARKET} onChange={typeSelect}
          size={'small'}
          tabBarGutter={0}
          type={'line'}
          tabPosition={'top'}
          tabBarStyle={{ border: '0px black' }}
        //animated={false}
        >
          {perpetualType.map(i => (
            <TabPane tab={<span>{i.icon}{i.name}{' '}</span>} key={i.id}>
            </TabPane>
          ))}
        </Tabs>
      </div>
      <AcyCuarrencyCard
        icon="eth"
        title={token0BalanceShow && `Balance: ${parseFloat(token0Balance).toFixed(3)}`}
        coin={(token0 && token0.symbol) || 'Select'}
        logoURI={token0 && token0.logoURI}
        yuan="566.228"
        dollar={`${token0Balance}`}
        token={token0Amount}
        bonus={!exactIn && bonus0}
        showBalance={token1BalanceShow}
        onChoseToken={() => {
          onClickCoin();
          setBefore(true);
        }}
        onChangeToken={e => {
          setToken0Amount(e);
          setExactIn(true);
          console.log("current t0 amount", e)
          t0Changed(e);
        }}
        library={library}
      />

      <div
        className={styles.arrow}
        disabled={isLockedToken1}
        onClick={() => {
          if (!isLockedToken1) {
            onSwitchCoinCard();
          }

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
        bonus={exactIn && bonus1}
        showBalance={token1BalanceShow}
        onChoseToken={() => {
          onClickCoin();
          setBefore(false);
        }}
        onChangeToken={e => {
          // setToken1ApproxAmount(e);
          setToken1Amount(e);
          setExactIn(false);
          console.log("test exactin and bonus1", exactIn, bonus0)
          console.log("current token1amount", e)
          t1Changed(e);
        }}
        isLocked={isLockedToken1}
        library={library}
      />

      {type === LIMIT &&
        <div className={styles.priceBox}>
          <PriceBox inputTest={"123"} onChange={limitOnChange} marketPrice={123} />
        </div>
      }
      <AcyDescriptions>
        <div className={styles.breakdownTopContainer}>
          <div className={styles.slippageContainer}>
            <span style={{ fontWeight: 600 }}>Leverage ymj</span>
            <span className={styles.leverageSlider}>
              <Slider marks={leverageSlider} defaultValue={leverage} max={30.60} min={1.10} onChange={leverageSliderOnChange} step={0.1} 
                style={{color: 'red'}}/>
            </span>
          </div>
        </div>
      </AcyDescriptions>
      <AcyCard className={styles.describeMain}>
        <div>
          <p className={styles.describeTitle}>Profits In: <span className={styles.describeInfo}>{profitsIn ? profitsIn : '此处需要设置'}</span></p>
          <p className={styles.describeTitle}>Leverage:  <span className={styles.describeInfo}>{Number(leverage).toFixed(2)}x</span></p>
          <p className={styles.describeTitle}>Entry Price:  <span className={styles.describeInfo}>{entryPriceLimit} USD</span></p>
          <p className={styles.describeTitle}>Liq. Price:  <span className={styles.describeInfo}>{liqPrice ? liqPrice : '-'}USD</span></p>
          <p className={styles.describeTitle}>Fees:  <span className={styles.describeInfo}>{fees.toFixed(2)}%({calculateFee()} USD)</span></p>
        </div>
        <div className={styles.describeMainTitle}>{mode} {token1.symbol}</div>
        <div>
          <p className={styles.describeTitle}>Entry Price: <span className={styles.describeInfo}>{entryPriceMarket ? entryPriceMarket : '-'} USD</span></p>
          <p className={styles.describeTitle}>Exit Price:  <span className={styles.describeInfo}>{exitPrice ? exitPrice : '-'} USD</span></p>
          <p className={styles.describeTitle}>Borrow Fee:  <span className={styles.describeInfo}>{borrowFee ? borrowFee : '-'}%/1h</span></p>
        </div>
      </AcyCard>

      {needApprove
        ? <div>
          <AcyButton
            style={{ marginTop: '25px' }}
            disabled={!approveButtonStatus}
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
                setNeedApprove(false);
                console.log("test needApprove false")
              }
            }}
          >
            Approve{' '}
            {showSpinner && <Icon type="loading" />}
          </AcyButton>{' '}
        </div>

        : <AcyButton
          style={{ marginTop: '25px' }}
          disabled={!swapButtonState}
          onClick={() => {
            if (account == undefined) {
              connectWalletByLocalStorage();
            } else {
              console.log("ready for function ymj");
            }
          }}
        >
          {swapButtonContent}
        </AcyButton>
      } 

      <AcyDescriptions>
        {swapStatus && <AcyDescriptions.Item> {swapStatus}</AcyDescriptions.Item>}
      </AcyDescriptions>

      <TokenSelectorModal
        onCancel={onCancel} width={400} visible={visible} onCoinClick={onCoinClick}
      />
    </div>
  );
};

export default connect(({ global, transaction, swap, loading }) => ({
  global,
  transaction,
  account: global.account,
  swap,
  loading: loading.global,
}))(SwapComponent);

