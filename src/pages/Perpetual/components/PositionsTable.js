
import React, { useState } from 'react';
import {  Divider, Icon, Input, Table  } from 'antd';
import styles from './PositionsTable.less';
import numeral from 'numeral';
import formatNumber from 'accounting-js/lib/formatNumber.js';
import  { abbrNumber } from '../../Market/Util.js';
import { constantInstance } from '@/constants';
function sortTableTime(table, key, isReverse) {
  return table.sort((a, b) => {
    if (isReverse) {
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    } else {
      return new Date(a[key]).getTime() - new Date(b[key]).getTime();
    }
  });
}

const StakeHistoryTable = props => {
  const [stakeDisplayNumber, setStakeDisplayNumber] = useState(5);
  const { dataSource, isMobile } = props;

  const sampleStakeHistoryColumns = [
    {
      title: (
        <div
          className={styles.tableDataFirstColumn}
        >
          Positions
        </div>
      ),
      dataIndex: '',
      key: 'fromforto',
      render: (text, record) => {
          return (
          <div className={styles.tableDataFirstColumn}>
            Swap {record.inputTokenSymbol} for {record.outTokenSymbol} {record.FA ? " (FA)" : ""}
            </div>
          );  
      }
    },
    {
      title: (
        <div
          className={styles.tableData}
        >
          Net Value
        </div>
      ),
      dataIndex: 'totalToken',
      key: 'totalToken',
      render: (text,record) => {
        return <div className={styles.tableData}>$ {abbrNumber(text)}</div>;
      }
    },
    {
        title: (
          <div
            className={styles.tableData}
          >
            Size
          </div>
        ),
        dataIndex: 'totalToken',
        key: 'totalToken',
        render: (text,record) => {
          return <div className={styles.tableData}>$ {abbrNumber(text)}</div>;
        }
      },
    {
      title: (
        <div
          className={styles.tableData}
        >
          Collateral
        </div>
      ),
      dataIndex: 'inputTokenNum',
      key: 'inputTokenNum',
      render: (text,record) => {
        return <div className={styles.tableData}>{abbrNumber(text)} {record.inputTokenSymbol}</div>;
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
      dataIndex: 'outTokenNum',
      key: 'outTokenNum',
      render: (text,record) => {
        return <div className={styles.tableData}>{abbrNumber(text)} {record.outTokenSymbol}</div>;
      }
    },
    {
      title: (
        <div
          className={styles.tableData}
        >
          Entry Price
        </div>
      ),
      dataIndex: 'transactionTime',
      key: 'transactionTime',
      render: (text,record) => {
        return <div className={styles.tableData}>{text}</div>;
      }
    },
    {
        title: (
          <div
            className={styles.tableData}
          >
            Liq. Price
          </div>
        ),
        dataIndex: 'transactionTime',
        key: 'transactionTime',
        render: (text,record) => {
          return <div className={styles.tableData}>{text}</div>;
        }
      },
      {
        title: (
          <div
            className={styles.tableData}
          >
          </div>
        ),
        dataIndex: 'transactionTime',
        key: 'transactionTime',
        render: (text,record) => {
          return <div className={styles.tableData}>{text}</div>;
        }
      },
    
  ]
  const sampleStakeHistoryMobileColumns = [
    {
      title: 'Positions ',
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
        columns={isMobile&&sampleStakeHistoryMobileColumns||sampleStakeHistoryColumns}
        dataSource={sortTableTime(dataSource,'transactionTime',true).slice(0,stakeDisplayNumber+1)}
        className={styles.tableStyle}
        pagination={false}
        locale={{ emptyText: 'No Positions Yet' }}
        onRow={record => {
          if(record.FA){
            return {
              onClick: event => {
                // 跳转到eths
                window.open(`#/transaction/${record.hash}`);
              }, // 点击行
            };
          }else{
            return {
              onClick: event => {
                // 跳转到eths
                window.open(`${constantInstance.scanUrlPrefix.scanUrl}/tx/${record.hash}`);
              }, // 点击行
            };
          }
          
        }}
      />
    </div>
    
  );
};

export default StakeHistoryTable;
