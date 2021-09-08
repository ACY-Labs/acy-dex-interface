import styles from './index.less';
import { sortAddress } from '@/utils/utils';

import { Button } from 'antd';
const AcyConnectWallet = props => {
  const { value, onClick, isMobile, chainId, ...rest } = props;
  return (
    (isMobile && (
      <div {...rest} className={styles.connect}>
        <div className={styles.address} onClick={onClick}>
          {(value && sortAddress(value)) || 'Connect'}
        </div>
      </div>
    )) || (
      <div {...rest} className={styles.connect}>
        <div className={styles.wrap}>
          Ethereum ( {chainId || 'disconnected'} )
          <div className={styles.address} onClick={onClick}>
            {(value && sortAddress(value)) || 'Connect'}
          </div>
        </div>
      </div>
    )
  );
};
export default AcyConnectWallet;
