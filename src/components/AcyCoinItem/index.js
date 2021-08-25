import AcyIcon from '@/components/AcyIcon';
import { Rate } from 'antd';
import styles from './style.less';

const AcyCoinItem = ({data,children, ...rest }) => {
  return (
    <div className={styles.acycoinitem} {...rest}>
      <ul>
        <li>
          <AcyIcon name="eth"/>
        </li>
        <li className={styles.conititle}>
          {data.symbol}
        </li>
        <li>
        Bitcoin
        </li>
        <li>
        0.233
        </li>
        <li >
        <Rate className={styles.rate} count={1} />
        </li>
      </ul>
    </div>

  );
}
export default AcyCoinItem;