import styles from './index.less';
import { sortAddress } from '@/utils/utils';

import { Button } from 'antd';
const AcyConnectWallet = props => {
  const {value,onClick,...rest}=props;
  return (
    <div {...rest} className={styles.connect}>
      <div className={styles.wrap}>
        Ethereum
        <div className={styles.address} onClick={onClick}>
          {
            value&&sortAddress(value)||'Connect'
          }</div>
      </div>
    </div>
  );
};
export default AcyConnectWallet;
