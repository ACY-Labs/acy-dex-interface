import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import SampleStakeHistoryData, {
  sampleStakeHistoryColumns,
} from '../sample_data/SampleStakeHistoryData';
import styles from './StakeHistoryTable.less';

const StakeHistoryTable = () => {
  const [stakeDisplayNumber, setStakeDisplayNumber] = useState(5);
  const [dataColumns, setDataColumns] = useState(sampleStakeHistoryColumns.map((column) => {
    const newColumn = {...column}
    newColumn.show = true
    return newColumn
  }))

  useEffect(() => {
    if (window.innerWidth < 768) {
      setDataColumns((prevState) => {
        const prevDataColumn = [...prevState]
        prevDataColumn[2].show = false
        prevDataColumn[4].show = false
        return prevDataColumn
      })
    } else {
      setDataColumns((prevState) => {
        const prevDataColumn = [...prevState]
        prevDataColumn[2].show = true
        prevDataColumn[4].show = true
        return prevDataColumn
      })
    }
  }, [])

  window.addEventListener('resize', (e) => {
    if (e.target.innerWidth < 768) {
      setDataColumns((prevState) => {
        const prevDataColumn = [...prevState]
        prevDataColumn[2].show = false
        prevDataColumn[4].show = false
        return prevDataColumn
      })
    } else {
      setDataColumns((prevState) => {
        const prevDataColumn = [...prevState]
        prevDataColumn[2].show = true
        prevDataColumn[4].show = true
        return prevDataColumn
      })
    }
  })

  return (
    <Table
      columns={dataColumns.filter((column) => column.show === true)}
      dataSource={SampleStakeHistoryData.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(
        0,
        stakeDisplayNumber
      )}
      className={styles.tableStyle}
      pagination={false}
      footer={() => (
        <div className={styles.tableSeeMoreWrapper} onClick={() => setStakeDisplayNumber(prevState => prevState + 5)}>
          <a
            className={styles.tableSeeMore}
          >
            See More...
          </a>
        </div>
      )}
    />
  );
};

export default StakeHistoryTable;
