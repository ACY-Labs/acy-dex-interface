import styles from '@/pages/Farms/Farms.less';
import { AcyBarChart, AcyLineChart, AcyPeriodTime } from '@/components/Acy';
import React, { useEffect, useState } from 'react';
const DaoChart = ({ 
  activeGraphId, 
  activeGraphData, 
  selectTopChart, 
  selection }) => 
{ 
  const [holdIndex, setHoldIndex] = useState(activeGraphData.length - 1);
  const onBarGraphHover = (newData, newIndex) => {
    setHoldIndex(newIndex);
    // setSelectedData(newData[newIndex]);
  };
  const formatValue = (value) => {
    if(value > 1e12) {
      return (value/1e12).toFixed(1).toString() + "T";ßƒƒ
    } else if(value > 1e9) {
      return (value/1e9).toFixed(1).toString() + "B";
    } else if(value > 1e6) {
      return (value/1e6).toFixed(1).toString() + "M";
    } else {
      return value.toFixed(1);
    }

  }

  return (
    <div className={styles.chartSection}>
      <AcyPeriodTime
        onhandPeriodTimeChoose={selectTopChart}
        times={selection}
        className={styles.switchChartsSelector}
      />
      
        <div className={styles.chartSectionMain}>
          <div className={styles.graphStats}>
            <div className={styles.statName}>{selection[activeGraphId]}</div>
            <div className={styles.statValue}>
              {activeGraphId === 0 ? "":"$ "}
              {formatValue(activeGraphData[holdIndex][1])}
              {activeGraphId === 0 ? " ACY":""}</div>
            <div className={styles.statName}>{activeGraphData[holdIndex][0]}</div>
          </div>
          <div className={styles.chartWrapper}>
          {activeGraphId === 0 ? (
            <AcyBarChart
              data={activeGraphData}
              showXAxis
              barColor="#1d5e91"
              onHover={onBarGraphHover}
            />) : (
              <AcyLineChart
                backData={activeGraphData}
                data={activeGraphData}
                showXAxis={true}
                showGradient={true}
                showTooltip
                lineColor="#1d5e91"
                bgColor="#29292c"
                onHover={onBarGraphHover}
              />
            )}
          </div>
      </div>
      
    </div>
  )
}

export default DaoChart
