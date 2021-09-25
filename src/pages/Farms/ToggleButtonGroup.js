import React from 'react';
import styles from '@/pages/Farms/Farms.less';

const ToggleButtonGroup = (
  { selectedTable,
    onAllToggleButtonClick,
    onAcyToggleButtonClick,
    onPremierToggleButtonClick,
    onDaoToggleButtonClick,
    onMyFarmsToggleButtonClick,
  }
) => {
  return (
    <div className={styles.tableToggleButtonContainer}>
      <button
        type="button"
        className={styles.firstToggleButton}
        style={{ backgroundColor: selectedTable === 0 ? "#174163" : "#2e3032", color: selectedTable === 0 ? "white": ""}}
        onClick={onAllToggleButtonClick}
      >
        All
      </button>
      <button
        type="button"
        className={styles.leftToggleButton}
        style={{ backgroundColor: selectedTable === 1 ? "#174163" : "#2e3032", color: selectedTable === 1 ? "white": ""}}
        onClick={onAcyToggleButtonClick}
      >
        Standard
      </button>
      <button
        type="button"
        className={styles.middleToggleButton}
        style={{ backgroundColor: selectedTable === 3 ? "#174163" : "#2e3032", color: selectedTable === 3 ? "white": ""}}
        onClick={onDaoToggleButtonClick}
      >
        DAO
      </button>
      <button
        type="button"
        className={styles.rightToggleButton}
        style={{ backgroundColor: selectedTable === 2 ? "#174163" : "#2e3032", color: selectedTable === 2 ? "white": ""}}
        onClick={onPremierToggleButtonClick}
      >
        Premier
      </button>
      {/*<button*/}
      {/*  type="button"*/}
      {/*  className={styles.lastToggleButton}*/}
      {/*  style={{ backgroundColor: selectedTable === 4 ? "#174163" : "#2e3032", color: selectedTable === 4 ? "white": ""}}*/}
      {/*  onClick={onMyFarmsToggleButtonClick}*/}
      {/*>*/}
      {/*  My Farms*/}
      {/*</button>*/}
    </div>
  )
}

export default ToggleButtonGroup
