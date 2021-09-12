import React, { useEffect, useState } from 'react';
import styles from '@/pages/Farms/Farms.less';
import farmsTableContent from './FarmsTableContent'
import FarmsTableRow from '@/pages/Farms/FarmsTableRow';
import FarmsTableHeader from '@/pages/Farms/FarmsTableHeader';

const FarmsTable = ({ tableRow, onRowClick, tableTitle, tableSubtitle, rowNumber, setRowNumber }) => {
  const [walletConnected, setWalletConnected] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const hideModal = () => setIsModalVisible(false)
  const showModal = () => setIsModalVisible(true)

  return (
    <div className={styles.tableContainer}>
      <FarmsTableHeader
        tableTitle={tableTitle}
        tableSubtitle={tableSubtitle}
      />
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
      <div className={styles.tableFooterContainer} onClick={() => setRowNumber(rowNumber + 5)}>
        More
      </div>
    </div>
  )
}

export default FarmsTable
