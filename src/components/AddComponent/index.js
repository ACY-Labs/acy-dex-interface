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
  AcyDescriptions
} from '@/components/Acy';

//^mark
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
  getTokenTotalSupply,
  ACYSwapErrorStatus,
  approve,
  checkTokenIsApproved,
  getUserTokenBalanceRaw,
  getUserTokenBalance,
  calculateSlippageAmount,
  INITIAL_ALLOWED_SLIPPAGE
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

const { AcyTabPane } = AcyTabs;
import { Row, Col, Button, Alert } from 'antd';

import {
  check,
  getEstimated,
  addLiquidity
} from '@/acy-dex-swap/components/LiquidityComponent';


const MyComponent = props =>{
  const { dispatch } = props;
  // 选择货币的弹窗
  const [visible, setVisible] = useState(null);
  // 选择货币前置和后置
  const [before, setBefore] = useState(true);

  // 交易对前置货币
  let [token0, setToken0] = useState(null);
  // 交易对后置货币
  let [token1, setToken1] = useState(null);
  // 交易对前置货币余额
  let [token0Balance, setToken0Balance] = useState("0");
  // 交易对后置货币余额
  let [token1Balance, setToken1Balance] = useState("0");
  // 交易对前置货币兑换量
  let [token0Amount, setToken0Amount] = useState("0");
  // 交易对后置货币兑换量
  let [token1Amount, setToken1Amount] = useState("0");
  let [token0BalanceShow,setToken0BalanceShow]=useState(false);
  let [token1BalanceShow,setToken1BalanceShow]=useState(false);

  // true 指前面的，false指后面的
  let [exactIn, setExactIn] = useState(true);

  let [slippageTolerance,setSlippageTolerance]=useState(INITIAL_ALLOWED_SLIPPAGE/100);

  let [estimatedStatus,setEstimatedStatus]=useState();
  let [liquidityStatus, setLiquidityStatus] = useState();

  let [needApproveToken0, setNeedApproveToken0] = useState(false);
  let [needApproveToken1, setNeedApproveToken1] = useState(false);

  let [approveAmountToken0, setApproveAmountToken0] = useState("0");
  let [approveAmountToken1, setApproveAmountToken1] = useState("0");

  let [liquidityBreakdown, setLiquidityBreakdown] = useState();

  let [buttonContent,setButtonContent]=useState("connect to wallet");
  let [buttonStatus,setButtonStatus]=useState(true);

  let [userLiquidityPositions, setUserLiquidityPositions] = useState([]);



  // 占位符
  const individualFieldPlaceholder = 'Enter amount';
  const dependentFieldPlaceholder = 'Estimated value';
  const slippageTolerancePlaceholder="please input a number from 1.00 to 100.00";


  // 连接钱包函数
  const { account, chainId, library, activate } = useWeb3React();
  // 连接钱包时支持的货币id
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });

  // 初始化函数时连接钱包
  useEffect(() => {
    // activate(injected);
  }, []);

  let t0Changed = useCallback(async ()=>{
    if (!token0 || !token1) return;
    if (!exactIn) return;

    let state = check(
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
      library,
      account
    );
    if(state==false) return;

    await getEstimated(
      {
        ...token0,
        amount: token0Amount,
      },
      {
        ...token1,
        amount: token1Amount,
      },
      slippageTolerance*100,
      exactIn,
      chainId,
      library,
      account,
      setToken0,
      setToken1,
      setToken0Amount,
      setToken1Amount,
      setEstimatedStatus,
      setNeedApproveToken0,
      setNeedApproveToken1,
      setApproveAmountToken0,
      setApproveAmountToken1,
      setLiquidityBreakdown,
      setButtonContent,
      setButtonStatus
    );

  },[token0, token1, token0Amount, token1Amount,slippageTolerance, exactIn, chainId, library,account]);

  let t1Changed = useCallback(async ()=>{
    if (!token0 || !token1) return;
    if (exactIn) return;

    let state = check(
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
      library,
      account
    );
    if(state==false) return;

    await getEstimated(
      {
        ...token0,
        amount: token0Amount,
      },
      {
        ...token1,
        amount: token1Amount,
      },
      slippageTolerance*100,
      exactIn,
      chainId,
      library,
      account,
      setToken0,
      setToken1,
      setToken0Amount,
      setToken1Amount,
      setEstimatedStatus,
      setNeedApproveToken0,
      setNeedApproveToken1,
      setApproveAmountToken0,
      setApproveAmountToken1,
      setLiquidityBreakdown,
      setButtonContent,
      setButtonStatus
    );


  },[token0, token1, token0Amount, token1Amount,slippageTolerance, exactIn, chainId, library,account]);

  useEffect(()=>{
    t0Changed();
  },[token0Amount]);
  useEffect(()=>{
    t1Changed();

  },[token1Amount]);

  useEffect(()=>{
    if(account==undefined){
      setButtonStatus(true);
      setButtonContent("Connect to Wallet");
    }else {
      setButtonContent("choose tokens and amount");
      setButtonStatus(false);
    }
  },[account]);

  // useEffect(() => {
  //   async function getAllUserLiquidityPositions() {
  //     if(account!=undefined){
  //       setUserLiquidityPositions(
  //         await getAllLiquidityPositions(
  //           supportedTokens,
  //           chainId,
  //           library,
  //           account
  //         )
  //       );
  //     }
  //   }
  //   getAllUserLiquidityPositions();
  // }, [chainId, library, account]);
  //=======================================


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
      {/*        setToken0ApproxAmount(e);*/}
      {/*        setToken0Amount(e);*/}
      {/*        setExactIn(true);*/}
      {/*      }}*/}
      {/*    />*/}

      {/*  </Col>*/}

      {/*</Row>*/}

      <AcyCuarrencyCard
        icon="eth"
        title={`Balance: ${token0Balance}`}
        coin={(token0 && token0.symbol) || 'In'}
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
        title={`Balance: ${token1Balance}`}
        coin={(token1 && token1.symbol) || 'Out'}
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

      {/*<Alert variant="danger">*/}
      {/*  the Slippage Tolerance you choose is [ {slippageTolerance}% ]*/}
      {/*</Alert>*/}


      <AcyDescriptions>
        <AcyDescriptions.Item>
          the Slippage Tolerance: [ {slippageTolerance}% ]
        </AcyDescriptions.Item>
        {
          estimatedStatus &&<AcyDescriptions.Item>estimatedStatus</AcyDescriptions.Item>
        }
        {
          estimatedStatus && <AcyDescriptions.Item>{estimatedStatus}</AcyDescriptions.Item>
        }

        {liquidityBreakdown && <AcyDescriptions.Item>liquidity breakdown</AcyDescriptions.Item>}
        {liquidityBreakdown && liquidityBreakdown.map((info) => <AcyDescriptions.Item>{info}</AcyDescriptions.Item>)}

      </AcyDescriptions>

      {
        needApproveToken0==true && <mark>
          <AcyButton
            variant="warning"
            onClick={() => {
              approve(token0.address, approveAmountToken0, library, account);
              setNeedApproveToken0(false);
            }}
          >
            Approve {token0 && token0.symbol}
          </AcyButton>
          {' '}
        </mark>
      }
      {
        needApproveToken1==true && <mark>
          <AcyButton
            variant="warning"
            onClick={() => {
              approve(token1.address, approveAmountToken1, library, account);
              setNeedApproveToken1(false);
            }}
          >
            Approve {token1 && token1.symbol}
          </AcyButton>
          {' '}
        </mark>
      }

      <AcyButton
        variant="success"
        disabled={!buttonStatus}
        onClick={() => {
          if(account==undefined) {
            activate(injected);
            setButtonContent("choose tokens and amount");
            setButtonStatus(false);
          }else{
            addLiquidity(
              {
                ...token0,
                amount: token0Amount,
              },
              {
                ...token1,
                amount: token1Amount,
              },
              100*slippageTolerance,
              exactIn,
              chainId,
              library,
              account,
              setNeedApproveToken0,
              setNeedApproveToken1,
              setApproveAmountToken0,
              setApproveAmountToken1,
              setLiquidityStatus,
              setLiquidityBreakdown,
              setToken0Amount,
              setToken1Amount
            );
          }
        }}
      >
        {buttonContent}
      </AcyButton>
      <AcyDescriptions>
        {
          liquidityStatus &&  <AcyDescriptions.Item>
            liquidityStatus
          </AcyDescriptions.Item>
        }
        {
          liquidityStatus &&   <AcyDescriptions.Item>
            {liquidityStatus}
          </AcyDescriptions.Item>
        }
      </AcyDescriptions>



      <AcyModal onCancel={onCancel} width={600} height={400} visible={visible}>
        <div className={styles.title}>
           Select a token
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
                    if (before) {
                      if(account == undefined){
                        alert("please connect to your account");
                      }else{
                        setToken0(token);
                        setToken0Balance(
                          await getUserTokenBalance(
                            token,
                            chainId,
                            account,
                            library
                          )
                        );
                        setToken0BalanceShow(true);
                      }
                    } else {

                      setToken1(token);
                      setToken1Balance(
                        await getUserTokenBalance(
                          token,
                          chainId,
                          account,
                          library
                        )
                      );
                      setToken1BalanceShow(true);

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
            {/* <AcyTabPane tab="Index" key="3" />
            <AcyTabPane tab="Synth" key="4" /> */}
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
