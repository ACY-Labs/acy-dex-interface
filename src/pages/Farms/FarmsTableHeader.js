import React from 'react';
import styles from '@/pages/Farms/Farms.less';

const FarmsTableHeader = ({ searchInput, setSearchInput }) => {
  return (
    <div className={styles.tableHeaderContainer}>
      <div className={styles.tableHeaderTitleContainer}>
        <div className={styles.tableHeaderTitle}>All Farms</div>
        <div className={styles.tableHeaderSubtitle}>Stake your LP tokens and earn token rewards</div>
      </div>
      <div className={styles.tableHeaderButtonContainer}>
        <div className={styles.tableHeaderRadioButtonContainer}>Stake Only</div>
        <div className={styles.tableHeaderSearchInputContainer}>
          <input
            type="text"
            placeholder="Search by token symbol"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.tableHeaderToggleButtonContainer}>Active & Ended</div>
      </div>
    </div>
  )
}

export default FarmsTableHeader
