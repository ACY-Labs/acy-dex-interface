import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { Gauge } from 'ant-design-pro/lib/Charts';
import { AcyPerpetualButton } from '../Acy';

import styles from './styles.less';

const AccountInfoGauge = props => {

  const onClickDeposit = () => {
    
  }

  const onClickWithdraw = () => {

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
        <AcyPerpetualButton onClick={onClickDeposit}>
          DEPOSIT
        </AcyPerpetualButton>
        <AcyPerpetualButton onClick={onClickWithdraw}>
          WITHDRAW
        </AcyPerpetualButton>
      </div>
    </div>
  );
}

export default AccountInfoGauge