import React, { useState, useCallback } from 'react';
import { Table } from 'antd';
import styles from './OperationHistoryTable.less';
import { Tooltip } from 'antd';
import formatNumber from 'accounting-js/lib/formatNumber.js';


function sortTableTime(table, key, isReverse) {
  return table.sort((a, b) => {
    if (isReverse) {
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    } else {
      return new Date(a[key]).getTime() - new Date(b[key]).getTime();
    }
  });
}

const OperationHistoryTable = props => {
  const [OperationDisplayNumber, setOperationDisplayNumber] = useState(5);
  const [transactionFilter, setTransactionFilter] = useState('All');
  const { dataSource, isMobile } = props;

  const onClickHandler = useCallback(e => {
    let destFilter = e.target.id;
    setTransactionFilter(destFilter);
  });
  const filterTable = (table,filter) =>{
    if(filter=='All') return table;
    else{
      return table.filter(item => item.action==filter);
    }
  }

  const OperationHistoryColumns = [
    {
      title: (
        <div>
          <div className={styles.transactionHeader}>
            <a
            className={styles.transactionType}
            onClick={onClickHandler}
            id={'All'}
            >
              All
            </a>
            <a
            className={styles.transactionType}
            onClick={onClickHandler}
            id={'Add'}
            >
              Add
            </a>
            <a
            className={styles.transactionType}
            onClick={onClickHandler}
            id={'Remove'}
            >
              Remove
            </a>
          </div>
        </div>
      ),
      key: 'fromforto',
      render: record => {
          return <div className={styles.tableDataFirstColumn}>{record.action} {record.token1Symbol} and {record.token2Symbol}</div>;
      }
    },
    {
      title: (
        <div className={styles.tableData}>
          Total Amount
        </div>
      ),
      dataIndex: 'totalToken',
      key: 'totalToken',
      render: (text,record) => {
        return <div className={styles.tableData}>{text}</div>;
      }
    },
    {
      title: (
        <div
          className={styles.tableData}
        >
          Token Amount
        </div>
      ),
      dataIndex: 'token1Number',
      key: 'inputTokenNum',
      render: (text,record) => {
        return <div className={styles.tableData}>{text && formatNumber(text*1,{ precision: 3, thousand: " " })} {record.token1Symbol}</div>;
      }
    },
    {
      title: (
        <div
          className={styles.tableData}
        >
          Token Amount
        </div>
      ),
      dataIndex: 'token2Number',
      key: 'outTokenNum',
      render: (text,record) => {
        return <div className={styles.tableData}>{text && formatNumber(text*1,{ precision: 3, thousand: " " })} {record.token2Symbol}</div>;
      }
    },
    {
      title: (
        <div
          className={styles.tableData}
        >
          Time
        </div>
      ),
      dataIndex: 'transactionTime',
      key: 'transactionTime',
      render: (text,record) => {
        return <div className={styles.tableData}>{text}</div>;
      }
    }
  ]
  const OperationHistoryMobileColumns = [
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
        columns={isMobile&&OperationHistoryMobileColumns||OperationHistoryColumns}
        dataSource={sortTableTime(filterTable(dataSource,transactionFilter),'transactionTime',true).slice(0,OperationDisplayNumber+1)}
        className={styles.tableStyle}
        pagination={false}
        onRow={record => {
          return {
            onClick: event => {
              window.open(`#/transaction/${record.hash}`);
            }, 
          };
        }}
        footer={() => (
          <div className={styles.tableSeeMoreWrapper}>
            <a
              className={styles.tableSeeMore}
              onClick={() => setOperationDisplayNumber(prevState => prevState + 5)}
            >
              See More...
            </a>
          </div>
        )}
      />
    </div>
    
  );
};

export default OperationHistoryTable;
