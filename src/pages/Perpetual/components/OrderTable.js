import React, { useState } from 'react';
import {  Divider, Icon, Input, Table  } from 'antd';
import styles from './OrderTable.less';
import numeral from 'numeral';
import formatNumber from 'accounting-js/lib/formatNumber.js';
import  { abbrNumber } from '../../Market/Util.js';
import { constantInstance } from '@/constants';
import { sortTableTime } from '../utils'
import { formatAmount, USD_DECIMALS, getTokenInfo } from '@/acy-dex-futures/utils';

const OrderTable = props => {

  const { dataSource, isMobile, infoTokens } = props;
  const [ orderDisplayNumber, setOrderDisplayNumber ] = useState(5);

  const sampleOrderColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      align: 'left',
      render: (text, record) => {
        if(text == "Increase") {
          if(record.isLong) {
            return <div className={styles.tableEntryGreen}> Litmit / Long </div>;
          } else {
            return <div className={styles.tableEntryRed}> Litmit / Short </div>;
          }
          
        } else if(text == "Decrease") {
          if(record.isLong && record.triggerAboveThreshold || !record.isLong && !record.triggerAboveThreshold) {
            return <div className={styles.tableEntryGreen}> Take Profit </div>;
          } else {
            return <div className={styles.tableEntryRed}> Stop Loss </div>;
          }
        }
        
      }
    },
    {
      title: 'Order',
      dataIndex: 'order',
      align: 'left',
      render: (text, record) => {
        const indexToken = getTokenInfo(infoTokens,record.indexToken)
        
        if(record.type == "Increase") {
          const purchaseToken = getTokenInfo(infoTokens, record.purchaseToken)
          return <div>
            <div className={styles.tableData}>
              {record.type} {indexToken.symbol} {record.isLong ? "Long" : "Short"}
              &nbsp;by ${formatAmount(record.sizeDelta, USD_DECIMALS, 2, true)}
            </div>
            <div className={styles.tableData}>
              Collateral: {formatAmount(record.purchaseTokenAmount, purchaseToken.decimals, 2, true)} {purchaseToken.symbol}
            </div>
          </div>
          
        } else if(record.type == "Decrease") {
          const collateralToken = getTokenInfo(infoTokens, record.collateralToken)
          return <div>
            <div className={styles.tableData}>
              {record.type} {indexToken.symbol} {record.isLong ? "Long" : "Short"}
              &nbsp;by ${formatAmount(record.sizeDelta, USD_DECIMALS, 2, true)}
            </div>
            <div className={styles.tableData}>
              Withdraw collateral: ${formatAmount(record.collateralDelta, USD_DECIMALS, 2, true)} {collateralToken.symbol}
            </div>
          </div>
        }
      }
    },
    {
      title: 'Trigger Price',
      dataIndex: 'triggerPrice',
      align: 'left',
      render: (text, record) => {
        return <div className={styles.tableData}> {record.triggerAboveThreshold? ">": "<"} $ {formatAmount(text, USD_DECIMALS, 2, false)}</div>;
      }
    },
    {
      title: 'Mark Price',
      dataIndex: 'triggerPrice',
      align: 'left',
      render: (text, record) => {
        const indexToken = getTokenInfo(infoTokens,record.indexToken)
        return <div className={styles.tableData}>$ {formatAmount(indexToken.maxPrice, USD_DECIMALS, 2, false)}</div>;
      }
    },
  ]
  const sampleOrderMobileColumns = [
    {
      title: 'Swap',
      key: 'fromforto',
      render: record =>`${record.action} ${record.token1Symbol} and ${record.token2Symbol}`
    },
    
    {
      title: 'Time',
      dataIndex: 'transactionTime',
      key: 'transactionTime'
    },
  ]
  return (
    <div className={styles.nobgTable}>
      <Table
        columns={isMobile&&sampleOrderMobileColumns||sampleOrderColumns}
        dataSource={sortTableTime(dataSource, 'transactionTime', true).slice(0, orderDisplayNumber+1)}
        className={styles.tableStyle}
        pagination={false}
        onRow={record => {
          if(record.FA){
            return {
              onClick: event => {
                // 跳转到eths
                window.open(`#/transaction/${record.hash}`);
              }, // 点击行
            };
          } else {
            return {
              onClick: event => {
                // 跳转到eths
                window.open(`${constantInstance.scanUrlPrefix.scanUrl}/tx/${record.hash}`);
              }, // 点击行
            };
          }
          
        }}
        footer={() => (
          <div className={styles.tableSeeMoreWrapper}>
            <a
              className={styles.tableSeeMore}
              onClick={() => setOrderDisplayNumber(prevState => prevState + 5)}
            >
              See More...
            </a>
          </div>
        )}
      />
    </div>
    
  );
  
};

export default OrderTable;