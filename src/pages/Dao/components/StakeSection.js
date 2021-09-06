import { Input } from 'antd';
import React, { forwardRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import styles from './StakeSection.less';
import { AcyCoinItem, AcyModal, AcyTabs } from '@/components/Acy';
import { supportedTokens } from '@/acy-dex-swap/utils';
import SampleToken from '@/pages/Dao/sample_data/SampleToken';

const { AcyTabPane } = AcyTabs;

const StakeSection = () => {
  const [stake, setStake] = useState(0)
  const [balance, setBalance] = useState(12345)
  const [balancePercentage, setBalancePercentage] = useState(0)
  const [date, setDate] = useState(new Date())
  const [isModal1Visible, setIsModal1Visible] = useState(false)
  const [isModal2Visible, setIsModal2Visible] = useState(false)
  const [token1, setToken1] = useState(SampleToken[0])
  const [token2, setToken2] = useState(SampleToken[1])

  const updateStake = (newStake) => {
    const newStakeInt = newStake !== '' ? parseInt(newStake, 10) : ''
    if (newStakeInt === '' || !Number.isNaN(newStakeInt)) setStake(newStakeInt)
  }

  const updateBalancePercentage = (percentage) => {
    setStake(balance * percentage / 100)
    setBalancePercentage(percentage)
  }

  const updateDate = (type, value) => {
    const newDate = new Date();
    if (type === 'week') newDate.setHours(newDate.getHours() + 24 * 7 * value);
    else if (type === 'month') newDate.setMonth(newDate.getMonth() + value);
    else if (type === 'year') newDate.setFullYear(newDate.getFullYear() + value);
    else return;
    setDate(newDate);
  };

  const CustomDatePickerInput = forwardRef(({ value, onClick }, ref) => (
    <button type="button" className={styles.datePickerInput} onClick={onClick} ref={ref}>
      {value}
    </button>
  ));

  const showModal1 = () => setIsModal1Visible(true);
  const showModal2 = () => setIsModal2Visible(true);


  const handleSelectToken1 = newToken => {
    setToken1(newToken);
    setIsModal1Visible(false)
  }
  const handleSelectToken2 = newToken => {
    setToken2(newToken);
    setIsModal2Visible(false)
  }

  const handleCancel1 = () => setIsModal1Visible(false);
  const handleCancel2 = () => setIsModal2Visible(false);

  const presetDate = [
    ['week', 1, '1W'],
    ['month', 1, '1M'],
    ['month', 3, '3M'],
    ['month', 6, '6M'],
    ['year', 1, '1Y'],
    ['year', 4, '4Y'],
  ]

  return (
    <div className={styles.stakeSection}>
      <div className={styles.stakeContentWrapper}>
        <div className={styles.stakeUpperSection}>
          <div className={styles.amountRow}>
            <div>Stake</div>
            <div>
              <input
                type="text"
                value={stake}
                onChange={e => updateStake(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.balanceRow}>
            <div className={styles.balanceRowTitle}>Balance:</div>
            <div className={styles.sliderContainer}>
              <div>{balance} ACY</div>
              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className={styles.slider}
                  value={balancePercentage}
                  onChange={e => updateBalancePercentage(e.target.value)}
                />
              </div>
              <div>{balancePercentage}%</div>
            </div>
          </div>
          <div className={styles.lockTimeRow}>
            <div className={styles.lockTimeRowTitle}>Lock Time:</div>
            <div className={styles.dateSelectionContainer}>
              <div className={styles.datePickerContainer}>
                <DatePicker
                  selected={date}
                  onChange={(newDate) => setDate(newDate)}
                  customInput={<CustomDatePickerInput />}
                />
              </div>
              <div className={styles.presetDurationContainer}>
                {presetDate.map(([type, value, text]) => (
                  <div
                    className={styles.presetDurationSelection}
                    onClick={() => updateDate(type, value)}
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.rewardContentWrapper}>
        <div className={styles.rewardRow}>
          <div className={styles.rewardRowTitle}>Reward</div>
          <div className={styles.cryptoSelectionContainer}>
            <div className={styles.tokenSelectionContainer}>
              <div className={styles.tokenSelection}>
                <div className={styles.tokenDropdown} onClick={showModal1}>
                  <img src={token1.logoURI} alt={token1.symbol} className={styles.tokenImg} />
                  <p className={styles.tokenSymbol}>{token1.symbol}</p>
                </div>
                <AcyModal onCancel={handleCancel1} width={400} visible={isModal1Visible}>
                  <div className={styles.title}>Select a token</div>
                  <div className={styles.search}>
                    <Input
                      size="large"
                      style={{
                        backgroundColor: '#373739',
                        borderRadius: '40px',
                      }}
                      placeholder="Enter the token symbol or address"
                    />
                  </div>

                  <div className={styles.coinList}>
                    <AcyTabs>
                      <AcyTabPane tab="All" key="1">
                        {supportedTokens.map((token, index) => (
                          <AcyCoinItem data={token} key={index} />
                        ))}
                      </AcyTabPane>
                      <AcyTabPane tab="Favorite" key="2" />
                    </AcyTabs>
                  </div>
                </AcyModal>
                <div className={styles.tokenPercentage}>
                  <input type="text" className={styles.tokenPercentageInput} />
                  <span className={styles.suffix}>%</span>
                </div>
              </div>
              <div className={styles.tokenSelection}>
                <div className={styles.tokenDropdown} onClick={showModal2}>
                  <img src={token2.logoURI} alt={token2.symbol} className={styles.tokenImg} />
                  <p className={styles.tokenSymbol}>{token2.symbol}</p>
                </div>
                <AcyModal onCancel={handleCancel2} width={400} visible={isModal2Visible}>
                  <div className={styles.title}>Select a token</div>
                  <div className={styles.search}>
                    <Input
                      size="large"
                      style={{
                        backgroundColor: '#373739',
                        borderRadius: '40px',
                      }}
                      placeholder="Enter the token symbol or address"
                    />
                  </div>

                  <div className={styles.coinList}>
                    <AcyTabs>
                      <AcyTabPane tab="All" key="1">
                        {supportedTokens.map((token, index) => (
                          <AcyCoinItem data={token} key={index} />
                        ))}
                      </AcyTabPane>
                      <AcyTabPane tab="Favorite" key="2" />
                    </AcyTabs>
                  </div>
                </AcyModal>
                <div className={styles.tokenPercentage}>
                  <input type="text" className={styles.tokenPercentageInput} />
                  <span className={styles.suffix}>%</span>
                </div>
              </div>
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
