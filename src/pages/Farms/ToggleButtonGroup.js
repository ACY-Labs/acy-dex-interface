import React from 'react';
import styles from '@/pages/Farms/Farms.less';

const ToggleButtonGroup = (
  { selectedTable,
    onAllToggleButtonClick,
    onAcyToggleButtonClick,
    onPremierToggleButtonClick,
    onDaoToggleButtonClick,
    onMyFarmsToggleButtonClick,
    isMyFarms
  }
) => {
  return (
    <div className={styles.tableToggleButtonContainer}>
      <button
        type="button"
        className={styles.firstToggleButton}
        style={{ backgroundColor: selectedTable === 0 && !isMyFarms ? "#174163" : "#2e3032", color: selectedTable === 0 && !isMyFarms? "white": ""}}
        onClick={onAllToggleButtonClick}
        disabled={isMyFarms}
      >
        All
      </button>
      <button
        type="button"
        className={styles.leftToggleButton}
        style={{ backgroundColor: selectedTable === 1 && !isMyFarms ? "#174163" : "#2e3032", color: selectedTable === 1 && !isMyFarms? "white": ""}}
        onClick={onAcyToggleButtonClick}
        disabled={isMyFarms}
      >
        Standard
      </button>
      <button
        type="button"
        className={styles.middleToggleButton}
        style={{ backgroundColor: selectedTable === 3 && !isMyFarms ? "#174163" : "#2e3032", color: selectedTable === 3 && !isMyFarms? "white": ""}}
        onClick={onDaoToggleButtonClick}
        disabled={isMyFarms}
      >
        DAO
      </button>
      <button
        type="button"
        className={styles.rightToggleButton}
        style={{ backgroundColor: selectedTable === 2 && !isMyFarms ? "#174163" : "#2e3032", color: selectedTable === 2 && !isMyFarms? "white": ""}}
        onClick={onPremierToggleButtonClick}
        disabled={isMyFarms}
      >
        Premier
      </button>
      {/* <button
       type="button"
       className={styles.lastToggleButton}
       style={{ backgroundColor: selectedTable === 4 ? "#174163" : "#2e3032", color: selectedTable === 4 ? "white": ""}}
       onClick={onMyFarmsToggleButtonClick}
      >
       My Farms
      </button> */}
    </div>
  )
}

export default ToggleButtonGroup
