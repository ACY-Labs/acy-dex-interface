import React, { useEffect, useState } from 'react';
import styles from './Farms.less'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FarmsTable from './FarmsTable';
import farmsTableContent from './FarmsTableContent';
import ToggleButtonGroup from './ToggleButtonGroup';
import DaoTable from './DaoTable';
import TableControl from './TableControl';
import SampleStakeHistoryData from './SampleDaoData';
import { useWeb3React } from '@web3-react/core';
import { getContract } from '@/utils/Acyhelpers';
import { abi } from './ACYMultiFarm.json'
import { InjectedConnector } from '@web3-react/injected-connector';
import { getAllPools } from '@/acy-dex-swap/core/farms';

const Farms = () => {
  // useWeb3React hook will listen to wallet connection.
  // if wallet is connected, account, chainId, library, and activate will not be not be undefined.
  const { account, chainId, library, activate } = useWeb3React();
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });

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
  const [currentTableRow, setCurrentTableRow] = useState(INITIAL_TABLE_DATA)
  const [daoDataSource, setDaoDataSource] = useState(SampleStakeHistoryData)
  const [contract, setContract] = useState(null)
  const [walletConnected, setWalletConnected] = useState(false)

  // method to activate metamask wallet.
  // calling this method for the first time will cause metamask to pop up,
  // and require user to approve this connection.
  const connectWallet = () => {
    activate(injected)
  }

  useEffect(() => {
    // automatically connect to wallet at the start of the application.
    connectWallet()

    // account will be returned if wallet is connected.
    // so if account is present, retrieve the farms contract.
    if (account) {
      setWalletConnected(true)
      getAllPools(library, account)
    } else {
      setWalletConnected(false)
    }
  }, [account])

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

  useEffect(() => {
    if (selectedTable === 4) {
      const currentTableData = SampleStakeHistoryData.filter((tableData) => {
        const [token1, token2] = tableData.tokens.split('-')
        if (token1.toLowerCase().includes(searchInput.toLowerCase()) || token2.toLowerCase().includes(searchInput.toLowerCase())) return true
      })
      setDaoDataSource(currentTableData)
    } else {
      const currentTableRowCopy = currentTableRow.filter((tableData) =>
        (
          tableData.token1.toLowerCase().includes(searchInput.toLowerCase()) ||
          tableData.token2.toLowerCase().includes(searchInput.toLowerCase())
        ))
      setTableRow(currentTableRowCopy)
    }
  }, [searchInput, selectedTable])

  // watch changes of the index of selected table and checkbox filter in premier tab.
  // basic filter when selected table is all, standard, and dao.
  // when premier is selected, basic filter out acy tokens only reward,
  // and advance filter again for bth/eth only or others or both.
  useEffect(() => {
    setSearchInput('')

    // when selected table is all,
    // display all data.
    if (selectedTable === 0) {
      const filteredTableData = INITIAL_TABLE_DATA
      setTableRow(filteredTableData)
      setCurrentTableRow(filteredTableData)
    }
    // when selected table is standard,
    // display acy token only rewards.
    else if (selectedTable === 1) {
      const filteredTableData = INITIAL_TABLE_DATA.filter((tableData) => (
        tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) === 'ACY'
      )
      setTableRow(filteredTableData)
      setCurrentTableRow(filteredTableData)
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
        const filteredTableData = tableDataTemp
        setTableRow(filteredTableData)
        setCurrentTableRow(filteredTableData)
      } else if (tokenFilter.btcEthToken && !tokenFilter.liquidityToken) {
        const filteredTableData = tableDataTemp.filter((tableData) => {
          let isBtcEth = false
          tableData.pendingReward.forEach(({ token }) => {
            if (token === 'BTC' || token === 'ETH') {
              isBtcEth = true
            }
          })
          return isBtcEth
        })
        setTableRow(filteredTableData)
        setCurrentTableRow(filteredTableData)
      } else if (!tokenFilter.btcEthToken && tokenFilter.liquidityToken) {
        const filteredTableData = tableDataTemp.filter((tableData) => {
          let isLiquidity = false
          tableData.pendingReward.forEach(({ token }) => {
            if (token !== 'BTC' && token !== 'ETH') {
              isLiquidity = true
            }
          })
          return isLiquidity
        })
        setTableRow(filteredTableData)
        setCurrentTableRow(filteredTableData)
      } else {
        setTableRow([])
        setCurrentTableRow([])
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
            walletConnected={walletConnected}
            connectWallet={connectWallet}
          />
        )}
        {selectedTable === 4 && <DaoTable dataSource={daoDataSource} />}
      </div>
    </PageHeaderWrapper>
  )
}

export default Farms
