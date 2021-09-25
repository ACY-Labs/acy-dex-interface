import React, { useEffect, useState } from 'react';
import styles from './Farms.less';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FarmsTable from './FarmsTable';
import ToggleButtonGroup from './ToggleButtonGroup';
import DaoTable from './DaoTable';
import TableControl from './TableControl';
import SampleStakeHistoryData from './SampleDaoData';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { getAllPools } from '@/acy-dex-swap/core/farms';

const Farms = () => {
  // useWeb3React hook will listen to wallet connection.
  // if wallet is connected, account, chainId, library, and activate will not be not be undefined.
  const { account, chainId, library, activate } = useWeb3React();
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });

  const INITIAL_ROW_NUMBER = 5;

  const [selectedTable, setSelectedTable] = useState(0);
  const [tableRow, setTableRow] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [tableTitle, setTableTitle] = useState('All Farms');
  const [tableSubtitle, setTableSubtitle] = useState('Stake your LP tokens and earn token rewards');
  const [rowNumber, setRowNumber] = useState(INITIAL_ROW_NUMBER);
  const [hideDao, setHideDao] = useState(true);
  const [tokenFilter, setTokenFilter] = useState({
    liquidityToken: true,
    btcEthToken: true,
  })
  const [currentTableRow, setCurrentTableRow] = useState([])
  const [daoDataSource, setDaoDataSource] = useState(SampleStakeHistoryData)
  const [walletConnected, setWalletConnected] = useState(false)
  const [farmsContent, setFarmsContent] = useState([])
  const [isMyFarms, setIsMyFarms] = useState(false)

  // method to activate metamask wallet.
  // calling this method for the first time will cause metamask to pop up,
  // and require user to approve this connection.
  const connectWallet = () => {
    activate(injected)
  }

  useEffect(() => {
    // automatically connect to wallet at the start of the application.
    connectWallet()

    const getPools = async (library, account) => {
      const pools = await getAllPools(library, account)
      const newFarmsContents = []

      pools.forEach((pool) => {
        const newFarmsContent = {
          lpTokens: pool.lpTokenAddress,
          token1: pool.token0Symbol,
          token1Logo: null,
          token2: pool.token1Symbol,
          token2Logo: null,
          pendingReward: pool.rewardTokensSymbols.map((token, index) => ({ token, amount: pool.rewardTokensAmount[index] })),
          totalApr: 89.02,
          tvl: 144542966,
          hasUserPosition: pool.hasUserPosition,
          hidden: true
        }
        newFarmsContents.push(newFarmsContent)
      })

      setFarmsContent(newFarmsContents)
      setCurrentTableRow(newFarmsContents)
      setTableRow(newFarmsContents)
    }

    // account will be returned if wallet is connected.
    // so if account is present, retrieve the farms contract.
    if (account) {
      setWalletConnected(true)
      getPools(library, account)
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
    setSelectedTable(0);
    setTableTitle('All Farms');
    setTableSubtitle('Stake your LP tokens and earn token rewards');
    setRowNumber(5);
    setHideDao(true);
  };

  const onAcyToggleButtonClick = () => {
    setSelectedTable(1);
    setTableTitle('ACY Farms');
    setTableSubtitle('Stake your LP tokens and earn ACY token rewards');
    setRowNumber(5);
    setHideDao(true);
  };

  const onDaoToggleButtonClick = () => {
    setSelectedTable(3);
    setHideDao(false);
    setTableTitle('DAO Farms');
    setTableSubtitle('Stake your ACY tokens and earn ACY token rewards');
  };

  const onPremierToggleButtonClick = () => {
    setSelectedTable(2);
    setTableTitle('Premier Farms');
    setTableSubtitle('Stake your LP tokens and earn project/other token rewards');
    setRowNumber(INITIAL_ROW_NUMBER);
    setHideDao(true);
  };

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
      if (isMyFarms) setTableRow(currentTableRowCopy.filter((tableData) => tableData.hasUserPosition))
      else setTableRow((currentTableRowCopy))
    }
  }, [searchInput, selectedTable, isMyFarms])

  // watch changes of the index of selected table and checkbox filter in premier tab.
  // basic filter when selected table is all, standard, and dao.
  // when premier is selected, basic filter out acy tokens only reward,
  // and advance filter again for bth/eth only or others or both.
  useEffect(() => {
    setSearchInput('')
    setIsMyFarms(false)

    // when selected table is all,
    // display all data.
    if (farmsContent && selectedTable === 0) {
      const filteredTableData = farmsContent
      setTableRow(filteredTableData)
      setCurrentTableRow(filteredTableData)
    }
    // when selected table is standard,
    // display acy token only rewards.
    else if (farmsContent && selectedTable === 1) {
      const filteredTableData = farmsContent.filter((tableData) => (
        tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) === 'ACY'
      )
      setTableRow(filteredTableData)
      setCurrentTableRow(filteredTableData)
    // when selected table is premier,
    // filter out all acy tokens only rewards,
    // and filter again based on bth/eth and liquidity checkboxes.
    } else if (farmsContent && selectedTable === 2) {
      const tableDataTemp = farmsContent.filter((tableData) => (
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
    },
    [selectedTable, tokenFilter, farmsContent]
  );

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
          <TableControl
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            isMyFarms={isMyFarms}
            setIsMyFarms={setIsMyFarms}
          />
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
            account={account}
            library={library}
          />
        )}
        {selectedTable === 4 && <DaoTable dataSource={daoDataSource} />}
      </div>
    </PageHeaderWrapper>
  );
};

export default Farms;
