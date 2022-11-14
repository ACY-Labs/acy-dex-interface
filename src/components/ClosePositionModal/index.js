import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Icon, Button, Input } from "antd";
import styles from './index.less';
import {
    AcyModal,
    AcyCuarrencyCard,
    AcyDescriptions,
    AcyPerpetualButton,
    AcyInput,
} from '@/components/Acy';
import { ethers } from 'ethers';
import { useConstantLoader } from '@/constants';
import classNames from 'classnames';
import { formatAmount, USD_DECIMALS, mapPositionData, parseValue, bigNumberify } from '@/acy-dex-futures/utils';

export const ClosePositionModal = ({isModalVisible,onCancel, ...props}) =>{
    
    const [percentage, setPercentage] = useState('')
    const [mode,setMode] = useState('Market')

    const handleCancel = () => {
        onCancel();
    }

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

    const getModeButton = value => {
        if (mode!=value){
            return(
                <a className={styles.modeInactive} onClick={()=>{setMode(value)}}> {value} </a>
            )
        }else{
            return(
                <a className={styles.modeActive} onClick={()=>{setMode(value)}}> {value} </a>
            )
        }
    }

    return(
    <AcyModal backgroundColor="#0e0304" width={400} visible={isModalVisible} onCancel={handleCancel}>
        <div className={styles.modalTitle} >Closed By&ensp;
         {getModeButton("Limit")}/  
         {getModeButton("Market")}
        </div>
        {mode=="Limit" ?(
        <div>
            <div className={styles.modalContent}>Closing Price USDT</div>
            <AcyInput className={styles.input}/>
            <div className={styles.modalContent}>Closed Qty LDO</div>
            <AcyInput className={styles.input}/>
            
            <div className={styles.buttonContainer}>
                {getPercentageButton('25%')}
                {getPercentageButton('50%')}
                {getPercentageButton('75%')}
                {getPercentageButton('100%')}
            </div>
        </div>
        ):(
            <div>
            <div className={styles.modalContent}>Closed Qty LDO</div>
            <AcyInput className={styles.input}/>
            
            <div className={styles.buttonContainer}>
                {getPercentageButton('25%')}
                {getPercentageButton('50%')}
                {getPercentageButton('75%')}
                {getPercentageButton('100%')}
            </div>
        </div>
        )}
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