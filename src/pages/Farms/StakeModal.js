import { AcyModal } from '@/components/Acy';
import React, { useState, useEffect, forwardRef } from 'react';
import styles from '@/pages/Farms/Farms.less';
import DatePicker from 'react-datepicker';
import { AcySmallButtonGroup } from '@/components/AcySmallButton';
import { useWeb3React } from '@web3-react/core';
import { deposit, approveLpToken } from '@/acy-dex-swap/core/farms';
import { white } from '@umijs/deps/compiled/chalk';
import { Icon } from 'antd';
import { now } from 'moment';
import { connect } from 'umi';
import moment from 'moment';
import SwapIcon from "@/assets/icon_swap.png";
import classNames from 'classnames';
import axios from 'axios';
import { API_URL } from '@/acy-dex-swap/utils';
import Pattern from '@/utils/pattern';


const StakeModal = props => {
  const {
    onCancel,
    isModalVisible,
    token1,
    token2,
    token1Logo,
    token2Logo,
    balance,
    stakedTokenAddr,
    poolId,
    dispatch,
    refreshPoolInfo,
    chainId,
    account,
    library,
    poolLpScore,
    endAfter,
    ratio, // USD/lpToken
    token1Ratio,
    token2Ratio,
    poolRewardPerYear,
  } = props;
  const [date, setDate] = useState(new Date());
  const [selectedPresetDate, setSelectedPresetDate] = useState(null);
  const [showStake, setShowStake] = useState(0);
  const [stake, setStake] = useState();
  const [balancePercentage, setBalancePercentage] = useState(0);
  const [buttonText, setButtonText] = useState('Stake');
  const [aprList, setAprList] = useState([[12.23, false], [14.53, false], [16.27, false], [18.13, false], [22.83, false]])
  const [pickingDate, setPickingDate] = useState(false);
  const [aprCounted, serAprCounted] = useState(13.2);
  const [buttonStatus, setButtonStatus] = useState(true);
  const [modalVisible, setModalVisible] = useState(true);
  const [is4Years, setIs4Years] = useState(false);
  const [daysNum, setDaysNum] = useState([]);
  const [lpTokenShow, setLpTokenShow] = useState(false);// true:lpToken false:USD

  const [lpValue, setLpValue] = useState(0);
  const [USDValue, setUSDValue] = useState(0);
  const [totalUSDBalance, setTotalUSDBalance] = useState(0);
  
  const maxDay = Math.floor(endAfter/(60*60*24)).toString();
  const maxDayStr = `MAX ${maxDay}D`;

  const getLockDuration = () => {
    if (is4Years) return 126144000;
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.abs((date.getTime() - Date.now()) / (oneDay));
    const result = Math.ceil(diffDays) * 86400;
    return result > 126144000 ? 126144000 : result;// 24*60*60  31536000
  };

  const updateStake = e => {

    const check = Pattern.coinNum.test(e.target.value);
    if (check) {
      const value = parseFloat(e.target.value?e.target.value:0);
      console.log("TEST totalUSDBalance:",totalUSDBalance);
      if(value > totalUSDBalance) {
        setButtonStatus(false);
        setButtonText("Insufficient balance");
        setShowStake(e.target.value);
        setBalancePercentage(100);
      } else {
        setButtonStatus(true);
        setButtonText("Stake");
        setShowStake(e.target.value);
        setBalancePercentage(Math.round(value/totalUSDBalance*100));
      }
    }


    // console.log("TEST HERE INPUT:",newStake);
    // let newStakeInt = newStake !== '' ? parseFloat(newStake, 10) : '';
    // newStakeInt = newStakeInt > balance ? balance : newStakeInt;
    // if (newStakeInt === '' || !Number.isNaN(newStakeInt)) {
    //   setShowStake(newStakeInt);
    // }
    // console.log("TEST HERE:",newStakeInt,balance, (newStakeInt / balance * 100));
    
  };

  const updateBalancePercentage = percentage => {

    
    const percentageInt = percentage === '' ? 0 : parseInt(percentage, 10);
    if (Number.isNaN(percentageInt)) return;
    setShowStake((parseFloat((totalUSDBalance * percentageInt) / 100)).toFixed(6));
    // setStake(parseFloat((balance * balancePercentage) / 100));
    setBalancePercentage(percentageInt);
  };

  // useEffect(() => {
  //   setStake(parseFloat((balance * balancePercentage) / 100));
  // }, [balancePercentage, balance]);

  useEffect(() => {
    let newArr = [...aprList];
    const day1W = getDayNum("week", 1);
    const day1M = getDayNum("month", 1);
    const day3M = getDayNum("month", 3);
    const day6M = getDayNum("month", 6);
    // const day1Y = getDayNum("year", 1);
    const day4Y = getDayNum("year", 4);
    const day_num = [day1W, day1M, day3M, day6M, day4Y];
    var totalScore = poolLpScore / 1e34;
    var lp = showStake/ratio;
    for (let i = 0; i < 5; i++) {
      var weight = lp * Math.sqrt(day_num[i]);
      console.log("weight 1:",lp,Math.sqrt(day_num[i]),weight);
      // console.log("TEST1234:",i,weight / (totalScore + weight),poolRewardPerYear);
      if (totalScore + weight == 0) newArr[i][0] = 0;
      else newArr[i][0] = (weight / (totalScore + weight) * poolRewardPerYear / showStake ).toFixed(2);
    }
    setAprList(aprList);
    setDaysNum(day_num);
  }, [showStake]);



  useEffect(() => {
    setIs4Years(false);
  }, [isModalVisible]);

  useEffect(() => {
    setTotalUSDBalance(balance*ratio);
  }, [balance, ratio]);

  const getDayNum = (type, value) => {
    const nowDate = new Date();
    const nowDate2 = new Date();
    if (type === 'week') nowDate.setHours(nowDate.getHours() + 24 * 7 * value);
    else if (type === 'month') nowDate.setMonth(nowDate.getMonth() + value);
    else if (type === 'year') nowDate.setFullYear(nowDate.getFullYear() + value);
    return Math.ceil((nowDate - nowDate2) / (1000 * 60 * 60 * 24));
  }

  const updateDate = (type, value, index) => {
    const newDate = new Date();
    if (type === 'week') newDate.setHours(newDate.getHours() + 24 * 7 * value);
    else if (type === 'month') newDate.setMonth(newDate.getMonth() + value);
    else if (type === 'year') newDate.setFullYear(newDate.getFullYear() + value);
    else return;

    let newArr = [...aprList];
    for (let i = 0; i < 5; i++) newArr[i][1] = false;
    newArr[index][1] = true;
    setAprList(newArr);
    setDate(newDate);
    setSelectedPresetDate(index);
    setPickingDate(false);
    if (value == 4) {
      setIs4Years(true);
    } else {
      setIs4Years(false);
    }
  };
  const updateMaxDay = (dayNum) => {
    let newArr = [...aprList];
    for (let i = 0; i < 5; i++) newArr[i][1] = false;
    newArr[4][1] = true;

  }

  const datePickerChangeHandler = newDate => {
    console.log("datePickerChangeHandler:",newDate/1000);
    const date = new Date();
    const dif = newDate - date;
    const dayNum = Math.ceil(dif/(60*60*24*1000));

    setDate(newDate);
    setSelectedPresetDate(null);
    var lp = showStake/ratio;
    var weight = lp * Math.sqrt(dayNum);
    console.log("weight 7:",lp,Math.sqrt(dayNum),weight);
    var totalScore = poolLpScore / 1e34;
    const apr = (weight / (totalScore + weight) * poolRewardPerYear / showStake ).toFixed(2);
    serAprCounted(apr);
    setPickingDate(true);
  };

  const CustomDatePickerInput = forwardRef(({ value, onClick }, ref) => (
    <button type="button" className={` ${styles.datePickerInput} ${pickingDate ? styles.pickingDate : ''}`} onClick={onClick} ref={ref}>
      {value}
    </button>
  ));

  const stakeCallback = status => {
    // const transactions = props.transaction.transactions;
    // const isCurrentTransactionDispatched = transactions.filter(item => item.hash == status.hash).length;
    // //trigger loading spin on top right
    // if (isCurrentTransactionDispatched == 0) {
    //   dispatch({
    //     type: "transaction/addTransaction",
    //     payload: {
    //       transactions: [...transactions, { hash: status.hash }]
    //     }
    //   })
    // }

    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {
        console.log("receipt ", receipt);

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          // let transactionTime;
          // await library.getBlock(receipt.logs[0].blockNumber).then(res => {
          //   transactionTime = moment(parseInt(res.timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
          //   console.log("test transactionTime: ", transactionTime)
          // });
          //refresh poold info
          await axios.get(
            // fetch valid pool list from remote
            `${API_URL}/farm/updatePool?poolId=${poolId}`
            //change to to production
            //`http://api.acy.finance/api/updatePool?poolId=${poolId}`
          ).then( async (res) => {
            console.log("poolId:",poolId)
            await refreshPoolInfo(poolId);
            setButtonText("Done");
            setButtonStatus(true);
            onCancel();
          }).catch(e => console.log("error: ", e));

          
          // clear top right loading spin
          // const newData = transactions.filter(item => item.hash != status.hash);
          // dispatch({
          //   type: "transaction/addTransaction",
          //   payload: {
          //     transactions: [
          //       ...newData,
          //       { hash: status.hash, transactionTime }
          //     ]
          //   }
          // });

          // refresh the table
          // dispatch({
          //   type: "liquidity/setRefreshTable",
          //   payload: true,
          // });

          // disable button after each transaction on default, enable it after re-entering amount to add
          
          // store to localStorage
        }
      })
    };
    // const sti = setInterval(, 500);
    checkStatusAndFinish();
  };

  const approveCallback = status => {
    // console.log("approveCallback test status:", status);
    // const transactions = props.transaction.transactions;
    // const isCurrentTransactionDispatched = transactions.filter(item => item.hash == status.hash).length;
    // console.log("is current dispatched? ", isCurrentTransactionDispatched);
    // //trigger loading spin on top right
    // if (isCurrentTransactionDispatched == 0) {
    //   dispatch({
    //     type: "transaction/addTransaction",
    //     payload: {
    //       transactions: [...transactions, { hash: status.hash }]
    //     }
    //   })
    // }

    console.log("test test see how many times setInterval is called");
    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {
        console.log("receipt ", receipt);

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          // let transactionTime;
          // await library.getBlock(receipt.logs[0].blockNumber).then(res => {
          //   transactionTime = moment(parseInt(res.timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
          //   console.log("test transactionTime: ", transactionTime)
          // });

          // clear top right loading spin
          // const newData = transactions.filter(item => item.hash != status.hash);
          // dispatch({
          //   type: "transaction/addTransaction",
          //   payload: {
          //     transactions: [
          //       ...newData,
          //       { hash: status.hash, transactionTime }
          //     ]
          //   }
          // });

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
  const checkIfDisabled = (i) => {
    return daysNum[i] * 60 * 60 * 24 > endAfter
  };
  const renderLpOrUsd = (flag) => flag&&<>
    {token1 && token2 && `${token1}-${token2} LP`}
    {token1 && !token2 && `${token1}s`}
    {token2 && !token1 && `${token2}s`}
  </>||'USD';
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
      <div className={styles.amountContainerWrap}>
        <div className={styles.amountRowContainer}>
          <div className={styles.amountRowInputContainer}>
          <span className={styles.prefix}>
              $
          </span>
            <input type="text"  value={ showStake} onChange={updateStake} />
          </div>

        </div>
      </div>

      <div className={styles.balanceAmountContainer}>
        <div className={styles.balanceAmount}>
          Balance: ${(parseFloat(totalUSDBalance)).toFixed(6)}
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
      <div className={styles.balanceAmountContainer2}>
          {token2? 'LP Token':'Token'}: {(parseFloat(totalUSDBalance)).toFixed(6)} {token2? `${token1+"-"+token2} LP`  : `s${token1}`}
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
      <div className={styles.tokenAmountContent}>
        <div className={styles.tokenAmount}>
        {(token1Ratio*showStake/ratio).toFixed(4)}
        </div>
        <div className={styles.tokenDetailContainer}>
          <div>
            {token1Logo && (
                <img src={token1Logo} alt="token" className={styles.tokenImg}/>
            )}

          </div>
          <div className={styles.tokenSymbol}>
            
            {token1}

          </div>
          
        </div>
      </div>
      { token2 && (
        <div className={styles.tokenAmountContent}>
        <div className={styles.tokenAmount}>
        {(token2Ratio*showStake/ratio).toFixed(4)}
        </div>
        <div className={styles.tokenDetailContainer}>
          <div>
            {token2Logo && (
                <img src={token2Logo} alt="token" className={styles.tokenImg}/>
            )}

          </div>
          <div className={styles.tokenSymbol}>
            {token2}
          </div>
        </div>
      </div>
      )}
      
      <div className={styles.lockTimeRow}>
        <div className={styles.dateSelectionContainer}>
          <div className={styles.datePickerContainer}>
            <DatePicker
              wrapperClassName={styles.datePickerWrapper}
              selected={date}
              onChange={datePickerChangeHandler}
              customInput={<CustomDatePickerInput />}
            />
            {/* {pickingDate ?
              <div className={styles.APRBox1}>
                {aprCounted}%
              </div> : ''
            } */}

          </div>
          {/* <div className={styles.APRRow}>
            {aprList.map(([text, selected], index) => {
              let APRstyle = ''
              if (false) {
                APRstyle = styles.APRDisabled
              }
              else if (selected) {
                APRstyle = styles.APRBoxSelected
              }
              else {
                APRstyle = styles.APRBox
              }
              return (
                <div className={APRstyle}>
                  {text}%
                </div>
              )
            })}
          </div> */}
          <div className={styles.presetDurationContainer}>
            <AcySmallButtonGroup
              activeButton={selectedPresetDate}
              buttonList={[
                ['1W', () => updateDate('week', 1, 0)],
                ['1M', () => updateDate('month', 1, 1)],
                ['3M', () => updateDate('month', 3, 2)],
                ['6M', () => updateDate('month', 6, 3)],
                // ['1Y', () => updateDate('year', 1, 4), checkIfDisabled(4)],
                [maxDayStr, () => updateDate('year', 4, 4)],
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
          className={(!buttonStatus && classNames(styles.stakeSubmitButton, styles.buttonDisabled)) || styles.stakeSubmitButton}
          disabled={!buttonStatus}
          onClick={async () => {
            if (buttonText != "Done") {
              if (buttonText !== 'Approval required') {
                setButtonText(<>Processing <Icon type="loading" /></>);
                console.log("TEST DEPOSIT:", balance, parseFloat(balance), (balance*(balancePercentage/100)),(balance*(balancePercentage/100)));
                setButtonStatus(false);
                if(balancePercentage < 100) {
                  deposit(stakedTokenAddr, (balance*(balancePercentage/100)).toFixed(18), poolId, getLockDuration(), library, account, setButtonText, stakeCallback, setButtonStatus);
                } else {
                  deposit(stakedTokenAddr, balance, poolId, getLockDuration(), library, account, setButtonText, stakeCallback, setButtonStatus);
                }
                
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
