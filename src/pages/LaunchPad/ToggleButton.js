import React from 'react';
import styles from './styles.less';

const ToggleButton = (
  { selectedTab,
    onWhitelistToggleButtonClick,
    onParticipateToggleButtonClick,
  }
) => {
  return (
    <div className={styles.tableToggleButtonContainer}>
      <button
        type="button"
        className={styles.leftToggleButton}
        style={{ backgroundColor: selectedTab === 1 ? "#c6224e" : "#2e3032", color: "white"}}
        onClick={onWhitelistToggleButtonClick}
      >
        Whitelist
      </button>
      <button
        type="button"
        className={styles.rightToggleButton}
        style={{ backgroundColor: selectedTab === 2 ? "#c6224e" : "#2e3032", color: "white"}}
        onClick={onParticipateToggleButtonClick}
      >
        Participate
      </button>
    </div>
  )
}

export default ToggleButton
