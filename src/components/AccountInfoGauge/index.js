import React, { useState } from 'react';
import { Gauge } from 'ant-design-pro/lib/Charts';
import ComponentButton from '../ComponentButton';
import DepositWithdrawModal from './DepositWithdrawModal';

import styles from './styles.less';

const AccountInfoGauge = props => {

  const {
    chainId,
    library,
    account,
    active,
    tokens,
    symbol,
  } = props

  const [mode, setMode] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)

  const onClickDeposit = () => {
    setMode('Deposit')
    setIsConfirming(true)
  }

  const onClickWithdraw = () => {
    setMode('Withdraw')
    setIsConfirming(true)
  }

  return (
    <div className={styles.main}>
      <div className={styles.accountInfo}>
        <div className={styles.details}>
          <div className={styles.statstitle}>Account Info</div>
          <div className={styles.statscontent}>
            <div className={styles.statsRow}>
              Dynamic Effective Balance
            </div>
            <div className={styles.statsRow}>
              ——
            </div>
            <div className={styles.statsRow}>
              Margin Usage
            </div>
            <div className={styles.statsRow}>
              ——
            </div>
            <div className={styles.statsRow}>
              Available Margin
            </div>
            <div className={styles.statsRow}>
              ——
            </div>
          </div>
        </div>
        <div className={styles.gauge}>
          <Gauge
            title=''
            autoFit={true}
            percent={70}
            color='l(0) 0:#00ff00 1:#ff0000'
          />
        </div>
      </div>

      <div className={styles.buttonContainer} style={{ marginTop: '20px' }}>
        <ComponentButton onClick={onClickDeposit}>
          DEPOSIT
        </ComponentButton>
        <ComponentButton onClick={onClickWithdraw}>
          WITHDRAW
        </ComponentButton>
      </div>

      {isConfirming &&
        <DepositWithdrawModal
          chainId={chainId}
          library={library}
          account={account}
          active={active}
          tokens={tokens}
          symbol={symbol}
          setIsConfirming={setIsConfirming}
          mode={mode}
        />
      }

    </div>
  );
}

export default AccountInfoGauge