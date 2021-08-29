import { Card } from 'antd';
import { Children } from 'react';
import className from 'classnames';
import styles from './index.less';
const AcyCard =(props)=>{
  const {max}=props;
  return <Card 
      {...props} 
      className={!max&&styles.acycard||className(styles.acycard,styles.max)}
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
