import React from 'react';
import styles from '@/pages/Farms/Farms.less';
import farmsTableContent from './FarmsTableContent'
import FarmsTableRow from '@/pages/Farms/FarmsTableRow';

const FarmsTable = () => {
  // const [tableContent, setTableContent] = {
  //
  // }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeaderContainer}>
        <div className={styles.tableHeaderTitleContainer}>
          <div className={styles.tableHeaderTitle}>All Farms</div>
          <div className={styles.tableHeaderSubtitle}>Stake your LP tokens and earn token rewards</div>
        </div>
        <div className={styles.tableHeaderButtonContainer}>
          <div className={styles.tableHeaderRadioButtonContainer}>Stake Only</div>
          <div className={styles.tableHeaderSearchInputContainer}>Search by Token Symbol</div>
          <div className={styles.tableHeaderToggleButtonContainer}>Active & Ended</div>
        </div>
      </div>
      <div className={styles.tableBodyContainer}>
        {farmsTableContent.map(() => (
          <FarmsTableRow />
        ))}
      </div>
    </div>
  )
}

export default FarmsTable
