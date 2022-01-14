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
import { getAllPools, getPool, newGetAllPools } from '@/acy-dex-swap/core/farms';
import {
  injected,
  walletconnect,
  walletlink,
  fortmatic,
  portis,
  torus,
  trezor,
  ledger,
  binance,
} from '@/connectors';
import PageLoading from '@/components/PageLoading';
import Eth from "web3-eth";
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers";
import {getTokenContract} from '@/acy-dex-swap/utils';
import { parse } from 'path-to-regexp';
// import {constantInstance} from "@/constants";
import { useConstantLoader,BLOCK_TIME, RPC_URL} from '@/constants';
import {useConnectWallet} from "@/components/ConnectWallet"
import { } from '../Market/Data/index.js';
// const supportedTokens = constantInstance.farm_setting.TOKENLIST();

const Farms = (props) => {
  // useWeb3React hook will listen to wallet connection.
  // if wallet is connected, account, chainId, library, and activate will not be not be undefined.
  // const { account, chainId, library, activate, active } = useWeb3React();
  const {account, library, chainId, tokenList: supportedTokens} = useConstantLoader();
  const { activate } = useWeb3React();
  // const [account, setAccount] = useState();
  const INITIAL_ROW_NUMBER = 20;

  const [farmsContent, setFarmsContent] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(0);
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
  const [walletConnected, setWalletConnected] = useState();
  
  const [isMyFarms, setIsMyFarms] = useState(false);
  const [harvestAcy, setHarvestAcy] = useState();
  const [balanceAcy, setBalanceAcy] = useState();
  const [stakeACY, setStakeACY] = useState();

  const [isLoadingPool, setIsLoadingPool] = useState(true);
  const [isLoadingHarvest, setIsLoadingHarvest] = useState(true);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  
  const [isConnected, setIsConnected] = useState(false); // set this after run activate
  const [activeEnded, setActiveEnded] = useState(true);

  const [notLogginFarmContent, setNotLogginFarmContent] = useState();


  // method to activate metamask wallet.
  // calling this method for the first time will cause metamask to pop up,
  // and require user to approve this connection.
  const connectWalletByLocalStorage = useConnectWallet();
  const connectWallet = async () =>  {
    connectWalletByLocalStorage();
  };

  //function to get logo URI
  function getLogoURIWithSymbol(symbol) {
    for (let j = 0; j < supportedTokens.length; j++) {
      if (symbol === supportedTokens[j].symbol) {
        return supportedTokens[j].logoURI;
      }
    }
    return null;
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

  const onLogInChanged = (account) => {
    if (!account)
    setWalletConnected(false);
    else
    setWalletConnected(true);
  };
  
  const getDateYDM = (date) => {
    return date.getFullYear(date)  + "-" + ("0"+(date.getMonth(date)+1)).slice(-2) + "-" + ("0" + date.getDate(date)).slice(-2)
  }
  const getDHM = (sec) => {
    if(sec<0) return '00d:00h:00m';
    var diff = sec;
    var days = 0, hrs = 0, min = 0, leftSec = 0;
    diff = Math.floor(diff);
    days = Math.floor(diff/(24*60*60));
    leftSec = diff - days * 24*60*60;
    hrs = Math.floor(leftSec/(60*60));
    leftSec = leftSec - hrs * 60*60;
    min = Math.floor(leftSec/(60));
    return days.toString() + 'd:' + hrs.toString() + 'h:' + min.toString() +'m';

  }

  const getPools = async (library, account, chainId) => {
    setIsLoadingPool(true);
    const block = await library.getBlockNumber();
    var pools;
    try {
      pools = await newGetAllPools(library, account, chainId);
    } catch(e) {
      console.log("getPools error: ",account,chainId,library,pools);
      return;
    }
    // const pools = await newGetAllPools(library, account, chainId);
    const newFarmsContents = [];
    let ismyfarm = false;
    pools&&pools.forEach((pool,idx) => {
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
          amount: pool.rewardTokensAmount[index] == 0?0 : pool.rewardTokensAmount[index],
        })),
        totalApr: pool.apr.toFixed(2),
        tvl: pool.tvl,
        hasUserPosition: pool.hasUserPosition,
        hidden: true,
        stakeData: pool.stakeData,
        poolLpScore: pool.lpScore,
        poolLpBalance: pool.lpBalance,
        endsIn: getDHM((pool.endBlock - block) * BLOCK_TIME()),
        status: pool.endBlock - block > 0,
        ratio: pool.ratio,
        endAfter: (pool.endBlock - block) * BLOCK_TIME(),
        token1Ratio: pool.token1Ratio,
        token2Ratio: pool.token2Ratio,
        poolRewardPerYear: pool.poolRewardPerYear, // usd price
        tokensRewardPerBlock: pool.tokensRewardPerBlock
      };
      if(newFarmsContent.poolId == 0) {
        // const total = rewards[j].reduce((total, currentAmount) => total.add(parseInt(currentAmount)));
        // if(newFarmsContent.stakeData){
        //   const myStakeAcy = newFarmsContent.stakeData.reduce((total, currentAmount) => total + parseFloat(currentAmount.lpAmount), 0);
        //   setStakeACY({
        //     myAcy: myStakeAcy,
        //     totalAcy: newFarmsContent.poolLpBalance
        //   });
        // } else {
        //   setStakeACY({
        //     myAcy: 0,
        //     totalAcy: newFarmsContent.poolLpBalance
        //   });
        // }
      }
      //if user has farm, direct to myfarm
      if(newFarmsContent.hasUserPosition && account) {
        setIsMyFarms(true);
        ismyfarm = true;
      }
      newFarmsContents.push(newFarmsContent);
    });
    
      if(account != "0x0000000000000000000000000000000000000000") {
          console.log("TEST newFarmsContents 0:",account,farmsContent,walletConnected)
          setFarmsContent(newFarmsContents);
          console.log("TEST newFarmsContents 1:",newFarmsContents);
      } else {
          console.log("TEST newFarmsContents 2:",account,farmsContent,walletConnected)
          setNotLogginFarmContent(newFarmsContents);
        
        console.log("TEST newFarmsContents 2:",newFarmsContents);
      }
    setIsLoadingPool(false);
    console.log("end getPools");
  };
  
  useEffect(
    () => {
       console.log("HERE TEST:",account);
      if(!account){
        connectWallet();
      }
      setIsMyFarms(false);
      if (account) {
        setWalletConnected(true);
        const provider = new JsonRpcProvider(RPC_URL(), chainId);
        console.log("start getPools",library,chainId);
        getPools(provider, account, chainId);

      } else {
        const provider = new JsonRpcProvider(RPC_URL(), chainId);
        const account = "0x0000000000000000000000000000000000000000";
        setWalletConnected(false);
        getPools(provider, account, chainId);

      }
    },
    [account, chainId]
  );



  const onAllToggleButtonClick = () => {
    setSelectedTable(0);
    setTableTitle('All Farms');
    setTableSubtitle('Stake your LP tokens and earn token rewards');
    setRowNumber(INITIAL_ROW_NUMBER);
    setHideDao(true);
    setIsMyFarms(false);
  };

  const onAcyToggleButtonClick = () => {
    setSelectedTable(1);
    setTableTitle('ACY Farms');
    setTableSubtitle('Stake your LP tokens and earn ACY token rewards');
    setRowNumber(INITIAL_ROW_NUMBER);
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
    setTableSubtitle('Stake your LP tokens and earn project/mainstream token rewards');
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
        if (isMyFarms){
          setTableTitle('My Farms');
          // setTableRow(currentTableRowCopy.filter(tableData => tableData.hasUserPosition));
          // setTableRow(currentTableRowCopy.filter(tableData => tableData.hasUserPosition));
          console.log('My Farms');
        }
        else if (selectedTable === 0){
          setTableTitle('All Farms');
          console.log('All Farms');
        } 
        else if (selectedTable === 1){
          setTableTitle('Standard Farms');
          console.log('Standard Farms');
        } 
        else if (selectedTable === 2){
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


  return (
    <PageHeaderWrapper>
      { isLoadingPool? (
        <div>
          <PageLoading/>
          {/* Farm is not available not! */}
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
            activeEnded={activeEnded}
            setActiveEnded={setActiveEnded}
          />
        </div>
        {selectedTable !== 4 && (
          <FarmsTable
            tableRow={walletConnected?farmsContent:notLogginFarmContent}
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
            balanceAcy={balanceAcy}
            searchInput={searchInput}
            selectedTable={selectedTable}
            isLoading={isLoadingPool || isLoadingBalance || isLoadingHarvest}
            activeEnded={activeEnded}
            setWalletConnected={setWalletConnected}
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
