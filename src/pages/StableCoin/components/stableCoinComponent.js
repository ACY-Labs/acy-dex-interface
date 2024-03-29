import {
  AcyCard,
  AcyIcon,
  AcyPeriodTime,
  AcyTabs,
  // AcyCuarrencyCard,
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
import TokenSelectorModal from './tokenSelectorModal';
import TokenSelectorDrawer from '@/components/TokenSelectorDrawer';
import { supportedTokens } from '@/acy-dex-usda/utils/address';
import AcyCuarrencyCard from './acyCuarrencyCard'
import { connect } from 'umi';
import styles from './stableCoinComponent.less';
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
  isZero,
  parseArbitrageLog,
} from '@/acy-dex-swap/utils/index';
import { getUserTokenBalance, getUserTokenBalanceRaw, getApprove } from '@/acy-dex-usda/utils'

// import { swapGetEstimated, swap } from '@/acy-dex-swap/core/swap';
import { swapGetEstimated, swap } from '../../../acy-dex-usda/core/swap';

import ERC20ABI from '@/abis/ERC20.json';
import WETHABI from '@/abis/WETH.json';
import { SCAN_URL_PREFIX, SCAN_NAME, getGlobalTokenList } from '@/constants';


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
import { useConstantLoader } from '@/constants';
import { useConnectWallet } from '@/components/ConnectWallet';

const SwapComponent = props => {
  const { account, library, farmSetting: { INITIAL_ALLOWED_SLIPPAGE } } = useConstantLoader(props);
  // TODO: TESTING
  const chainId = 137;
  const { dispatch, onSelectToken0, onSelectToken1, onSelectToken, token, isLockedToken1 = false, sideComponent } = props;
  const INITIAL_TOKEN_LIST = supportedTokens[chainId]
  // 选择货币的弹窗
  const [visible, setVisible] = useState(null);

  // 选择货币前置和后置
  const [before, setBefore] = useState(true);

  // 交易对前置货币
  const [token0, setToken0] = useState(INITIAL_TOKEN_LIST[2]);
  // 交易对后置货币
  const [token1, setToken1] = useState(INITIAL_TOKEN_LIST[0]);

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
  const [isUSDA, setIsUSDA] = useState(true)
  const [swapMode, setSwapMode] = useState('redeem')
  const [isMax, setIsMax] = useState(false)

  useEffect(() => {
    if (!INITIAL_TOKEN_LIST) return
    setVisible(null);
    // 选择货币前置和后置
    setBefore(true);
    // 交易对前置货币
    setToken0(INITIAL_TOKEN_LIST[2]);
    // 交易对后置货币
    setToken1(INITIAL_TOKEN_LIST[0]);
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
    setSwapMode('redeem')
    setIsUSDA('true')
  }, [chainId])

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
      if (!account || !chainId || !library) {
        setToken0BalanceShow(false);
        setToken1BalanceShow(false);
        return;
      }
      const _token0 = INITIAL_TOKEN_LIST[2];
      const _token1 = INITIAL_TOKEN_LIST[0];
      setToken0(_token0);
      setToken1(_token1);
      setSwapMode('redeem')
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
  function getSwapStatus(view) {
    setSwapStatus(view)
  }


  // token1Amount is changed according to token0Amount
  const t0Changed =
    async (e) => {
      if (!token0 || !token1) return;
      if (!exactIn) return;
      //输入amount从而估计另一个的amount
      setSwapStatus();
      await swapGetEstimated(
        {
          ...token0,
          amount: e,
        },
        {
          ...token1,
          amount: token1Amount,
        },
        swapMode,
        chainId,
        library,
        account,
        setToken1Amount,
        setSwapButtonState,
        setSwapButtonContent,
        setIsMax,
        setNeedApprove,
      );
    }

  useEffect(() => { '@@@ismaxchange' }, [isMax])
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
      token0Amount,
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
    let mode = swapMode === 'redeem' ? 'mint' : 'redeem'
    setToken1(token0);
    setToken1Amount(token0Amount);
    setToken1Balance(token0Balance);

    setToken0(tempToken);
    setToken0Amount(tempAmount);
    setToken0Balance(tempBalance);
    setIsUSDA(!isUSDA)
    setSwapMode(mode)
    setIsMax(false)
  };

  let coinList = getGlobalTokenList()
  coinList = coinList.filter(token => token.symbol == "USDT" || token.symbol == 'USDC' || token.symbol == 'BTC' || token.symbol == 'ETH')

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
        isLocked={isUSDA}
        token0Balance={token0Balance}
        account={account}
        isMax={isMax}
        onChoseToken={() => {
          onClickCoin();
          setBefore(true);
        }}
        onChangeToken={e => {
          setShowDescription(true);
          setToken0Amount(e);
          setExactIn(true);
          t0Changed(e);
        }}
        onClickMax={() => {
          setToken0Amount(token0Balance)
          setIsMax(true)
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
        isLocked={!isUSDA}
        onChoseToken={() => {
          onClickCoin();
          setBefore(false);
        }}
        library={library}
        isMax={isMax}
      />

      {showDescription ? <AcyDescriptions>
        <div className={styles.breakdownTopContainer}>
          <div className={styles.slippageContainer}>
            <span style={{ fontWeight: 600 }}>Slippage tolerance</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '7px' }}>
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
      </AcyDescriptions>
        : null}

      {needApprove
        ? <div>
          <AcyButton
            style={{ marginTop: '25px' }}
            disabled={!swapButtonState}
            onClick={async () => {
              setShowSpinner(true);
              setApproveButtonStatus(false);
              const isApproved = await getApprove(token0, token0Amount, library, account)
              console.log('@@@isApproved',isApproved)
              setApproveButtonStatus(true);
              setShowSpinner(false);

              if (isApproved) {
                setSwapButtonState(true);
                setSwapButtonContent('Swap');
                setApproveButtonStatus(false);
                setNeedApprove(false);
                console.log("test needApprove false")
              }
            }}
          >
            {swapButtonContent}
            {/* {showSpinner && <Icon type="loading" />} */}
          </AcyButton>
        </div> :
        <AcyButton
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
                swapMode,
                library,
                account,
                isMax,
                setSwapButtonContent,
                setSwapButtonState,
                setSwapStatus,
              );
            }
          }}
        >
          {swapButtonContent}
        </AcyButton>}

      <AcyDescriptions>
        {swapStatus && <AcyDescriptions.Item> {swapStatus} </AcyDescriptions.Item>}
      </AcyDescriptions>

      {/* <TokenSelectorModal
        onCancel={onCancel} width={400} visible={visible} onCoinClick={onCoinClick} sideComponent={true}
      /> */}

      <TokenSelectorDrawer onCancel={onCancel} width={400} visible={visible} onCoinClick={onCoinClick} simple={true} coinList={coinList} />

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
