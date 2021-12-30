import React, { useState } from 'react';
import { Icon, Input } from 'antd';
import styles from '@/pages/Dao/components/StakeSection.less';
import { AcyCoinItem, AcyIcon, AcyModal, AcyTabs } from '@/components/Acy';
import placeholder from '../placeholder-round.png';
import {useConstantLoader} from '@/constants';

const { AcyTabPane } = AcyTabs

const TokenSelection = (
  {
    showModal,
    handleCancel,
    isModalVisible,
    token,
    tokenPercentage,
    updateTokenPercentage,
    selectToken,
    favTokenList,
    setTokenAsFav
  }
) => {
  const {tokenList} = useConstantLoader();
  return (
    <div className={styles.tokenSelection}>
      <div className={styles.tokenDropdown} onClick={showModal}>
        <div className={styles.tokenImgContainer}>
          <img src={token.logoURI || placeholder} alt={token.symbol} className={styles.tokenImg} />
        </div>
        <p className={styles.tokenSymbol}>{token.symbol}</p>
        <Icon type="down" style={{ fontSize:'12px', margin:'0px 0.25rem 0px 0.35rem' }} />
      </div>

      {/* POP UP MODAL */}

      <AcyModal onCancel={handleCancel} width={400} visible={isModalVisible}>
        <div className={styles.title}>Select a token</div>
        <div className={styles.search}>
          <Input
            size="large"
            style={{
              backgroundColor: '#373739',
              borderRadius: '40px',
            }}
            placeholder="Enter the token symbol or address"
          />
        </div>

        <div className={styles.coinList}>
          <AcyTabs>
            <AcyTabPane tab="All" key="1">
              {tokenList.map((supToken, index) => (
                <AcyCoinItem data={supToken} key={index} selectToken={selectToken} customIcon={false} index={index} clickCallback={() => setTokenAsFav(index)} />
              ))}
            </AcyTabPane>
            <AcyTabPane tab="Favorite" key="2">
              {favTokenList.map((supToken, index) => (
                <AcyCoinItem data={supToken} key={index} selectToken={selectToken} customIcon={false} index={index} clickCallback={() => setTokenAsFav(index)} />
              ))}
            </AcyTabPane>
          </AcyTabs>
        </div>
      </AcyModal>

      {/* Percentage Input */}

      <div className={styles.tokenPercentage}>
        <span className={styles.suffix}>%</span>
        <input
          type="text"
          className={styles.tokenPercentageInput}
          value={tokenPercentage}
          onChange={(e) => updateTokenPercentage(e.target.value)}
        />
      </div>
    </div>
  )
}

export default TokenSelection
