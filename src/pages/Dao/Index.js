/* eslint-disable lines-between-class-members */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable import/order */
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { graphSampleData, graphSampleData2 } from './sample_data/SampleData';
import React, { Component, forwardRef } from 'react';
import { AcyLineChart, AcyPieChart } from '@/components/Acy';
import styles from './styles.less';
import stakeInfoStyles from './styles2.less';
import 'react-datepicker/dist/react-datepicker.css';
import SampleToken from './sample_data/SampleToken';
import StakeHistoryTable from './components/StakeHistoryTable';
import StakeSection from '@/pages/Dao/components/StakeSection';

export class Dao extends Component {
  state = {
    activeGraphData: graphSampleData,
    activeStakeInfoPanel: 0,
  };

  componentDidMount() {}

  changeGraphData(id = 0) {
    let activeGraphData = null;
    if (id === 0) activeGraphData = graphSampleData;
    else activeGraphData = graphSampleData2;
    this.setState({ activeGraphData });
  }

  render() {
    const { activeGraphData } = this.state;

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
              lineColor="#e29227"
              bgColor="#29292c"
            />
          </div>
          <StakeSection />
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
                  backData={activeGraphData}
                  data={activeGraphData}
                  showXAxis
                  showGradient
                  lineColor="#e29227"
                  bgColor="#29292c"
                />
              </div>
            )}

            {this.state.activeStakeInfoPanel === 2 && (
              <div className={stakeInfoStyles.stakeInfoTab}>
                <AcyLineChart
                  title="Reward"
                  backData={activeGraphData}
                  data={activeGraphData}
                  showXAxis
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
