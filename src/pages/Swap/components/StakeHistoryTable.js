import React, { useState } from 'react';
import { Table } from 'antd';
import SampleStakeHistoryData, {
  sampleStakeHistoryColumns,
} from '../sample_data/SampleStakeHistoryData';
import styles from './StakeHistoryTable.less';

const StakeHistoryTable = (props) => {
  const [stakeDisplayNumber, setStakeDisplayNumber] = useState(5);
  const {dataSource}=props;
  console.log('dataSource',dataSource);
  return (
    <Table
      columns={sampleStakeHistoryColumns}
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
  );
};

export default StakeHistoryTable;
