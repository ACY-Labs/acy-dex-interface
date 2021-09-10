import React from 'react';
import styles from '@/pages/Farms/Farms.less';

const FarmsTableRow = () => {
  return (
    <div className={styles.tableBodyRowContainer}>
      <div className={styles.tableBodyRowTitleContainer}>Token Pair Name</div>
      <div className={styles.tableBodyRowRewardContainer}>Pending Reward</div>
      <div className={styles.tableBodyRowAprContainer}>Total APR</div>
      <div className={styles.tableBodyRowTvlContainer}>TVL</div>
      <div className={styles.tableBodyRowArrowContainer}>Arrow Icon</div>
    </div>
  )
}

export default FarmsTableRow
