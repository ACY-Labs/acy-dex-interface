/*
 * @Author: Doctor
 * @Date: 2021-10-18 14:09:29
 * @LastEditTime: 2021-10-18 18:23:20
 * @LastEditors: Doctor
 * @Description: 
 * @FilePath: \acy-dex-interface\src\pages\Transaction\Index.js
 * jianqiang
 */
import React, { Component, useState, useEffect } from 'react';
import Media from 'react-media';
import { connect } from 'umi';
import {Divider}from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import {
  AcyIcon
} from '@/components/Acy';
import styles from './styles.less';

const Transaction = props => {
  return <PageHeaderWrapper>
    <div className={styles.transaction}>
      <div>
        <h1>Flash Routers</h1>
        <div className={styles.routers}>
          <div>
            <div className={styles.block}>Swap  AAVE </div>
            <div className={styles.smallblock}>
              <div>0.875392845</div>
              <div>0.009%</div>
            </div>
            <div className={styles.smallblock}>
              <div>0.875392845</div>
              <div>0.009%</div>
            </div>
            <div className={styles.smallblock}>
              <div>0.875392845</div>
              <div>0.009%</div>
            </div>
          </div>
          <div><AcyIcon.MyIcon width={30} type="arrow" /></div>
          <div>
            <div className={styles.block}>Pass</div>
            <div className={styles.smallblock}>
              <div>208.4382124</div>
              <div>ACY</div>
            </div>
            <div className={styles.smallblock}>
              <div>208.4382124</div>
              <div>ACY</div>
            </div>
            <div className={styles.smallblock}>
              <div>208.4382124</div>
              <div>ACY</div>
            </div>
          </div>
          <div><AcyIcon.MyIcon width={30} type="arrow" /></div>
          <div>
          <div className={styles.block}>For USDC</div>
            <div className={styles.smallblock}>
              <div>0.875392845</div>
              <div>0.009%</div>
            </div>
            <div className={styles.smallblock}>
              <div>0.875392845</div>
              <div>0.009%</div>
            </div>
            <div className={styles.smallblock}>
              <div>0.875392845</div>
              <div>0.009%</div>
            </div>
          </div>

        </div>
        <Divider />
        <h1>Flash Arbitrage Revenue </h1>
        <table style={{width:'500px'}}>
           <tr>
             <td>ACY Output</td>
             <td>7,082,312.03</td>
             <td>USDC</td>
           </tr>
           <tr>
             <td>AMM Output</td>
             <td>7,082,312.03</td>
             <td>USDC</td>
           </tr>
           <tr>
             <td>Flash Arbitrage Revenue</td>
             <td>7,082,312.03</td>
             <td>USDC</td>
           </tr>
        </table>
        <Divider />
        <h1>Flash Arbitrage Revenue Allocation</h1>
        <table style={{width:'500px'}}>
           <tr>
             <td>Trader</td>
             <td>40%</td>
             <td>2,519,015.51</td>
           </tr>
           <tr>
             <td>Liquidity Provider</td>
             <td>10%</td>
             <td>2,519,015.51</td>
           </tr>
           <tr>
             <td>{`Farms-->ACYDAO`}</td>
             <td>10%</td>
             <td>314,876.94</td>
           </tr>
        </table>
        <Divider />
        <h1>Basic Fee</h1>
        <table style={{width:'500px'}}>
           <tr>
             <td>Gas Fee</td>
             <td>36.30968799$ (0.010374ETH)</td>
           </tr>
           <tr>
             <td>Trading Fee</td>
             <td>4988.4</td>
           </tr>
        </table>
        <Divider />
        <h1>Trading Fee Allocation</h1>
        <table style={{width:'500px'}}>
           <tr>
             <td>Liquidity Providers</td>
             <td>4157</td>
           </tr>
           <tr>
             <td>ACYDAO</td>
             <td>831.4</td>
           </tr>
        </table>
        <Divider />
        <h1>Trader Receive</h1>
        <table style={{width:'500px'}}>
           <tr>
             <td>USDC</td>
             <td>3,303,788.77</td>
           </tr>
           <tr>
             <td>ACY</td>
             <td>2,519,015.51</td>
           </tr>
        </table>
      </div>
    </div>
  </PageHeaderWrapper>
}
export default connect(({ profile, transaction, loading }) => ({
  profile,
  transaction,
  loading: loading.effects['profile/fetchBasic'],
}))(props => (
  <Media query="(max-width: 599px)">
    {isMobile => <Transaction {...props} isMobile={isMobile} />}
  </Media>
))

