import Switch from '@material-ui/core/Switch';
import { makeStyles } from "@material-ui/styles";
import React from 'react';
import styles from './Farms.less';

const useStyles = makeStyles({
  root: {},
  track: {},
  switchBase: {
    color: '#FFF',
    '&$checked': {
      color: '#eb5c20',
    },
    '&$checked + $track': {
      backgroundColor: '#a34520',
    },
  },
  checked: {},
  thumb: {},
});




const TableControl = ({ searchInput, setSearchInput, isMyFarms, setIsMyFarms, walletConnected, activeEnded, setActiveEnded }) => {
  const isMobile = window.innerWidth <= 768
  const classes = useStyles();
  return (
    <div className={styles.tableHeaderButtonContainer}>
      { walletConnected && (
        <div className={styles.tableHeaderRadioButtonContainer}>
        <Switch name="checkedA"  size="small"  id="stake-switch" onChange={(e) => setIsMyFarms(e.target.checked)} checked={isMyFarms} 
         classes={{
          root: classes.root,
          switchBase: classes.switchBase,
          checked: classes.checked,
          track: classes.track,
          thumb: classes.thumb,
        }}/>
        <label style={{ color: isMyFarms?"#eb5c20":""}} htmlFor="stake-switch" >My Farms</label>
      </div>
      )}
      
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
        <button 
          type="button" 
          style={{ backgroundColor: activeEnded ? "#2e3032" : "transparent", color: activeEnded? "white": "", border: '0.75px solid #333333'}}
          onClick={()=>{
            setActiveEnded(true);
          }}
          className={styles.activeToggleButton}>
            Active
        </button>
        <button 
          type="button" 
          style={{ backgroundColor: !activeEnded ? "#2e3032" : "transparent", color: !activeEnded? "white": "", border: '0.75px solid #333333'}}
          onClick={()=>{
            setActiveEnded(false);
          }}
          className={styles.endedToggleButton}>
            Ended
        </button>
      </div>
    </div>
  )
}

export default TableControl
