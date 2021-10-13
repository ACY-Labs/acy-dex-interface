import React, { useCallback, useEffect, useState, useRef } from 'react';
import { AcyModal } from '@/components/Acy';
import { useWeb3React } from '@web3-react/core';
import { INITIAL_ALLOWED_SLIPPAGE } from '@/acy-dex-swap/utils/index';
import { getEstimated, signOrApprove, removeLiquidity } from '@/acy-dex-swap/core/removeLiquidity';
import { Icon } from "antd";
import styles from './AcyRemoveLiquidityModal.less';

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
const AcyRemoveLiquidityModal = ({ removeLiquidityPosition, isModalVisible, onCancel }) => {
  const [token0, setToken0] = useState(null);
  const [token1, setToken1] = useState(null);
  const [token0Amount, setToken0Amount] = useState('0');
  const [token1Amount, setToken1Amount] = useState('0');
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
  const [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [breakdown, setBreakdown] = useState();
  const [needApprove, setNeedApprove] = useState(false);
  const [buttonStatus, setButtonStatus] = useState(false);
  const [buttonContent, setButtonContent] = useState(false);
  // 点击按钮之后的返回信息
  const [removeStatus, setRemoveStatus] = useState();
  const [signatureData, setSignatureData] = useState(null);
  const [removeOK, setRemoveOK] = useState(false);
  const slippageTolerancePlaceholder = 'please input a number from 1.00 to 100.00';

  const { account, chainId, library, activate } = useWeb3React();

  // Button styling status
  const [buttonProcessing, setButtonProcessing] = useState(false);

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
        setRemoveStatus
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

    // Button styling status
    setButtonProcessing(false);
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
                    : 'https://storageapi.fleek.co/chwizdo-team-bucket/token image/ethereum-eth-logo.svg'
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
                    : 'https://storageapi.fleek.co/chwizdo-team-bucket/token image/ethereum-eth-logo.svg'
                }
                alt="token"
                className={styles.tokenImg}
              />
            </div>
            <div className={styles.tokenSymbol}>{token1 && token1.symbol}</div>
          </div>
        </div>
      </div>
      <h2>{removeStatus}</h2>
      <div className={styles.buttonContainer}>
        <button
          type="button"
          className={buttonProcessing ? styles.inactive_button : styles.active_button}
          // className={styles.active_button}
          onClick={async () => {
            
            if (buttonContent === "Done") {
              handleCancel();
              return;
            }

            setButtonProcessing(true);
            if (needApprove) {
              setButtonContent(<>Approving <Icon type="loading" /></>);
              await signOrApprove(
                { ...token0 },
                { ...token1 },
                index,
                percent,
                amount,
                slippageTolerance * 100,
                chainId,
                library,
                account,
                setNeedApprove, // in function set to false
                setButtonStatus,
                setButtonContent,
                setRemoveStatus,
                setSignatureData,
                setButtonProcessing
              );
            } else if (buttonStatus) {
              if (account == undefined) {
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
                  setToken0Amount,
                  setToken1Amount,
                  signatureData,
                  setNeedApprove,
                  setButtonStatus,
                  setButtonContent,
                  setRemoveStatus
                );

                setButtonProcessing(false);
                setButtonContent("Done");
              }
            }
          }}
        >
          {/* approve is the default text, it will always be shown */}
          {needApprove || buttonStatus ? buttonContent : "Calculating"}
        </button>
      </div>
    </AcyModal>
  );
};

export default AcyRemoveLiquidityModal;
