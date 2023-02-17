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
    coinList,
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
        }}>
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
            <div>24h Change</div>
            {latestPricePercentage > 0 ?
              <span style={{ color: 'green' }}>{latestPricePercentage}% / $213.15</span>
              : <span style={{ color: 'red' }}>{latestPricePercentage}% / $213.15</span>
            }
          </div>
          <div className={styles.item}>
            <div>24h High</div>
            <span>$ 23212.90</span>
          </div>
          <div className={styles.item}>
            <div>24h Low</div>
            <span>$ 20123.15</span>
          </div>
          <div className={styles.item}>
            <div>24h Volume(USDT)</div>
            <span>$ 4,598,774,444.16</span>
          </div>
          <div className={styles.item}>
            <div>Funding / Countdown</div>
            <span style={{ color: '#eb5c20' }}>-0.0126% </span>
            <span>/ 07:35:28</span>
          </div>
        </div>
        {showChart == true &&
          <div style={{ marginRight: '8px', cursor: 'pointer' }} onClick={() => { setShowChart() }}>
            <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 96 960 960" fill="#b5b6b6"><path d="m343 896-43-43 180-180 180 180-43 43-137-137-137 137Zm137-417L300 299l43-43 137 137 137-137 43 43-180 180Z" /></svg>
          </div>}
        {showChart == false &&
          <div style={{ marginRight: '8px', cursor: 'pointer' }} onClick={() => { setShowChart() }}>
            <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 96 960 960" fill="#b5b6b6"><path d="M480 936 300 756l44-44 136 136 136-136 44 44-180 180ZM344 444l-44-44 180-180 180 180-44 44-136-136-136 136Z" /></svg>          </div>}
      </div>
      <TokenSelectorDrawer placement="left" onCancel={onCancel} width={400} visible={visible} onCoinClick={onClickCoin} coinList={coinList} />

    </>
  );
};
export default AcySymbol;
