import { SwapOutlined } from '@ant-design/icons';
import styles from './index.less';

const KpSymbol = (props: any) => {
  const {
    pairName,
    showDrawer,
    latestPriceColor,
    latestPrice,
    latestPricePercentage,
  } = props;
  return (
    <div
      style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        padding: '0px 26px 10px',
      }}
    >
      <div className={styles.title}>
        {pairName}&nbsp;
        <SwapOutlined
          onClick={showDrawer}
          style={{ fontSize: '20px', color: '#ffffff', cursor: 'pointer' }}
        />
      </div>
      {/* </Dropdown> */}
      <div style={{ color: latestPriceColor, fontSize: '20px' }}>
        {Number.parseFloat(latestPrice).toFixed(3)}
      </div>
      <div style={{ marginLeft: '20px' }} className={styles.item}>
        <div>24h Change%</div>
        <span style={{ color: latestPriceColor }}>{latestPricePercentage}</span>
      </div>
      <div className={styles.item}>
        <div>24H High</div>
        <span>23212.90</span>
      </div>
      <div className={styles.item}>
        <div>24H Low</div>
        <span>20123.15</span>
      </div>
      <div className={styles.item}>
        <div>24H Turnover(USDT)</div>
        <span>4,598,774,444.16</span>
      </div>
      <div className={styles.item}>
        <div>Funding Rate/ Countdown</div>
        <span>-0.0126%/ 07:35:28</span>
      </div>
    </div>
  );
};
export default KpSymbol;
