import React, { useState } from 'react';
import {  Divider, Icon, Input, Table  } from 'antd';
import styles from './OrderTable.less';
import numeral from 'numeral';
import formatNumber from 'accounting-js/lib/formatNumber.js';
import  { abbrNumber } from '../../Market/Util.js';
import { constantInstance } from '@/constants';
import { sortTableTime } from '../utils'

const OrderTable = props => {
  const { dataSource, isMobile } = props;
  const [ orderDisplayNumber, setOrderDisplayNumber ] = useState(5);

  const sampleOrderColumns = [
    {
      // title: (
      //   <div className={styles.tableDataFirstColumn}>
      //     Type
      //   </div>
      // ),
      title: 'Type',
      dataIndex: 'type',
      align: 'left',
      render: (text, record) => {
          return (
            <div className={styles.tableEntryBig}>
              {record.type}
            </div>
          );
      }
    },
    {
      // title: (
      //   <div className={styles.tableData}>
      //     Order
      //   </div>
      // ),
      title: 'Order',
      dataIndex: 'order',
      align: 'left',
      render: (text, record) => {
        return <div className={styles.tableData}>$ {abbrNumber(record.order.amountIn)}</div>;
      }
    },
    {
      // title: (
      //   <div className={styles.tableData}>
      //     Price
      //   </div>
      // ),
      title: 'Price',
      dataIndex: 'price',
      align: 'left',
      render: (text, record) => {
        return <div className={styles.tableData}>$ {abbrNumber(text)}</div>;
      }
    },
    {
      // title: (
      //   <div className={styles.tableData}>
      //     Mark Price
      //   </div>
      // ),
      title: 'Mark Price',
      dataIndex: 'markPrice',
      align: 'left',
      render: (text, record) => {
        return <div className={styles.tableData}>$ {abbrNumber(text)}</div>;
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