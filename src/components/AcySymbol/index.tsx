import { useState } from "react";
import { SwapOutlined } from '@ant-design/icons';
import TokenSelectorDrawer from '@/components/TokenSelectorDrawer';
import styles from './index.less';

const AcySymbol = (props: any) => {
  const {
    pairName,
    showDrawer,
    latestPriceColor,
    latestPrice,
    latestPricePercentage,
    coinList
  } = props;
  // 选择货币的弹窗
  const [visible, setVisible] = useState(null);
  const onClickCoin = () => {
    setVisible(true);
  };
  const onCancel = () => {
    setVisible(false);
  };
  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          padding: '0px 26px 10px',
          borderBottom: ' 1px solid #22252e'
        }}
      >
        <div className={styles.title}>
          {pairName}&nbsp;
          <SwapOutlined
            onClick={onClickCoin}
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
      <TokenSelectorDrawer placement="left" onCancel={onCancel} width={400} visible={visible} onCoinClick={onClickCoin} coinList={coinList} />

    </>
  );
};
export default AcySymbol;
