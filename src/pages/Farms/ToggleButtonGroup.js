import React from 'react';
import styles from '@/pages/Farms/Farms.less';

const ToggleButtonGroup = ({ selectedTable, onAllToggleButtonClick, onAcyToggleButtonClick, onPremierToggleButtonClick }) => {
  return (
    <div className={styles.tableToggleButtonContainer}>
      <button
        type="button"
        className={styles.firstToggleButton}
        style={{ borderColor: selectedTable === 0 && '#eb5c20' }}
        onClick={onAllToggleButtonClick}
      >
        All
      </button>
      <button
        type="button"
        className={styles.middleToggleButton}
        style={{ borderColor: selectedTable === 1 && '#eb5c20' }}
        onClick={onAcyToggleButtonClick}
      >
        ACY
      </button>
      <button
        type="button"
        className={styles.lastToggleButton}
        style={{ borderColor: selectedTable === 2 && '#eb5c20' }}
        onClick={onPremierToggleButtonClick}
      >
        Premier
      </button>
    </div>
  )
}

export default ToggleButtonGroup
