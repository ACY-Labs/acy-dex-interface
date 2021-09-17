import React from 'react';
import styles from '@/pages/Farms/Farms.less';

const ToggleButtonGroup = ({ selectedTable, onAllToggleButtonClick, onAcyToggleButtonClick, onPremierToggleButtonClick }) => {
  return (
    <div className={styles.tableToggleButtonContainer}>
      <button
        type="button"
        className={styles.firstToggleButton}
        style={{ backgroundColor: selectedTable === 0 ? "#29292c" : "#2e3032", color: selectedTable === 0 ? "#1e5d91": ""}}
        onClick={onAllToggleButtonClick}
      >
        All
      </button>
      <button
        type="button"
        className={styles.middleToggleButton}
        style={{ backgroundColor: selectedTable === 1 ? "#29292c" : "#2e3032", color: selectedTable === 1 ? "#1e5d91": ""}}
        onClick={onAcyToggleButtonClick}
      >
        ACY
      </button>
      <button
        type="button"
        className={styles.lastToggleButton}
        style={{ backgroundColor: selectedTable === 2 ? "#29292c" : "#2e3032", color: selectedTable === 2 ? "#1e5d91": ""}}
        onClick={onPremierToggleButtonClick}
      >
        Premier
      </button>
    </div>
  )
}

export default ToggleButtonGroup
