// FIXME: This component seems to be obsoleted. 

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

//^mark
import { connect } from 'umi';

import styles from './styles.less';
import { sortAddress } from '@/utils/utils';

import { useWeb3React } from '@web3-react/core';
import { binance, injected } from '@/connectors';
import { useState, useEffect, useCallback } from 'react';

import {
  supportedTokens,
  getRouterContract,
  calculateGasMargin,
  getTokenTotalSupply,
  Error,
  approve,
  checkTokenIsApproved,
  getUserTokenBalanceRaw,
  getUserTokenBalance,
  addLiquidityGetEstimated,
  getUserRemoveLiquidityBalance,
  removeLiquidityGetEstimated,
  calculateSlippageAmount,
  INITIAL_ALLOWED_SLIPPAGE,
  usePairContract,
} from '@/acy-dex-swap/utils/index';

import { processInput, signOrApprove, removeLiquidity } from '@/acy-dex-swap/core/removeLiquidity';

const { AcyTabPane } = AcyTabs;
import { Row, Col, Button, Alert } from 'antd';

const MyComponent = props => {
  const { dispatch } = props;

  // 选择货币的弹窗
  const [visible, setVisible] = useState(null);
  // 选择货币前置和后置
  const [before, setBefore] = useState(true);

  let [needApprove, setNeedApprove] = useState(false);
  let [userLiquidityPosition, setUserLiquidityPosition] = useState('you need to get tokens');

  // 交易对前置货币
  const [token0, setToken0] = useState(null);
  // 交易对前置货币余额
  const [token0Balance, setToken0Balance] = useState('0');
  // 交易对前置货币兑换量
  const [token0Amount, setToken0Amount] = useState('0');
  // 交易对后置货币
  const [token1, setToken1] = useState(null);
  // 交易对后置货币余额
  const [token1Balance, setToken1Balance] = useState('0');
  // 交易对后置货币兑换量
  const [token1Amount, setToken1Amount] = useState('0');
  let [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE() / 100);
  let [liquidityBreakdown, setLiquidityBreakdown] = useState();
  let [liquidityStatus, setLiquidityStatus] = useState();
  let [exactIn, setExactIn] = useState(true);
  let [removeLiquidityStatus, setRemoveLiquidityStatus] = useState('');
  let [signatureData, setSignatureData] = useState(null);

  // 占位符
  const individualFieldPlaceholder = 'Enter amount';
  const dependentFieldPlaceholder = 'Estimated value';

  // 连接钱包函数
  const { account, chainId, library, activate } = useWeb3React();

  useEffect(
    () => {
      async function getUserRemoveLiquidityPositions() {
        if (!token0 && !token1) {
          setUserLiquidityPosition('you need to choose  tokens');
          return;
        }
        if (!token0 || !token1) {
          setUserLiquidityPosition('please choose the other token ');
          return;
        }
        if (account == undefined) {
          setUserLiquidityPosition('you need to set your account');
          return;
        }
        await getUserRemoveLiquidityBalance(
          token0,
          token1,
          chainId,
          account,
          library,
          setUserLiquidityPosition,
          setToken0Balance,
          setToken1Balance
        );
      }
      getUserRemoveLiquidityPositions();
    },
    [token0, token1, chainId, account, library]
  );

  let inputChange = useCallback(
    async () => {
      processInput(
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
        setToken0Amount,
        setToken1Amount,
        setSignatureData,
        setRemoveLiquidityStatus
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
      inputChange();
    },
    [token0Amount, token1Amount]
  );

  // ^mark
  // const checkApprovalStatus = useCallback(async () => {
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
    //activate(binance);
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
      {/*        setToken0ApproxAmount(e.target.value);*/}
      {/*        setToken0Amount(e.target.value);*/}
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
        onChoseToken={() => {
          onClickCoin();
          setBefore(true);
        }}
        onChangeToken={e => {
          setToken0Amount(e.target.value);
          setExactIn(true);
          // setApproveAmountToken0(e.target.value);
        }}
      />
      <div style={{ margin: '12px auto', textAlign: 'center' }}>
        <AcyIcon width={21.5} name="double-down" />
      </div>
      <AcyCuarrencyCard
        icon="eth"
        title={`Balance: ${token1Balance}`}
        coin={(token1 && token1.symbol) || 'Out'}
        yuan="566.228"
        dollar={`${token1Balance}`}
        token={token1Amount}
        onChoseToken={() => {
          onClickCoin();
          setBefore(false);
        }}
        onChangeToken={e => {
          // setApproveAmountToken1(e.target.value);
          setToken1Amount(e.target.value);
          setExactIn(false);
        }}
      />

      {/*<Alert variant="danger">*/}
      {/*  the Slippage Tolerance you choose is [ {slippageTolerance}% ]*/}
      {/*</Alert>*/}

      <AcyDescriptions>
        <AcyDescriptions.Item>
          the Slippage Tolerance: [ {slippageTolerance}% ]
        </AcyDescriptions.Item>
        <AcyDescriptions.Item>userLiquidityPosition: {userLiquidityPosition}</AcyDescriptions.Item>
        <AcyDescriptions.Item>
          removeLiquidityStatus: [ {removeLiquidityStatus} ]
        </AcyDescriptions.Item>

        {/*{liquidityBreakdown && <AcyDescriptions.Item> Liquidity status:  </AcyDescriptions.Item>}*/}
        {/*{liquidityBreakdown && liquidityBreakdown.map((info) => <AcyDescriptions.Item>{info}</AcyDescriptions.Item>)}*/}
        <AcyDescriptions.Item>{liquidityStatus}</AcyDescriptions.Item>
      </AcyDescriptions>

      {/* <AcyDescriptions>
        <AcyDescriptions.Item>
          {needApproveToken0 == 'true'
            ? 'plase click the left approve button'
            : "you don't need to click the left approve button"}{' '}
          <br />
          {needApproveToken1 == 'true'
            ? 'plase click the right approve button'
            : "you don't need to click the right approve button"}{' '}
          <br />
        </AcyDescriptions.Item>
      </AcyDescriptions> */}
      {/* <br />

      <div>the Slippage Tolerance you choose is [ {slippageTolerance}% ]</div>
      <div>{liquidityBreakdown && liquidityBreakdown.map(info => <p>{info}</p>)}</div>
      <br />
      <br />
      <div>Liquidity status: {liquidityStatus}</div>
      <br />
      <br />

      <div>
        {needApproveToken0 == 'true'
          ? 'plase click the left approve button'
          : "you don't need to click the left approve button"}{' '}
        <br />
        {needApproveToken1 == 'true'
          ? 'plase click the right approve button'
          : "you don't need to click the right approve button"}{' '}
        <br />
      </div> */}
      {(!account && <AcyButton onClick={ConnectWallet}>Connect</AcyButton>) || (
        <div>
          <div style={{ display: 'flex', marginBottom: '15px' }}>
            {token0 && (
              <Button
                type="primary"
                style={{ marginRight: '15px' }}
                onClick={() => {
                  // approve(token0.address, approveAmountToken0, library, account);
                  signOrApprove(
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
                    setSignatureData,
                    setRemoveLiquidityStatus
                  );
                  console.log('Approve');
                }}
              >
                signOrApprove
              </Button>
            )}
          </div>

          {
            <AcyButton
              disabled={!(token1 && token1.symbol && token0 && token0.symbol)}
              onClick={() => {
                removeLiquidity(
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
                  signatureData,
                  setToken0Amount,
                  setToken1Amount,
                  setSignatureData,
                  setRemoveLiquidityStatus
                );
              }}
            >
              remove Liquidity
            </AcyButton>
          }
        </div>
      )}

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
                    if (before) {
                      setToken0(token);
                      //^mark 这里的await拖慢了速度
                      // setToken0Balance(await getUserTokenBalance(token, chainId, account, library));
                    } else {
                      setToken1(token);
                      // setToken1Balance(await getUserTokenBalance(token, chainId, account, library));
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
