import React, { useState, useEffect, useMemo } from 'react';
import { AcyCuarrencyCard } from '../../Acy';
import Modal from '../../PerpetualComponent/Modal/Modal';
import TokenSelectorModal from '../../TokenSelectorModal';
import { approveTokens, addMargin, removeMargin } from '@/services/derivatives';
import { getContract } from '@/constants/future_option_power';
import { useConnectWallet } from '@/components/ConnectWallet';
import { AddressZero } from '@ethersproject/constants';
import { PLACEHOLDER_ACCOUNT, fetcher, parseValue } from '@/acy-dex-futures/utils'
import useSWR from 'swr';
import Router from '@/abis/future-option-power/Router.json';
import ERC20 from '@/abis/future-option-power/ERC20.json';
import Reader from '@/abis/future-option-power/Reader.json'

import styles from './styles.less';

const DepositWithdrawModal = props => {

  const {
    chainId,
    library,
    account,
    active,
    symbol,
    setIsConfirming,
    mode,
  } = props

  const connectWalletByLocalStorage = useConnectWallet()

  const [token, setToken] = useState()
  const [tokenValue, setTokenValue] = useState('');
  const [tokenAmount, setTokenAmount] = useState(parseValue(tokenValue, token?.decimals))
  const [visible, setVisible] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)

  const routerAddress = getContract(chainId, "router")
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")
  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")

  const tokenAllowanceAddress = token?.address === AddressZero ? nativeTokenAddress : token?.address;
  const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR([chainId, tokenAllowanceAddress, "allowance", account || PLACEHOLDER_ACCOUNT, routerAddress], {
    fetcher: fetcher(library, ERC20)
  });

  const { data: tokenInfo, mutate: updateTokenInfo } = useSWR([chainId, readerAddress, "getTokenInfo", poolAddress, account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader)
  });

  useEffect(() => {
    if (!tokenInfo) return;
    const firstTokenInList = {
      ...tokenInfo[0],
      address: tokenInfo[0].token
    }
    setToken(firstTokenInList)
  }, [setToken, tokenInfo])

  const needApproval =
    token?.address != AddressZero &&
    tokenAllowance &&
    tokenAmount &&
    tokenAmount.gt(tokenAllowance)

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
      approveTokens(chainId, library, routerAddress, ERC20, token.address, tokenAmount, setIsWaitingForApproval, setIsApproving)
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

  useEffect(()=>{
    if(whitelistedTokens.length > 0) {
      setToken(whitelistedTokens[0])
    }
  }, [whitelistedTokens])

  return (
    <>
      <div className={styles.ConfirmationBox}>
        <Modal isVisible={true} setIsVisible={() => { setIsConfirming(false) }} label={'Account ' + mode}>

          <div style={{ width: '300px' }}>
            <AcyCuarrencyCard
              coin={token || 'Select'}
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
              }}
              disabled={!token || !tokenValue}
              className={styles.ConfirmationBoxButton}
            >
              {getPrimaryText()}
            </button>
          </div>
        </Modal>
      </div>

      <TokenSelectorModal
        onCancel={() => setVisible(false)}
        width={400}
        visible={visible}
        onCoinClick={token => {
          setToken(token)
          setVisible(false)
          setIsWaitingForApproval(false)
        }}
      />
    </>
  );
}

export default DepositWithdrawModal