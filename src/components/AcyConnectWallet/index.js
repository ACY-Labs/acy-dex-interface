import styles from './index.less';
import { sortAddress } from '@/utils/utils';

import { Button,Icon } from 'antd';
const AcyConnectWallet = props => {
  const { value, onClick, isMobile, chainId,pendingLength, ...rest } = props;
  return (
    (isMobile && (
      <div {...rest} className={styles.connect}>
       {/* pending */}
       {pendingLength
            &&
              <div className={styles.pending}>
                {pendingLength} Pending <Icon type="redo" spin/>
              </div>
            || 
              <div className={styles.address} onClick={onClick}>
                {value && sortAddress(value) || 'Connect'}
              </div>
            }
      </div>
    )) || (
      <div {...rest} className={styles.connect}>
        <div className={styles.wrap}>
          Ethereum ( {chainId || 'disconnected'} )
          {/* pending */}
          {pendingLength
            &&
              <div className={styles.pending}>
                {pendingLength} Pending <Icon type="redo" spin/>
              </div>
            || 
              <div className={styles.address} onClick={onClick}>
                {value && sortAddress(value) || 'Connect'}
              </div>
            }
        </div>
      </div>
    )
  );
};
export default AcyConnectWallet;
