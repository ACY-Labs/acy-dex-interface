import React from 'react';
import styles from '@/pages/Farms/Farms.less';

const FarmsTableHeader = () => {
  return (
    <div className={styles.tableHeaderContainer}>
      <div className={styles.tableHeaderTitleContainer}>
        <div className={styles.tableHeaderTitle}>All Farms</div>
        <div className={styles.tableHeaderSubtitle}>Stake your LP tokens and earn token rewards</div>
      </div>
    </div>
  )
}

export default FarmsTableHeader
