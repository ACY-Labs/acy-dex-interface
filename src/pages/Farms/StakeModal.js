import { AcyModal } from '@/components/Acy';
import React, { useState, useEffect, forwardRef } from 'react';
import styles from '@/pages/Farms/Farms.less';
import DatePicker from 'react-datepicker';
import { AcySmallButtonGroup } from '@/components/AcySmallButton';
import { useWeb3React } from '@web3-react/core';
import { deposit, approveLpToken } from '@/acy-dex-swap/core/farms';
import { white } from '@umijs/deps/compiled/chalk';
import { Icon} from 'antd';
import { now } from 'moment';
import { connect } from 'umi';
import moment from 'moment';
import classNames from 'classnames';


const StakeModal = props => {
  const {
    onCancel,
    isModalVisible,
    token1,
    token2,
    balance,
    stakedTokenAddr,
    poolId,
    dispatch,
    refreshPoolInfo,
    chainId,
    account,
    library,
    poolLpScore
  } = props;
  const [date, setDate] = useState(new Date());
  const [selectedPresetDate, setSelectedPresetDate] = useState(null);
  const [showStake, setShowStake] = useState(0);
  const [stake, setStake] = useState(0);
  const [balancePercentage, setBalancePercentage] = useState(0);
  const [buttonText, setButtonText] = useState('Stake');
  const [aprList, setAprList] = useState([[12.23,false],[14.53,false],[16.27,false],[18.13,false],[19.63,false],[22.83,false]])
  const [pickingDate,setPickingDate] = useState(false);
  const [aprCounted, serAprCounted] = useState(13.2);
  const [buttonStatus, setButtonStatus] = useState(true);
  const [modalVisible, setModalVisible] = useState(true);
  const [is4Years, setIs4Years] = useState(false);

  
  const getLockDuration = () => {
    if(is4Years) return 126144000;
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.abs((date.getTime() - Date.now()) / (oneDay)); 
    const result = Math.ceil(diffDays) * 86400;
    return result>126144000?126144000:result;// 24*60*60  31536000
  };

  const updateStake = newStake => {
    let newStakeInt = newStake !== '' ? parseFloat(newStake, 10) : '';
    newStakeInt = newStakeInt > balance ? balance : newStakeInt;
    if (newStakeInt === '' || !Number.isNaN(newStakeInt)){
      setShowStake(newStakeInt);
      setStake(newStakeInt);
    } 
    setBalancePercentage(Math.floor((newStakeInt / balance) * 100));
  };
  
  const updateBalancePercentage = percentage => {
    const percentageInt = percentage === '' ? 0 : parseInt(percentage, 10);
    if (Number.isNaN(percentageInt)) return;
    setShowStake((parseFloat((balance * percentageInt) / 100)).toFixed(6));
    setBalancePercentage(percentageInt);
  };

  useEffect( () =>{
    setStake(parseFloat((balance * balancePercentage) / 100));
  },[balancePercentage, balance]);

  useEffect( () =>{
    let newArr = [...aprList];
    const day1W = getDayNum("week",1);
    const day1M = getDayNum("month",1);
    const day3M = getDayNum("month",3);
    const day6M = getDayNum("month",6);
    const day1Y = getDayNum("year",1);
    const day4Y = getDayNum("year",4);
    const day_num = [day1W, day1M, day3M, day6M, day1Y, day4Y];

    var totalScore = poolLpScore / 1e34;
    for(let i=0 ; i<6 ; i++) {
      var weight =  stake * Math.sqrt(day_num[i]);
      if(totalScore + weight == 0) newArr[i][0] = 0;
      else newArr[i][0] = (weight / (totalScore + weight) * 100).toFixed(2);
    }
    setAprList(newArr);
  },[stake]); 

  useEffect( () =>{
    setIs4Years(false);
  },[isModalVisible]);

  const getDayNum = (type, value) => {
    const nowDate = new Date();
    const nowDate2 = new Date();
    if (type === 'week')nowDate.setHours(nowDate.getHours() + 24 * 7 * value);
    else if (type === 'month') nowDate.setMonth(nowDate.getMonth() + value);
    else if (type === 'year') nowDate.setFullYear(nowDate.getFullYear() + value);
    return Math.ceil((nowDate - nowDate2) / (1000 * 60 * 60 * 24));
  }

  const updateDate = (type, value, index) => {
    const newDate = new Date();
    if (type === 'week')newDate.setHours(newDate.getHours() + 24 * 7 * value);
    else if (type === 'month') newDate.setMonth(newDate.getMonth() + value);
    else if (type === 'year') newDate.setFullYear(newDate.getFullYear() + value);
    else return;

    let newArr = [...aprList]; 
    for (let i = 0; i < 6; i++) newArr[i][1] = false;
    newArr[index][1] = true; 
    setAprList(newArr);   
    setDate(newDate);
    setSelectedPresetDate(index);
    setPickingDate(false);
    if(value == 4){
      setIs4Years(true);
    } else {
      setIs4Years(false);
    }
  };

  const datePickerChangeHandler = newDate => {
    setDate(newDate);
    setSelectedPresetDate(null);

    let newArr = [...aprList]; 
    for (let i = 0; i < 6; i++) newArr[i][1] = false;
    setAprList(newArr);  
    setPickingDate(true);
  };

  const CustomDatePickerInput = forwardRef(({ value, onClick }, ref) => (
    <button type="button" className={` ${styles.datePickerInput} ${pickingDate ? styles.pickingDate : '' }`} onClick={onClick} ref={ref}>
      {value}
    </button>
  ));

  const stakeCallback = status => {
    const transactions = props.transaction.transactions;
    const isCurrentTransactionDispatched = transactions.filter(item => item.hash == status.hash).length;
    //trigger loading spin on top right
    if (isCurrentTransactionDispatched == 0) {
      dispatch({
        type: "transaction/addTransaction",
        payload: {
          transactions: [...transactions, { hash: status.hash }]
        }
      })
    }

    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {
        console.log("receipt ", receipt);

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          let transactionTime;
          await library.getBlock(receipt.logs[0].blockNumber).then(res => {
            transactionTime = moment(parseInt(res.timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
            console.log("test transactionTime: ", transactionTime)
          });

          // update backend userPool record
          // console.log("test pair to add on server", pairToAddOnServer);
          // if (pairToAddOnServer) {
          //   const { token0, token1 } = pairToAddOnServer;
          //   axios.post(
          //     // fetch valid pool list from remote
          //     `https://api.acy.finance/api/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
          //     // `http://localhost:3001/api/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
          //   ).then(res => {
          //     console.log("add to server return: ", res);

          //   }).catch(e => console.log("error: ", e));
          // }
          //refresh poold info
          await refreshPoolInfo();
          // clear top right loading spin
          const newData = transactions.filter(item => item.hash != status.hash);
          dispatch({
            type: "transaction/addTransaction",
            payload: {
              transactions: [
                ...newData,
                { hash: status.hash, transactionTime }
              ]
            }
          });

          // refresh the table
          // dispatch({
          //   type: "liquidity/setRefreshTable",
          //   payload: true,
          // });

          // disable button after each transaction on default, enable it after re-entering amount to add
          setButtonText("Done");
          setButtonStatus(true);
          onCancel();
          // store to localStorage
        }
      })
    };
    // const sti = setInterval(, 500);
    checkStatusAndFinish();
  };

  const approveCallback = status => {
    console.log("approveCallback test status:", status);
    const transactions = props.transaction.transactions;
    const isCurrentTransactionDispatched = transactions.filter(item => item.hash == status.hash).length;
    console.log("is current dispatched? ", isCurrentTransactionDispatched);
    //trigger loading spin on top right
    if (isCurrentTransactionDispatched == 0) {
      dispatch({
        type: "transaction/addTransaction",
        payload: {
          transactions: [...transactions, { hash: status.hash }]
        }
      })
    }

    console.log("test test see how many times setInterval is called");
    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {
        console.log("receipt ", receipt);

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          let transactionTime;
          await library.getBlock(receipt.logs[0].blockNumber).then(res => {
            transactionTime = moment(parseInt(res.timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
            console.log("test transactionTime: ", transactionTime)
          });

          // update backend userPool record
          // console.log("test pair to add on server", pairToAddOnServer);
          // if (pairToAddOnServer) {
          //   const { token0, token1 } = pairToAddOnServer;
          //   axios.post(
          //     // fetch valid pool list from remote
          //     `https://api.acy.finance/api/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
          //     // `http://localhost:3001/api/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
          //   ).then(res => {
          //     console.log("add to server return: ", res);

          //   }).catch(e => console.log("error: ", e));
          // }
          //refresh pool info 
          
          // clear top right loading spin
          const newData = transactions.filter(item => item.hash != status.hash);
          dispatch({
            type: "transaction/addTransaction",
            payload: {
              transactions: [
                ...newData,
                { hash: status.hash, transactionTime }
              ]
            }
          });

          // refresh the table
          // dispatch({
          //   type: "liquidity/setRefreshTable",
          //   payload: true,
          // });

          // disable button after each transaction on default, enable it after re-entering amount to add
          setButtonText("Stake");
          setButtonStatus(true);
          // store to localStorage
        }
      })
    };
    // const sti = setInterval(, 500);
    checkStatusAndFinish();
  };

  return (
    <AcyModal
      key={`${token1}${token2}`}
      onCancel={onCancel}
      width={400}
      bodyStyle={{
        padding: '21px',
        background: '#0e0304',
        borderRadius: '.5rem',
      }}
      visible={isModalVisible && modalVisible}
      destroyOnClose
    >
      <div className={styles.amountRowContainer}>
        <div className={styles.amountRowInputContainer}>
          <input type="text" defaultValue={stake} value={showStake} onChange={e => updateStake(e.target.value)} />
        </div>
        <span className={styles.suffix}>
          {token1 && token2 && `${token1}-${token2} LP`}
          {token1 && !token2 && `${token1}s`}
          {token2 && !token1 && `${token2}s`}
        </span>
      </div>
      <div className={styles.balanceAmountContainer}>
        <div className={styles.balanceAmount}>
          Balance: {(parseFloat(balance)).toFixed(6)} 
          {token1 && token2 && ` ${token1}-${token2} LP`}
          {token1 && !token2 && ` ${token1}s`}
          {token2 && !token1 && ` ${token2}s`}
        </div>
        <div className={styles.balanceAmountInputContainer}>
          <input
            className={styles.balanceAmountInput}
            value={balancePercentage}
            onChange={e => updateBalancePercentage(e.target.value)}
          />
          <span className={styles.balanceAmountSuffix}>%</span>
        </div>
      </div>
      <div className={styles.sliderWrapper}>
        <input
          type="range"
          min="0"
          max="100"
          className={styles.slider}
          value={balancePercentage}
          onChange={e => updateBalancePercentage(e.target.value)}
        />
      </div>

      <div className={styles.lockTimeRow}>
        <div className={styles.dateSelectionContainer}>
          <div className={styles.datePickerContainer}>
            <DatePicker
              wrapperClassName={styles.datePickerWrapper}
              selected={date}
              onChange={datePickerChangeHandler}
              customInput={<CustomDatePickerInput /> }
            />
            {pickingDate ? 
              <div className={styles.APRBox1}>
                {aprCounted}%
              </div> : ''
            }

          </div>
          <div className={styles.APRRow}>
            {aprList.map(([text, selected], index) => {
              let APRstyle = ''
              if (selected){
                APRstyle = styles.APRBoxSelected
              }
              else{
                APRstyle = styles.APRBox
              }
              return (
                <div className={APRstyle}>
                  {text}%
                </div>
              )
            })}
          </div>
          <div className={styles.presetDurationContainer}>
            <AcySmallButtonGroup
              activeButton={selectedPresetDate}
              buttonList={[
                ['1W', () => updateDate('week', 1, 0)],
                ['1M', () => updateDate('month', 1, 1)],
                ['3M', () => updateDate('month', 3, 2)],
                ['6M', () => updateDate('month', 6, 3)],
                ['1Y', () => updateDate('year', 1, 4)],
                ['4Y', () => updateDate('year', 4, 5)],
              ]}
              containerClass={styles.presetDurationSelection}
              theme="#eb5c20"
            />
          </div>
        </div>
      </div>
      <div>
        <button
          type="button"
          // className={(!withdrawButtonStatus && classNames(styles.button,styles.buttonDisabled)) || styles.button}
          // className={styles.stakeSubmitButton}
          className={(!buttonStatus && classNames(styles.stakeSubmitButton,styles.buttonDisabled)) || styles.stakeSubmitButton}
          disabled={!buttonStatus}
          onClick={async () => {
            if(buttonText != "Done") {
              if(buttonText !== 'Approval required') {
                setButtonText(<>Processing <Icon type="loading" /></>);
                setButtonStatus(false);
                deposit(stakedTokenAddr, stake, poolId, getLockDuration(), library, account, setButtonText, stakeCallback, setButtonStatus);
              } else {
                setButtonText(<>Approving <Icon type="loading" /></>);
                setButtonStatus(false);
                approveLpToken(stakedTokenAddr, library, account, setButtonText, approveCallback);
              }
            }
          }}
        >
          {buttonText}
        </button>
      </div>
    </AcyModal>
  );
};

// export default StakeModal;
export default connect(({ global, transaction, loading }) => ({
  global,
  transaction,
  loading: loading.global,
}))(StakeModal);
