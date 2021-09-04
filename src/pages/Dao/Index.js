/* eslint-disable lines-between-class-members */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable import/order */
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { graphSampleData, graphSampleData2 } from './SampleData';
import { Component } from 'react';
import { AcyLineChart } from '@/components/Acy';
import styles from './styles.less';

export class Dao extends Component {
  state = {
    activeGraphData: graphSampleData,
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
          <div className={styles.stakeSection}>Stake</div>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Dao;
