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

import { useConstantLoader } from '@/constants';
import classNames from 'classnames';
import { findTokenWithSymbol } from '@/utils/txData';
import { getUserTokenBalance } from '@/acy-dex-swap/utils';
import { formatAmount, USD_DECIMALS, mapPositionData, parseValue } from '@/utils/utils';

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

const AcyCreateOrderModal = ({ Position, isModalVisible, onCancel, ...props }) => {
  const classes = useStyles();
  const { account, chainId, library, farmSetting: { API_URL: apiUrlPrefix }, farmSetting: { INITIAL_ALLOWED_SLIPPAGE } } = useConstantLoader()
  const [fromToken, setFromToken] = useState({symbol : 'ACY'});
  const [indexToken, setIndexToken] = useState({symbol : 'ACY'});
  const [editIsLong, setEditIsLong] = useState(false);
  const [positionInfo, setPositionInfo] = useState({});
  const [newPositionInfo, setNewPositionInfo] = useState();
  const [fromAmount, setFromAmount] = useState('');
  const [inputPrice, setInputPrice] = useState('');
  const [inputPriceIsLess, setInputPriceIsLess] = useState(true)
  const [fromAmountUSD, setFromAmountUSD] = useState(0);
  const [maxFromAmount, setMaxFromAmount] = useState(0);
  const [keepLeverage, setKeepLeverage] = useState(false);
  const [buttonContent, setButtonContent] = useState('Enter Amount');
  const [buttonIsEnabled, setButtonIsEnabled] = useState(false);
  
  useEffect(() => {
   if(Position){
       setFromToken(findTokenWithSymbol('USDT'));
       setIndexToken(Position.indexToken);
       console.log("setting index token : ", Position.indexToken);
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

  const onInputPriceChanged = (input) => {

    if(input == '') return;

    if(Position){
        let inputPrice = parseValue(input, USD_DECIMALS);
        if(Position.markPrice.lt(inputPrice))
            setInputPriceIsLess(false);
        else 
            setInputPriceIsLess(true);
    }
  }

  const resetParams = () => {
    setFromAmount('');
    setInputPrice('');
    lockButton(0);
    setKeepLeverage(false);
    setPositionInfo(mapPositionData(Position,'none'));
  }

  const handleCancel = () => {
    onCancel();
    resetParams();
  }

  return (
    <AcyModal backgroundColor="#0e0304" width={400} visible={isModalVisible} onCancel={handleCancel}>
      <div className={styles.modalTitle} >Take Profit / Stop Loss</div>
      <div className={styles.inputBox}>
        <AcyCuarrencyCard
                icon={fromToken.symbol}
                title={`Max ${Position && formatAmount(Position.size, USD_DECIMALS, 2, null , true)}`}
                logoURI={fromToken.logoURI}
                coin={fromToken.symbol}
                yuan="566.228"
                dollar={`${maxFromAmount}`}
                token={fromAmount}
                showBalance={true}
                onChangeToken={e => {
                    setFromAmount(e);
                    onInputChanged(e,maxFromAmount);
                }}
                isLocked={true}
                library={library}
                />
      </div>
      <div className={styles.inputBox}>
        <AcyCuarrencyCard
                icon={indexToken.symbol}
                title={`Mark Price : ${Position && formatAmount(Position.markPrice, USD_DECIMALS, 2, null , true)}`}
                logoURI={indexToken.logoURI}
                coin={`${indexToken.symbol} Price`}
                yuan="566.228"
                dollar={`${maxFromAmount}`}
                token={inputPrice}
                showBalance={true}
                onChangeToken={e => {
                    setInputPrice(e);
                    onInputPriceChanged(e);
                }}
                isLocked={true}
                library={library}
                />
       </div>
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
        {inputPrice && indexToken && (
            <div className={styles.newPriceContainer}>
                {`trigger when ${inputPriceIsLess ? '<' : '>'} than ${inputPrice}`}
            </div>
        )}
        <hr className={styles.linediv}/>
        <AcyDescriptions>
              {Object.keys(positionInfo).map( (key, index) => {
                  return <div className={styles.infoSmallBox}>
                    <div className={styles.infoBoxTitle}>{key}</div>
                    { newPositionInfo && key in newPositionInfo ? 
                        <div className={styles.infoBoxValue}>
                            <div>
                              <div className={styles.inlineInfoBlock}>
                                $ 
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
                          $ 
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
            console.log("PERFORM ACTION");
          }}
          >
        {buttonContent}
        </AcyButton>    
        </div>
        
    </AcyModal>
  );
};

export default AcyCreateOrderModal
