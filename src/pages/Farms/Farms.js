import React, { useState } from 'react';
import styles from './Farms.less'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FarmsTable from './FarmsTable';
import farmsTableContent from './FarmsTableContent';
import ToggleButtonGroup from './ToggleButtonGroup';
import Switch from '@material-ui/core/Switch';
import { FormControlLabel } from '@material-ui/core';

const Farms = () => {
  const INITIAL_TABLE_DATA = farmsTableContent.map((row) => {
    const prevRow = { ...row }
    prevRow.hidden = true
    return prevRow
  })

  const [selectedTable, setSelectedTable] = useState(0)
  const [tableRow, setTableRow] = useState(INITIAL_TABLE_DATA)
  const [searchInput, setSearchInput] = useState('')

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
        <div className={styles.tableControlButtonContainer}>
          <ToggleButtonGroup
            selectedTable={selectedTable}
            onAllToggleButtonClick={onAllToggleButtonClick}
            onAcyToggleButtonClick={onAcyToggleButtonClick}
            onPremierToggleButtonClick={onPremierToggleButtonClick}
          />
          <div className={styles.tableHeaderButtonContainer}>
            <div className={styles.tableHeaderRadioButtonContainer}>
              <FormControlLabel
                control={<Switch name="checkedA" color="default" />}
                label="Stake Only"
                labelPlacement="start"
              />
            </div>
            <div className={styles.tableHeaderSearchInputContainer}>
              <input
                type="text"
                placeholder="Search by token symbol"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.tableHeaderToggleButtonContainer}>
              <button type="button" className={styles.activeToggleButton}>Active</button>
              <button type="button" className={styles.endedToggleButton}>Ended</button>
            </div>
          </div>
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
