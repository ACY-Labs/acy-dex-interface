import React, { useEffect, useState } from 'react';
import styles from '@/pages/Farms/Farms.less';
import farmsTableContent from './FarmsTableContent'
import FarmsTableRow from '@/pages/Farms/FarmsTableRow';
import FarmsTableHeader from '@/pages/Farms/FarmsTableHeader';

const FarmsTable = ({ tableRow, onRowClick, tableTitle, tableSubtitle }) => {
  const [walletConnected, setWalletConnected] = useState(true) // todo change
  const [isModalVisible, setIsModalVisible] = useState(true) // todo change

  const stakeLp = () => {

  }

  const hideModal = () => setIsModalVisible(false)
  const showModal = () => setIsModalVisible(true)

  return (
    <div className={styles.tableContainer}>
      <FarmsTableHeader
        tableTitle={tableTitle}
        tableSubtitle={tableSubtitle}
      />
      <div className={styles.tableBodyContainer}>
        {tableRow.map((content, index) => (
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
    </div>
  )
}

export default FarmsTable
