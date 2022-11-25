import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { Gauge } from 'ant-design-pro/lib/Charts';
import { AcyCuarrencyCard } from '../Acy';
import ComponentButton from '../ComponentButton';
import Modal from '../PerpetualComponent/Modal/Modal';
import TokenSelectorModal from '../TokenSelectorModal';
import { approveTokens, addMargin, removeMargin } from '@/services/derivatives';
import { getContract, getTokens } from '@/constants/future_option_power';
import { useWeb3React } from '@web3-react/core';
import { useConnectWallet } from '@/components/ConnectWallet';
import { AddressZero } from '@ethersproject/constants';
import { PLACEHOLDER_ACCOUNT, fetcher, parseValue } from '@/acy-dex-futures/utils'
import { useChainId } from '@/utils/helpers';
import useSWR from 'swr';
import Router from '@/abis/future-option-power/Router.json';
import ERC20 from '@/abis/future-option-power/ERC20.json';

import styles from './styles.less';

const AccountInfoGauge = props => {

  const {
    chainId,
    library,
    account,
    active,
    tokens,
    token,
    setToken,
    symbol,
  } = props

  const connectWalletByLocalStorage = useConnectWallet()

  const [mode, setMode] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [tokenValue, setTokenValue] = useState('');
  const [tokenAmount, setTokenAmount] = useState(parseValue(tokenValue, token?.decimals))
  const [visible, setVisible] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)

  const routerAddress = getContract(chainId, "router")
  const poolAddress = getContract(chainId, "pool")
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")

  const tokenAllowanceAddress = token.address === AddressZero ? nativeTokenAddress : token.address;
  const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR([chainId, tokenAllowanceAddress, "allowance", account || PLACEHOLDER_ACCOUNT, routerAddress], {
    fetcher: fetcher(library, ERC20)
  });

  const needApproval =
    token.address != AddressZero &&
    tokenAllowance &&
    tokenAmount &&
    tokenAmount.gt(tokenAllowance)

  const onClickDeposit = () => {
    setMode('Deposit')
    setIsConfirming(true)
  }

  const onClickWithdraw = () => {
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
    if (!tokenValue) {
      return 'Enter an Amount'
    }
    if (needApproval && isWaitingForApproval) {
      return 'Waiting for Approval'
    }
    if (isApproving) {
      return `Approving ${token.symbol}...`;
    }
    if (needApproval) {
      return `Approve ${token.symbol}`;
    }
    return mode.toUpperCase()
  }

  const onClickPrimary = () => {
    if (!account) {
      connectWalletByLocalStorage()
      return
    }
    if (needApproval) {
      approveTokens(library, routerAddress, ERC20, token.address, tokenAmount, setIsWaitingForApproval, setIsApproving)
      return
    }
    if (mode == 'Deposit') {
      addMargin(chainId, library, routerAddress, Router, token, tokenValue, symbol)
    } else {
      removeMargin(chainId, library, routerAddress, Router, token, tokenValue, symbol)
    }
  }

  useEffect(() => {
    if (token && isWaitingForApproval && !needApproval) {
      setIsWaitingForApproval(false)
    }
  }, [token, tokenAmount, needApproval, isWaitingForApproval])

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
        <ComponentButton onClick={onClickDeposit}>
          DEPOSIT
        </ComponentButton>
        <ComponentButton onClick={onClickWithdraw}>
          WITHDRAW
        </ComponentButton>
      </div>

      {isConfirming &&
        <div className={styles.ConfirmationBox}>
          <Modal isVisible={true} setIsVisible={() => { setIsConfirming(false) }} label={'Account ' + mode}>

            <div style={{ width: '300px' }}>
              <AcyCuarrencyCard
                coin={(token && token.symbol) || 'Select'}
                logoURI={token && token.logoURI}
                token={tokenValue}
                showBalance={false}
                onChoseToken={() => {
                  setVisible(true)
                }}
                onChangeToken={e => {
                  setTokenValue(e);
                  setTokenAmount(parseValue(e, token?.decimals))
                }}
                isLocked={false}
                library={library}
              />
            </div>

            <div className={styles.ConfirmationBoxRow}>
              <button
                onClick={() => {
                  onClickPrimary()
                  setIsConfirming(false)
                }}
                disabled={!token || !tokenValue}
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
          setIsWaitingForApproval(false)
        }}
        defaultTokens={tokens}
      />
    </div>
  );
}

export default AccountInfoGauge