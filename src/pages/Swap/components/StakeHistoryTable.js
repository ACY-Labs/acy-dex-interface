import React, { useState } from 'react';
import { Table } from 'antd';
import SampleStakeHistoryData, {
  sampleStakeHistoryColumns,
} from '../sample_data/SampleStakeHistoryData';
import styles from './StakeHistoryTable.less';

const StakeHistoryTable = props => {
  const [stakeDisplayNumber, setStakeDisplayNumber] = useState(5);
  const { dataSource, isMobile } = props;
  return (
<<<<<<< HEAD
    <div className={styles.nobgTable}>
      <Table
        columns={isMobile&&sampleStakeHistoryColumns.slice(0,3)||sampleStakeHistoryColumns}
        dataSource={dataSource}
        className={styles.tableStyle}
        pagination={false}
        onRow={record => {
          return {
            onClick: event => {
              // 跳转到eths
              window.open(`https://rinkeby.etherscan.io/tx/${record.hash}`);
              
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
    
=======
    <Table
      columns={(isMobile && sampleStakeHistoryColumns.slice(0, 3)) || sampleStakeHistoryColumns}
      dataSource={dataSource}
      className={styles.tableStyle}
      pagination={false}
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
>>>>>>> b51a2f0cd4915e15a1343484a7869989fe0dfb20
  );
};

export default StakeHistoryTable;
