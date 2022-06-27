import React, { useState } from 'react';
import {  Divider, Icon, Input, Table  } from 'antd';
import styles from './ActionHistoryTable.less';
import numeral from 'numeral';
import formatNumber from 'accounting-js/lib/formatNumber.js';
import  { abbrNumber } from '../../Market/Util.js';
import { constantInstance } from '@/constants';
import { sortTableTime } from '../utils'
import { useActionData, formatDateTime, formatAmount, getExplorerUrl } from '@/acy-dex-futures/utils';
import { useConstantLoader } from '@/constants';


const StakeHistoryTable = props => {
  const [stakeDisplayNumber, setStakeDisplayNumber] = useState(7);
  const { dataSource, isMobile } = props;
  const {chainId} = useConstantLoader();
  const [data, loading] = useActionData()

  const getWallet = (wallet) => {
    return wallet.substr(0,5) + "......" + wallet.substr(-4,4)
  }

  const sampleStakeHistoryColumns = [
    {
      title: (
        <div className={styles.tableDataFirstColumn}>
          Wallet
        </div>
      ),
      dataIndex: 'account',
      key: 'fromforto',
      render: (text, record) => {
        return (
        <div className={styles.tableDataFirstColumn}>
          {getWallet(text)}
          </div>
        );
      }
    },
    {
      title: (
        <div className={styles.tableData}>
          Action
        </div>
      ),
      dataIndex: 'action',
      key: 'action',
      align : 'left',
      render: (text, record) => {
        return <div className={styles.tableData}>{text}</div>;
      }
    },
    {
      title: (
        <div className={styles.tableData}>
          Amount
        </div>
      ),
      dataIndex: 'amount',
      key: 'toAmount',
      align : 'left',
      render: (text,record) => {
        return <div className={styles.tableData}>{text}</div>;
      }
    },
    {
      title: (
        <div className={styles.tableData}>
          Price
        </div>
      ),
      dataIndex: 'price',
      key: 'price',
      align : 'left',
      render: (text, record) => {
        const price = text/1e30;
        return <div className={styles.tableData}>{text}</div>;
      }
    },
    {
      title: (
        <div className={styles.tableData}>
          Time
        </div>
      ),
      dataIndex: 'timestamp',
      key: 'transactionTime',
      render: (text, record) => {
        return <div className={styles.tableData}>{formatDateTime(text)}</div>;
      }
    },
  ]
  const sampleStakeHistoryMobileColumns = [
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
      { !loading && (
        <Table
        columns={ isMobile&&sampleStakeHistoryMobileColumns || sampleStakeHistoryColumns }
        dataSource={  sortTableTime(data, 'timestamp', true).slice(0, stakeDisplayNumber + 1) }
        className={ styles.tableStyle }
        pagination={ false }
        onRow={record => {
            return {
              onClick: event => {
                // 跳转到eths
                window.open(`${getExplorerUrl(chainId)}tx/${record.hash}`);
              }, // 点击行
            };
        }}
        footer={() => (
          <div className={styles.tableSeeMoreWrapper}>
            <a
              className={styles.tableSeeMore}
              onClick={() => {
                if(stakeDisplayNumber < data.length) {
                  setStakeDisplayNumber(prevState => prevState + 7)
                }
              }
               
              }
            > 
            {stakeDisplayNumber < data.length ? "See More...": "No more data"}
              
            </a>
          </div>
        )}
      />
      )}
      </div>
      
    
  );
};

export default StakeHistoryTable;
