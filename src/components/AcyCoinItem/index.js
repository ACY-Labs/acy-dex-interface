import React from 'react';
import { Rate } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './style.less';
import stakeStyles from '@/pages/Dao/components/StakeSection.less';
import placeholder from '@/pages/Dao/placeholder-round.png';

const AcyCoinItem = ({ data, children, selectToken, customIcon = true, ...rest }) => {
  console.log(data)
  return (
    <div className={styles.acycoinitem} {...rest} onClick={() => selectToken(data) || null}>
      <ul>
        <li>
          {customIcon ? (
            <AcyIcon name="eth" />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '24px' }}>
              <img src={data.logoURI || placeholder} alt={data.symbol} style={{ maxHeight: '24px', maxWidth: '24px' }} />
            </div>
          )}
        </li>
        <li className={styles.conititle}>{data.symbol}</li>
        <li>Bitcoin</li>
        <li>0.233</li>
        <li>
          <Rate className={styles.rate} count={1} />
        </li>
      </ul>
    </div>
  );
};
export default AcyCoinItem;
