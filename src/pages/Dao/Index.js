/* eslint-disable lines-between-class-members */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable import/order */
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { graphSampleData, graphSampleData2 } from './SampleData';
import { Component, forwardRef } from 'react';
import { AcyCuarrencyCard, AcyLineChart } from '@/components/Acy';
import styles from './styles.less';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import SampleToken from './SampleToken';
import TokenSelectionModal from '@/pages/Dao/TokenSelectionModal';

export class Dao extends Component {
  state = {
    activeGraphData: graphSampleData,
    startDate: new Date(),
    token1: SampleToken[0],
    token2: SampleToken[1],
    isModal1Visible: false,
    isModal2Visible: false,
    stake: 0,
  };
  componentDidMount() {}

  changeGraphData(id = 0) {
    let activeGraphData = null;
    if (id === 0) activeGraphData = graphSampleData;
    else activeGraphData = graphSampleData2;
    this.setState({ activeGraphData });
  }

  updateStake(newStake) {
    const newStakeInt = parseInt(newStake, 10)
    if (!Number.isNaN(newStakeInt)) {
      this.setState({...this.state, stake: 'hello'})
    }
  }

  render() {
    const { activeGraphData, startDate, token1, token2, isModal1Visible, isModal2Visible, stake } = this.state;

    const CustomDatePickerInput = forwardRef(({ value, onClick }, ref) => (
      <button type="button" className={styles.datePickerInput} onClick={onClick} ref={ref}>
        {value}
      </button>
    ));

    const showModal1 = () => this.setState({...this.state, isModal1Visible: true})
    const showModal2 = () => this.setState({...this.state, isModal2Visible: true})
    const handleSelectToken1 = (newToken) => this.setState({...this.state, token1: newToken, isModal1Visible: false})
    const handleSelectToken2 = (newToken) => this.setState({...this.state, token2: newToken, isModal2Visible: false})
    const handleCancel1 = () => this.setState({...this.state, isModal1Visible: false})
    const handleCancel2 = () => this.setState({...this.state, isModal2Visible: false})

    const updateDate = (type, value) => {
      const newDate = new Date()
      if (type === 'week') newDate.setHours(newDate.getHours() + (24 * 7 * value))
      else if (type === 'month') newDate.setMonth(newDate.getMonth() + value)
      else if(type === 'year') newDate.setFullYear(newDate.getFullYear() + value)
      else return
      this.setState({...this.state, startDate: newDate})
    }

    return (
      <PageHeaderWrapper>
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
                    <input type="text" value={stake} onChange={(e) => this.updateStake(e.target.value)} />
                  </div>
                </div>
                <div className={styles.balanceRow}>
                  <div>Balance:</div>
                  <div>43765 ACY</div>
                </div>
                <div className={styles.lockTimeRow}>
                  <div className={styles.lockTimeRowTitle}>Lock Time:</div>
                  <div className={styles.dateSelectionContainer}>
                    <div className={styles.datePickerContainer}>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => this.setState({...this.state, startDate: date})}
                        customInput={<CustomDatePickerInput />}
                      />
                    </div>
                    <div className={styles.presetDurationContainer}>
                      <div className={styles.presetDurationSelection} onClick={() => updateDate('week', 1)}>1W</div>
                      <div className={styles.presetDurationSelection} onClick={() => updateDate('month', 1)}>1M</div>
                      <div className={styles.presetDurationSelection} onClick={() => updateDate('month', 3)}>3M</div>
                      <div className={styles.presetDurationSelection} onClick={() => updateDate('month', 6)}>6M</div>
                      <div className={styles.presetDurationSelection} onClick={() => updateDate('year', 1)}>1Y</div>
                      <div className={styles.presetDurationSelection} onClick={() => updateDate('year', 4)}>4Y</div>
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
                        <img
                          src={token1.logoURI}
                          alt={token1.symbol}
                          className={styles.tokenImg}
                        />
                        <p className={styles.tokenSymbol}>{token1.symbol}</p>
                      </div>
                      <TokenSelectionModal isModalVisible={isModal1Visible} handleCancel={handleCancel1} handleClick={handleSelectToken1} />
                      <div className={styles.tokenPercentage}>
                        <input type="text" className={styles.tokenPercentageInput} />
                      </div>
                    </div>
                    <div className={styles.tokenSelection}>
                      <div className={styles.tokenDropdown} onClick={showModal2}>
                        <img
                          src={token2.logoURI}
                          alt={token2.symbol}
                          className={styles.tokenImg}
                        />
                        <p className={styles.tokenSymbol}>{token2.symbol}</p>
                      </div>
                      <TokenSelectionModal isModalVisible={isModal2Visible} handleCancel={handleCancel2} handleClick={handleSelectToken2} />
                      <div className={styles.tokenPercentage}>
                        <input type="text" className={styles.tokenPercentageInput} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <button type="button" className={styles.stakeSubmitButton}>Stake</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Dao;
