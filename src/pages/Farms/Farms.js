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
import { getAllPools, getHarvestHistory, getPool } from '@/acy-dex-swap/core/farms';
import supportedTokens from '@/constants/TokenList';
import PageLoading from '@/components/PageLoading';

const Farms = (props) => {
  // useWeb3React hook will listen to wallet connection.
  // if wallet is connected, account, chainId, library, and activate will not be not be undefined.
  const { account, chainId, library, activate } = useWeb3React();
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });

  const INITIAL_ROW_NUMBER = 10;

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
  });
  const [currentTableRow, setCurrentTableRow] = useState([]);
  const [daoDataSource, setDaoDataSource] = useState(SampleStakeHistoryData);
  const [walletConnected, setWalletConnected] = useState(false);
  const [farmsContent, setFarmsContent] = useState([]);
  const [isMyFarms, setIsMyFarms] = useState(false);
  const [harvestAcy, setHarvestAcy] = useState();

  const [refreshPooldId, setRefreshPooldId] = useState();
  const [isLoadingPool, setIsLoadingPool] = useState(true);
  const [isLoadingHarvest, setIsLoadingHarvest] = useState(true);

  // method to activate metamask wallet.
  // calling this method for the first time will cause metamask to pop up,
  // and require user to approve this connection.
  const connectWallet = () => {
    activate(injected);
  };

  //function to get logo URI
  function getLogoURIWithSymbol(symbol) {
    for (let j = 0; j < supportedTokens.length; j++) {
      if (symbol === supportedTokens[j].symbol) {
        return supportedTokens[j].logoURI;
      }
    }
    return 'https://storageapi.fleek.co/chwizdo-team-bucket/token image/ethereum-eth-logo.svg';
  }
  function getTokenDetail(symbol) {
    for (let j = 0; j < supportedTokens.length; j++) {
      if (symbol === supportedTokens[j].symbol) {
        return supportedTokens[j];
      }
    }
    return {
      name: symbol,
      symbol: symbol,
      address:      '0x0000000000000000000000000000000000000000',
      addressOnEth: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoURI: 'https://storageapi.fleek.co/chwizdo-team-bucket/token image/ethereum-eth-logo.svg'
    };
  }
  const getDateYDM = (date) => {
    return date.getFullYear(date)  + "-" + ("0"+(date.getMonth(date)+1)).slice(-2) + "-" + ("0" + date.getDate(date)).slice(-2)
  }
  // useEffect( async () => {
    
  // },[])
  const initHarvestHistiry = async () => {
    const harvest = await getHarvestHistory(account);
    console.log('getHarvestHistiry:',harvest);
    setHarvestAcy(harvest);
    setIsLoadingHarvest(false);
  }
  const refreshHarvestHistory = async () => {
    const harvest = await getHarvestHistory(account);
    console.log('refreshHarvestHistory:',harvest);
    setHarvestAcy(harvest);
    setIsLoadingHarvest(false);
  }

  useEffect(
     () => {
      // automatically connect to wallet at the start of the application.
      connectWallet();

      const getPools = async (library, account) => {
        const pools = await getAllPools(library, account);
        const newFarmsContents = [];
        let ismyfarm = false;
        pools.forEach(pool => {
          const newFarmsContent = {
            poolId: pool.poolId,
            lpTokens: pool.lpTokenAddress,
            token1: pool.token0Symbol,
            token1Logo: getLogoURIWithSymbol(pool.token0Symbol),
            token2: pool.token1Symbol,
            token2Logo: getLogoURIWithSymbol(pool.token1Symbol),
            pendingReward: pool.rewardTokensSymbols.map((token, index) => ({
              token,
              amount: pool.rewardTokensAmount[index],
            })),
            totalApr: 89.02,
            tvl: 144542966,
            hasUserPosition: pool.hasUserPosition,
            hidden: true,
            userRewards: pool.rewards,
            stakeData: pool.stakeData
          };
          //if user has farm, direct to myfarm
          if(newFarmsContent.hasUserPosition) {
            setIsMyFarms(true);
            ismyfarm = true;
          }
          newFarmsContents.push(newFarmsContent);
        });
        setFarmsContent(newFarmsContents);
        setCurrentTableRow(newFarmsContents);
        if(ismyfarm) {
          // setCurrentTableRow(newFarmsContents.filter(tableData => tableData.hasUserPosition));
          // setTableRow(newFarmsContents.filter(tableData => tableData.hasUserPosition));
          setTableRow(newFarmsContents);
        } else {
          // setCurrentTableRow(newFarmsContents);
          setTableRow(newFarmsContents);
        }
        console.log('finished getPools');
        setIsLoadingPool(false);
      };
      // account will be returned if wallet is connected.
      // so if account is present, retrieve the farms contract.
      if (account) {
        setWalletConnected(true);
        getPools(library, account);
        initHarvestHistiry();
        
      } else if(library) {
        setWalletConnected(false);
        getPools(library, "0x1954F985F1086caBDc0Ea5FCC2a55732e7e43DD5");
      } else {
        setWalletConnected(false);
      }
    },
    [account]
  );
  useEffect(
    async () =>{
      if(refreshPooldId) {
        const pool = await getPool(library, account, refreshPooldId);
        const newFarmsContent = {
          poolId: pool.poolId,
          lpTokens: pool.lpTokenAddress,
          token1: pool.token0Symbol,
          token1Logo: getLogoURIWithSymbol(pool.token0Symbol),
          token2: pool.token1Symbol,
          token2Logo: getLogoURIWithSymbol(pool.token1Symbol),
          pendingReward: pool.rewardTokensSymbols.map((token, index) => ({
            token,
            amount: pool.rewardTokensAmount[index],
          })),
          totalApr: 89.02,
          tvl: 144542966,
          hasUserPosition: pool.hasUserPosition,
          hidden: true,
          userRewards: pool.rewards,
          stakeData: pool.stakeData
        };
        setFarmsContent(prevState =>{
          const prevFarmContent = [...prevState];
          prevFarmContent[refreshPooldId] = newFarmsContent;
          return prevFarmContent;
        })
      }
      
    },[refreshPooldId]
  );

  const onRowClick = index =>
    setTableRow(prevState => {
      const prevTableRow = [...prevState];
      prevTableRow[index].hidden = !prevTableRow[index].hidden;
      return prevTableRow;
    });

  const onAllToggleButtonClick = () => {
    console.log('currentTableRow:',currentTableRow)
    console.log('farm content:',farmsContent);
    setSelectedTable(0);
    setTableTitle('All Farms');
    setTableSubtitle('Stake your LP tokens and earn token rewards');
    setRowNumber(10);
    setHideDao(true);
    setIsMyFarms(false);
  };

  const onAcyToggleButtonClick = () => {
    console.log('currentTableRow:',currentTableRow)
    console.log('farm content:',farmsContent);
    setSelectedTable(1);
    setTableTitle('ACY Farms');
    setTableSubtitle('Stake your LP tokens and earn ACY token rewards');
    setRowNumber(10);
    setHideDao(true);
  };

  const onDaoToggleButtonClick = () => {
    console.log('currentTableRow:',currentTableRow)
    console.log('farm content:',farmsContent);
    setSelectedTable(3);
    setHideDao(false);
    setTableTitle('DAO Farms');
    setTableSubtitle('Stake your ACY tokens and earn ACY token rewards');
  };

  const onPremierToggleButtonClick = () => {
    console.log('currentTableRow:',currentTableRow)
    console.log('farm content:',farmsContent);
    setSelectedTable(2);
    setTableTitle('Premier Farms');
    setTableSubtitle('Stake your LP tokens and earn project/other token rewards');
    setRowNumber(INITIAL_ROW_NUMBER);
    setHideDao(true);
  };

  const onMyFarmsButtonClick = () => {
    console.log('currentTableRow:',currentTableRow)
    console.log('farm content:',farmsContent);
    setSelectedTable(4);
  };

  useEffect(
    () => {
      if (selectedTable === 4) {
        const currentTableData = SampleStakeHistoryData.filter(tableData => {
          const [token1, token2] = tableData.tokens.split('-');
          if (
            token1.toLowerCase().includes(searchInput.toLowerCase()) ||
            token2.toLowerCase().includes(searchInput.toLowerCase())
          )
            return true;
        });
        setDaoDataSource(currentTableData);
      } else {
        const currentTableRowCopy = currentTableRow.filter(
          tableData =>
            tableData.token1.toLowerCase().includes(searchInput.toLowerCase()) ||
            tableData.token2.toLowerCase().includes(searchInput.toLowerCase())
        );
        if (isMyFarms){
          setTableTitle('My Farms');
          // setTableRow(currentTableRowCopy.filter(tableData => tableData.hasUserPosition));
          // setTableRow(currentTableRowCopy.filter(tableData => tableData.hasUserPosition));
          setTableRow(currentTableRowCopy);
          
        }
        else if (selectedTable === 0){
          setTableRow(currentTableRowCopy);
          setTableTitle('All Farms');
        } 
        else if (selectedTable === 1){
          setTableRow(currentTableRowCopy);
          setTableTitle('ACY Farms');
        } 
        else if (selectedTable === 2){
          setTableRow(currentTableRowCopy);
          setTableTitle('Premier Farms');
        } 
        else{
          setTableTitle('DAO Farms'); 
        }
      }
    },
    [searchInput, selectedTable, isMyFarms]
  );

  // watch changes of the index of selected table and checkbox filter in premier tab.
  // basic filter when selected table is all, standard, and dao.
  // when premier is selected, basic filter out acy tokens only reward,
  // and advance filter again for bth/eth only or others or both.
  useEffect(
    () => {
      setSearchInput('');
      // setIsMyFarms(false);

      // when selected table is all,
      // display all data.
      if (farmsContent && selectedTable === 0) {
        const filteredTableData = farmsContent;
        setTableRow(filteredTableData);
        setCurrentTableRow(filteredTableData);
      }
      // when selected table is standard,
      // display acy token only rewards.
      else if (farmsContent && selectedTable === 1) {
        const filteredTableData = farmsContent.filter(
          tableData =>
            (tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) === 'ACY'
        );
        setTableRow(filteredTableData);
        setCurrentTableRow(filteredTableData);
        // when selected table is premier,
        // filter out all acy tokens only rewards,
        // and filter again based on bth/eth and liquidity checkboxes.
      } else if (farmsContent && selectedTable === 2) {
        const tableDataTemp = farmsContent.filter(
          tableData =>
            (tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) !== 'ACY' ||
            tableData.pendingReward.length !== 1
        );
        // advance filter based on bth/eth and liquidity checkboxes.
        if (tokenFilter.btcEthToken && tokenFilter.liquidityToken) {
          const filteredTableData = tableDataTemp;
          setTableRow(filteredTableData);
          setCurrentTableRow(filteredTableData);
        } else if (tokenFilter.btcEthToken && !tokenFilter.liquidityToken) {
          const filteredTableData = tableDataTemp.filter(tableData => {
            let isBtcEth = false;
            tableData.pendingReward.forEach(({ token }) => {
              if (token === 'BTC' || token === 'ETH' || token === 'USDC' || token === 'USDT') {
                isBtcEth = true;
              }
            });
            return isBtcEth;
          });
          setTableRow(filteredTableData);
          setCurrentTableRow(filteredTableData);
        } else if (!tokenFilter.btcEthToken && tokenFilter.liquidityToken) {
          const filteredTableData = tableDataTemp.filter(tableData => {
            let isLiquidity = false;
            tableData.pendingReward.forEach(({ token }) => {
              if (token !== 'BTC' && token !== 'ETH' && token !== 'USDC' && token !== 'USDT') {
                isLiquidity = true;
              }
            });
            return isLiquidity;
          });
          setTableRow(filteredTableData);
          setCurrentTableRow(filteredTableData);
        } 
        else {
          setTableRow([]);
          setCurrentTableRow([]);
        }
      }
    },
    [selectedTable, tokenFilter, farmsContent]
  );



  return (
    <PageHeaderWrapper>
      { (isLoadingHarvest || isLoadingPool)? (
        <div>
          <PageLoading/>
        </div>
      ) : (
      <div className={styles.farmsContainer}>
        <div className={styles.tableControlButtonContainer}>
          <ToggleButtonGroup
            selectedTable={selectedTable}
            onAllToggleButtonClick={onAllToggleButtonClick}
            onAcyToggleButtonClick={onAcyToggleButtonClick}
            onPremierToggleButtonClick={onPremierToggleButtonClick}
            onDaoToggleButtonClick={onDaoToggleButtonClick}
            onMyFarmsToggleButtonClick={onMyFarmsButtonClick}
            isMyFarms={isMyFarms}
          />
          <TableControl
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            isMyFarms={isMyFarms}
            setIsMyFarms={setIsMyFarms}
          />
        </div>
        {selectedTable !== 4 && harvestAcy &&(
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
            chainId={chainId}
            isMyFarms={isMyFarms}
            harvestAcy={harvestAcy}
            setRefreshPooldId={setRefreshPooldId}
            refreshHarvestHistory={refreshHarvestHistory}
          />
        )}
        {selectedTable === 4 && <DaoTable dataSource={daoDataSource} />}
      </div>
      )}
    </PageHeaderWrapper>
  );
};

export default Farms;
