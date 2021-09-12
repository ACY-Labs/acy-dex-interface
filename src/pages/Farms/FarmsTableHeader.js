import React from 'react';
import styles from '@/pages/Farms/Farms.less';

const FarmsTableHeader = ({ tableTitle, tableSubtitle }) => {
  return (
    <div className={styles.tableHeaderContainer}>
      <div className={styles.tableHeaderTitleContainer}>
        <div className={styles.tableHeaderTitle}>{tableTitle}</div>
        <div className={styles.tableHeaderSubtitle}>{tableSubtitle}</div>
      </div>
    </div>
  )
}

export default FarmsTableHeader
