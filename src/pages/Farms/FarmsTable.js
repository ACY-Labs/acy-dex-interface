import React, { useState, useEffect } from 'react';
import styles from '@/pages/Farms/Farms.less';
import FarmsTableRow from '@/pages/Farms/FarmsTableRow';
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
  // refreshPool

}) => {
  const [myChartId, setMyChartId] = useState(0);
  const [totalChartId, setTotalChartId] = useState(0);
  const [totalChartData, setTotalChartData] = useState(harvestAcy.totalAcy);

  const getMyChart = () => {
    if(myChartId == 0) return harvestAcy.myAcy;
    return harvestAcy.myAll;
  }
  const getTotalChart = () =>{
    if(totalChartId==0) return harvestAcy.totalAcy;
    return harvestAcy.totalAll
  }

  const selectTopChart = pt => {
    const functionDict = {
      'My ACY': () => {
        setMyChartId(0);
      },
      'My Reward': () => {
        setMyChartId(1);
      },
      'Total ACY': () => {
        setTotalChartId(0);
      },
      'Total Reward': () => {
        setTotalChartId(1);
      },
    };
    functionDict[pt]();
  };

  // useEffect(
  //   () => {
  //     if (!account || !library) return;
  //     console.log(library, account);
  //     disapproveTokenWithSpender(
  //       '0xa6983722023c67ff6938ff2adc1d7fc61b5966f3',
  //       '0xd9145CCE52D386f254917e481eB44e9943F39138',
  //       library,
  //       account
  //     );
  //   },
  //   [library, account]
  // );
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
      {hideDao ? (
        <div className={styles.tableBodyContainer}>
          {tableRow.slice(0, rowNumber).map((content, index) => {
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
                userRewards={content.userRewards}
                stakeData={content.stakeData}
                hasUserPosition={content.hasUserPosition}
                refreshHarvestHistory={refreshHarvestHistory}
                searchInput={searchInput}
                selectedTable={selectedTable}
                tokenFilter={tokenFilter}
                // refreshPool={refreshPool}
              />
            );
          })}
        </div>
      ) : (
        <div className={styles.tableBodyContainer}>
          <FarmsTableRow
            content={daoContent}
            token1="ACY"
            token1Logo={AcyIcon}
            token2={null}
            token2Logo={null}
            totalApr="12345"
            tvl="12345"
            pendingReward={[{ token: 'ACY', amount: 0 }]}
            walletConnected={walletConnected}
            connectWallet={connectWallet}
            isMyFarms={isMyFarms}
            hideArrow
            harvestHistory={harvestAcy}
            refreshHarvestHistory={refreshHarvestHistory}
            searchInput={searchInput}
            selectedTable={selectedTable}
            tokenFilter={tokenFilter}
            dao={!hideDao}
          />
          <div>
            <div className={styles.stakeSectionMain}>
              <DaoChart
                activeGraphId={myChartId}
                activeGraphData={getMyChart()}
                selectTopChart={selectTopChart}
                selection={['My ACY', 'My Reward']}
              />
              <DaoChart
                activeGraphId={totalChartId}
                activeGraphData={getTotalChart()}
                selectTopChart={selectTopChart}
                selection={['Total ACY', 'Total Reward']}
              />
            </div>
          </div>
        </div>
      )}
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
