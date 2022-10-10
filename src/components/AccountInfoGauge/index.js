import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { Gauge } from 'ant-design-pro/lib/Charts';
import { AcyPerpetualButton, AcyCuarrencyCard } from '../Acy';
import Modal from '../PerpetualComponent/Modal/Modal';
import { useChainId } from '@/utils/helpers';
import styles from './styles.less';
import TokenSelectorModal from '../TokenSelectorModal';
import { getTokens, getContract } from '@/constants/powers.js';
import IPool from '@/abis/future-option-power/IPool.json'
import { ethers } from 'ethers'
import { bigNumberify,getGasLimit,getGasPrice } from '@/acy-dex-futures/utils';
import * as Api from '@/acy-dex-futures/Api';
import Web3 from 'web3'

const AccountInfoGauge = props => {

  const {
    account,
    library,
    tokens,
  } = props

  const [token, setToken] = useState()
  const [mode, setMode] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [tokenAmount, setTokenAmount] = useState('');
  const [visible, setVisible] = useState(false)
  const { chainId } = useChainId();
  

  const poolAddress = getContract(chainId, "pool")

  const onClickDeposit = () => {
    setMode('Deposit')
    setIsConfirming(true)
  }

  const onClickWithdraw = () => {
    setMode('Withdraw')
    setIsConfirming(true)
  }

  const getPrimaryText = () => {
    if(!token) {
      return 'Select a Token'
    }
    if(!tokenAmount) {
      return 'Enter an Amount'
    }
    return mode.toUpperCase()
  }

  const addMargin = async () => {
    const contract = new ethers.Contract(poolAddress, IPool.abi, library.getSigner())

    let method = "addMargin"
    let params = [
      token.address,  //token address
      token.symbol,  //token symbol
      ethers.utils.parseUnits(tokenAmount, token.decimals),  //amount
      [], //oracleSignature
    ]
    
    const successMsg = `Order Submitted!`

    if(token.address===ethers.constants.AddressZero){     // matic in mumbai chain
      let value = ethers.utils.parseUnits(tokenAmount, token.decimals)
      console.log("MATIC!",value)
      Api.callContract(chainId, contract, method, params, {
        value: value,
        sentMsg: `Submitted.`,
        failMsg: `Failed.`,
        successMsg,
      })
        .then(() => { })
        .catch(e => { console.log(e) })
    }else{                                               // other ERC20 token, e.g. BTC
      Api.callContract(chainId, contract, method, params, {
        sentMsg: `Submitted.`,
        failMsg: `Failed.`,
        successMsg,
      })
        .then(() => { })
        .catch(e => { console.log(e) })
    }
  }

  const removeMargin = () => {

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
                  mode == 'Deposit' ? addMargin() : removeMargin()
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