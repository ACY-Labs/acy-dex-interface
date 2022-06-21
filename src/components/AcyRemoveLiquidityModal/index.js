import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { connect } from 'umi';
import { AcyModal, AcyDescriptions, AcyButton } from '@/components/Acy';
import { useWeb3React } from '@web3-react/core';
import { getEstimated, signOrApprove, removeLiquidity } from '@/acy-dex-swap/core/removeLiquidity';
import { Icon, Button, Input } from "antd";
import moment from 'moment';
import styles from './AcyRemoveLiquidityModal.less';
import {
  binance,
  injected,
} from '@/connectors';
import { useConstantLoader } from '@/constants';

const AutoResizingInput = ({ value: inputValue, onChange: setInputValue }) => {
  const handleInputChange = (e) => {
    let newVal = e.target.valueAsNumber || 0;
    newVal = newVal > 100 ? 100 : (newVal < 0 ? 0 : newVal);  // set newVal in range of 0~100
    console.log(newVal);
    setInputValue(newVal);
  };

  const inputRef = useRef();
  useEffect(() => {
    const newSize = inputValue.toString().length + 0.5;
    console.log("new size ", newSize);
    inputRef.current.style.width = newSize + "ch";
    console.log(inputRef.current.style.width);
  }, [inputValue]);

  useEffect(() => {
    setInputValue(inputValue);
  }, [setInputValue, inputValue]);

  return (
    <input
      ref={inputRef}
      type="number"
      className={styles.amountInput}
      value={Number(inputValue).toString()}
      onChange={handleInputChange}
      autoFocus
    />
  );
};

