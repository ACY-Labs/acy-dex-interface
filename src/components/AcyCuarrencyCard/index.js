import { Card, Icon,Input } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './index.less';
const AcyCuarrencyCard =({title,icon,coin,yuan,dollar,onChoseToken,onChangeToken,token,...rest})=>{
  return <div {...rest} className={styles.acycuarrencycard}>
    {title&&<div className={styles.cua_title}>
     {title}
    </div>}
    <div className={styles.cua_body}>
      <div className={styles.coin} onClick={onChoseToken}>
        <AcyIcon name={icon}/>
        {coin}
        <AcyIcon name="nabla"/>
      </div>
      <div className={styles.price}>
        <ul>
          <li><Input value={token} onChange={onChangeToken}/></li>
          <li className={styles.dollar}>${dollar}</li>
        </ul>
      </div>
    </div>
  </div> 
      
}
export default AcyCuarrencyCard;
