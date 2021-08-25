import styles from './index.less';
import { Button } from 'antd';
const AcyConnectWallet =({children,...rest})=>{
  return <div className={styles.connect} {...rest}>
     {children}

    </div>
}
export default AcyConnectWallet;