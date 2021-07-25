import { Card, Icon } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './index.less';
const AcyCuarrencyCard =({title,icon,coin,yuan,dollar,...rest})=>{
  return <div {...rest} className={styles.acycuarrencycard}>
    {title&&<div className={styles.cua_title}>
      <div>Receive</div>
      <div>Available: <span>{title}</span></div>
    </div>}
    <div className={styles.cua_body}>
      <div className={styles.coin}>
        <AcyIcon name={icon}/>
        {coin}
        <AcyIcon name="nabla"/>
      </div>
      <div className={styles.price}>
        <ul>
          <li>{yuan}</li>
          <li className={styles.dollar}>${dollar}</li>
        </ul>
      </div>
    </div>
  </div> 
      
}
export default AcyCuarrencyCard;
