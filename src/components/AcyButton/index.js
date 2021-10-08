import { Card } from 'antd';
import { Children } from 'react';
import classNames from 'classnames';
import styles from './index.less';
const AcyButton =(props)=>{
  const {children,type,onClick,disabled,...rest}=props;
  return <div className={(disabled && classNames(styles.acybutton,styles.disabled)) || styles.acybutton} onClick={()=>!disabled&&onClick()} {...rest}> 
      {children}
  </div>
}
export default AcyButton;
