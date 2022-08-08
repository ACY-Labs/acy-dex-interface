import React, { useState, useEffect } from 'react';
import styles from '../styles.less'

const DetailBox = props => {

  const {

  } = props

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statstitle}>UNISWAP V2 POOL INFO</div>
      <div className={styles.statsdivider} />
      <div className={styles.statscontent}>
        <div className={styles.statsRow}>
          <div className={styles.label}>Total liquidity</div>
          <div className={styles.value}>$8.73K</div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.label}>24h Volume</div>
          <div className={styles.value}>$1.20K</div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.label}>Pooled WETH</div>
          <div className={styles.value}>2.70</div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.label}>Pooled SHIKI</div>
          <div className={styles.value}>741.01M</div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.label}>Holders</div>
          <div className={styles.value}>1</div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.label}>Diluted MCap</div>
          <div className={styles.value}>$5.89K</div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.label}>Max Supply</div>
          <div className={styles.value}>1.00B SHIKI</div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.label}>Pool Created</div>
          <div className={styles.value}>8/4/2022 20:33</div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.label}>% Pooled SHIKI</div>
          <div className={styles.value}>74.10%</div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.label}>1 ETH</div>
          <div className={styles.value}>274.16M SHIKI</div>
        </div>

      </div>

    </div>
  );
}

export default DetailBox