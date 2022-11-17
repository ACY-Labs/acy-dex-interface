import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Icon, Button, Input } from "antd";
import styles from './index.less';
import {
    AcyModal,
    AcyCuarrencyCard,
    AcyDescriptions,
    AcyPerpetualButton,
    AcyInput,
    AcyCheckBox,
} from '@/components/Acy';
import { ethers } from 'ethers';
import { useConstantLoader } from '@/constants';
import classNames from 'classnames';
import { formatAmount, USD_DECIMALS, mapPositionData, parseValue, bigNumberify } from '@/acy-dex-futures/utils';

export const ClosePositionModal = ({isModalVisible,onCancel,position, ...props}) =>{
    
    const [percentage, setPercentage] = useState('100%')
    const [mode,setMode] = useState('Market')
    const [isMarket,setMarket] = useState(true)
    const [markPrice,setMarkPrice] = useState()
    


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

    const handleInputChange = (e) => {
      setMarkPrice(e.target.value)
    }

    const handleInputFocus = (e) => {
      if (isMarket){
        setMarket(false)
        setMarkPrice()
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
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        />
        <div className={styles.modalContent}>Closed Qty</div>
        <AcyInput className={styles.input}/>
        
        <div className={styles.buttonContainer}>
            {getPercentageButton('25%')}
            {getPercentageButton('50%')}
            {getPercentageButton('75%')}
            {getPercentageButton('100%')}
        </div>
        <div className={styles.buttonContainer}>
        <AcyPerpetualButton
          onClick = {() => {
            handleCancel();
          }}
          
          >Confirm
        </AcyPerpetualButton>
        <AcyPerpetualButton
          onClick = {() => {
            handleCancel();
          }}
          
          >Cancel
        </AcyPerpetualButton>
        </div>
    </AcyModal>
    );
};

// export default ClosePositionModal