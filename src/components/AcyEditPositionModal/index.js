import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { connect } from 'umi';
import { useWeb3React } from '@web3-react/core';
import { getEstimated, signOrApprove, removeLiquidity } from '@/acy-dex-swap/core/removeLiquidity';
import { Icon, Button, Input } from "antd";
import moment from 'moment';
import styles from './index.less';
import {
  binance,
  injected,
} from '@/connectors';

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

const AutoResizingInput = ({ value: inputValue, onChange: setInputValue }) => {
  const handleInputChange = (e) => {
    let newVal = e.target.valueAsNumber || 0;
    newVal = newVal > 100 ? 100 : (newVal < 0 ? 0 : newVal);  // set newVal in range of 0~100
    console.log(newVal);
    setInputValue(newVal);
  };

  const inputRef = useRef();
  useEffect(() => {
    const newSize = inputValue.toString().length + 0.5;
    console.log("new size ", newSize);
    inputRef.current.style.width = newSize + "ch";
    console.log(inputRef.current.style.width);
  }, [inputValue]);

  useEffect(() => {
    setInputValue(inputValue);
  }, [setInputValue, inputValue]);

  return (
    <input
      ref={inputRef}
      type="number"
      className={styles.amountInput}
      value={Number(inputValue).toString()}
      onChange={handleInputChange}
      autoFocus
    />
  );
};

// FIXME: use state machine to rewrite the logic (needApprove, approving, removeLiquidity, processing, done).
const AcyRemoveLiquidityModal = ({ EditPosition, isModalVisible, onCancel, ...props }) => {
  const { account, chainId, library, farmSetting: { API_URL: apiUrlPrefix }, farmSetting: { INITIAL_ALLOWED_SLIPPAGE } } = useConstantLoader()
  const [token0, setToken0] = useState(null);
  const [token1, setToken1] = useState(null);
  const [token0Amount, setToken0Amount] = useState('0');
  const [token1Amount, setToken1Amount] = useState('0');
  const [args, setArgs] = useState([]);
  // 仓位信息，确定两种代币之后就可以确定了
  const [position, setPosition] = useState();
  // uni-v2 的余额
  const [balance, setBalance] = useState('0');
  const [balanceShow, setBalanceShow] = useState(false);
  // index==0 表示百分比，index==1 表示数额
  const [index, setIndex] = useState(0);
  // 代币的百分比
  const [percent, setPercent] = useState(50);
  // 代币的数额
  const [amount, setAmount] = useState('0');
  const [needApprove, setNeedApprove] = useState(false);
  const [buttonStatus, setButtonStatus] = useState(false);
  const [buttonContent, setButtonContent] = useState(false);
  // Slippage and deadline timer
  const [breakdown, setBreakdown] = useState();
  const [inputSlippageTol, setInputSlippageTol] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [slippageTolerance, setSlippageTolerance] = useState(INITIAL_ALLOWED_SLIPPAGE / 100);
  const [slippageError, setSlippageError] = useState('');
  const [deadline, setDeadline] = useState();
  // 点击按钮之后的返回信息
  const [removeStatus, setRemoveStatus] = useState();
  const [signatureData, setSignatureData] = useState(null);
  const [removeOK, setRemoveOK] = useState(false);
  const slippageTolerancePlaceholder = 'please input a number from 1.00 to 100.00';

  const { activate } = useWeb3React();


  //START FROM HERE
  const [editToken, setEditToken] = useState({symbol : 'ACY'});
  const [editIsLong, setEditIsLong] = useState(false);
  const [editPositionInfo, setEditPositionInfo] = useState([]);
  const [editTokenInputAmount, setEditTokenInputAmount] = useState();
  const [editTokenBalance, setEditTokenBalance] = useState('0');
  const [barOption, setBarOption] = useState('Deposit');

  useEffect(() => {

    console.log("first use effect from acy edit", EditPosition);
   if(EditPosition){
       setDepositMode(EditPosition);
   }   
  },[EditPosition]);

  useEffect( async () => {
    console.log("updating balance for edit token", editToken);
    setEditTokenBalance(await getUserTokenBalance(editToken, chainId, account, library).catch(e => console.log("Edit position update balance dispatch error",e)));
  },[editToken])

  const handleCancel = () => {
    onCancel();
  }

  const setDepositMode = () => {
    setBarOption('Deposit');
    setEditToken(findTokenWithSymbol(EditPosition.token.symbol));
       setEditIsLong(EditPosition.isLong);

       setEditPositionInfo([
           {title : 'Size',
            value : EditPosition.totalSize},
            {title : 'Collateral',
            value : EditPosition.collateral},
            {title : 'Leverage',
            value : `${EditPosition.delta.toFixed(2)}x`},
            {title : 'Mark Price',
            value : EditPosition.markPrice},
            {title : 'Liq. Price',
            value : EditPosition.liqPrice}
       ]);
    setEditTokenInputAmount();
  }
  const setWithdrawMode = () => {
    setBarOption('Withdraw');
    setEditToken(findTokenWithSymbol('USDT'));
    setEditTokenInputAmount();
  }


  return (
    <AcyModal backgroundColor="#0e0304" width={400} visible={isModalVisible} onCancel={handleCancel}>
      <div className={styles.modalTitle} >Edit {editIsLong ? 'Long' : 'Short'} {EditPosition && EditPosition.token.symbol}</div>
      <div className={styles.optionBarContainer}>
        <div className={ barOption=='Deposit' && classNames(styles.optionBarSelected, styles.optionBar) || styles.optionBar} onClick={() => setDepositMode(EditPosition)}>Deposit</div>
        <div className={ barOption=='Withdraw' && classNames(styles.optionBarSelected, styles.optionBar) || styles.optionBar} onClick={() => setWithdrawMode()}>Withdraw</div>
      </div>
      <AcyCuarrencyCard
              icon={editToken.symbol}
              title={`Balance : ${parseFloat(editTokenBalance).toFixed(5)}`}
              logoURI={editToken.logoURI}
              coin={editToken.symbol}
              yuan="566.228"
              dollar={`${editTokenBalance}`}
              token={editTokenInputAmount}
              showBalance={true}
              onChoseToken={async () => {
                // onClickCoin();
                // setBefore(true);
              }}
              onChangeToken={e => {
                setEditTokenInputAmount(e);
              }}
              isLocked={true}
              library={library}
            />
        <AcyDescriptions>
              {editPositionInfo.map((item)=>{
                       return <div className={styles.infoSmallBox}>
                               <div className={styles.infoBoxTitle}>{item.title}</div>
                               <div className={styles.infoBoxValue}>
                                   {item.value}
                               </div>
                           </div>
                  })
              }
        </AcyDescriptions>
        <div className={styles.buttonContainer}>
        <AcyButton
          variant="sucess"
          disabled={true}
          onClick = {() => {
            console.log("PERFORM ACTION");
          }}
          >
        Enter Amount
        </AcyButton>
        </div>
        
    </AcyModal>
  );
};

export default connect(({ transaction, liquidity }) => ({
  transaction,
  liquidity
}))(AcyRemoveLiquidityModal);
