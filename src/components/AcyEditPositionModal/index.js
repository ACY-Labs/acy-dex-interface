import React, { useCallback, useEffect, useState, useRef } from 'react';
import { connect } from 'umi';
// import { getEstimated, signOrApprove, removeLiquidity } from '@/acy-dex-swap/core/removeLiquidity';
import { Icon, Button, Input } from "antd";
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
import { mapPositionData, USD_DECIMALS } from '@/utils/utils';
import { getAllSuportedTokensPrice } from '@/acy-dex-swap/utils';
import { parseValue } from '@/utils/utils';

const AcyEditPositionModal = ({ Position, isModalVisible, onCancel, ...props }) => {
  const { account, chainId, library, farmSetting: { API_URL: apiUrlPrefix }, farmSetting: { INITIAL_ALLOWED_SLIPPAGE } } = useConstantLoader()
  const [fromToken, setFromToken] = useState({symbol : 'ACY'});
  const [editIsLong, setEditIsLong] = useState(false);
  const [positionInfo, setPositionInfo] = useState({});
  const [fromAmount, setFromAmount] = useState('');
  const [maxFromAmount, setMaxFromAmount] = useState(0);
  const [barOption, setBarOption] = useState('Deposit');
  const [buttonContent, setButtonContent] = useState('Enter Amount');
  const [buttonIsEnabled, setButtonIsEnabled] = useState(false);
  const [newPositionInfo, setNewPositionInfo] = useState();
  const [fromAmountUSD, setFromAmountUSD] = useState(0);

  const mode = useRef();
  mode.current = barOption;

  useEffect(() => {
    if(Position)
      setDepositMode(Position);

  },[Position]);

  useEffect( async () => {
    setMaxFromAmount( parseFloat(await getUserTokenBalance(fromToken, chainId, account, library).catch(e => console.log("Edit position update balance dispatch error",e))));
  },[fromToken, isModalVisible])

  useEffect(async ()=>{
    if(Position){
      if (fromAmount == 0)
        setFromAmountUSD(0);
      else if (!fromToken)
      setFromAmountUSD(0);

      const tokenPriceList = await getAllSuportedTokensPrice();
      const tokenPrice = tokenPriceList[fromToken.symbol];
      const tokenAmountUSD = tokenPrice * fromAmount;

      setFromAmountUSD(tokenAmountUSD.toFixed(2));
      const collateralDelta = parseValue(tokenAmountUSD,USD_DECIMALS);
      setNewPositionInfo(mapPositionData(Position, mode.current, collateralDelta));
    }
  },[fromAmount])

  const handleCancel = () => {
    onCancel();
    setDepositMode();
  }
  
  const unlockButton = () => {
    setButtonContent('Enter Amount');
    setButtonIsEnabled(true);
  }
  const lockButton = (err)=> {
    //err = 0 means normal enter ammount
    //err = 1 means input amount exceeds maxFromAmount , 
    //err = 2 means ....
    if(mode.current == 'Deposit'){
      switch(err){
        case 0 :
          setButtonContent('Enter Amount');
          setButtonIsEnabled(false);
          return;
        case 1 :
          setButtonContent('Not Enough Balance');
          setButtonIsEnabled(false);
          return;
      }
    }else{
      switch(err){
        case 0 :
          setButtonContent('Enter Amount');
          setButtonIsEnabled(false);
          return 
        case 1 :
          setButtonContent('Not Enough Collateral');
          setButtonIsEnabled(false);
          return;
      }
    }
  }
  const resetParams = () => {
    setFromAmount('');
    setPositionInfo(mapPositionData(Position,'none'));
  }

  const setDepositMode = () => {
    setBarOption('Deposit');
    setFromToken(Position.indexToken);
    lockButton(0);
    setEditIsLong(Position.isLong);

    resetParams();
  }
  const setWithdrawMode = () => {
    setBarOption('Withdraw');
    setFromToken(Position.collateralToken)
    lockButton(0);
    resetParams();
  }

const onInputChanged = (input, maxFromAmount) => {

  //check if input is legit
  console.log("input has changed", maxFromAmount, input)

  if(input == '') {
    lockButton(0);
    return
  }

  if(input <= 0){
    lockButton(1);
    return 
  }

  if(input > maxFromAmount) {
    lockButton(1);
    return;
  }

  setButtonContent(mode.current);
  setButtonIsEnabled(true);

}

  //reset parameters when modal is not visible
  useEffect(()=>{
    if(!isModalVisible){
      setBarOption('Deposit');
    }
  },[isModalVisible])


  return (
    <AcyModal backgroundColor="#0e0304" width={400} visible={isModalVisible} onCancel={handleCancel}>
      <div className={styles.modalTitle} >Edit {editIsLong ? 'Long' : 'Short'} {Position && Position.indexToken.symbol}</div>
      <div className={styles.optionBarContainer}>
        <div className={ barOption=='Deposit' && classNames(styles.optionBarSelected, styles.optionBar) || styles.optionBar} onClick={() => setDepositMode(Position)}>Deposit</div>
        <div className={ barOption=='Withdraw' && classNames(styles.optionBarSelected, styles.optionBar) || styles.optionBar} onClick={() => setWithdrawMode()}>Withdraw</div>
      </div>
      <AcyCuarrencyCard
              icon={fromToken.symbol}
              title={barOption=='Deposit' ? `Balance : ${maxFromAmount.toFixed(5)}` : `Max : ${maxFromAmount.toFixed(5)}`}
              logoURI={fromToken.logoURI}
              coin={fromToken.symbol}
              yuan="566.228"
              dollar={`${maxFromAmount}`}
              token={fromAmount}
              showBalance={true}
              onChoseToken={async () => {
                // onClickCoin();
                // setBefore(true);
              }}
              onChangeToken={e => {
                setFromAmount(e);
                onInputChanged(e, maxFromAmount);
              }}
              isLocked={true}
              library={library}
            />
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

export default connect(({ transaction, position }) => ({
  transaction,
  position
}))(AcyEditPositionModal);
