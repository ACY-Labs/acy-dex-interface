import React, { useState } from 'react';
import styles from '@/pages/Farms/Farms.less';
import FarmsTableRow from '@/pages/Farms/FarmsTableRow';
import FarmsTableHeader from '@/pages/Farms/FarmsTableHeader';
import { graphSampleData, graphSampleData2 } from '@/pages/Dao/sample_data/SampleData';
import DaoChart from './DaoChart';
import AcyIcon from '@/assets/icon_acy.svg'

const FarmsTable = (
  {
    tableRow,
    onRowClick,
    tableTitle,
    tableSubtitle,
    rowNumber,
    setRowNumber,
    hideDao,
    selectedTable,
    tokenFilter,
    setTokenFilter,
    walletConnected,
    connectWallet,
    library,
    account,
  }
) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const hideModal = () => setIsModalVisible(false)
  const showModal = () => setIsModalVisible(true)
  const [myChartId, setMyChartId] = useState(0)
  const [totalChartId, setTotalChartId] = useState(0)
  const [myChartData, setMyChartData] = useState(graphSampleData)
  const [totalChartData, setTotalChartData] = useState(graphSampleData)

  const changeGraphData = (id = 0, chartSetter) => {
    if (id === 0) chartSetter(graphSampleData)
    else chartSetter(graphSampleData2)
  }

  const selectTopChart = (pt) => {
    const functionDict = {
      'My ACY': () => {
        changeGraphData(0, setMyChartData);
        setMyChartId(0)
      },
      'My Reward': () => {
        changeGraphData(1, setMyChartData);
        setMyChartId(1)
      },
      'Total ACY': () => {
        changeGraphData(0, setTotalChartData);
        setTotalChartId(0)
      },
      'Total Reward': () => {
        changeGraphData(1, setTotalChartData);
        setTotalChartId(1)
      },
    }
    functionDict[pt]();
  }

  return (
    <div className={styles.tableContainer}>
      <FarmsTableHeader
        tableTitle={tableTitle}
        tableSubtitle={tableSubtitle}
        selectedTable={selectedTable}
        tokenFilter={tokenFilter}
        setTokenFilter={setTokenFilter}
      />
      {hideDao ? (
        <div className={styles.tableBodyContainer}>
          {tableRow.slice(0, rowNumber).map((content, index) => (
            <FarmsTableRow
              key={index}
              index={index}
              lpTokens={content.lpTokens}
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
              connectWallet={connectWallet}
              showModal={showModal}
              hideModal={hideModal}
              isModalVisible={isModalVisible}
              selectedTable={selectedTable}
              account={account}
              library={library}
            />
          ))}
        </div>
      ) : (
        <div className={styles.tableBodyContainer}>
          <FarmsTableRow
            token1="ACY"
            token1Logo={AcyIcon}
            token2={null}
            token2Logo={null}
            totalApr="12345"
            tvl="12345"
            hidden={false}
            pendingReward={[{token: 'ACY', amount: 0}]}
            walletConnected={walletConnected}
            connectWallet={connectWallet}
            showModal={showModal}
            hideModal={hideModal}
            isModalVisible={isModalVisible}
            hideArrow
          />
          <div>
            <div className={styles.stakeSectionMain}>
              <DaoChart
                activeGraphId={myChartId}
                activeGraphData={myChartData}
                selectTopChart={selectTopChart}
                selection={['My ACY', 'My Reward']}
              />
              <DaoChart
                activeGraphId={totalChartId}
                activeGraphData={totalChartData}
                selectTopChart={selectTopChart}
                selection={['Total ACY', 'Total Reward']}
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
