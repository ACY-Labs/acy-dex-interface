import React from 'react';
import { Checkbox } from 'antd';
import styles from '@/pages/Farms/Farms.less';

const FarmsTableHeader = ({ tableTitle, tableSubtitle, selectedTable, tokenFilter, setTokenFilter }) => {
  return (
    <div className={styles.tableHeaderContainer}>
      <div className={styles.tableHeaderTitleContainer}>
        <div className={styles.tableHeaderTitle}>{tableTitle}</div>
        <div className={styles.tableHeaderSubtitle}>{tableSubtitle}</div>
        {selectedTable === 2 && (
          <div className={styles.premierCheckboxContainer}>
            <span className={styles.premierCheckboxText}>Stake your LP tokens and earn:</span>
            <Checkbox
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
              BTC, ETH
            </Checkbox>
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmsTableHeader
