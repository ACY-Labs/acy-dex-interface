import React, { useEffect, useState } from 'react';
import styles from '@/pages/Farms/Farms.less';
import farmsTableContent from './FarmsTableContent'
import FarmsTableRow from '@/pages/Farms/FarmsTableRow';
import FarmsTableHeader from '@/pages/Farms/FarmsTableHeader';

const FarmsTable = () => {
  const [searchInput, setSearchInput] = useState('')
  const [tableRow, setTableRow] = useState(farmsTableContent.map((row) => {
    const prevRow = { ...row }
    prevRow.hidden = true
    return prevRow
  }))
  const onRowClick = (index) => setTableRow((prevState) => {
    const prevTableRow = [ ...prevState ]
    prevTableRow[index].hidden = !prevTableRow[index].hidden
    return prevTableRow
  })

  useEffect(() => console.log(tableRow), [tableRow])

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
            token1Reward={content.token1Reward}
            token2={content.token2}
            token2Logo={content.token2Logo}
            token2Reward={content.token2Reward}
            totalApr={content.totalApr}
            tvl={content.tvl}
            hidden={content.hidden}
            rowClickHandler={() => onRowClick(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default FarmsTable
