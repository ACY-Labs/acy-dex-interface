import React, { useState, useEffect } from 'react';
import styles from '../styles.less'

const DetailBox = props => {

  const {
    pair_name,
    token_address,
    pair_address,
  } = props

  const copy = value => {
    navigator.clipboard.writeText(value)
  }

  return (
    <>
      <div style={{ padding: '10px', display: 'flex', fontSize: '16px', marginTop: '50px' }}>
        <div style={{ color: 'white', fontWeight: '400', marginRight: '10px' }}>{pair_name}</div>
        <div style={{ marginRight: '10px' }}>
          <span style={{ marginRight: '5px' }}>Token: {token_address.slice(0,6)}...{token_address.slice(token_address.length-4, token_address.length)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.copyAddress} viewBox="0 0 50 50" onClick={()=>{copy(token_address)}}><path d="M9 43.95q-1.2 0-2.1-.9-.9-.9-.9-2.1V10.8h3v30.15h23.7v3Zm6-6q-1.2 0-2.1-.9-.9-.9-.9-2.1v-28q0-1.2.9-2.1.9-.9 2.1-.9h22q1.2 0 2.1.9.9.9.9 2.1v28q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h22v-28H15v28Zm0 0v-28 28Z" /></svg>
        </div>
        <div>
          <span style={{ marginRight: '5px' }}>Pair: {pair_address.slice(0,6)}...{pair_address.slice(pair_address.length-4, pair_address.length)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.copyAddress} viewBox="0 0 50 50" onClick={()=>{copy(pair_address)}}><path d="M9 43.95q-1.2 0-2.1-.9-.9-.9-.9-2.1V10.8h3v30.15h23.7v3Zm6-6q-1.2 0-2.1-.9-.9-.9-.9-2.1v-28q0-1.2.9-2.1.9-.9 2.1-.9h22q1.2 0 2.1.9.9.9.9 2.1v28q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h22v-28H15v28Zm0 0v-28 28Z" /></svg>
        </div>
      </div>

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
    </>
  );
}

export default DetailBox