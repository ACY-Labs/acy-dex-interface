import React, { useEffect, useState } from 'react';
import styles from '@/pages/Farms/Farms.less';
import farmsTableContent from './FarmsTableContent'
import FarmsTableRow from '@/pages/Farms/FarmsTableRow';
import FarmsTableHeader from '@/pages/Farms/FarmsTableHeader';
import { AcyBarChart, AcyLineChart, AcyPeriodTime } from '@/components/Acy';
import StakeSection from '@/pages/Dao/components/StakeSection';
import { graphSampleData, graphSampleData2 } from '@/pages/Dao/sample_data/SampleData';
import DaoChart from './DaoChart';

const FarmsTable = ({ tableRow, onRowClick, tableTitle, tableSubtitle, rowNumber, setRowNumber, hideDao }) => {
  const [walletConnected, setWalletConnected] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const hideModal = () => setIsModalVisible(false)
  const showModal = () => setIsModalVisible(true)
  const [activeGraphId, setActiveGraphId] = useState(0)
  const [activeGraphData, setActiveGraphData] = useState(graphSampleData)

  const changeGraphData = (id = 0) => {
    if (id === 0) setActiveGraphData(graphSampleData)
    else setActiveGraphData(graphSampleData2)
  }

  const selectTopChart = (pt) => {
    const functionDict = {
      'ACY': () => {
        changeGraphData(0);
        setActiveGraphId(0)
      },
      'Reward': () => {
        changeGraphData(1);
        setActiveGraphId(1)
      }
    }
    functionDict[pt]();
  }

  return (
    <div className={styles.tableContainer}>
      <FarmsTableHeader
        tableTitle={tableTitle}
        tableSubtitle={tableSubtitle}
      />
      {hideDao ? (
        <div className={styles.tableBodyContainer}>
          {tableRow.slice(0, rowNumber).map((content, index) => (
            <FarmsTableRow
              key={index}
              token1={content.token1}
              token1Logo={content.token1Logo}
              token2={content.token2}
              token2Logo={content.token2Logo}
              totalApr={content.totalApr}
              tvl={content.tvl}
              hidden={content.hidden}
              rowClickHandler={() => onRowClick(index)}
              pendingReward={content.pendingReward}
              walletConnected={walletConnected}
              setWalletConnected={setWalletConnected}
              showModal={showModal}
              hideModal={hideModal}
              isModalVisible={isModalVisible}
            />
          ))}
        </div>
      ) : (
        <div className={styles.tableBodyContainer}>
          <FarmsTableRow
            token1="ACY"
            token1Logo={tableRow[0].token1Logo}
            token2Logo={tableRow[0].token1Logo}
            totalApr="12345"
            tvl="12345"
            hidden={false}
            pendingReward={[{token: 'ACY', amount: 0}]}
            walletConnected={walletConnected}
            setWalletConnected={setWalletConnected}
            showModal={showModal}
            hideModal={hideModal}
            isModalVisible={isModalVisible}
          />
          <div>
            <div className={styles.stakeSectionMain}>
              <DaoChart
                activeGraphId={activeGraphId}
                activeGraphData={activeGraphData}
                selectTopChart={selectTopChart}
              />
              <DaoChart
                activeGraphId={activeGraphId}
                activeGraphData={activeGraphData}
                selectTopChart={selectTopChart}
              />
            </div>
          </div>
        </div>
      )}
      <div className={styles.tableFooterContainer} onClick={() => setRowNumber(rowNumber + 5)} hidden={!hideDao}>
        More
      </div>
    </div>
  )
}

export default FarmsTable
