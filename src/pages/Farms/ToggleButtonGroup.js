import React from 'react';
import styles from '@/pages/Farms/Farms.less';

const ToggleButtonGroup = ({ selectedTable, onAllToggleButtonClick, onAcyToggleButtonClick, onPremierToggleButtonClick }) => {
  return (
    <div className={styles.tableToggleButtonContainer}>
      <button
        type="button"
        className={styles.firstToggleButton}
        style={{ backgroundColor: selectedTable === 0 ? "#2e3032" : "#29292c"}}
        onClick={onAllToggleButtonClick}
      >
        All
      </button>
      <button
        type="button"
        className={styles.middleToggleButton}
        style={{ backgroundColor: selectedTable === 1 ? "#2e3032" : "#29292c"}}
        onClick={onAcyToggleButtonClick}
      >
        ACY
      </button>
      <button
        type="button"
        className={styles.lastToggleButton}
        style={{ backgroundColor: selectedTable === 2 ? "#2e3032" : "#29292c"}}
        onClick={onPremierToggleButtonClick}
      >
        Premier
      </button>
    </div>
  )
}

export default ToggleButtonGroup
