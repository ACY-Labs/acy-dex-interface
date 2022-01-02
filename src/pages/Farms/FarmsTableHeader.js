import React from 'react';
import { Checkbox } from 'antd';
import styles from '@/pages/Farms/Farms.less';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from "@material-ui/styles";

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

const FarmsTableHeader = ({ tableTitle, tableSubtitle, selectedTable, tokenFilter, setTokenFilter }) => {
  const classes = useStyles();
  return (
    <div className={styles.tableHeaderContainer}>
      <div className={styles.tableHeaderTitleContainer}>
        <div className={styles.tableHeaderTitle}>{tableTitle}</div>
        <div className={styles.tableHeaderSubtitle}>{tableSubtitle}</div>
        {selectedTable === 2 && (
          <div className={styles.premierCheckboxContainer}>
            <span className={styles.premierCheckboxText}>Stake your LP tokens and earn:</span>
            {/* <Checkbox
              checked={tokenFilter.liquidityToken}
              onChange={(e) => setTokenFilter({...tokenFilter, liquidityToken: e.target.checked})}
              className={styles.premierCheckbox}
            >
              Liquidity Tokens
            </Checkbox>
            <Checkbox
              checked={tokenFilter.btcEthToken}
              onChange={(e) => setTokenFilter({...tokenFilter, btcEthToken: e.target.checked})}
              className={styles.premierCheckbox}
            >
              BTC, ETH, USDC, USDT...
            </Checkbox> */}
            <Switch name="checkedA"  size="small"  id="stake-switch" 
              onChange={(e) => {
                setTokenFilter(e.target.checked);
                // setIsMyFarms(e.target.checked)
              }}
              checked={tokenFilter} 
              classes={{
                root: classes.root,
                switchBase: classes.switchBase,
                checked: classes.checked,
                track: classes.track,
                thumb: classes.thumb,
              }}/>
              <div className={styles.premierCheckbox}>
                BTC, ETH, USDC, USDT...
              </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmsTableHeader
