import { Checkbox } from 'antd';
import styles from './index.less';
const AcyCheckBox =(props)=>{
  return <Checkbox 
      {...props} 
      className={styles.acycheckbox}
    >
    {props.children}
  </Checkbox>
}
export default AcyCheckBox;
