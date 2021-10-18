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
  chainId,
  isMyFarms,
}) => {
  const [myChartId, setMyChartId] = useState(0);
  const [totalChartId, setTotalChartId] = useState(0);
  const [myChartData, setMyChartData] = useState(graphSampleData);
  const [totalChartData, setTotalChartData] = useState(graphSampleData);

  const changeGraphData = (id = 0, chartSetter) => {
    if (id === 0) chartSetter(graphSampleData);
    else chartSetter(graphSampleData2);
  };

  const selectTopChart = pt => {
    const functionDict = {
      'My ACY': () => {
        changeGraphData(0, setMyChartData);
        setMyChartId(0);
      },
      'My Reward': () => {
        changeGraphData(1, setMyChartData);
        setMyChartId(1);
      },
      'Total ACY': () => {
        changeGraphData(0, setTotalChartData);
        setTotalChartId(0);
      },
      'Total Reward': () => {
        changeGraphData(1, setTotalChartData);
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
  //       '0x8c2a011ee757C78eB3570ed4e63bD86d64399b99',
  //       '0xf132Fdd642Afa79FDF6C1B77e787865C652eC824',
  //       library,
  //       account
  //     );
  //   },
  //   [library, account]
  // );

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
                poolId={content.poolId}
                stakedTokenAddr={content.lpTokens}
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
                selectedTable={selectedTable}
                account={account}
                library={library}
                chainId={chainId}
                isMyFarms={isMyFarms}
              />
            );
          })}
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
            pendingReward={[{ token: 'ACY', amount: 0 }]}
            walletConnected={walletConnected}
            connectWallet={connectWallet}
            isMyFarms={isMyFarms}
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
      <div
        className={styles.tableFooterContainer}
        onClick={() => setRowNumber(rowNumber + 5)}
        hidden={!hideDao}
      >
        More
      </div>
    </div>
  );
};

export default FarmsTable;
