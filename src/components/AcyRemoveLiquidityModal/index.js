import React, { useState } from 'react';
import { AcyModal } from '@/components/Acy';
import styles from './AcyRemoveLiquidityModal.less'

const AcyRemoveLiquidityModal = ({ isModalVisible }) => {
  const [amount, setAmount] = useState(50)
  const [token1Amount, setToken1Amount] = useState(0)
  const [token2Amount, setToken2Amount] = useState(0)

  return (
    <AcyModal width={400} visible={isModalVisible}>
      <div className={styles.removeAmountContainer}>
        <div>
          Remove Amount
        </div>
        <div className={styles.amountText}>
          {amount}%
        </div>
        <div className={styles.sliderContainer}>
          <input type="range" className={styles.sliderInput} onChange={(e) => setAmount(parseInt(e.target.value))} />
        </div>
      </div>
      <div className={styles.tokenAmountContainer}>
        <div className={styles.tokenAmountContent}>
          <div className={styles.tokenAmount}>{token1Amount}</div>
          <div className={styles.tokenDetailContainer}>
            <div>
              <img
                src="https://storageapi.fleek.co/chwizdo-team-bucket/token image/ethereum-eth-logo.svg"
                alt="token"
                className={styles.tokenImg}
              />
            </div>
            <div className={styles.tokenSymbol}>ETH</div>
          </div>
        </div>
        <div className={styles.tokenAmountContent}>
          <div className={styles.tokenAmount}>{token2Amount}</div>
          <div className={styles.tokenDetailContainer}>
            <div>
              <img
                src="https://storageapi.fleek.co/chwizdo-team-bucket/token image/wrapped-bitcoin-wbtc-logo.svg"
                alt="token"
                className={styles.tokenImg}
              />
            </div>
            <div className={styles.tokenSymbol}>WBTC</div>
          </div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <button type="button" className={styles.button}>Approve</button>
        <button type="button" className={styles.button}>Reject</button>
      </div>
    </AcyModal>
  );
};

export default AcyRemoveLiquidityModal;
