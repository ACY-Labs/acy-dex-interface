import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'umi';
import { approve, getUserTokenBalance } from '@/acy-dex-swap/utils/index';
import { swapGetEstimated, swap } from '@/acy-dex-swap/core/swap';
import { useConstantLoader, getGlobalTokenList } from '@/constants';
import { useConnectWallet } from '@/components/ConnectWallet';
import { useChainId } from '@/utils/helpers';
import { getTokens } from '@/constants/trade';
import { AcyCuarrencyCard, AcyPerpetualButton, AcyDescriptions } from '@/components/Acy';
import { Button, Input, Icon } from 'antd';
import TokenSelectorDrawer from '../TokenSelectorDrawer';
import DetailBox from './components/DetailBox';
import ScoreBox from './components/ScoreBox';
import styles from './styles.less';
import mockTokenList from './mockTokenList.json';
import axios from 'axios';


// var CryptoJS = require("crypto-js");
const SwapComponent = props => {
  const { account, library, farmSetting: { INITIAL_ALLOWED_SLIPPAGE } } = useConstantLoader(props);
  const {
    dispatch,
    onSelectToken0,
    onSelectToken1,
    onSelectToken,
    token,
    isLockedToken1=false
  } = props;
  // 选择货币的弹窗

  const { chainId } = useChainId();
  const getTokenList = async (chainId)=>{
    try {
      const res = await fetch("https://stats.acy.finance/api/tokens?chainId=56")
      const myJson = await res.json()
      return myJson.data
    } catch (error) {
      return
    }
  }
  let INITIAL_TOKEN_LIST = getTokens(chainId);
  // INITIAL_TOKEN_LIST = getTokenList(chainId);

  const coinList = getGlobalTokenList()

  const [visible, setVisible] = useState(null);

  // 选择货币前置和后置
  const [before, setBefore] = useState(true);

  // 交易对前置货币
  const [token0, setToken0] = useState(INITIAL_TOKEN_LIST[0]);
  // 交易对后置货币
  const [token1, setToken1] = useState(INITIAL_TOKEN_LIST[3]);

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
    setToken1(INITIAL_TOKEN_LIST[3]);
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

    // setToken0(modelToken0);
    // setToken1(modelToken1);

    console.log(">> old new token 0/1 compare", token0 == modelToken1, token1 == modelToken0)
    if (token0 == modelToken1 && token1 == modelToken0) {
      const newToken0Balance = token1Balance;
      const newToken1Balance = token0Balance;
      setToken0Balance(newToken0Balance);
      setToken1Balance(newToken1Balance);
    }
  }, [props.swap]);

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
      const _token1 = INITIAL_TOKEN_LIST[3];
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
  const t0Changed = async (e) => {
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
  const t1Changed = async (e) => {
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
    if (account == undefined) {
      alert('Please connect to your account');
    } else {
      if (before) {
        console.log('SET TOKEN 0');
        console.log("onselect token0", token);
        onSelectToken0(token);
        setToken0(token);
        setToken0Balance(await getUserTokenBalance(token, chainId, account, library));
        setToken0BalanceShow(true);
      } else {
        console.log("onselect token1", token);
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
    onSelectToken1(token0);
    setToken1Amount(token0Amount);
    setToken1Balance(token0Balance);

    setToken0(tempToken);
    onSelectToken0(token1);
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

  const history = useHistory()
  useEffect(() => {
    const hash = history.location.hash.replace('#', '').split('?')[0]
    hash ? setToken0(coinList.filter(coin => coin.symbol.toLowerCase() == hash.toLowerCase())[0]) : setToken0(INITIAL_TOKEN_LIST[0])
  }, [history.location.hash, coinList])

  const onClickApprove = async () => {
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
  }

  const onConfirmationClick = () => {
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
  }

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
          props.showGraph("Routes")
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

      {showDescription ?
        <AcyDescriptions>
          <div className={styles.breakdownTopContainer}>
            <div className={styles.slippageContainer}>
              <span style={{ fontWeight: 600 }}>Slippage tolerance</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <Input
                  className={styles.input}
                  value={inputSlippageTol || ''}
                  onChange={e => {
                    setInputSlippageTol(e.target.value);
                  }}
                  suffix={<strong>%</strong>}
                />
                <Button
                  type="primary"
                  style={{ marginLeft: '10px', background: '#2e3032', borderColor: 'transparent' }}
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
                  height: '33.6px',
                  marginTop: '10px',
                }}
              >
                <Input
                  className={styles.input}
                  type="number"
                  value={Number(deadline).toString()}
                  onChange={e => setDeadline(e.target.valueAsNumber || 0)}
                  placeholder={30}
                  suffix={<strong>minutes</strong>}
                />
              </div>
            </div>
          </div>
        </AcyDescriptions>
        : null}

      {needApprove
        ? <div>
          <AcyButton
            style={{ marginTop: '30px' }}
            disabled={!approveButtonStatus}
            onClick={onClickApprove}
          >
            Approve{' '}
            {showSpinner && <Icon type="loading" />}
          </AcyButton>{' '}
        </div>
        :
        <div className={styles.centerButton}>
          <AcyPerpetualButton
            style={{ marginTop: '25px' }}
            disabled={!swapButtonState}
            onClick={onConfirmationClick}
          >
            {swapButtonContent}
          </AcyPerpetualButton>
        </div>
      }

      <DetailBox 
        pair_name='DAImond'
        token_address='0x712ce0de2401e632d75e307ed8325774daaa3c51'
        pair_address='0x52384e314d18aa160bca9ecf45d03b6f80f9557f'
      />

      <ScoreBox />

      <AcyDescriptions>
        {swapStatus && <AcyDescriptions.Item> {swapStatus}</AcyDescriptions.Item>}
      </AcyDescriptions>

      <TokenSelectorDrawer onCancel={onCancel} width={400} visible={visible} onCoinClick={onCoinClick} />

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