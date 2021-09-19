import React, { forwardRef, useState } from 'react';
import styles from '@/pages/Farms/Farms.less';
import { AcyModal } from '@/components/Acy';
import DatePicker from 'react-datepicker';
import { AcySmallButtonGroup } from '@/components/AcySmallButton';
import {
  isMobile
} from "react-device-detect";

const FarmsTableRow = (
  {
    token1,
    token1Logo,
    token2,
    token2Logo,
    totalApr,
    tvl,
    hidden,
    rowClickHandler,
    pendingReward,
    walletConnected,
    setWalletConnected,
    showModal,
    hideModal,
    isModalVisible,
  }
) => {
  const [date, setDate] = useState(new Date())
  const [selectedPresetDate, setSelectedPresetDate] = useState(null)
  const [stake, setStake] = useState(0)
  const [balance, setBalance] = useState(12345)
  const [balancePercentage, setBalancePercentage] = useState(0)

  const updateStake = (newStake) => {
    let newStakeInt = newStake !== '' ? parseInt(newStake, 10) : ''
    newStakeInt = newStakeInt > balance ? balance : newStakeInt
    if (newStakeInt === '' || !Number.isNaN(newStakeInt)) setStake(newStakeInt)
    setBalancePercentage(Math.floor(newStakeInt / balance * 100))
  }

  const updateBalancePercentage = (percentage) => {
    const percentageInt = percentage === '' ? 0 : parseInt(percentage, 10)
    if (Number.isNaN(percentageInt)) return
    setStake(balance * percentageInt / 100)
    setBalancePercentage(percentageInt)
  }

  const updateDate = (type, value, index) => {
    const newDate = new Date();
    if (type === 'week') newDate.setHours(newDate.getHours() + 24 * 7 * value);
    else if (type === 'month') newDate.setMonth(newDate.getMonth() + value);
    else if (type === 'year') newDate.setFullYear(newDate.getFullYear() + value);
    else return;
    setDate(newDate);
    setSelectedPresetDate(index)
  };

  const datePickerChangeHandler = (newDate) => {
    setDate(newDate)
    setSelectedPresetDate(null)
  }

  const CustomDatePickerInput = forwardRef(({ value, onClick }, ref) => (
    <button type="button" className={styles.datePickerInput} onClick={onClick} ref={ref}>
      {value}
    </button>
  ));

  return (
    <div className={styles.tableBodyRowContainer}>

      {/* Table Content */}
      <div className={styles.tableBodyRowContentContainer} onClick={rowClickHandler}>

        {/* Token Title Row */}
        <div className={styles.tableBodyTitleColContainer}>
          <div className={styles.token1LogoContainer}>
            <img src={token1Logo} alt={token1} />
          </div>

          {/* conditionally hide and show token 2 logo. */}
          {/* if token 2 is undefined or null, hide token 2 logo. */}
          {token2 && (
            <div className={styles.token2LogoContainer}>
              <img src={token2Logo} alt={token2} />
            </div>
          )}

          {/* conditionally hide and show token 2 symbol */}
          {/* only display token 1 symbol if token 2 is undefined or null. */}
          <div className={styles.tokenTitleContainer}>
            {token2 ? `${token1}-${token2} LP` : `${token1} LP`}
          </div>
        </div>

        {/* Pending Reward Column */}
        {!isMobile && (
          <div className={styles.tableBodyRewardColContainer}>
            <div className={styles.pendingRewardTitleContainer}>Pending Reward</div>
              {pendingReward.map((reward) => (
                <div className={styles.pendingReward1ContentContainer}>
                  {`${reward.amount} ${reward.token}`}
                </div>
            ))}
          </div>
        )}

        {/* Total APR Column */}
        {!isMobile && (
          <div className={styles.tableBodyAprColContainer}>
            <div className={styles.totalAprTitleContainer}>Total APR</div>
            <div className={styles.totalAprContentContainer}>{totalApr}%</div>
          </div>
        )}

        {/* TVL Column */}
        <div className={styles.tableBodyTvlColContainer}>
          <div className={styles.tvlTitleContainer}>TVL</div>
          <div className={styles.tvlContentContainer}>${tvl}</div>
        </div>

        {/* Arrow Icon Column */}
        <div className={styles.tableBodyArrowColContainer}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.arrowIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Table Drawer */}
      <div className={styles.tableBodyDrawerContainer} hidden={hidden}>

        {/* Add Liquidity Column */}
        <div className={styles.tableBodyDrawerLiquidityContainer}>
          <div>Add Liquidity:</div>
          <div><a className={styles.tableCodyDrawerLiquidityLink}>{token1}-{token2} LP</a></div>
        </div>

        {/* Harvest Reward Column */}
        <div className={styles.tableBodyDrawerRewardContainer}>
          <div className={styles.tableBodyDrawerRewardTitle}>Pending Reward</div>
          <div className={styles.tableBodyDrawerRewardContent}>
            <div className={styles.tableBodyDrawerRewardTokenContainer}>
              {pendingReward.map((reward) => (
                <div className={styles.pendingReward1ContentContainer}>
                  {`${reward.amount} ${reward.token}`}
                </div>
              ))}
            </div>
            <button type="button" className={styles.tableBodyDrawerRewardHarvestButton}>Harvest</button>
          </div>
        </div>

        {/* Farm Column */}
        <div className={styles.tableBodyDrawerFarmContainer}>
          <div className={styles.tableBodyDrawerWalletTitle}>Start Farming</div>
          <div>
            {walletConnected ? (
              <button
                type="button"
                className={styles.tableBodyDrawerWalletButton}
                onClick={showModal}
              >
                Stake LP
              </button>
              ) : (
                <button
                  type="button"
                  className={styles.tableBodyDrawerWalletButton}
                  onClick={() => setWalletConnected(true)}
                >
                  Connect Wallet
                </button>
            )}
          </div>
        </div>
      </div>

      <AcyModal onCancel={hideModal} width={400} visible={true}>
        <div className={styles.amountRowContainer}>
          <div className={styles.amountRowInputContainer}>
            <input
              type="text"
              value={stake}
              onChange={e => updateStake(e.target.value)}
            />
          </div>
          <span className={styles.suffix}>ACY</span>
        </div>
        <div className={styles.balanceAmountContainer}>
          <div>Balance: 12345 {token1}-{token2}</div>
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
                selected={date}
                onChange={datePickerChangeHandler}
                customInput={<CustomDatePickerInput />}
              />
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
          <button type="button" className={styles.stakeSubmitButton}>
            Stake
          </button>
        </div>
      </AcyModal>
    </div>
  )
}

export default FarmsTableRow
