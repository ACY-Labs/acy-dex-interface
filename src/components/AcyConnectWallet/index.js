import styles from './index.less';
import { sortAddress } from '@/utils/utils';

import { Button } from 'antd';
const AcyConnectWallet = props => {
  const {value}=props;
  return (
    <div {...props} className={styles.connect}>
      <div className={styles.wrap}>
        Ethereum
        <div className={styles.address}>
          {
            value&&sortAddress(value)||'Connect'
          }</div>
      </div>
    </div>
  );
};
export default AcyConnectWallet;
