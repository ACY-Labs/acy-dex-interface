import { Input } from 'antd';
import styles from './style.less';

const AcyInput = ({ children, ...rest }) => {
  return (
    <Input className={styles.acyinput} {...rest}  />

  );
}
export default AcyInput;