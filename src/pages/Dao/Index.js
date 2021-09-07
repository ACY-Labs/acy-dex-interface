/* eslint-disable lines-between-class-members */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable import/order */
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { graphSampleData, graphSampleData2 } from './sample_data/SampleData';
import React, { Component, forwardRef } from 'react';
import { AcyLineChart, AcyBarChart, AcyPieChart } from '@/components/Acy';
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
    activeGraphId: 0,
  };

  componentDidMount() {}

  changeGraphData(id = 0) {
    let activeGraphData = null;
    if (id === 0) activeGraphData = graphSampleData;
    else activeGraphData = graphSampleData2;
    this.setState({ activeGraphData });
  }

  render() {
    const { activeGraphData, activeStakeInfoPanel, activeGraphId } = this.state;

    return (
      <PageHeaderWrapper>
        <div className={styles.createProposalContainer}>
          <button type="button" className={styles.createProposalButton}>
            Proposal
          </button>
        </div>
        <div className={styles.stakeSectionMain}>
          <div className={styles.chartSection}>
            <div className={styles.toggleChart}>
              <div
                onClick={() => {
                  this.changeGraphData(0);
                  this.setState({ activeGraphId: 0 });
                }}
                style={{ color: activeGraphId === 0 ? '#eb5c20' : '#b5b5b6' }}
              >
                ACY
              </div>
              <div
                onClick={() => {
                  this.changeGraphData(1);
                  this.setState({ activeGraphId: 1 });
                }}
                style={{ marginLeft: 20, color: activeGraphId === 1 ? '#eb5c20' : '#b5b5b6' }}
              >
                Reward
              </div>
            </div>
            {activeGraphId === 0 ? (
              <AcyBarChart backData={activeGraphData} />
            ) : (
              <AcyLineChart
                backData={activeGraphData}
                data={activeGraphData}
                showXAxis
                showGradient
                showTootip
                lineColor="#e29227"
                bgColor="#29292c"
              />
            )}
          </div>
          <StakeSection />
        </div>
        <div className={styles.tableChartContainer}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StakeHistoryTable />
          </div>
          <div className={styles.chartContainer}>
            <div
              style={{ display: 'flex', justifyContent: 'end', marginBottom: 30 }}
              className={stakeInfoStyles.stakeDetails}
            >
              <span
                onClick={() => {
                  this.setState({ activeStakeInfoPanel: 0 });
                }}
                style={{ color: activeStakeInfoPanel === 0 ? '#eb5c20' : '#b5b5b6' }}
              >
                Allocation
              </span>
              <span
                onClick={() => {
                  this.setState({ activeStakeInfoPanel: 1 });
                }}
                style={{ color: activeStakeInfoPanel === 1 ? '#eb5c20' : '#b5b5b6' }}
              >
                sACY
              </span>
              <span
                onClick={() => {
                  this.setState({ activeStakeInfoPanel: 2 });
                }}
                style={{ color: activeStakeInfoPanel === 2 ? '#eb5c20' : '#b5b5b6' }}
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
