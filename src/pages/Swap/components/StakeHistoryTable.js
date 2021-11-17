/*
 * @Author: Doctor
 * @Date: 2021-09-20 13:10:40
 * @LastEditTime: 2021-10-18 18:31:41
 * @LastEditors: Doctor
 * @Description: 
 * @FilePath: \acy-dex-interface\src\pages\Swap\components\StakeHistoryTable.js
 * jianqiang
 */
import React, { useState } from 'react';
import { Table } from 'antd';
import SampleStakeHistoryData, {
  sampleStakeHistoryColumns,
  sampleStakeHistoryMobileColumns,
} from '../sample_data/SampleStakeHistoryData';
import styles from './StakeHistoryTable.less';

const StakeHistoryTable = props => {
  const [stakeDisplayNumber, setStakeDisplayNumber] = useState(5);
  const { dataSource, isMobile } = props;
  return (
    <div className={styles.nobgTable}>
      <Table
        columns={isMobile&&sampleStakeHistoryMobileColumns||sampleStakeHistoryColumns}
        dataSource={dataSource.slice(0,stakeDisplayNumber+1)}
        className={styles.tableStyle}
        pagination={false}
        onRow={record => {
          return {
            onClick: event => {
              // 跳转到eths
              window.open(`#/transaction/${record.hash}`);
              
            }, // 点击行
          };
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

export default StakeHistoryTable;
