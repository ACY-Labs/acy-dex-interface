import { AcyModal } from '@/components/Acy';
import React, { useState, useEffect, forwardRef } from 'react';
import styles from '@/pages/Farms/Farms.less';
import DatePicker from 'react-datepicker';
import { AcySmallButtonGroup } from '@/components/AcySmallButton';
import { useWeb3React } from '@web3-react/core';
import { deposit } from '@/acy-dex-swap/core/farms';
import { white } from '@umijs/deps/compiled/chalk';

const StakeModal = ({
  onCancel,
  isModalVisible,
  token1,
  token2,
  balance,
  stakedTokenAddr,
  poolId,
}) => {
  const [date, setDate] = useState(new Date());
  const [selectedPresetDate, setSelectedPresetDate] = useState(null);
  const [showStake, setShowStake] = useState(0);
  const [stake, setStake] = useState(0);
  const [balancePercentage, setBalancePercentage] = useState(0);
  const [buttonText, setButtonText] = useState('Stake');
  const { account, chainId, library, activate } = useWeb3React();
  const [aprList, setAprList] = useState([[12.23,false],[14.53,false],[16.27,false],[18.13,false],[19.63,false],[22.83,false]])
  const [pickingDate,setPickingDate] = useState(false);
  const [aprCounted, serAprCounted] = useState(13.2);

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
    setStake(parseFloat((balance * percentageInt) / 100));
    setBalancePercentage(percentageInt);
  };

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

  return (
    <AcyModal
      key={`${token1}${token2}`}
      onCancel={onCancel}
      width={400}
      bodyStyle={{
        padding: '21px',
        background: '#2F3032',
        borderRadius: '.5rem',
      }}
      visible={isModalVisible}
      destroyOnClose
    >
      <div className={styles.amountRowContainer}>
        <div className={styles.amountRowInputContainer}>
          <input type="text" value={showStake} onChange={e => updateStake(e.target.value)} />
        </div>
        <span className={styles.suffix}>{token1}-{token2}</span>
      </div>
      <div className={styles.balanceAmountContainer}>
        <div className={styles.balanceAmount}>
          Balance: {(parseFloat(balance)).toFixed(6)} {token1}-{token2}
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
          className={styles.stakeSubmitButton}
          onClick={async () => {
            deposit(stakedTokenAddr, stake, poolId, library, account, setButtonText);
          }}
        >
          {buttonText}
        </button>
      </div>
    </AcyModal>
  );
};

export default StakeModal;
