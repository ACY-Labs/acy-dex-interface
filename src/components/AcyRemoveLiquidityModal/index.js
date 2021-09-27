import React, { useCallback, useEffect, useState } from 'react';
import { AcyModal } from '@/components/Acy';
import { useWeb3React } from '@web3-react/core';
import { INITIAL_ALLOWED_SLIPPAGE } from '@/acy-dex-swap/utils/index';
import { getEstimated, signOrApprove, removeLiquidity } from '@/acy-dex-swap/core/removeLiquidity';
import styles from './AcyRemoveLiquidityModal.less';

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
      if (removeLiquidityPosition) {
        const token0 = {
          symbol: removeLiquidityPosition.token0.symbol,
          address: removeLiquidityPosition.token0.address,
          decimal: removeLiquidityPosition.token0.decimals,
        };
        setToken0(token0);
        const token1 = {
          symbol: removeLiquidityPosition.token1.symbol,
          address: removeLiquidityPosition.token1.address,
          decimal: removeLiquidityPosition.token1.decimals,
        };
        setToken1(token1);
      }
    },
    [removeLiquidityPosition]
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

  return (
    <AcyModal width={400} visible={isModalVisible} onCancel={onCancel}>
      <div className={styles.removeAmountContainer}>
        <div>Remove Amount</div>
        <div className={styles.amountText}>{percent}%</div>
        <div className={styles.sliderContainer}>
          <input
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
          className={removeOK ? styles.inactive_button : styles.active_button}
          onClick={async () => {
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
              setNeedApprove,
              setButtonStatus,
              setButtonContent,
              setRemoveStatus,
              setSignatureData,
              setRemoveOK
            );
          }}
          disabled={!needApprove}
        >
          Approve
        </button>
        <button
          type="button"
          className={removeOK ? styles.active_button : styles.inactive_button}
          onClick={async () => {
            if (account == undefined) {
              activate(injected);
            } else {
              console.log(buttonStatus);
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
            }
          }}
          disabled={!buttonStatus}
        >
          {buttonContent}
        </button>
      </div>
    </AcyModal>
  );
};

export default AcyRemoveLiquidityModal;
