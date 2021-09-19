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
  const INITIAL_ROW_NUMBER = 5

  const [selectedTable, setSelectedTable] = useState(0)
  const [tableRow, setTableRow] = useState(INITIAL_TABLE_DATA)
  const [searchInput, setSearchInput] = useState('')
  const [tableTitle, setTableTitle] = useState('All Farms')
  const [tableSubtitle, setTableSubtitle] = useState('Stake your LP tokens and earn token rewards')
  const [rowNumber, setRowNumber] = useState(INITIAL_ROW_NUMBER)
  const [hideDao, setHideDao] = useState(true)

  const onRowClick = (index) => setTableRow((prevState) => {
    const prevTableRow = [ ...prevState ]
    prevTableRow[index].hidden = !prevTableRow[index].hidden
    return prevTableRow
  })

  const onAllToggleButtonClick = () => {
    setSelectedTable(0)
    setTableRow(INITIAL_TABLE_DATA)
    setTableTitle('All Farms')
    setTableSubtitle('Stake your LP tokens and earn token rewards')
    setRowNumber(5)
    setHideDao(true)
  }

  const onAcyToggleButtonClick = () => {
    setSelectedTable(1)
    setTableRow(INITIAL_TABLE_DATA.filter((tableData) => (
      tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) === 'ACY'
    ))
    setTableTitle('ACY Farms')
    setTableSubtitle('Stake your LP tokens and earn ACY token rewards')
    setRowNumber(5)
    setHideDao(true)
  }

  const onDaoToggleButtonClick = () => {
    setSelectedTable(3)
    setHideDao(false)
  }

  const onPremierToggleButtonClick = () => {
    setSelectedTable(2)
    setTableRow(INITIAL_TABLE_DATA.filter((tableData) => (
      (tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) !== 'ACY') || tableData.pendingReward.length !== 1
    ))
    setTableTitle('Premier Farms')
    setTableSubtitle('Stake your LP tokens and earn project/other token rewards')
    setRowNumber(INITIAL_ROW_NUMBER)
    setHideDao(true)
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
            onDaoToggleButtonClick={onDaoToggleButtonClick}
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
          tableTitle={tableTitle}
          tableSubtitle={tableSubtitle}
          rowNumber={rowNumber}
          setRowNumber={setRowNumber}
          hideDao={hideDao}
        />
      </div>
    </PageHeaderWrapper>
  )
}

export default Farms
