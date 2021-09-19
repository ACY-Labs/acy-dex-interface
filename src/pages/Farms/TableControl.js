import { FormControlLabel } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import React from 'react';
import styles from './Farms.less';

const TableControl = ({ searchInput, setSearchInput }) => {
  return (
    <div className={styles.tableHeaderButtonContainer}>
      <div className={styles.tableHeaderRadioButtonContainer}>
        <FormControlLabel
          control={<Switch name="checkedA" color="default" />}
          label="Stake Only"
          labelPlacement="start"
        />
      </div>
      <div className={styles.tableHeaderSearchInputContainer}>
        <input
          type="text"
          placeholder="Search by token symbol"
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
