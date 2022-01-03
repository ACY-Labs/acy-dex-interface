import React, { useState, useEffect } from 'react';
import styles from '@/pages/Farms/Farms.less';
import FarmsTableRow from '@/pages/Farms/FarmsTableRow';
import DaoTableRow from '@/pages/Farms/DaoTableRow';
import FarmsTableHeader from '@/pages/Farms/FarmsTableHeader';
import { graphSampleData, graphSampleData2 } from '@/pages/Dao/sample_data/SampleData';
import DaoChart from './DaoChart';
import AcyIcon from '@/assets/icon_acy.svg';
import { approveTokenWithSpender, disapproveTokenWithSpender } from '@/acy-dex-swap/utils';

const FarmsTable = ({
  tableRow,
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
  chainId,
  isMyFarms,
  harvestAcy,
  refreshHarvestHistory,
  searchInput,
  balanceAcy,
  isLoading,
  activeEnded
  // refreshPool

}) => {
  const [myChartId, setMyChartId] = useState(0);
  const [totalChartId, setTotalChartId] = useState(0);
  // const [myChartData, setMyChartData] = useState(balanceAcy.myAcy);
  // const [allChartData, setAllChartData] = useState(balanceAcy.totalAcy);
  const [myChartData, setMyChartData] = useState();
  const [allChartData, setAllChartData] = useState();

  const getMyChart = () => {
    if(myChartId == 0) return balanceAcy.myAcy;
    return harvestAcy.myAll;
  }
  const getTotalChart = () =>{
    if(totalChartId==0) return balanceAcy.totalAcy;
    return harvestAcy.totalAll
  }
  useEffect(
    () => {
      setMyChartId(0);
      setTotalChartId(0);
   },
   [hideDao]
 );
   

  const selectTopChart = pt => {
    const functionDict = {
      'My sACY': () => {
        setMyChartId(0);
        setMyChartData(balanceAcy.myAcy);
      },
      'My Reward': () => {
        setMyChartId(1);
        setMyChartData(harvestAcy.myAll);
      },
      'Total sACY': () => {
        setTotalChartId(0);
        setAllChartData(balanceAcy.totalAcy);
      },
      'Total Reward': () => {
        setTotalChartId(1);
        setAllChartData(harvestAcy.totalAll);
      },
    };
    functionDict[pt]();
  };

  const daoContent = {
    token1:"ACY",
    token1Logo:AcyIcon,
    token2: null,
    token2Logo:null,
    totalApr:"12345",
    tvl:'12345',
    pendingReward:[{ token: 'ACY', amount: 0 }],
    hasUserPosition:true,
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
      {/* {hideDao ? ( */}
        <div className={styles.tableBodyContainer}>
          {tableRow.map((content, index) => {
            return (
              <FarmsTableRow
                key={index}
                index={index}
                walletConnected={walletConnected}
                connectWallet={connectWallet}
                selectedTable={selectedTable}
                account={account}
                library={library}
                chainId={chainId}
                isMyFarms={isMyFarms}
                harvestHistory={harvestAcy}
                content={content}
                poolId={content.poolId}
                stakedTokenAddr={content.lpTokens}
                token1={content.token1}
                token1Logo={content.token1Logo}
                token2={content.token2}
                token2Logo={content.token2Logo}
                totalApr={content.totalApr}
                tvl={content.tvl}
                hidden={content.hidden}
                pendingReward={content.pendingReward}
                stakeData={content.stakeData}
                hasUserPosition={content.hasUserPosition}
                refreshHarvestHistory={refreshHarvestHistory}
                searchInput={searchInput}
                selectedTable={selectedTable}
                tokenFilter={tokenFilter}
                dao={!hideDao}
                isLoading={isLoading}
                activeEnded={activeEnded}
                // refreshPool={refreshPool}
              />
            );
          })}
          { !hideDao &&(
            <div className={styles.stakeSectionMain} hidden={hideDao}>
              {/* <DaoChart
                activeGraphId={myChartId}
                activeGraphData={getMyChart()}
                selectTopChart={selectTopChart}
                selection={['My sACY', 'My Reward']}
              />
              <DaoChart
                activeGraphId={totalChartId}
                activeGraphData={getTotalChart()}
                selectTopChart={selectTopChart}
                selection={['Total sACY', 'Total Reward']}
              /> */}
            </div>
          )}
              
        </div>
      <div
        className={styles.tableFooterContainer}
        onClick={() => setRowNumber(rowNumber + 5)}
        hidden={!hideDao || rowNumber > tableRow.length}
      >
        More
      </div>
    </div>
  );
};

export default FarmsTable;
