import React, { forwardRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import styles from './StakeSection.less';
import SampleToken from '@/pages/Dao/sample_data/SampleToken';
import TokenSelection from '@/pages/Dao/components/TokenSelection';

const StakeSection = () => {
  const [stake, setStake] = useState(0)
  const [balance, setBalance] = useState(12345)
  const [balancePercentage, setBalancePercentage] = useState(0)
  const [date, setDate] = useState(new Date())
  const [isModal1Visible, setIsModal1Visible] = useState(false)
  const [isModal2Visible, setIsModal2Visible] = useState(false)
  const [token1, setToken1] = useState(SampleToken.filter((token) => token.symbol === 'WBTC')[0])
  const [token2, setToken2] = useState(SampleToken.filter((token) => token.symbol === 'WETH')[0])
  const [token1Percentage, setToken1Percentage] = useState(50)
  const [token2Percentage, setToken2Percentage] = useState(50)
  const [presetDate, setPresetDate] = useState([
    ['week', 1, '1W', false],
    ['month', 1, '1M', false],
    ['month', 3, '3M', false],
    ['month', 6, '6M', false],
    ['year', 1, '1Y', false],
    ['year', 4, '4Y', false],
  ])

  const updateStake = (newStake) => {
    let newStakeInt = newStake !== '' ? parseInt(newStake, 10) : ''
    newStakeInt = newStakeInt > balance ? balance : newStakeInt
    if (newStakeInt === '' || !Number.isNaN(newStakeInt)) setStake(newStakeInt)
    setBalancePercentage(Math.floor(newStakeInt / balance * 100))
  }

  const updateToken1Percentage = (percentage) => {
    let percentageInt = percentage !== '' ? parseInt(percentage, 10) : 0
    percentageInt = percentageInt > 100 ? 100 : percentageInt
    setToken1Percentage(percentageInt)
    setToken2Percentage(100 - percentageInt)
  }

  const updateToken2Percentage = (percentage) => {
    let percentageInt = percentage !== '' ? parseInt(percentage, 10) : 0
    percentageInt = percentageInt > 100 ? 100 : percentageInt
    setToken2Percentage(percentageInt)
    setToken1Percentage(100 - percentageInt)
  }

  const updateBalancePercentage = (percentage) => {
    setStake(balance * percentage / 100)
    setBalancePercentage(percentage)
  }

  const updateDate = (type, value, index) => {
    const newDate = new Date();
    if (type === 'week') newDate.setHours(newDate.getHours() + 24 * 7 * value);
    else if (type === 'month') newDate.setMonth(newDate.getMonth() + value);
    else if (type === 'year') newDate.setFullYear(newDate.getFullYear() + value);
    else return;
    setDate(newDate);
    const presetDateCopy = [...presetDate]
    for (let i = 0; i < presetDateCopy.length; i ++) presetDateCopy[i][3] = index === i
    setPresetDate(presetDateCopy)
  };

  const datePickerChangeHandler = (newDate) => {
    setDate(newDate)
    const presetDateCopy = [...presetDate]
    for (let i = 0; i < presetDateCopy.length; i++) presetDateCopy[i][3] = false
  }

  const CustomDatePickerInput = forwardRef(({ value, onClick }, ref) => (
    <button type="button" className={styles.datePickerInput} onClick={onClick} ref={ref}>
      {value}
    </button>
  ));

  const showModal1 = () => setIsModal1Visible(true);
  const showModal2 = () => setIsModal2Visible(true);


  const handleSelectToken1 = (newToken) => {
    setToken1(newToken);
    setIsModal1Visible(false)
  }
  const handleSelectToken2 = (newToken) => {
    setToken2(newToken);
    setIsModal2Visible(false)
  }

  const handleCancel1 = () => setIsModal1Visible(false);
  const handleCancel2 = () => setIsModal2Visible(false);

  return (
    <div className={styles.stakeSection}>
      <div className={styles.stakeContentWrapper}>
        <div className={styles.stakeUpperSection}>

          {/* AMOUNT ROW */}

          <div className={styles.amountRow}>
            <div className={styles.amountRowTitle}>Stake</div>
            <div className={styles.amountRowInputContainer}>
              <input
                type="text"
                value={stake}
                onChange={e => updateStake(e.target.value)}
              />
            </div>
            <span className={styles.suffix}>ACY</span>
          </div>

          {/* BALANCE ROW */}

          <div className={styles.balanceRow}>
            <div className={styles.balanceRowTitleContainer}>
              <div className={styles.balanceRowTitle}>Balance:</div>
            </div>
            <div className={styles.sliderContainer}>
              <div className={styles.sliderContentWrapper}>
                <div>{balance} ACY</div>
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
                <div className={styles.balancePercentage}>
                  <input
                    className={styles.balancePercentageInput}
                    type="text"
                    value={balancePercentage}
                    onChange={(e) => updateBalancePercentage(e.target.value)}
                  />
                </div>
              </div>
              <span className={styles.balancePercentageSuffix}>%</span>
            </div>
          </div>

          {/* LOCK TIME SECTION */}

          <div className={styles.lockTimeRow}>
            <div className={styles.lockTimeRowTitleContainer}>
              <div className={styles.lockTimeRowTitle}>Lock Time:</div>
            </div>
            <div className={styles.dateSelectionContainer}>
              <div className={styles.datePickerContainer}>
                <DatePicker
                  selected={date}
                  onChange={datePickerChangeHandler}
                  customInput={<CustomDatePickerInput />}
                />
              </div>
              <div className={styles.presetDurationContainer}>
                {presetDate.map(([type, value, text, isSelected], index) => (
                  <div
                    style={isSelected ? { backgroundColor: '#EB5C20', color: 'white' } : null}
                    className={styles.presetDurationSelection}
                    onClick={() => updateDate(type, value, index)}
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REWARD ROW */}

      <div className={styles.rewardContentWrapper}>
        <div className={styles.rewardRow}>
          <div className={styles.rewardRowTitle}>Reward</div>
          <div className={styles.cryptoSelectionContainer}>
            <div className={styles.tokenSelectionContainer}>
              <TokenSelection
                showModal={showModal1}
                handleCancel={handleCancel1}
                isModalVisible={isModal1Visible}
                token={token1}
                tokenPercentage={token1Percentage}
                updateTokenPercentage={updateToken1Percentage}
                selectToken={handleSelectToken1}
              />
              <TokenSelection
                showModal={showModal2}
                handleCancel={handleCancel2}
                isModalVisible={isModal2Visible}
                token={token2}
                tokenPercentage={token2Percentage}
                updateTokenPercentage={updateToken2Percentage}
                selectToken={handleSelectToken2}
              />
            </div>
            <div>
              <button type="button" className={styles.stakeSubmitButton}>
                Stake
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakeSection
