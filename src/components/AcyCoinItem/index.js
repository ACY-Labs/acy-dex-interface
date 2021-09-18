import React from 'react';
import { Rate } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './style.less';
import stakeStyles from '@/pages/Dao/components/StakeSection.less';
import placeholder from '@/pages/Dao/placeholder-round.png';

const AcyCoinItem = ({ data, children, selectToken, setAsFav, hideFavButton = false, customIcon = true, ...rest }) => {
  return (
    <div className={styles.tokenRowContainer} {...rest}>
      <div className={styles.tokenRowContent} onClick={() => selectToken(data) || null}>
        <div style={{ flex: '2' }}>
          {customIcon ? (
            <AcyIcon name="eth" />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '24px' }}>
            <img src={data.logoURI || placeholder} alt={data.symbol} style={{ maxHeight: '24px', maxWidth: '24px' }} />
          </div>
        )}
        </div>
        <div style={{ flex: '2', color: 'white', fontWeight: '500' }}>{data.symbol}</div>
        <div style={{ flex: '7' }}>{data.name}</div>
        <div style={{ flex: '1' }}>0.233</div>
      </div>
      <div hidden={hideFavButton} className={styles.favButtonContainer} onClick={setAsFav}>
        <Rate className={styles.rate} count={1} />
      </div>
    </div>
  );
};
export default AcyCoinItem;
