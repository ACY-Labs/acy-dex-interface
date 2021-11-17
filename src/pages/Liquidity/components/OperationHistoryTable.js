import React, { useState } from 'react';
import { Table } from 'antd';
import styles from './OperationHistoryTable.less';
import { Tooltip } from 'antd';
import formatNumber from 'accounting-js/lib/formatNumber.js';

const OperationHistoryColumns = [
  {
    title: 'Swap',
    key: 'fromforto',
    render: record =>`Swap ${record.inputTokenSymbol} for ${record.outTokenSymbol}`
  },
  {
    title: 'Total Value',
    dataIndex: 'totalToken',
    key: 'totalToken',
    render: text =><Tooltip title={text}>{text && text.toString().replace(/([0-9]+.[0-9]{2})[0-9]*/,"$1")}</Tooltip>
  },
  {
    title: 'Token Amount',
    dataIndex: 'inputTokenNum',
    key: 'inputTokenNum',
    render: (text,record) =><Tooltip title={text}>{text && formatNumber(text*1,{ precision: 3, thousand: " " })} {record.inputTokenSymbol}</Tooltip>
  },
  {
    title: 'Token Amount',
    dataIndex: 'outTokenNum',
    key: 'outTokenNum',
    render: (text,record) =><Tooltip title={text}>{text && formatNumber(text*1,{ precision: 3, thousand: " " })} {record.outTokenSymbol}</Tooltip>
  },
  {
    title: 'Time',
    dataIndex: 'transactionTime',
    key: 'transactionTime'
  },
]
const OperationHistoryMobileColumns = [
  {
    title: 'Swap',
    key: 'fromforto',
    render: record =>`Swap ${record.inputTokenSymbol} for ${record.outTokenSymbol}`
  },
  
  {
    title: 'Time',
    dataIndex: 'transactionTime',
    key: 'transactionTime'
  },
]
const OperationHistoryTable = props => {
  const [OperationDisplayNumber, setOperationDisplayNumber] = useState(5);
  const { dataSource, isMobile } = props;
  return (
    <div className={styles.nobgTable}>
      <Table
        columns={isMobile&&OperationHistoryMobileColumns||OperationHistoryColumns}
        dataSource={dataSource.slice(0,OperationDisplayNumber+1)}
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
