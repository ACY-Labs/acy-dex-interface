import React from 'react'
import { Rate } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './style.less';
import stakeStyles from '@/pages/Dao/components/StakeSection.less'
import placeholder from '@/pages/Dao/placeholder-round.png';

const AcyCoinItem = ({token, children,onClick, selectToken, customIcon = true, ...rest }) => {
  return (
    <div className={styles.acycoinitem} {...rest} onClick={() => onClick(token) || null}>
      <ul>
        <li>
          {customIcon
            ? <AcyIcon name="eth" />
            : <img src={token&&token.logoURI || placeholder}style={{ width: '32px' }} />}
        </li>
        <li className={styles.conititle}>
          {token&&token.symbol}
        </li>
        <li>
          Bitcoin
        </li>
        <li>
          0.233
        </li>
        <li>
          <Rate className={styles.rate} count={1} />
        </li>
      </ul>
    </div>

  );
}
export default AcyCoinItem;
