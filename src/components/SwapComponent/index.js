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

import { connect } from 'umi';
import styles from './styles.less';
import { sortAddress, abbrNumber } from '@/utils/utils';
import axios from 'axios';

import { useWeb3React } from '@web3-react/core';
import { binance,injected } from '@/connectors';
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
import { Row, Col, Button, Input, Icon } from 'antd';
import { Alert } from 'antd';
import spinner from '@/assets/loading.svg';
import moment from 'moment';
import {useConstantLoader} from '@/constants';
import {useConnectWallet} from '@/components/ConnectWallet';



// var CryptoJS = require("crypto-js");
const SwapComponent = props => {
  const { account, library, chainId, tokenList: INITIAL_TOKEN_LIST, farmSetting: {INITIAL_ALLOWED_SLIPPAGE}} = useConstantLoader(props);
  const { dispatch, onSelectToken0, onSelectToken1, onSelectToken, token, isLockedToken1=false } = props;

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
  const [inputSlippageTol, setInputSlippageTol] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [slippageError, setSlippageError] = useState('');

  const [deadline, setDeadline] = useState();

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

  const [showDescription, setShowDescription] = useState(false);
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
    setInputSlippageTol(INITIAL_ALLOWED_SLIPPAGE / 100);
    setSlippageError('');
    setDeadline();
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
    setShowDescription(false);
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
    setInputSlippageTol(INITIAL_ALLOWED_SLIPPAGE / 100);
    setSlippageError('');
    setDeadline();
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
    setShowDescription(false);
  }, [chainId])

  // connect to page model, reflect changes of pair ratio in this component
  useEffect(() => {
    const { swap: { token0: modelToken0, token1: modelToken1 } } = props;
    
    setToken0(modelToken0);
    setToken1(modelToken1);

    console.log(">> old new token 0/1 compare", token0 == modelToken1, token1 == modelToken0)
    if (token0 == modelToken1 && token1 == modelToken0) {
      const newToken0Balance = token1Balance;
      const newToken1Balance = token0Balance;
      setToken0Balance(newToken0Balance);
      setToken1Balance(newToken1Balance);
    }
  }, [props.swap]);

  useEffect(() => {
    if(token) {
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
        bonus={!exactIn && bonus0}
        showBalance={token1BalanceShow}
        onChoseToken={() => {
          onClickCoin();
          setBefore(true);
        }}
        onChangeToken={e => {
          setShowDescription(true);
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
          if(!isLockedToken1){
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
          setShowDescription(true)
          setToken1Amount(e);
          setExactIn(false);
          console.log("test exactin and bonus1", exactIn, bonus0)
          console.log("current token1amount", e)
          t1Changed(e);
        }}
        isLocked={isLockedToken1}
        library={library}
      />

      {showDescription ? <AcyDescriptions>
        <div className={styles.breakdownTopContainer}>
          <div className={styles.slippageContainer}>
            <span style={{ fontWeight: 600 }}>Slippage tolerance</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '7px' }}>
              {/* <Button
                    type="link"
                    style={{ marginRight: '5px' }}
                    onClick={() => {
                      setInputSlippageTol(INITIAL_ALLOWED_SLIPPAGE / 100);
                      setSlippageTolerance(INITIAL_ALLOWED_SLIPPAGE / 100);
                    }}
                  >
                    Auto
                  </Button> */}
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
              <Input type="number" value={Number(deadline).toString()} onChange={e => setDeadline(e.target.valueAsNumber || 0)} placeholder={30} suffix={<strong>minutes</strong>} />
            </div>
          </div>
        </div>
        {/* <div className={styles.acyDescriptionContainer}>
              {swapBreakdown.map(info => (
                <AcyDescriptions.Item>
                  <div className={styles.acyDescriptionItem}>{info}</div>
                </AcyDescriptions.Item>
              ))}
            </div> */}
      </AcyDescriptions>
      : null}

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
              setSwapButtonState(false);
              setSwapButtonContent(<>Processing <Icon type="loading" /></>)
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
                deadline,
                setSwapStatus,
                setSwapButtonContent,
                setSwapButtonState,
                swapCallback,
                methodName,
                isUseArb,
                midTokenAddress,
                poolExist
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


// if (receipt) {
//   clearInterval(sti);
  // const { logs } = receipt;
  // console.log("logs: ", logs);
  // const decodedLog = parseArbitrageLog(logs[logs.length - 1]);
  // console.log('receipt OK, these are logs');
  // console.log("decodedLog", decodedLog);
  // decodedLog['transactionHash'] = receipt.transactionHash;

//   props.onGetReceipt(decodedLog, library, account);
//   let newData = transactions.filter(item => item.hash != status.hash);
//   let transactionTime = '';
//   let inputTokenNum;
//   let outTokenNum;
//   let totalToken;
//   let transferHash = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef;
//   await library.getBlock(receipt.logs[0].blockNumber).then(data => {
//     transactionTime = moment(parseInt(data.timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
//   });
//   receipt.logs.map(item => {
//     // debugger
//     // let topics=hexlify(item.topics[0]).toText();
//     // let ss=CryptoJS.SHA3.decrypt(item.topics[0]); 
//     // debugger
//     if (item.topics.length == 3 && item.topics[0] == transferHash && item.address == inputToken.address) {
//       // inputtoken 数量
//       // inputTokenNum=BigNumber.from(item.data).div(BigNumber.from(parseUnits("1.0",inputToken.decimals))).toString();
//       inputTokenNum = item.data / Math.pow(10, inputToken.decimals).toString();
//       // console.log('inputTokenNum',inputTokenNum)
//     }
//     if (item.topics.length == 3 && item.topics[0] == transferHash && item.address == outToken.address) {
//       // outtoken 数量
//       // outTokenNum=BigNumber.from(item.data).div(BigNumber.from(parseUnits("1.0", outToken.decimals))).toString();
//       outTokenNum = item.data / Math.pow(10, outToken.decimals).toString();
//       // console.log('outputTokenNum',outTokenNum)
//     }
//   });

//   setSwapButtonContent("Done");
  
//   // 获取美元价值
//   await axios
//     .post(
//       `https://api.acy.finance/api/chart/swap?token0=${inputToken.addressOnEth}&token1=${outToken.addressOnEth
//       }&range=1D`
//     )
//     .then(data => {
//       // totalToken = abbrNumber(
//       //   inputTokenNum * data.data.data.swaps[data.data.data.swaps.length - 1].rate
//       // );

//       // const { swaps } = data.data.data;
//       // const lastDataPoint = swaps[swaps.length - 1];
//       // console.log('ROUTE PRICE POINT', lastDataPoint);
//       // this.setState({
//       //   pricePoint: lastDataPoint.rate,
//       // });
//     });

//   console.log("receipt transactionTime", transactionTime);
// >>>>>>> e0b545d... (wip) : migration to bsc
//   dispatch({
//     type: 'transaction/addTransaction',
//     payload: {
//       transactions: newData
//     },
//   });