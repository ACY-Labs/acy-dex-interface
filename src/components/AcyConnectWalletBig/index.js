import styles from './index.less';
import { Button } from 'antd';
const AcyConnectWallet =({children,...rest})=>{
  return <div className={styles.connect}>
     {children}

    </div>
}
export default AcyConnectWallet;