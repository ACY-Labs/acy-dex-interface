import React from 'react';
import styles from '@/pages/Farms/Farms.less';
import { AcyBarChart, AcyLineChart, AcyPeriodTime } from '@/components/Acy';

const DaoChart = ({ activeGraphId, activeGraphData, selectTopChart }) => {
  return (
    <div className={styles.chartSection}>
      <AcyPeriodTime
        onhandPeriodTimeChoose={selectTopChart}
        times={['ACY', 'Reward']}
        className={styles.switchChartsSelector}
      />
      {activeGraphId === 0 ? (
        <AcyBarChart data={activeGraphData} showXAxis />
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
  )
}

export default DaoChart
