/* eslint-disable import/extensions */
/* eslint-disable react/button-has-type */
import React, { useState, useEffect } from 'react'
import AcyIcon from '@/components/AcyIcon';
import {useConstantLoader} from '@/constants';
import TokenSelectorModal from "@/components/TokenSelectorModal";

import glp40Icon from './ic_glp_40.svg'

import "./BuyInputSection.css"

export default function BuyInputSection(props) {
  const { chainId } = useConstantLoader(props)
  const { topLeftLabel, topRightLabel, isLocked, inputValue, onInputValueChange, staticInput, balance, tokenBalance, onSelectToken, tokenlist } = props

  const [visible, setVisible] = useState(null)

  useEffect(() => {
    if (!tokenlist) return
    setVisible(null);
  }, [chainId])
  
  // TokenSelectModal
  const onClickCoin = () => {
    setVisible(true)
  };
  const onCancel = () => {
    setVisible(false)
  };
  const onCoinClick = t => {
    onCancel();
    onSelectToken(t)
  };

  return (
    <div className="Exchange-swap-section buy-input">
      <div className="Exchange-swap-section-top">
        <div className="muted">
          {topLeftLabel}: {balance}
        </div>
        <div className="align-right">
          <span className="Exchange-swap-label muted">{topRightLabel}</span>&nbsp;
          {isLocked &&  <span className="Exchange-swap-balance">{tokenBalance}</span>}
          {!isLocked && <span className="Exchange-swap-balance">{tokenBalance}</span>}
        </div>
      </div>
      <div className="Exchange-swap-section-bottom">
        <div className="Exchange-swap-input-container">
          {!isLocked &&
            <button className="switchcoin" onClick={onClickCoin}>
              <span className="wrap">
                <div className="coin">
                  <img src={props.token.logoURI} alt="glp" style={{ width: '24px', marginRight: '0.5rem' }} />
                  <span style={{ margin: '0px 0.25rem' }}>{props.token.symbol}</span>
                </div>
                <AcyIcon.MyIcon type="triangleGray" width={10} />
              </span>
            </button>
          }
          {isLocked &&
            <button className="switchcoin" disabled={isLocked}>
              <span className="wrap">
                <div className="coin">
                  <img src={glp40Icon} alt="glp" style={{ width: '24px', marginRight: '0.5rem' }} />
                  <span style={{ margin: '0px 0.25rem' }}>GLP</span>
                </div>
              </span>
            </button>
          }
          {!staticInput && <input type="number" min="0" placeholder="0.0" className="Exchange-swap-input" value={inputValue} onChange={onInputValueChange} />}
          {staticInput && <div className="InputSection-static-input">{inputValue}</div>}
        </div>
      </div>
      <TokenSelectorModal
        onCancel={onCancel} 
        width={400} 
        visible={visible} 
        onCoinClick={onCoinClick}
        tokenlist={tokenlist}
      />
    </div>
  )
}
