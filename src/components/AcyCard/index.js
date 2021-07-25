import { Card } from 'antd';
import { Children } from 'react';
import styles from './index.less';
const AcyCard =(props)=>{
  return <Card 
      {...props} 
      className={styles.acycard}
      headStyle={{
        borderBottom:0
      }} 
      bodyStyle={{
        padding:'0 24px 24px'
      }}
      title={
        <div className={styles.card_header}>
            {
              props.title
            }
        </div>
      }
    >
    {props.children}
  </Card>
}
export default AcyCard;
