import React, { useState } from 'react';
import {  Divider, Icon, Input, Table  } from 'antd';
import styles from './OrderTable.less';
import numeral from 'numeral';
import formatNumber from 'accounting-js/lib/formatNumber.js';
import  { abbrNumber } from '../../Market/Util.js';
import { constantInstance } from '@/constants';

const OrderTable = props => {
  const { dataSource, isMobile } = props;

  const sampleOrderColumns = [
    {
      title: (
        <div
          className={styles.tableDataFirstColumn}
        >
          Type
        </div>
      ),
      dataIndex: '',
      key: 'fromforto',
      render: (text, record) => {
          return (
          <div className={styles.tableDataFirstColumn}>
            {abbrNumber(text)}
            </div>
          );  
      }
    },
    {
      title: (
        <div
          className={styles.tableData}
        >
          Order
        </div>
      ),
      dataIndex: 'order',
      key: 'order',
      render: (text,record) => {
        return <div className={styles.tableData}>$ {abbrNumber(text)}</div>;
      }
    },
    {
      title: (
        <div
          className={styles.tableData}
        >
          Price
        </div>
      ),
      dataIndex: 'price',
      key: 'price',
      render: (text,record) => {
        return <div className={styles.tableData}>{abbrNumber(text)} $</div>;
      }
    },
    {
      title: (
        <div
          className={styles.tableData}
        >
          Mark Price
        </div>
      ),
      dataIndex: 'markPrice',
      key: 'markPrice',
      render: (text,record) => {
        return <div className={styles.tableData}>{abbrNumber(text)}$ </div>;
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
        dataSource={sortTableTime(dataSource, 'transactionTime', true).slice(0, stakeDisplayNumber+1)}
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
              onClick={() => setStakeDisplayNumber(prevState => prevState + 5)}
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