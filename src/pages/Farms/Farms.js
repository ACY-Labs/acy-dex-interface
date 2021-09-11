import React, { useState } from 'react';
import styles from './Farms.less'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FarmsTable from './FarmsTable';
import farmsTableContent from '@/pages/Farms/FarmsTableContent';

const Farms = () => {
  const INITIAL_TABLE_DATA = farmsTableContent.map((row) => {
    const prevRow = { ...row }
    prevRow.hidden = true
    return prevRow
  })

  const [selectedTable, setSelectedTable] = useState(0)
  const [tableRow, setTableRow] = useState(INITIAL_TABLE_DATA)

  const onRowClick = (index) => setTableRow((prevState) => {
    const prevTableRow = [ ...prevState ]
    prevTableRow[index].hidden = !prevTableRow[index].hidden
    return prevTableRow
  })

  const onAllToggleButtonClick = () => {
    setSelectedTable(0)
    setTableRow(INITIAL_TABLE_DATA)
  }

  const onAcyToggleButtonClick = () => {
    setSelectedTable(1)
    setTableRow(INITIAL_TABLE_DATA.filter((tableData) => (
      tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) === 'ACY'
    ))
  }

  const onPremierToggleButtonClick = () => {
    setSelectedTable(2)
    setTableRow(INITIAL_TABLE_DATA.filter((tableData) => (
      (tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) !== 'ACY') || tableData.pendingReward.length !== 1
    ))
  }

  return (
    <PageHeaderWrapper>
      <div className={styles.farmsContainer}>
        <div className={styles.tableToggleButtonContainer}>
          <button
            type="button"
            className={styles.firstToggleButton}
            style={{ borderColor: selectedTable === 0 && '#1d5e91' }}
            onClick={onAllToggleButtonClick}
          >
            All
          </button>
          <button
            type="button"
            className={styles.middleToggleButton}
            style={{ borderColor: selectedTable === 1 && '#1d5e91' }}
            onClick={onAcyToggleButtonClick}
          >
            ACY
          </button>
          <button
            type="button"
            className={styles.lastToggleButton}
            style={{ borderColor: selectedTable === 2 && '#1d5e91' }}
            onClick={onPremierToggleButtonClick}
          >
            Premier
          </button>
        </div>
        <FarmsTable
          tableRow={tableRow}
          onRowClick={onRowClick}
        />
      </div>
    </PageHeaderWrapper>
  )
}

export default Farms
