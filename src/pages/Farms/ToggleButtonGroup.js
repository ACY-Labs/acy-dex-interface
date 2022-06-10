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
        style={{ backgroundColor: selectedTable === 0 && !isMyFarms ? "#2e3032" : "transparent", color: selectedTable === 0 && !isMyFarms? "white": "", border: '0.75px solid #333333'}}
        onClick={onAllToggleButtonClick}
        // disabled={isMyFarms}
      >
        All
      </button>
      <button
        type="button"
        className={`${isMyFarms ? styles.tableToggleButtonMyFarm : styles.leftToggleButton}`}
        style={{ backgroundColor: selectedTable === 3 && !isMyFarms ? "#2e3032" : "transparent", color: selectedTable === 3 && !isMyFarms? "white": "", border: '0.75px solid #333333'}}
        onClick={onDaoToggleButtonClick}
        disabled={isMyFarms}
      >
        DAO
      </button>
      <button
        type="button"
        className={`${isMyFarms ? styles.tableToggleButtonMyFarm : styles.middleToggleButton}`}
        style={{ backgroundColor: selectedTable === 1 && !isMyFarms ? "#2e3032" : "transparent", color: selectedTable === 1 && !isMyFarms? "white": "", border: '0.75px solid #333333'}}
        onClick={onAcyToggleButtonClick}
        disabled={isMyFarms}
      >
        Standard
      </button>
      
      <button
        type="button"
        className={`${isMyFarms ? styles.tableToggleButtonMyFarm : styles.rightToggleButton}`}
        style={{ backgroundColor: selectedTable === 2 && !isMyFarms ? "#2e3032" : "transparent", color: selectedTable === 2 && !isMyFarms? "white": "", border: '0.75px solid #333333'}}
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
