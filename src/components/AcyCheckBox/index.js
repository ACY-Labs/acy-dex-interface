import { Checkbox } from 'antd';
import styles from './index.less';
const AcyCheckBox =(props)=>{
  return <Checkbox 
      {...props} 
    >
    {props.children}
  </Checkbox>
}
export default AcyCheckBox;
