import React, { useEffect, useState } from 'react';
import styles from './Farms.less'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FarmsTable from './FarmsTable';
import farmsTableContent from './FarmsTableContent';
import ToggleButtonGroup from './ToggleButtonGroup';
import DaoTable from './DaoTable';
import TableControl from './TableControl';

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
  const [tokenFilter, setTokenFilter] = useState({
    liquidityToken: true,
    btcEthToken: true,
  })

  const onRowClick = (index) => setTableRow((prevState) => {
    const prevTableRow = [ ...prevState ]
    prevTableRow[index].hidden = !prevTableRow[index].hidden
    return prevTableRow
  })

  const onAllToggleButtonClick = () => {
    setSelectedTable(0)
    setTableTitle('All Farms')
    setTableSubtitle('Stake your LP tokens and earn token rewards')
    setRowNumber(5)
    setHideDao(true)
  }

  const onAcyToggleButtonClick = () => {
    setSelectedTable(1)
    setTableTitle('ACY Farms')
    setTableSubtitle('Stake your LP tokens and earn ACY token rewards')
    setRowNumber(5)
    setHideDao(true)
  }

  const onDaoToggleButtonClick = () => {
    setSelectedTable(3)
    setHideDao(false)
    setTableTitle('DAO Farms')
    setTableSubtitle('Stake your ACY tokens and earn ACY token rewards')
  }

  const onPremierToggleButtonClick = () => {
    setSelectedTable(2)
    setTableTitle('Premier Farms')
    setTableSubtitle('Stake your LP tokens and earn project/other token rewards')
    setRowNumber(INITIAL_ROW_NUMBER)
    setHideDao(true)
  }

  const onMyFarmsButtonClick = () => {
    setSelectedTable(4)
  }

  // watch changes of the index of selected table and checkbox filter in premier tab.
  // basic filter when selected table is all, standard, and dao.
  // when premier is selected, basic filter out acy tokens only reward,
  // and advance filter again for bth/eth only or others or both.
  useEffect(() => {
    // when selected table is all,
    // display all data.
    if (selectedTable === 0) {
      setTableRow(INITIAL_TABLE_DATA)
    }
    // when selected table is standard,
    // display acy token only rewards.
    else if (selectedTable === 1) {
      setTableRow(INITIAL_TABLE_DATA.filter((tableData) => (
        tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) === 'ACY'
      ))
    // when selected table is premier,
    // filter out all acy tokens only rewards,
    // and filter again based on bth/eth and liquidity checkboxes.
    } else if (selectedTable === 2) {
      // basic filter out all acy tokens only rewards.
      const tableDataTemp = INITIAL_TABLE_DATA.filter((tableData) => (
        (tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) !== 'ACY') || tableData.pendingReward.length !== 1
      )
      // advance filter based on bth/eth and liquidity checkboxes.
      if (tokenFilter.btcEthToken && tokenFilter.liquidityToken) {
        setTableRow(tableDataTemp)
      } else if (tokenFilter.btcEthToken && !tokenFilter.liquidityToken) {
        setTableRow(tableDataTemp.filter((tableData) => {
          let isBtcEth = false
          tableData.pendingReward.forEach(({ token }) => {
            if (token === 'BTC' || token === 'ETH') {
              isBtcEth = true
            }
          })
          return isBtcEth
        }))
      } else if (!tokenFilter.btcEthToken && tokenFilter.liquidityToken) {
        setTableRow(tableDataTemp.filter((tableData) => {
          let isLiquidity = false
          tableData.pendingReward.forEach(({ token }) => {
            if (token !== 'BTC' && token !== 'ETH') {
              isLiquidity = true
            }
          })
          return isLiquidity
        }))
      } else {
        setTableRow([])
      }
    }
  }, [selectedTable, tokenFilter])

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
            onMyFarmsToggleButtonClick={onMyFarmsButtonClick}
          />
          <TableControl searchInput={searchInput} setSearchInput={setSearchInput} />
        </div>
        {selectedTable !== 4 && (
          <FarmsTable
            tableRow={tableRow}
            onRowClick={onRowClick}
            tableTitle={tableTitle}
            tableSubtitle={tableSubtitle}
            rowNumber={rowNumber}
            setRowNumber={setRowNumber}
            hideDao={hideDao}
            selectedTable={selectedTable}
            tokenFilter={tokenFilter}
            setTokenFilter={setTokenFilter}
          />
        )}
        {selectedTable === 4 && <DaoTable />}
      </div>
    </PageHeaderWrapper>
  )
}

export default Farms
