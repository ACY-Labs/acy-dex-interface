import React, { useCallback, useEffect, useState, useRef } from 'react';
import { connect } from 'umi';
import { Icon, Button, Input } from "antd";
import Switch from '@material-ui/core/Switch';
import styles from './index.less';
import {
    AcyModal,
    AcyCuarrencyCard,
    AcyDescriptions,
    AcyButton
} from '@/components/Acy';
import { ethers } from 'ethers';
import { useConstantLoader } from '@/constants';
import classNames from 'classnames';
import { findTokenWithSymbol } from '@/utils/txData';
import { getUserTokenBalance } from '@/acy-dex-swap/utils';
import { formatAmount, USD_DECIMALS, mapPositionData, parseValue, bigNumberify } from '@/acy-dex-futures/utils';
import Router from "@/acy-dex-futures/abis/Router";
import * as Api from '@/acy-dex-futures/Api';

import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {},
  track: {},
  switchBase: {
    color: '#FFF',
    '&$checked': {
      color: '#eb5c20',
    },
    '&$checked + $track': {
      backgroundColor: '#a34520',
    },
  },
  checked: {},
  thumb: {},
});

const AcyClosePositionModal = ({ Position, isModalVisible, onCancel, setPendingTxns, ...props }) => {
  const classes = useStyles();
  const { account, chainId, library, 
    farmSetting: { 
      API_URL: apiUrlPrefix,  
      NATIVE_CURRENCY: nativeToken,
     INITIAL_ALLOWED_SLIPPAGE
    }, 
    perpetuals ,
  } = useConstantLoader()
  const [fromToken, setFromToken] = useState({symbol : 'ACY'});
  const [editIsLong, setEditIsLong] = useState(false);
  const [positionInfo, setPositionInfo] = useState({});
  const [newPositionInfo, setNewPositionInfo] = useState();
  const [fromAmount, setFromAmount] = useState('');
  const [fromAmountUSD, setFromAmountUSD] = useState(0);
  const [maxFromAmount, setMaxFromAmount] = useState(0);
  const [keepLeverage, setKeepLeverage] = useState(true);
  const [buttonContent, setButtonContent] = useState('Enter Amount');
  const [buttonIsEnabled, setButtonIsEnabled] = useState(false);

  const { AddressZero } = ethers.constants;
  const nativeTokenAddress = findTokenWithSymbol(nativeToken).address;
  const routerAddress = perpetuals.getContract("Router")
  
  useEffect(() => {

   if(Position){
       setFromToken(findTokenWithSymbol('USDT'));
       setEditIsLong(Position.isLong);
       setPositionInfo(mapPositionData(Position,'none'));
       setMaxFromAmount(parseFloat(formatAmount(Position.size,USD_DECIMALS,2,null,false)));
   }   
  },[Position]);

  useEffect(async ()=>{
    if(Position){
      const sizeDelta = parseValue(fromAmount,USD_DECIMALS);
      setNewPositionInfo(mapPositionData(Position, 'Close', sizeDelta, keepLeverage));
    }
  },[fromAmount, keepLeverage])

  const lockButton = (err)=> {
    //err = 0 means normal enter ammount
    //err = 1 means input amount exceeds maxFromAmount , 
    //err = 2 means ....

    switch(err){
      case 0 :
        setButtonContent('Enter Amount');
        setButtonIsEnabled(false);
        return 
      case 1 :
        setButtonContent('Max close amount exceeded');
        setButtonIsEnabled(false);
        return;
    }
    
  }

  const onInputChanged = (input, maxFromAmount) => {

  
    if(input == '') {
      lockButton(0);
      return
    }
  
    if(input <= 0){
      lockButton(0);
      return 
    }
  
    if(input > maxFromAmount) {
      lockButton(1);
      return;
    }
  
    setButtonContent('Close');
    setButtonIsEnabled(true);
  
  }

  const resetParams = () => {
    setFromAmount('');
    lockButton(0);
    setKeepLeverage(false);
    setPositionInfo(mapPositionData(Position,'none'));
  }

  const handleCancel = () => {
    onCancel();
    resetParams();
  }

  const onClickMain = async () => {
    lockButton(2);
    const indexTokenAddress =
        Position.indexToken.address === AddressZero
          ? nativeTokenAddress
          : Position.indexToken.address;
    const collateralTokenAddress = Position.collateralToken.address
    //perform withdraw collateral
    const tokenAddress0 =
      Position.collateralToken.address === AddressZero
        ? nativeTokenAddress
        : Position.collateralToken.address;
    const path = [tokenAddress0];
    const priceBasisPoints = Position.isLong ? 9000 : 11000;
    const priceLimit = Position.indexToken.maxPrice.mul(priceBasisPoints).div(10000); //UNCOMMENT THIS WHEN REAL POSITION READY
    const amount = fromAmount== maxFromAmount? Position.size:parseValue(fromAmount, USD_DECIMALS);
    const ratio = fromAmount/maxFromAmount * 10000
    const collateralDelta = keepLeverage ?  Position.collateral.mul(parseInt(ratio)).div(10000) : 0
    
    let params = [
      tokenAddress0,
      indexTokenAddress,
      collateralDelta,
      amount,
      Position.isLong,
      account,
      priceLimit,
    ];
    let method =
      collateralTokenAddress === AddressZero || collateralTokenAddress === nativeTokenAddress
        ? 'decreasePositionETH'
        : 'decreasePosition';

    const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner());
    Api.callContract(chainId, contract, method, params, {
      sentMsg: 'Withdrawal submitted!',
      successMsg: `Withdrew ${formatAmount(amount, USD_DECIMALS, 2)} USD from ${
        Position.indexToken.symbol
      } ${Position.isLong ? 'Long' : 'Short'}.`,
      failMsg: 'Withdrawal failed.',
      setPendingTxns,
    })
      .then(async res => {
        // setFromValue('');
        // setIsVisible(false);
      })
      .finally(() => {
        // setIsSwapping(false);
      });
  };

  return (
    <AcyModal backgroundColor="#0e0304" width={400} visible={isModalVisible} onCancel={handleCancel}>
      <div className={styles.modalTitle} >Close {editIsLong ? 'Long' : 'Short'} {Position && Position.indexToken.symbol}</div>
      <AcyCuarrencyCard
          icon={'USD'}
          title={`Max: $${Position && formatAmount(Position.size, USD_DECIMALS, 2, null , true)}`}
          coin={'USD'}
          yuan="566.228"
          dollar={`${maxFromAmount}`}
          token={fromAmount}
          showBalance={true}
          onChangeToken={e => {
            setFromAmount(e);
            onInputChanged(e, maxFromAmount);
          }}
          isLocked={true}
          library={library}
          onClickTitle={ () => {
            setFromAmount(maxFromAmount)
            onInputChanged(maxFromAmount, maxFromAmount);
          }}
        />
        <div className={styles.checkboxContainer}>
        <span>Keep Leverage at {positionInfo.Leverage}x</span>
        <Switch
              name="checkboxP"  
              size="small"  
              id="stake-switch" 
              className={styles.checkbox}
              onChange={(e) => {
                setKeepLeverage(e.target.checked);
              }}
              checked={keepLeverage}
              classes={{
                root: classes.root,
                switchBase: classes.switchBase,
                checked: classes.checked,
                track: classes.track,
                thumb: classes.thumb,
            }} 
        />
        </div>
        <hr className={styles.linediv}/>
        <AcyDescriptions>
              {Object.keys(positionInfo).map( (key, index) => {
                  return <div className={styles.infoSmallBox}>
                    <div className={styles.infoBoxTitle}>{key}</div>
                    { newPositionInfo && key in newPositionInfo ? 
                        <div className={styles.infoBoxValue}>
                            <div>
                              <div className={styles.inlineInfoBlock}>
                                {positionInfo[key]}
                                <svg className={styles.infoBoxTransitionArrow}>
                                  <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"></path>
                                </svg>
                              </div>
                                {newPositionInfo[key]}
                            </div>
                        </div> 
                      :
                        <div className={styles.infoBoxValue}>
                         {positionInfo[key]}
                        </div> }
                  </div> } )
              }
        </AcyDescriptions>
        <div className={styles.buttonContainer}>
        <AcyButton
          variant="sucess"
          disabled={!buttonIsEnabled}
          onClick = {() => {
            onClickMain();
          }}
          >
        {buttonContent}
        </AcyButton>
        </div>
        
    </AcyModal>
  );
};

export default AcyClosePositionModal
