import { useState } from "react";
import { SwapOutlined, DownOutlined } from '@ant-design/icons';
import TokenSelectorDrawer from '@/components/TokenSelectorDrawer';
import styles from './index.less';

const AcySymbol = (props: any) => {
  const {
    activeSymbol,
    selectSymbol,
    setActiveSymbol,
    showDrawer,
    latestPriceColor,
    latestPrice,
    latestPricePercentage,
    coinList,
    pageName,
    activeToken0,
    activeToken1,
    setActiveToken0,
    setActiveToken1,
    dailyLow,
    dailyHigh,
    dailyVol,
    showChart,
    setShowChart,
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          padding: '0px 26px 10px',
          borderBottom: ' 1px solid #22252e'
        }}
        >
          <div className={styles.title}>
            {activeSymbol}&nbsp;
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
            <div>24h Change %</div>
            {latestPricePercentage >= 0 ?
              <span style={{ color: '#0ecc83' }}>{pageName === "Trade"?`-`:latestPricePercentage} %</span>
              : <span style={{ color: '#fa3c58' }}>{pageName === "Trade"?`-`:latestPricePercentage} %</span>
            }
          </div>
          <div className={styles.item}>
            <div>24H High</div>
            <span>{pageName === "Trade"?`-`:dailyHigh}</span>
          </div>
          <div className={styles.item}>
            <div>24H Low</div>
            <span>{pageName === "Trade"?`-`:dailyLow}</span>
          </div>
          <div className={styles.item}>
            <div>24H Turnover(USDT)</div>
            <span>{pageName === "Trade"?`-`:dailyVol}</span>
          </div>
          <div className={styles.item}>
            <div>Funding / Countdown</div>
            <span style={{ color: '#eb5c20' }}>-0.0126% </span>
          </div>
        </div>
        {showChart == true &&
          <div style={{ marginRight: '8px', cursor: 'pointer' }} onClick={() => { setShowChart() }}>
            <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 96 960 960" fill="#b5b6b6"><path d="m343 896-43-43 180-180 180 180-43 43-137-137-137 137Zm137-417L300 299l43-43 137 137 137-137 43 43-180 180Z" /></svg>
          </div>}
        {showChart == false &&
          <div style={{ marginRight: '8px', cursor: 'pointer' }} onClick={() => { setShowChart() }}>
            <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 96 960 960" fill="#b5b6b6"><path d="M480 936 300 756l44-44 136 136 136-136 44 44-180 180ZM344 444l-44-44 180-180 180 180-44 44-136-136-136 136Z" /></svg>
          </div>}
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
        activeSymbol={activeSymbol}
        selectSymbol={selectSymbol}
        setActiveSymbol={setActiveSymbol}
        activeToken0={activeToken0}
        activeToken1={activeToken1}
        setActiveToken0={setActiveToken0}
        setActiveToken1={setActiveToken1}
      />

    </>
  );
};
export default AcySymbol;
