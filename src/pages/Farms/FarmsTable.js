import React, { useEffect, useState } from 'react';
import styles from '@/pages/Farms/Farms.less';
import farmsTableContent from './FarmsTableContent'
import FarmsTableRow from '@/pages/Farms/FarmsTableRow';
import FarmsTableHeader from '@/pages/Farms/FarmsTableHeader';

const FarmsTable = ({ tableRow, onRowClick }) => {
  const [searchInput, setSearchInput] = useState('')

  return (
    <div className={styles.tableContainer}>
      <FarmsTableHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
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
          />
        ))}
      </div>
    </div>
  )
}

export default FarmsTable
