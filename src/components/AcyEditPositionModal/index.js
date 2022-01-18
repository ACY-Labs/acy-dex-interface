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


const AcyEditPositionModal = ({ Position, isModalVisible, onCancel, ...props }) => {
  const { account, chainId, library, farmSetting: { API_URL: apiUrlPrefix }, farmSetting: { INITIAL_ALLOWED_SLIPPAGE } } = useConstantLoader()
  const [editToken, setEditToken] = useState({symbol : 'ACY'});
  const [editIsLong, setEditIsLong] = useState(false);
  const [editPositionInfo, setEditPositionInfo] = useState([]);
  const [editTokenInputAmount, setEditTokenInputAmount] = useState('');
  const [editTokenBalance, setEditTokenBalance] = useState('0');
  const [barOption, setBarOption] = useState('Deposit');

  useEffect(() => {

   if(Position){
       setDepositMode(Position);
   }   
  },[Position]);

  useEffect( async () => {
    setEditTokenBalance(await getUserTokenBalance(editToken, chainId, account, library).catch(e => console.log("Edit position update balance dispatch error",e)));
  },[editToken])

  const handleCancel = () => {
    onCancel();
  }

  const setDepositMode = () => {
    setBarOption('Deposit');
    setEditToken(findTokenWithSymbol(Position.token.symbol));
       setEditIsLong(Position.isLong);

       setEditPositionInfo([
           {title : 'Size',
            value : Position.totalSize.toFixed(2)},
            {title : 'Collateral',
            value : Position.collateral.toFixed(2)},
            {title : 'Leverage',
            value : `${Position.delta.toFixed(2)}x`},
            {title : 'Mark Price',
            value : Position.markPrice.toFixed(2)},
            {title : 'Liq. Price',
            value : Position.liqPrice.toFixed(2)}
       ]);
    setEditTokenInputAmount('');
  }
  const setWithdrawMode = () => {
    setBarOption('Withdraw');
    setEditToken(findTokenWithSymbol('USDT'));
    setEditTokenInputAmount('');
  }
  //reset parameters when modal is not visible
  useEffect(()=>{
    if(!isModalVisible){
      setBarOption('Deposit');
    }
  },[isModalVisible])


  return (
    <AcyModal backgroundColor="#0e0304" width={400} visible={isModalVisible} onCancel={handleCancel}>
      <div className={styles.modalTitle} >Edit {editIsLong ? 'Long' : 'Short'} {Position && Position.token.symbol}</div>
      <div className={styles.optionBarContainer}>
        <div className={ barOption=='Deposit' && classNames(styles.optionBarSelected, styles.optionBar) || styles.optionBar} onClick={() => setDepositMode(Position)}>Deposit</div>
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

export default connect(({ transaction, position }) => ({
  transaction,
  position
}))(AcyEditPositionModal);
