/* eslint-disable import/extensions */
/* eslint-disable react/button-has-type */
import React, { useState, useEffect } from 'react'
import { Select } from 'antd'
import AcyIcon from '@/components/AcyIcon';
import {useConstantLoader} from '@/constants';
import TokenSelectorModal from "@/components/TokenSelectorModal";
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
            <div className={styles.tokenSelector}>
              <Select 
                value={token.symbol} 
                onChange={onSelectToken}
                dropdownClassName={styles.dropDownMenu}
              >
                {tokenlist.map(coin => (
                  <Option className={styles.optionItem} value={coin.symbol}>{coin.symbol}</Option>
                ))}
              </Select>
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
    </div>
  )
}
