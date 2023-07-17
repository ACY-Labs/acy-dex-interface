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
import {cancelTradeOrder} from '@/services/derivatives'
import OrderBook from '@/abis/future-option-power/OrderBook.json'


const { AddressZero } = ethers.constants;

export const CancelOrderModal = ({isModalVisible,onCancel,order,chainId, ...props}) =>{
    
    const connectWalletByLocalStorage = useConnectWallet()
    const { account, active, library } = useWeb3React()
    const orderbookAddress = getContract(chainId, "orderbook")

    const onClickPrimary = () => {
        if(!account){
            connectWalletByLocalStorage()
            return
        }
        // console.log("amount",ethers.utils.parseUnits(tokenAmount.toString(),18))
        console.log("CANCEL ORDER",order.orderIndex)
        cancelTradeOrder(chainId,library,orderbookAddress,OrderBook,order.orderIndex)
        onCancel();
    }

    const handleCancel = () => {
        onCancel();
      }

    return(
    <AcyModal backgroundColor="#0e0304" width={400} visible={isModalVisible} onCancel={handleCancel}>
        <div className={styles.modalTitle} >Are you sure?</div>
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