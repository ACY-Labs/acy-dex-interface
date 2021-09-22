import Switch from '@material-ui/core/Switch';
import React from 'react';
import styles from './Farms.less';

const TableControl = ({ searchInput, setSearchInput }) => {
  const isMobile = window.innerWidth <= 768

  return (
    <div className={styles.tableHeaderButtonContainer}>
      <div className={styles.tableHeaderRadioButtonContainer}>
        <Switch name="checkedA" color="default" size="small" id="stake-switch" />
        <label htmlFor="stake-switch">Stake Only</label>
      </div>
      <div className={styles.tableHeaderSearchInputContainer}>
        <input
          type="text"
          placeholder={isMobile ? "Search" : "Search by token symbol"}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.tableHeaderToggleButtonContainer}>
        <button type="button" className={styles.activeToggleButton}>Active</button>
        <button type="button" className={styles.endedToggleButton}>Ended</button>
      </div>
    </div>
  )
}

export default TableControl