// FIXME: use state machine to rewrite the logic (needApprove, approving, removeLiquidity, processing, done).
const AcyRemoveLiquidityModal = ({ removeLiquidityPosition, isModalVisible, onCancel, ...props }) => {
  const { account, chainId, library, farmSetting: { API_URL: apiUrlPrefix }, farmSetting: { INITIAL_ALLOWED_SLIPPAGE } } = useConstantLoader()
  const [token0, setToken0] = useState(null);
  const [token1, setToken1] = useState(null);
  const [token0Amount, setToken0Amount] = useState('0');
  const [token1Amount, setToken1Amount] = useState('0');
  const [args, setArgs] = useState([]);
  // 仓位信息，确定两种代币之后就可以确定了
  const [position, setPosition] = useState();
  // uni-v2 的余额
  const [balance, setBalance] = useState('0');
  const [balanceShow, setBalanceShow] = useState(false);
  // index==0 表示百分比，index==1 表示数额
  const [index, setIndex] = useState(0);
  // 代币的百分比
  const [percent, setPercent] = useState(50);
  // 代币的数额
  const [amount, setAmount] = useState('0');
  const [needApprove, setNeedApprove] = useState(false);
  const [buttonStatus, setButtonStatus] = useState(false);
  const [buttonContent, setButtonContent] = useState(false);
  // Slippage and deadline timer
  const [breakdown, setBreakdown] = useState();
  const [inputSlippageTol, setInputSlippageTol] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [slippageError, setSlippageError] = useState('');
  const [deadline, setDeadline] = useState();
  // 点击按钮之后的返回信息
  const [removeStatus, setRemoveStatus] = useState();
  const [signatureData, setSignatureData] = useState(null);
  const [removeOK, setRemoveOK] = useState(false);
  const slippageTolerancePlaceholder = 'please input a number from 1.00 to 100.00';

  const { activate } = useWeb3React();


  useEffect(
    () => {
      if (account == undefined) {
        setNeedApprove(false);
        setButtonStatus(true);
        setButtonContent('Connect to Wallet');
      } else {
        setNeedApprove(false);
        setButtonStatus(false);
        setButtonContent('choose tokens and amount');
      }
    },
    [account]
  );

  useEffect(
    () => {
      if (removeLiquidityPosition && isModalVisible) {
        const token0 = {
          symbol: removeLiquidityPosition.token0.symbol,
          address: removeLiquidityPosition.token0.address,
          decimals: removeLiquidityPosition.token0.decimals,
        };
        setToken0(token0);
        const token1 = {
          symbol: removeLiquidityPosition.token1.symbol,
          address: removeLiquidityPosition.token1.address,
          decimals: removeLiquidityPosition.token1.decimals,
        };
        setToken1(token1);
      }
    },
    [removeLiquidityPosition, isModalVisible]
  );

  const inputChange = useCallback(
    async () => {
      if (!token0 || !token1) return;

      await getEstimated(
        {
          ...token0,
        },
        {
          ...token1,
        }, // 这里是不包含amount信息的
        token0Amount,
        token1Amount,
        index,
        percent,
        amount,
        slippageTolerance,
        chainId,
        library,
        account,
        setToken0Amount,
        setToken1Amount,
        setBalance,
        setBalanceShow,
        setPercent,
        setAmount,
        setBreakdown,
        setNeedApprove,
        setButtonStatus,
        setButtonContent,
        setRemoveStatus,
        setArgs
      );
    },
    [token0, token1, index, percent, amount, slippageTolerance, chainId, library, account]
  );

  useEffect(
    () => {
      inputChange();
    },
    [token0, token1, index, percent, amount, slippageTolerance, chainId, library, account]
  );

  const handleCancel = () => {
    onCancel();

    // reset all states
    setToken0(null);
    setToken1(null);
    setToken0Amount('0');
    setToken1Amount('0');
    // 仓位信息，确定两种代币之后就可以确定了
    setPosition();
    // uni-v2 的余额
    setBalance('0');
    setBalanceShow(false);
    // index==0 表示百分比，index==1 表示数额
    setIndex(0);
    // 代币的百分比
    setPercent(50);
    // 代币的数额
    setAmount('0');
    setSlippageTolerance(INITIAL_ALLOWED_SLIPPAGE / 100);
    setBreakdown();
    setNeedApprove(false);
    setButtonStatus(false);
    setButtonContent(false);
    // 点击按钮之后的返回信息
    setRemoveStatus();
    setSignatureData(null);
    setRemoveOK(false);

    // refresh the table
    const { dispatch } = props;
    setTimeout(() =>
      dispatch({
        type: "liquidity/setRefreshTable",
        payload: true,
      }), 1000);
  }

  const removeLiquidityCallback = async (status, percent) => {
    console.log("test status:", status);
    const { dispatch, transaction: { transactions } } = props;
    // const transactions = props.transaction.transactions;
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

    // remove pair if user has totally withdrawn from pool
    let requestRes;
    if (percent === 100) {
      requestRes = await axios.post(
        // fetch valid pool list from remote
        `${apiUrlPrefix}/pool/update?walletId=${account}&action=remove&token0=${token0.address}&token1=${token1.address}&txHash=${status.hash}`
      ).then(res => {
        console.log("remove to server return: ", res);
        return res.data;
      }).catch(e => console.log("error: ", e));
    } else {
      let tryCount = 0;
      let receipt;
      while (!receipt) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        receipt = await library.getTransactionReceipt(status.hash);
        console.log("receipt", receipt);
        if (receipt) {
          requestRes = receipt.status;
          break;
        }

        tryCount++;
        if (tryCount > 60) 
          requestRes = -1;
      }
    }

    // clear top right loading spin
    const newData = transactions.filter(item => item.hash != status.hash);
    dispatch({
      type: "transaction/addTransaction",
      payload: {
        transactions: newData
      }
    });
    
    if (requestRes == -1) {
      setButtonStatus(false);
      setButtonContent("Failed");
    } else {
      // disable button after each transaction on default, enable it after re-entering amount to add
      setButtonStatus(true);
      setButtonContent("Done");
    }

    // store to localStorage
  }

  return (
    <AcyModal backgroundColor="#0e0304" width={400} visible={isModalVisible} onCancel={handleCancel}>
      <div className={styles.removeAmountContainer}>
        <div>Remove Amount</div>
        <div className={styles.amountText}>
          <AutoResizingInput value={percent} onChange={setPercent} />%
        </div>
        <div className={styles.sliderContainer}>
          <input
            value={percent}
            type="range"
            className={styles.sliderInput}
            onChange={e => {
              setIndex(0);
              setPercent(parseInt(e.target.value));
            }}
          />
        </div>
      </div>
      <div className={styles.tokenAmountContainer}>
        <div className={styles.tokenAmountContent}>
          <div className={styles.tokenAmount}>{token0Amount}</div>
          <div className={styles.tokenDetailContainer}>
            <div>
              <img
                src={
                  removeLiquidityPosition
                    ? removeLiquidityPosition.token0LogoURI
                    : 'https://storageapi2.fleek.co/chwizdo-team-bucket/token image/ethereum-eth-logo.svg'
                }
                alt="token"
                className={styles.tokenImg}
              />
            </div>
            <div className={styles.tokenSymbol}>{token0 && token0.symbol}</div>
          </div>
        </div>
        <div className={styles.tokenAmountContent}>
          <div className={styles.tokenAmount}>{token1Amount}</div>
          <div className={styles.tokenDetailContainer}>
            <div>
              <img
                src={
                  removeLiquidityPosition
                    ? removeLiquidityPosition.token1LogoURI
                    : 'https://storageapi2.fleek.co/chwizdo-team-bucket/token image/ethereum-eth-logo.svg'
                }
                alt="token"
                className={styles.tokenImg}
              />
            </div>
            <div className={styles.tokenSymbol}>{token1 && token1.symbol}</div>
          </div>
        </div>
      </div>

      {/* Slippage and deadline timer */}
      <AcyDescriptions>
        {breakdown && (
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
                    type="number"
                    value={Number(inputSlippageTol).toString()}
                    onChange={e => {
                      setInputSlippageTol(e.target.valueAsNumber || 0);
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
                  <Input type="number" value={deadline} onChange={e => setDeadline(e.target.valueAsNumber)} placeholder={30} suffix={<strong>minutes</strong>} />
                </div>
              </div>
            </div>
            <div className={styles.breakdownContainer}>
              {breakdown.map(info => (
                <AcyDescriptions.Item>
                  <div className={styles.acyDescriptionItem} style={{ color: "white", fontSize: "1rem", fontWeight: "lighter", opacity: "0.8" }}>{info}</div>
                </AcyDescriptions.Item>
              ))}
            </div>
          </>
        )}
      </AcyDescriptions>

      <h2>{removeStatus}</h2>
      <div className={styles.buttonContainer}>
        <AcyButton
          variant="success"
          disabled={!buttonStatus}
          onClick={async () => {

            if (buttonContent === "Done") {
              handleCancel();
              return;
            }

            setButtonStatus(false);
            if (needApprove) {
              setButtonContent(<>Signing <Icon type="loading" /></>);
              await signOrApprove(
                { ...token0 },
                { ...token1 },
                index,
                percent,
                amount,
                deadline,
                chainId,
                library,
                account,
                setNeedApprove, // in function set to false
                setButtonStatus,
                setButtonContent,
                setRemoveStatus,
                setSignatureData,
              );
            } else if (buttonStatus) {
              if (account == undefined) {
                //activate(binance);
                activate(injected);
              } else {
                console.log(buttonStatus);
                setButtonContent(<>Processing <Icon type="loading" /></>);
                await removeLiquidity(
                  { ...token0 },
                  { ...token1 },
                  index,
                  percent,
                  amount,
                  slippageTolerance * 100,
                  chainId,
                  library,
                  account,
                  args,
                  setToken0Amount,
                  setToken1Amount,
                  signatureData,
                  setNeedApprove,
                  setButtonStatus,
                  setButtonContent,
                  setRemoveStatus,
                  removeLiquidityCallback
                );
              }
            }
          }}
        >
          {/* approve is the default text, it will always be shown */}
          {buttonContent}
        </AcyButton>

      </div>
    </AcyModal>
  );
};

export default connect(({ transaction, liquidity }) => ({
  transaction,
  liquidity
}))(AcyRemoveLiquidityModal);
