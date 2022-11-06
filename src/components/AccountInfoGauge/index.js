import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { Gauge } from 'ant-design-pro/lib/Charts';
import { AcyPerpetualButton, AcyCuarrencyCard } from '../Acy';
import Modal from '../PerpetualComponent/Modal/Modal';
import TokenSelectorModal from '../TokenSelectorModal';
import { addMargin, removeMargin } from '@/services/derivatives';
import { getContract } from '@/constants/future_option_power';
import { useWeb3React } from '@web3-react/core';
import { useConnectWallet } from '@/components/ConnectWallet';
import Router from '@/abis/future-option-power/Router.json'

import styles from './styles.less';

const AccountInfoGauge = props => {

  const {
    account,
    library,
    chainId,
    tokens,
  } = props

  const [token, setToken] = useState()
  const [mode, setMode] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [tokenAmount, setTokenAmount] = useState('');
  const [visible, setVisible] = useState(false)

  const routerAddress = getContract(chainId, "router")

  const { active } = useWeb3React();
  const connectWalletByLocalStorage = useConnectWallet();

  const onClickDeposit = () => {
    if (!account) {
      connectWalletByLocalStorage()
      return
    }
    setMode('Deposit')
    setIsConfirming(true)
  }

  const onClickWithdraw = () => {
    if (!account) {
      connectWalletByLocalStorage()
      return
    }
    setMode('Withdraw')
    setIsConfirming(true)
  }

  const getPrimaryText = () => {
    if (!active) {
      return 'Connect Wallet'
    }
    if (!token) {
      return 'Select a Token'
    }
    if (!tokenAmount) {
      return 'Enter an Amount'
    }
    return mode.toUpperCase()
  }

  const setMargin = () => {
    if (mode == 'Deposit') {
      addMargin(chainId, library, routerAddress, Router, token, tokenAmount)
    } else {
      removeMargin(chainId, library, routerAddress, Router, token, tokenAmount)
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.accountInfo}>
        <div className={styles.details}>
          <div className={styles.statstitle}>Account Info</div>
          <div className={styles.statscontent}>
            <div className={styles.statsRow}>
              Dynamic Effective Balance
            </div>
            <div className={styles.statsRow}>
              ——
            </div>
            <div className={styles.statsRow}>
              Margin Usage
            </div>
            <div className={styles.statsRow}>
              ——
            </div>
            <div className={styles.statsRow}>
              Available Margin
            </div>
            <div className={styles.statsRow}>
              ——
            </div>
          </div>
        </div>
        <div className={styles.gauge}>
          <Gauge
            title=''
            autoFit={true}
            percent={70}
            color='l(0) 0:#00ff00 1:#ff0000'
          />
        </div>
      </div>

      <div className={styles.buttonContainer} style={{ marginTop: '20px' }}>
        <AcyPerpetualButton onClick={onClickDeposit}>
          DEPOSIT
        </AcyPerpetualButton>
        <AcyPerpetualButton onClick={onClickWithdraw}>
          WITHDRAW
        </AcyPerpetualButton>
      </div>

      {isConfirming &&
        <div className={styles.ConfirmationBox}>
          <Modal isVisible={true} setIsVisible={() => { setIsConfirming(false) }} label={'Account '+mode}>

            <div style={{ width: '300px' }}>
              <AcyCuarrencyCard
                coin={(token && token.symbol) || 'Select'}
                logoURI={token && token.logoURI}
                token={tokenAmount}
                showBalance={false}
                onChoseToken={() => {
                  setVisible(true)
                }}
                onChangeToken={e => {
                  setTokenAmount(e);
                }}
                isLocked={false}
                library={library}
              />
            </div>

            <div className={styles.ConfirmationBoxRow}>
              <button
                onClick={() => {
                  setMargin()
                  setIsConfirming(false)
                }}
                disabled={!token || !tokenAmount}
                className={styles.ConfirmationBoxButton}
              >
                {getPrimaryText()}
              </button>
            </div>
          </Modal>
        </div>
      }

      <TokenSelectorModal
        onCancel={() => setVisible(false)}
        width={400}
        visible={visible}
        onCoinClick={token => {
          setToken(token)
          setVisible(false)
        }}
        defaultTokens={tokens}
      />
    </div>
  );
}

export default AccountInfoGauge