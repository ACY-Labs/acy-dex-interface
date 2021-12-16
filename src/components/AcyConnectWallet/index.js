import styles from './index.less';
import { sortAddress } from '@/utils/utils';

import { Button,Icon } from 'antd';
const AcyConnectWallet = props => {
  const { value, onClick, isMobile, chainId,pendingLength, ...rest } = props;
  let chainName = 'BNB'
  switch (chainId) {
    case 97:
      chainName = 'BNB'
      break;
    case 4:
      chainName = 'Ethereum'
      break;
    default:
      chainName = 'other'
      break;
  }
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
          {chainName} ( {chainId || 'disconnected'} )
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
