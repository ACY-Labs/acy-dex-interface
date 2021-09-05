import React from 'react';
import { Table } from 'antd';
import SampleStakeHistoryData, {sampleStakeHistoryColumns} from './SampleStakeHistoryData';
import styles from './styles.less';


const StakeHistoryTable = () => (
  <Table
    columns={sampleStakeHistoryColumns}
    dataSource={SampleStakeHistoryData.sort((a, b) => new Date(b.time) - new Date(a.time))}
    pagination={false}
    footer={() => (
      <div className={styles.tableSeeMoreWrapper}>
        <a className={styles.tableSeeMore}>See More...</a>
      </div>
    )}
  />
)

export default StakeHistoryTable;
