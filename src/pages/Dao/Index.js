/* eslint-disable lines-between-class-members */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable import/order */
import { AcyBarChart, AcyLineChart, AcyPeriodTime, AcyPieChart } from '@/components/Acy';
import { AcySmallButtonGroup } from '@/components/AcySmallButton';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StakeSection from '@/pages/Dao/components/StakeSection';
import React, { Component } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import StakeHistoryTable from './components/StakeHistoryTable';
import { graphSampleData, graphSampleData2 } from './sample_data/SampleData';
import styles from './styles.less';
import stakeInfoStyles from './styles2.less';

const Dao = ({
  acy_history
}) => {

  const [activeGraphData,setActiveGraphData] = useState(graphSampleData);
  const [activeStakeInfoPanel,setActiveStakeInfoPanel] = useState(1);
  const [activeGraphId,setActiveGraphId] = useState(0);
  // state = {
  //   activeGraphData: graphSampleData,
  //   activeStakeInfoPanel: 1,
  //   activeGraphId: 0,
  // };
  

  const changeGraphData = (id = 0) =>{
    let activeGraphData = null;
    if (id === 0) activeGraphData = graphSampleData;
    else activeGraphData = graphSampleData2;
    this.setState({ activeGraphData });
  };

  const selectTopChart = (pt) => {
    let functionDict = {
        'ACY': () => {
          this.changeGraphData(0);
          this.setState({ activeGraphId: 0 });
        }
      ,
        'Reward': () => {
          this.changeGraphData(1);
          this.setState({ activeGraphId: 1 });
        }
    }
    functionDict[pt]();
  };

  const selectGraph = (pt) => {
    let functionDict = {
      'Volume' : () => this.setState({ activeStakeInfoPanel: 0 }),
      'TVL' : ()=> this.setState({ activeStakeInfoPanel: 1 }),
      'Price' : () => this.setState({ activeStakeInfoPanel: 2 })
    }

    functionDict[pt]();

  };
  return (
    <PageHeaderWrapper>
      <div className={styles.createProposalContainer}>
        <button type="button" className={styles.createProposalButton}>
          Proposal
        </button>
      </div>
      <div className={styles.stakeSectionMain}>
        <div className={styles.chartSection}>
          <AcyPeriodTime
            onhandPeriodTimeChoose={this.selectTopChart}
            times={['ACY', 'Reward']}
            className={styles.switchChartsSelector}
          />
          {activeGraphId === 0 ? (
            <AcyBarChart data={activeGraphData} showXAxis/>
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
          <AcyPeriodTime
              onhandPeriodTimeChoose={this.selectGraph}
              times={['TVL', 'Price']}
              className={styles.contentChartsSelector}
          />
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

export default Dao;
