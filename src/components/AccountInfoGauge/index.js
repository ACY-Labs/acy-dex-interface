import React, { useState, useEffect } from 'react';
import { Gauge } from 'ant-design-pro/lib/Charts';
import ComponentButton from '../ComponentButton';
import DepositWithdrawModal from './DepositWithdrawModal';
import { getContract } from '@/constants/future_option_power.js';
import useSWR from 'swr';
import { PLACEHOLDER_ACCOUNT, fetcher, formatAmount } from '@/acy-dex-futures/utils';
import Reader from '@/abis/future-option-power/Reader.json'

import styles from './styles.less';
import { offset } from '@popperjs/core';

const AccountInfoGauge = props => {

  const {
    chainId,
    library,
    account,
    active,
    symbol,
    totalMargin,
    usedMargin,
  } = props

  const [mode, setMode] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const percentage = totalMargin && usedMargin ? (totalMargin-usedMargin)/totalMargin * 100 : 0

  const onClickDeposit = () => {
    setMode('Deposit')
    setIsConfirming(true)
  }

  const onClickWithdraw = () => {
    setMode('Withdraw')
    setIsConfirming(true)
  }

  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")

  const { data: tokenInfo, mutate: updateTokenInfo } = useSWR([chainId, readerAddress, "getTokenInfo", poolAddress, account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader)
  });

  useEffect(() => {
    if (active) {
      library.on('block', () => {
        updateTokenInfo()
      });
      return () => {
        library.removeAllListeners('block')
      }
    }
  },
    [active,
      library,
      chainId,
      updateTokenInfo,
    ]
  )

  return (
    <div className={styles.main}>
      <div className={styles.accountInfo}>
        <div className={styles.details}>
          <div className={styles.statstitle}>Account Info</div>
          <div className={styles.statscontent}>
            <div className={styles.statsRow}>
              Total Margin
            </div>
            <div className={styles.statsRow}>
              ${totalMargin}
            </div>
            <div className={styles.statsRow}>
              Margin Usage
            </div>
            <div className={styles.statsRow}>
              ${usedMargin}
            </div>
            <div className={styles.statsRow}>
              Available Margin
            </div>
            <div className={styles.statsRow}>
              ${totalMargin - usedMargin || '...'}
            </div>
          </div>
        </div>
        <div className={styles.gauge}>
          <Gauge
            title=''
            autoFit={true}
            percent={percentage}
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
          symbol={symbol}
          setIsConfirming={setIsConfirming}
          mode={mode}
        />
      }

    </div>
  );
}

export default AccountInfoGauge