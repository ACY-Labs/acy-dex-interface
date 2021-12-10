import React from 'react';
import styles from '@/pages/Farms/Farms.less';
import { AcyBarChart, AcyLineChart, AcyPeriodTime } from '@/components/Acy';

const DaoChart = ({ activeGraphId, activeGraphData, selectTopChart, selection }) => {
  return (
    <div className={styles.chartSection}>
      <AcyPeriodTime
        onhandPeriodTimeChoose={selectTopChart}
        times={selection}
        className={styles.switchChartsSelector}
      />
      {activeGraphId === 0 ? (
        <>
        <AcyBarChart 
        data={activeGraphData} 
        showXAxis={true}
        barColor="#1d5e91" />
        </>
      ) : (
        <AcyLineChart
          backData={activeGraphData}
          data={activeGraphData}
          showXAxis={true}
          showGradient={true}
          showTooltip
          lineColor="#1d5e91"
          bgColor="#29292c"
        />
      )}
    </div>
  )
}

export default DaoChart
