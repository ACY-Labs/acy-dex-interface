import { Card, Icon, Input, Row, Col} from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './index.less';
import Pattern from '@/utils/pattern';
const AcyCuarrencyCard = ({
  title,
  icon,
  coin,
  yuan,
  dollar,
  onChoseToken,
  onChangeToken,
  token,
  ...rest
}) => {
const onChange=e=>{
  // const check=Pattern.coinNum.test(e.target.value);
  // if(!check){
    onChangeToken&&onChangeToken(e.target.value)
  // }
}
  return (
    <div {...rest} className={styles.acycuarrencycard}>
      
      <div className={styles.cua_body}>
        <Row>
          <Col span={24}>
          {title && <div className={styles.cua_title}>{title}</div>}
          </Col>
        </Row>
        <Row className={styles.bottomRow}>
          <Col span={6}>
            <div className={styles.coin} onClick={onChoseToken}>
              <AcyIcon width={14} name={icon} />
                {coin}
                <Icon type="down" />
            </div>
          </Col>
          <Col span={18}>
            <div className={styles.price}>
            <ul>
              <li>
                <Input className={styles.inputBar} placeholder="0.0" bordered={false} value={token} onChange={onChange} />
              </li>
              {/* <li className={styles.dollar}> ${dollar}</li> */}
            </ul>
            </div>
          </Col>
        </Row>
        <div>
          
        </div>
        
        
      </div>
    </div>
  );
};
export default AcyCuarrencyCard;
