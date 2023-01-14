import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Icon, Button, Input } from "antd";
import styles from './index.less';
import {
    AcyModal,
    AcyCuarrencyCard,
    AcyDescriptions,
    AcyButton,
    AcyPerpetualButton,
    AcyInput,
    AcyCheckBox,
} from '@/components/Acy';
import { ethers } from 'ethers';
import useSWR from 'swr'
import { useConstantLoader } from '@/constants';
import { useConnectWallet } from '@/components/ConnectWallet';
import { useWeb3React } from '@web3-react/core';
import { INITIAL_ALLOWED_SLIPPAGE, getTokens, getContract } from '@/constants/future_option_power.js';
import classNames from 'classnames';
import {fetcher,formatAmount, USD_DECIMALS, mapPositionData, parseValue, bigNumberify, approveTokens } from '@/acy-dex-futures/utils';
import ERC20 from '@/abis/ERC20.json';
import {trade} from '@/services/derivatives'
import IPool from '@/abis/future-option-power/IPool.json'


const { AddressZero } = ethers.constants;

export const ClosePositionModal = ({isModalVisible,onCancel,position,chainId, ...props}) =>{
    
    const connectWalletByLocalStorage = useConnectWallet()
    const { account, active, library } = useWeb3React()

    if (!position){
      position = {
        accountFunding: 0,
        address : "0x09e63267A4b0F7bB45e1ADc6De1B709C1eCE1d67",
        entryPrice : 0,
        marginUsage: 0,
        markPrice: 0,
        position: 0,
        symbol: "BTCUSD-60000-C",
        type: "Long",
        unrealizedPnl: 0,
        minTradeVolume: "0.001"
      }
    }

    /// get contract address
    const poolAddress = getContract(chainId, "pool")


    //// read contract to check token allowance
    // const routerAddress = getContract(chainId, "router")
    // const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")
    // const tokenAllowanceAddress = position.address === AddressZero ? nativeTokenAddress : position.address;
    // const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR([chainId, tokenAllowanceAddress, "allowance", account, routerAddress], {
    //   fetcher: fetcher(library, ERC20)
    // });

    // const needApproval =
    // position.address !== AddressZero &&
    // tokenAllowance &&
    // tokenAmount &&
    // tokenAmount.gt(tokenAllowance)

    ///// ui
    const [percentage, setPercentage] = useState('100%')
    const [isMarket,setMarket] = useState(true)
    const [markPrice,setMarkPrice] = useState()
    const [tokenAmount,setTokenAmount] = useState()
    const [isApproving, setIsApproving] = useState(false)
    const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)

    const getPercentageButton = value => {
      if (percentage != value) {
        return (
          <button
            className={styles.percentageButton}
            onClick={() => { setPercentage(value) }}>
            {value}
          </button>
        )
      } else {
        return (
          <button
            className={styles.percentageButtonActive}
            onClick={() => { setPercentage(value) }}>
            {value}
          </button>
        )
      }
    }

    useEffect(() => {
      if(position){
        setMarkPrice(position.markPrice)
      }   
    },[position]);

    useEffect(() => {
      if(position && percentage){
        const amount = position.position * parseFloat(percentage) / 100
        handleAmountChange(amount)
      }   
    },[percentage,position]);


    const handleCancel = () => {
      onCancel();
    }

    const handleCheckBox = () => {
      if (isMarket){
        setMarket(false)
        setMarkPrice()
      }else{
        setMarket(true)
        setMarkPrice(position.markPrice)
      }
    }

    const handlePriceChange = (e) => {
      setMarkPrice(e.target.value)
    }

    const handleInputFocus = (e) => {
      if (isMarket){
        setMarket(false)
        setMarkPrice()
      }
    }


    const handleAmountChange = (value) => {
      const minTradeVolume = position.minTradeVolume
      if(value%minTradeVolume==0&&value<=position.position){
        setTokenAmount(value)
      }else if(value>position.position){
        setTokenAmount(position.position)
      }else{
        setTokenAmount(Math.floor(value/minTradeVolume)*minTradeVolume)
      }
      

    }

    const onClickPrimary = () => {
      if(!account){
        connectWalletByLocalStorage()
        return
      }
      console.log("amount",ethers.utils.parseUnits(tokenAmount.toString(),18))
      if(position.type=="Long"){  // original Long: Short when close position, negative token amount
        trade(
          chainId,
          library,
          poolAddress, 
          IPool,
          account,
          position.symbol,
          ethers.utils.parseUnits(tokenAmount.toString(),18).mul(bigNumberify(-1)),
          ethers.utils.parseUnits(markPrice,18).mul(bigNumberify(10000 - INITIAL_ALLOWED_SLIPPAGE * 100)).div(bigNumberify(10000))
          )
          onCancel();
      }else{
        trade(    // original Short: Long when close position, positive token amount 
          chainId,
          library,
          poolAddress, 
          IPool,
          account,
          position.symbol,
          ethers.utils.parseUnits(tokenAmount.toString(),18),
          ethers.utils.parseUnits(markPrice,18).mul(bigNumberify(10000 + INITIAL_ALLOWED_SLIPPAGE * 100)).div(bigNumberify(10000))
        )
        onCancel();
      }
    }

    return(
    <AcyModal backgroundColor="#0e0304" width={400} visible={isModalVisible} onCancel={handleCancel}>
        <div className={styles.modalTitle} >Close Position</div>
        <div className={styles.modalContent}>
          Closing Price USDT &ensp;
          <div className={styles.checkBox}>
            <AcyCheckBox label="Close all"
            checked={isMarket}
            onChange={handleCheckBox}
            >Market Price</AcyCheckBox>
          </div>
        </div>
        
        <AcyInput className={styles.input}
        value={markPrice}
        onChange={handlePriceChange}
        onFocus={handleInputFocus}
        />
        <div className={styles.modalContent}>Closed Qty</div>
        <AcyInput className={styles.input}
        value={tokenAmount}
        onChange={(e)=>handleAmountChange(e.target.value)}
        />
        
        <div className={styles.buttonContainer}>
            {getPercentageButton('25%')}
            {getPercentageButton('50%')}
            {getPercentageButton('75%')}
            {getPercentageButton('100%')}
        </div>
        <div className={styles.buttonContainer}>
        <Button
          onClick = {() => {
            onClickPrimary();
          }}
          className={styles.buttonPrimary}
          >Confirm
        </Button>
        <Button
          onClick = {() => {
            handleCancel();
          }}
          className={styles.buttonPrimary}
          >Cancel
        </Button>
        </div>
    </AcyModal>
    );
};

// export default ClosePositionModal