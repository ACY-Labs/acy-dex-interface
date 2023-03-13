import { useState } from "react";
import { SwapOutlined, DownOutlined } from '@ant-design/icons';
import TokenSelectorDrawer from '@/components/TokenSelectorDrawer';
import styles from './index.less';

const AcySymbol = (props: any) => {
  const {
    activeSymbol,
    setActiveSymbol,
    showDrawer,
    latestPriceColor,
    latestPrice,
    latestPricePercentage,
    coinList,
    pageName,
    setActiveToken0,
    setActiveToken1,
    dailyLow,
    dailyHigh,
    dailyVol
  } = props;
  // 选择货币的弹窗
  const [visible, setVisible] = useState(null);
  const onClickCoin = () => {
    setVisible(true);
  };
  const onCancel = () => {
    setVisible(false);
  };
  console.log("ACY symbol activeSymbol", activeSymbol)
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
        <div className={styles.title} onClick={onClickCoin}>
          {activeSymbol}<DownOutlined style={{ fontSize: "18px" }} />&nbsp;
          <SwapOutlined
            // onClick={onClickCoin}
            style={{ fontSize: '20px', color: '#ffffff', cursor: 'pointer' }}
          />
        </div>
        {/* </Dropdown> */}
        <div style={{ color: latestPriceColor, fontSize: '20px' }}>
          {Number.parseFloat(latestPrice).toFixed(2)}
        </div>
        <div style={{ marginLeft: '20px' }} className={styles.item}>
          <div>24h Change %</div>
          <span style={{ color: latestPriceColor }}>{latestPricePercentage} %</span>
        </div>
        <div className={styles.item}>
          <div>24H High</div>
          <span>{dailyHigh}</span>
        </div>
        <div className={styles.item}>
          <div>24H Low</div>
          <span>{dailyLow}</span>
        </div>
        <div className={styles.item}>
          <div>24H Turnover(USDT)</div>
          <span>{dailyVol}</span>
        </div>
        <div className={styles.item}>
          <div>Funding Rate/ Countdown</div>
          <span>-0.0126%/ 07:35:28</span>
        </div>

      </div>
      <TokenSelectorDrawer
        placement="left"
        onCancel={onCancel}
        width={400}
        visible={visible}
        setVisible={setVisible}
        pageName={pageName}
        onCoinClick={onClickCoin}
        coinList={coinList}
        setActiveSymbol={setActiveSymbol}
        setActiveToken0={setActiveToken0}
        setActiveToken1={setActiveToken1}
      />

    </>
  );
};
export default AcySymbol;
