/* eslint-disable import/extensions */
/* eslint-disable react/button-has-type */
import React, { useState, useEffect } from 'react'
import { Select } from 'antd'
import AcyIcon from '@/components/AcyIcon';
import { useConstantLoader } from '@/constants';
import TokenSelectorModal from "@/components/TokenSelectorModal";
import TokenSelectorDrawer from '@/components/TokenSelectorDrawer';
import glp40Icon from './ic_glp_40.svg'
import styles from './BuyInputSection.less'

const { Option } = Select;

export default function BuyInputSection(props) {
  const { chainId } = useConstantLoader(props)
  const {
    topLeftLabel,
    topRightLabel,
    isLocked,
    inputValue,
    onInputValueChange,
    staticInput,
    balance,
    tokenBalance,
    onSelectToken,
    tokenlist,
    token
  } = props

  const logoURI = {
    'MATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
    'WMATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
    'BTC': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
    'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    'USDC': 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389',
    'USDT': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
    'BNB': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850',
  }
  // 选择货币的弹窗
  const [visible, setVisible] = useState(null);
  const onOpenCoin = () => {
    setVisible(true);
  };
  const onClickCoin = (token) => {
    setVisible(false);
    onSelectToken(token.symbol);
  };
  const onCancel = () => {
    setVisible(false);
  };
  return (
    <div className={styles.buyInput}>
      <div className={styles.swapSectionTop}>
        <div className={styles.muted}>
          {topLeftLabel}: {balance}
        </div>
        <div className={styles.alignRight}>
          <span className={styles.swapLabel}>{topRightLabel}</span>&nbsp;
          <span className={styles.swapBalance}>{tokenBalance}</span>
        </div>
      </div>
      <div className={styles.swapSectionBottom}>
        <div className={styles.inputContainer}>
          {!isLocked &&
            // <div className={styles.tokenSelector} onClick={onClickCoin}>
            //   <Select 
            //     value={token.symbol} 
            //     onChange={onSelectToken}
            //     dropdownClassName={styles.dropDownMenu}
            //   >
            //     {tokenlist.map(coin => (
            //       <Option className={styles.optionItem} value={coin.symbol}>
            //         <img src={logoURI[coin.symbol]} style={{ width: '20px', height:'20px', marginRight: '0.5rem' }} />
            //         {coin.symbol}
            //       </Option>
            //     ))}
            //   </Select>
            // </div>
            <div className={styles.tokenSelector} onClick={onOpenCoin}>
              <img src={logoURI[token.symbol]} style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
              {token.symbol}
              <AcyIcon.MyIcon type="triangleGray" width={10} />
            </div>
          }
          {isLocked &&
            <button className={styles.switchcoin} disabled={isLocked}>
              <span className={styles.wrap}>
                <div className={styles.coin}>
                  <img src={glp40Icon} alt="glp" style={{ width: '24px', marginRight: '0.5rem' }} />
                  <span style={{ margin: '0px 0.25rem' }}>ALP</span>
                </div>
              </span>
            </button>
          }
          {!staticInput && <input type="number" min="0" placeholder="0.0" className={styles.swapInput} value={inputValue} onChange={onInputValueChange} />}
          {staticInput && <div className={styles.staticInput}>{inputValue}</div>}
        </div>
      </div>
      <TokenSelectorDrawer onCancel={onCancel} simple width={400} visible={visible} onCoinClick={onClickCoin} coinList={tokenlist.map(item => { item.logoURI = logoURI[item.symbol]; return item; })} />
    </div>
  )
}
