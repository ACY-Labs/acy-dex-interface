/* eslint-disable lines-between-class-members */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable import/order */
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { graphSampleData, graphSampleData2 } from './SampleData';
import React, { Component, forwardRef } from 'react';
import { AcyCoinItem, AcyLineChart, AcyModal, AcyTabs, AcyPieChart } from '@/components/Acy';
import styles from './styles.less';
import stakeInfoStyles from './styles2.less';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SampleToken from './SampleToken';
import { Input } from 'antd';
import { supportedTokens } from '@/acy-dex-swap/utils';
import StakeHistoryTable from './StakeHistoryTable';
const { AcyTabPane } = AcyTabs;

export class Dao extends Component {
  state = {
    activeGraphData: graphSampleData,
    activeStakeInfoPanel: 0,
    startDate: new Date(),
    token1: SampleToken[0],
    token2: SampleToken[1],
    isModal1Visible: false,
    isModal2Visible: false,
    stake: 0,
    balance: 123456,
    balancePercentage: 0,
  };
  componentDidMount() {}

  changeGraphData(id = 0) {
    let activeGraphData = null;
    if (id === 0) activeGraphData = graphSampleData;
    else activeGraphData = graphSampleData2;
    this.setState({ activeGraphData });
  }

  updateStake(newStake) {
    let newStakeInt;
    if (newStake !== '') {
      newStakeInt = parseInt(newStake, 10);
    } else {
      newStakeInt = '';
    }
    if (newStakeInt === '' || !Number.isNaN(newStakeInt)) {
      this.setState({ ...this.state, stake: newStakeInt });
    }
  }

  updateBalancePercentage(percentage) {
    this.setState({
      ...this.state,
      stake: (this.state.balance * percentage) / 100,
      balancePercentage: percentage,
    });
  }

  render() {
    const {
      activeGraphData,
      startDate,
      token1,
      token2,
      isModal1Visible,
      isModal2Visible,
      stake,
      balance,
      balancePercentage,
    } = this.state;

    const CustomDatePickerInput = forwardRef(({ value, onClick }, ref) => (
      <button type="button" className={styles.datePickerInput} onClick={onClick} ref={ref}>
        {value}
      </button>
    ));

    const showModal1 = () => this.setState({ ...this.state, isModal1Visible: true });
    const showModal2 = () => this.setState({ ...this.state, isModal2Visible: true });
    const handleSelectToken1 = newToken =>
      this.setState({ ...this.state, token1: newToken, isModal1Visible: false });
    const handleSelectToken2 = newToken =>
      this.setState({ ...this.state, token2: newToken, isModal2Visible: false });
    const handleCancel1 = () => this.setState({ ...this.state, isModal1Visible: false });
    const handleCancel2 = () => this.setState({ ...this.state, isModal2Visible: false });

    const updateDate = (type, value) => {
      const newDate = new Date();
      if (type === 'week') newDate.setHours(newDate.getHours() + 24 * 7 * value);
      else if (type === 'month') newDate.setMonth(newDate.getMonth() + value);
      else if (type === 'year') newDate.setFullYear(newDate.getFullYear() + value);
      else return;
      this.setState({ ...this.state, startDate: newDate });
    };

    return (
      <PageHeaderWrapper>
        <div className={styles.createProposalContainer}>
          <button type="button" className={styles.createProposalButton}>
            Create Proposal
          </button>
        </div>
        <div className={styles.stakeSectionMain}>
          <div className={styles.chartSection}>
            <div className={styles.toggleChart}>
              <div
                onClick={() => {
                  this.changeGraphData(0);
                }}
              >
                ACY
              </div>
              <div
                style={{ marginLeft: 20 }}
                onClick={() => {
                  this.changeGraphData(1);
                }}
              >
                Reward
              </div>
            </div>
            <AcyLineChart
              backData={activeGraphData}
              data={activeGraphData}
              showXAxis
              showGradient
              showTootip
              lineColor="#e29227"
              bgColor="#29292c"
            />
          </div>
          <div className={styles.stakeSection}>
            <div className={styles.stakeContentWrapper}>
              <div className={styles.stakeUpperSection}>
                <div className={styles.amountRow}>
                  <div>Stake</div>
                  <div>
                    <input
                      type="text"
                      value={stake}
                      onChange={e => this.updateStake(e.target.value)}
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
                        onChange={e => this.updateBalancePercentage(e.target.value)}
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
                        selected={startDate}
                        onChange={date => this.setState({ ...this.state, startDate: date })}
                        customInput={<CustomDatePickerInput />}
                      />
                    </div>
                    <div className={styles.presetDurationContainer}>
                      <div
                        className={styles.presetDurationSelection}
                        onClick={() => updateDate('week', 1)}
                      >
                        1W
                      </div>
                      <div
                        className={styles.presetDurationSelection}
                        onClick={() => updateDate('month', 1)}
                      >
                        1M
                      </div>
                      <div
                        className={styles.presetDurationSelection}
                        onClick={() => updateDate('month', 3)}
                      >
                        3M
                      </div>
                      <div
                        className={styles.presetDurationSelection}
                        onClick={() => updateDate('month', 6)}
                      >
                        6M
                      </div>
                      <div
                        className={styles.presetDurationSelection}
                        onClick={() => updateDate('year', 1)}
                      >
                        1Y
                      </div>
                      <div
                        className={styles.presetDurationSelection}
                        onClick={() => updateDate('year', 4)}
                      >
                        4Y
                      </div>
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
        </div>
        <div>
          <StakeHistoryTable />
          <div style={{ paddingTop: '30px' }}>
            <div
              style={{ display: 'flex', justifyContent: 'end' }}
              className={stakeInfoStyles.stakeDetails}
            >
              <span
                onClick={() => {
                  this.setState({ activeStakeInfoPanel: 0 });
                }}
              >
                Allocation
              </span>
              <span
                onClick={() => {
                  this.setState({ activeStakeInfoPanel: 1 });
                }}
              >
                sACY
              </span>
              <span
                onClick={() => {
                  this.setState({ activeStakeInfoPanel: 2 });
                }}
              >
                Reward
              </span>
            </div>
            {this.state.activeStakeInfoPanel === 0 && (
              <div className={stakeInfoStyles.stakeInfoTab}>
                <AcyPieChart />
              </div>
            )}
            {this.state.activeStakeInfoPanel === 1 && (
              <div className={stakeInfoStyles.stakeInfoTab}>
                <AcyLineChart
                  title="Total stake"
                  backData={graphSampleData}
                  data={graphSampleData}
                  showXAxis
                  showGradient
                  showTootip
                  lineColor="#e29227"
                  bgColor="#29292c"
                />
              </div>
            )}

            {this.state.activeStakeInfoPanel === 2 && (
              <div className={stakeInfoStyles.stakeInfoTab}>
                <AcyLineChart
                  title="Reward"
                  backData={graphSampleData2}
                  data={graphSampleData2}
                  showXAxis
                  showTootip
                  showGradient
                  lineColor="#e29227"
                  bgColor="#29292c"
                />
              </div>
            )}
          </div>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Dao;
