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
import Eth from "web3-eth";
import { Web3Provider } from "@ethersproject/providers";


const Farms = (props) => {
  // useWeb3React hook will listen to wallet connection.
  // if wallet is connected, account, chainId, library, and activate will not be not be undefined.
  const { account, chainId, library, activate } = useWeb3React();
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });

  const INITIAL_ROW_NUMBER = 10;

  const [farmsContent, setFarmsContent] = useState([]);
  const [currentTableRow, setCurrentTableRow] = useState([]);
  const [tableRow, setTableRow] = useState([]);

  const [selectedTable, setSelectedTable] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [tableTitle, setTableTitle] = useState('All Farms');
  const [tableSubtitle, setTableSubtitle] = useState('Stake your LP tokens and earn token rewards');
  const [rowNumber, setRowNumber] = useState(INITIAL_ROW_NUMBER);
  const [hideDao, setHideDao] = useState(true);
  const [tokenFilter, setTokenFilter] = useState(false);
  const [daoDataSource, setDaoDataSource] = useState(SampleStakeHistoryData);
  const [walletConnected, setWalletConnected] = useState(false);
  
  const [isMyFarms, setIsMyFarms] = useState(false);
  const [harvestAcy, setHarvestAcy] = useState();

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
  const initHarvestHistiry = async (library, account) => {
    const harvest = await getHarvestHistory(library, account);
    setHarvestAcy(harvest);
    setIsLoadingHarvest(false);
  }
  const refreshHarvestHistory = async (library, account) => {
    const harvest = await getHarvestHistory(library, account);
    setHarvestAcy(harvest);
    setIsLoadingHarvest(false);
  }
  const getPools = async (library, account) => {
    const pools = await getAllPools(library, account);
    const newFarmsContents = [];
    let ismyfarm = false;
    pools.forEach((pool,idx) => {
      const newFarmsContent = {
        index: idx,
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
    setIsLoadingPool(false);
  };

  useEffect(
    () => {
      var eth = new Eth('https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
      const library = new Web3Provider(eth.givenProvider);
      const account = "0x0000000000000000000000000000000000000000";
      getPools(library, account);
      initHarvestHistiry(library, account);
   },
   []
 );
  useEffect(
     async () => {
      // automatically connect to wallet at the start of the application.
      connectWallet();
      // account will be returned if wallet is connected.
      // so if account is present, retrieve the farms contract.
      
      function sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }
      if (account) {
        await sleep(1000)
        setWalletConnected(true);
        getPools(library, account);
        initHarvestHistiry(library, account);
        
      } else {
        setWalletConnected(false);
      }
    },
    [account]
  );



  const onAllToggleButtonClick = () => {
    setSelectedTable(0);
    setTableTitle('All Farms');
    setTableSubtitle('Stake your LP tokens and earn token rewards');
    setRowNumber(10);
    setHideDao(true);
    setIsMyFarms(false);
  };

  const onAcyToggleButtonClick = () => {
    setSelectedTable(1);
    setTableTitle('ACY Farms');
    setTableSubtitle('Stake your LP tokens and earn ACY token rewards');
    setRowNumber(10);
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
          tableData =>{
            
            if( tableData.token1.toLowerCase().includes(searchInput.toLowerCase()) ||
            tableData.token2.toLowerCase().includes(searchInput.toLowerCase())
            ) {
              return true;
            }
          }
        );
        console.log(currentTableRowCopy);
        if (isMyFarms){
          setTableTitle('My Farms');
          // setTableRow(currentTableRowCopy.filter(tableData => tableData.hasUserPosition));
          // setTableRow(currentTableRowCopy.filter(tableData => tableData.hasUserPosition));
          setTableRow(currentTableRowCopy);
          console.log('My Farms');
        }
        else if (selectedTable === 0){
          setTableRow(currentTableRowCopy);
          setTableTitle('All Farms');
          console.log('All Farms');
        } 
        else if (selectedTable === 1){
          setTableRow(currentTableRowCopy);
          setTableTitle('ACY Farms');
          console.log('ACY Farms');
        } 
        else if (selectedTable === 2){
          setTableRow(currentTableRowCopy);
          setTableTitle('Premier Farms');
          console.log('Premier Farms');
        } 
        else{
          setTableTitle('DAO Farms'); 
          console.log('DAO Farms');
        }
      }
    },
    [searchInput, selectedTable, isMyFarms]
  );

  // watch changes of the index of selected table and checkbox filter in premier tab.
  // basic filter when selected table is all, standard, and dao.
  // when premier is selected, basic filter out acy tokens only reward,
  // and advance filter again for bth/eth only or others or both.
  // useEffect(
  //   () => {
  //     setSearchInput('');
  //     // setIsMyFarms(false);

  //     // when selected table is all,
  //     // display all data.
  //     if (farmsContent && selectedTable === 0) {
  //       const filteredTableData = farmsContent;
  //       setTableRow(filteredTableData);
  //       setCurrentTableRow(filteredTableData);
  //     }
  //     // when selected table is standard,
  //     // display acy token only rewards.
  //     else if (farmsContent && selectedTable === 1) {
  //       const filteredTableData = farmsContent.filter(
  //         tableData =>
  //           (tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) === 'ACY'
  //       );
  //       setTableRow(filteredTableData);
  //       setCurrentTableRow(filteredTableData);
  //       // when selected table is premier,
  //       // filter out all acy tokens only rewards,
  //       // and filter again based on bth/eth and liquidity checkboxes.
  //     } else if (farmsContent && selectedTable === 2) {
  //       const tableDataTemp = farmsContent.filter(
  //         tableData =>
  //           (tableData.pendingReward.length === 1 && tableData.pendingReward[0].token) !== 'ACY' ||
  //           tableData.pendingReward.length !== 1
  //       );
  //       // advance filter based on bth/eth and liquidity checkboxes.
  //       if (tokenFilter.btcEthToken && tokenFilter.liquidityToken) {
  //         const filteredTableData = tableDataTemp;
  //         setTableRow(filteredTableData);
  //         setCurrentTableRow(filteredTableData);
  //       } else if (tokenFilter.btcEthToken && !tokenFilter.liquidityToken) {
  //         const filteredTableData = tableDataTemp.filter(tableData => {
  //           let isBtcEth = false;
  //           tableData.pendingReward.forEach(({ token }) => {
  //             if (token === 'BTC' || token === 'ETH' || token === 'USDC' || token === 'USDT') {
  //               isBtcEth = true;
  //             }
  //           });
  //           return isBtcEth;
  //         });
  //         setTableRow(filteredTableData);
  //         setCurrentTableRow(filteredTableData);
  //       } else if (!tokenFilter.btcEthToken && tokenFilter.liquidityToken) {
  //         const filteredTableData = tableDataTemp.filter(tableData => {
  //           let isLiquidity = false;
  //           tableData.pendingReward.forEach(({ token }) => {
  //             if (token !== 'BTC' && token !== 'ETH' && token !== 'USDC' && token !== 'USDT') {
  //               isLiquidity = true;
  //             }
  //           });
  //           return isLiquidity;
  //         });
  //         setTableRow(filteredTableData);
  //         setCurrentTableRow(filteredTableData);
  //       } 
  //       else {
  //         setTableRow([]);
  //         setCurrentTableRow([]);
  //       }
  //     }
  //   },
  //   [selectedTable, tokenFilter, farmsContent]
  // );

  // const refreshPool = async (poolId, idx) => {
  //   console.log('refresh pool info:');
  //   const newPool = await getPool(library, account, poolId);
  //   const newFarmsContent = {
  //     index:idx,
  //     poolId: newPool.poolId,
  //     lpTokens: newPool.lpTokenAddress,
  //     token1: newPool.token0Symbol,
  //     token1Logo: getLogoURIWithSymbol(newPool.token0Symbol),
  //     token2: newPool.token1Symbol,
  //     token2Logo: getLogoURIWithSymbol(newPool.token1Symbol),
  //     pendingReward: newPool.rewardTokensSymbols.map((token, idx) => ({
  //       token,
  //       amount: newPool.rewardTokensAmount[idx],
  //     })),
  //     totalApr: 89.02,
  //     tvl: 144542966,
  //     hasUserPosition: newPool.hasUserPosition,
  //     userRewards: newPool.rewards,
  //     stakeData: newPool.stakeData
  //   };
  //   setFarmsContent( prevState => {
  //     const prevData = [...prevState];
  //     prevData[idx] = newFarmsContent;
  //     return prevData;
  //   })
  // };



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
            walletConnected={walletConnected}
          />
        </div>
        {selectedTable !== 4 && harvestAcy &&(
          <FarmsTable
            tableRow={farmsContent}
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
            refreshHarvestHistory={refreshHarvestHistory}
            searchInput={searchInput}
            selectedTable={selectedTable}
            tokenFilter={tokenFilter}
            // refreshPool={refreshPool}
          />
        )}
        {selectedTable === 4 && <DaoTable dataSource={daoDataSource} />}
      </div>
      )}
    </PageHeaderWrapper>
  );
};

export default Farms;
