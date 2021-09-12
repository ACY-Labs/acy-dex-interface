/* eslint-disable lines-between-class-members */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable import/order */
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { graphSampleData, graphSampleData2 } from './sample_data/SampleData';
import React, { Component, forwardRef } from 'react';
import { AcyLineChart, AcyBarChart, AcyPieChart, AcySmallButton } from '@/components/Acy';
import styles from './styles.less';
import stakeInfoStyles from './styles2.less';
import 'react-datepicker/dist/react-datepicker.css';
import SampleToken from './sample_data/SampleToken';
import StakeHistoryTable from './components/StakeHistoryTable';
import StakeSection from '@/pages/Dao/components/StakeSection';
import styles2 from '../Market/styles.less';
import { AcySmallButtonGroup } from '@/components/AcySmallButton';

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
            <AcySmallButtonGroup
              activeButton={activeGraphId}
              buttonList={[
                [
                  'ACY',
                  () => {
                    this.changeGraphData(0);
                    this.setState({ activeGraphId: 0 });
                  }
                ],
                [
                  'Reward',
                  () => {
                    this.changeGraphData(1);
                    this.setState({ activeGraphId: 1 });
                  }
                ],
              ]}
              containerClass={styles.switchChartsSelector}
              theme="#c6224e"
            />
            {activeGraphId === 0 ? (
              <AcyBarChart backData={activeGraphData} />
            ) : (
              <AcyLineChart
                backData={activeGraphData}
                data={activeGraphData}
                showXAxis
                showGradient
                showTooltip
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
            <AcySmallButtonGroup
              activeButton={activeStakeInfoPanel}
              buttonList={[
                ['Volume', () => this.setState({ activeStakeInfoPanel: 0 })],
                ['TVL', () => this.setState({ activeStakeInfoPanel: 1 })],
                ['Price', () => this.setState({ activeStakeInfoPanel: 2 })],
              ]}
              containerClass={styles.contentChartsSelector}
              theme="#c6224e"
            />
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
