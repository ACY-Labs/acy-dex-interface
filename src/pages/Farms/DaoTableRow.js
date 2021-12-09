import React, { forwardRef, useState, useEffect, useRef} from 'react';
import { useHistory } from 'react-router-dom';
import styles from '@/pages/Farms/Farms.less';
import { isMobile } from 'react-device-detect';
import { harvestAll, harvest, withdraw } from '@/acy-dex-swap/core/farms';
import { getUserTokenBalanceWithAddress, getUserTokenBalance } from '@/acy-dex-swap/utils';
import StakeModal from './StakeModal';
import { addLiquidity } from '@/acy-dex-swap/core/addLiquidity';
import { AcyActionModal, AcyModal, AcyButton, AcyBarChart, AcyCard } from '@/components/Acy';
import AddLiquidityComponent from '@/components/AddComponent';
import { Modal, Icon, Divider } from 'antd';
import { connect } from 'umi';
import moment from 'moment';
import classNames from 'classnames';
import { getPool, getPoolAccmulateReward} from '@/acy-dex-swap/core/farms';
import supportedTokens from '@/constants/TokenList';
import StakeRow from './StakeRow';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from '@ethersproject/bignumber';
import SwapComponent from '@/components/SwapComponent';

const AutoResizingInput = ({ value: inputValue, onChange: setInputValue }) => {
  const handleInputChange = (e) => {
    let newVal = e.target.valueAsNumber || 0;
    newVal = newVal > 100 ? 100 : (newVal < 0 ? 0 : newVal);  // set newVal in range of 0~100
    setInputValue(newVal);
  };

  const inputRef = useRef();
  useEffect(() => {
    const newSize = inputValue.toString().length + 0.5;
    inputRef.current.style.width = newSize + "ch";
  }, [inputValue]);

  useEffect(() => {
    setInputValue(inputValue);
  }, [setInputValue, inputValue]);

  return (
    <input
      ref={inputRef}
      type="number"
      className={styles.amountInput}
      value={Number(inputValue).toString()}
      onChange={handleInputChange}
      autoFocus
    />
  );
};


const DaoTableRow = props => {
  const {
    index,
    lpTokens,
    rowClickHandler,
    walletConnected,
    connectWallet,
    hideArrow = false,
    isMyFarms,
    harvestHistory,
    dispatch,
    content,
    poolId,
    stakedTokenAddr,
    token1,
    token1Logo,
    token2,
    token2Logo,
    totalApr,
    tvl,
    pendingReward,
    userRewards,
    stakeData,
    hasUserPosition,
    refreshHarvestHistory,
    searchInput,
    selectedTable,
    tokenFilter,
    dao
  } = props;

  const [poolInfo, setPoolInfo] = useState(content);
  const [hidden, setHidden] = useState(true);

  const [balance, setBalance] = useState(12345);
  const [isHarvestDisabled, setIsHarvestDisabled] = useState(false);
  const [remainingDays, setRemainingDays] = useState(120)
  const [date, setDate] = useState("10/12/2021")
  const [isModalVisible, setIsModalVisible] = useState(false);
  const hideModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  const [withdrawModal,setWithdrawModal] = useState(false);
  const hideWithdrawModal = () => setWithdrawModal(false);
  const showWithdrawModal = () => setWithdrawModal(true);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const [harvestModal,setHarvestModal] = useState(false);
  const [harvestButtonText, setHarvestButtonText] = useState('Harvest');
  const [harvestButtonStatus,setHarvestButtonStatus] = useState(true);
  const hideHarvestModal = () => setHarvestModal(false);
  const showHarvestModal = () => setHarvestModal(true);

  const [showAddLiquidity,setShowAddLiquidity] = useState(false);

  const [errorMessages,setErrorMessages] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const [withdrawButtonText,setWithdrawButtonText] = useState('Withdraw');
  const [withdrawButtonStatus,setWithdrawButtonStatus] = useState(true);
  const [percent,setPercent] = useState(50);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  

  const ACY_LOGO = "https://acy.finance/static/media/logo.78c0179c.svg";

  const [AcyBalance, setBal] = useState(0);
  const { account, chainId, library, activate } = useWeb3React();
  
  useEffect(
    () => {
        console.log("ACY supportedTokens:", supportedTokens.find( token => token.name == "ACY"));
        console.log("library account chainId:", library, account, chainId );
      if (!library || !account || !chainId) return;
      function processString(bal) {
        let decimals = bal.split('.')[0];
        let fraction = bal.split('.')[1] || '0';
        // console.log(`decimals: ${decimals} fraction:${fraction}`);
        const million = BigNumber.from('1000000');
        const billion = BigNumber.from('1000000000');
        const trillion = BigNumber.from('1000000000000');

        const decimalBN = BigNumber.from(decimals);
        let unit = '';
        if (decimalBN.gt(trillion)) {
          decimals = `${decimalBN.div(trillion)}`;
          unit = 'T';
        } else if (decimalBN.gt(billion)) {
          decimals = `${decimalBN.div(billion)}`;
          unit = 'B';
        } else if (decimalBN.gt(million)) {
          decimals = `${decimalBN.div(million)}`;
          unit = 'M';
        }
        decimals = decimals.toString();

        const fractionBN = BigNumber.from(fraction);
        if (fractionBN.gt(trillion)) fraction = `${fractionBN.div(trillion)}`;
        else if (fractionBN.gt(billion)) fraction = `${fractionBN.div(billion)}`;
        else if (fractionBN.gt(million)) fraction = `${fractionBN.div(million)}`;
        fraction = fraction.toString();

        console.log(`decimals: ${decimals}`);
        console.log(fractionBN);
        return `${decimals}${!fractionBN.isZero() ? `.${fraction}` : ''}${unit}`;
      }
      async function getThisTokenBalance() {
        const { address, symbol, decimals } = supportedTokens.find( token => token.name == "ACY");
        
        const bal = await getUserTokenBalance(
          { address, symbol, decimals },
          chainId,
          account,
          library
        );
        console.log(bal);
        setBal(processString(bal));
      }
      console.log("getThisTokenBalance:");
      getThisTokenBalance();
    },
    [library, account, chainId]
  );

  //function to get logo URI
  function getLogoURIWithSymbol(symbol) {
    for (let j = 0; j < supportedTokens.length; j++) {
      if (symbol === supportedTokens[j].symbol) {
        return supportedTokens[j].logoURI;
      }
    }
    return 'https://storageapi.fleek.co/chwizdo-team-bucket/token image/ethereum-eth-logo.svg';
  }
  useEffect(
    () => {
      setPoolInfo(content);
    },
    [content]
  );
  

  useEffect(
    () => {
      
      if (!poolInfo.lpTokens || !chainId || !account || !library) return;
      async function getFarmTokenUserBalance() {
        console.log("getFarmTokenUserBalance in");
        const bal = await getUserTokenBalanceWithAddress(
          poolInfo.lpTokens,
          chainId,
          account,
          library
        );
        setBalance(bal);
      }
      getFarmTokenUserBalance();
    },
    [poolInfo,isModalVisible]
  );
  useEffect(
    () => {
      setErrorMessages('');
      setWithdrawButtonText('Withdraw');
      setHarvestButtonStatus(true);
    },[withdrawModal]
  );
  useEffect(
    () => {
      setErrorMessages('');
      setHarvestButtonText('Harvest');
      setHarvestButtonStatus(true);
    },[harvestModal]
  );
  
  let history = useHistory();

  const refreshPoolInfo = async () => {
    console.log('refresh pool info:');
    const newPool = await getPool(library, account, poolId);
    const newFarmsContent = {
      poolId: newPool.poolId,
      lpTokens: newPool.lpTokenAddress,
      token1: newPool.token0Symbol,
      token1Logo: getLogoURIWithSymbol(newPool.token0Symbol),
      token2: newPool.token1Symbol,
      token2Logo: getLogoURIWithSymbol(newPool.token1Symbol),
      pendingReward: newPool.rewardTokensSymbols.map((token, idx) => ({
        token,
        amount: newPool.rewardTokensAmount[idx],
      })),
      totalApr: 89.02,
      tvl: 144542966,
      hasUserPosition: newPool.hasUserPosition,
      userRewards: newPool.rewards,
      stakeData: newPool.stakeData,
      poolLpScore: newPool.lpScore
    };
    setPoolInfo(newFarmsContent);
  };



  const redirectLiquidity = () => {
    history.push({
      pathname: '/liquidity',
      // search: '?update=true',  // query string
      state: {  // location state
        token1 : token1,
        token2 : token2,
      },
    });
  };

  const withdrawClicked = () => {
    if(false) {
      
      setErrorMessages("- You can't withdraw now");
    } else {
      setWithdrawButtonStatus(false);
      setWithdrawButtonText(<>Processing <Icon type="loading" /></>);
      withdraw(poolId, selectedRowData.positionId, (selectedRowData.lpAmount * percent / 100).toString(), setWithdrawButtonText, setWithdrawButtonStatus, withdrawCallback, library, account);
    }
  };

  const harvestCallback = status => {
    const transactions = props.transaction.transactions;
    const isCurrentTransactionDispatched = transactions.filter(item => item.hash == status.hash).length;
    // trigger loading spin on top right
    if (isCurrentTransactionDispatched == 0) {
      dispatch({
        type: "transaction/addTransaction",
        payload: {
          transactions: [...transactions, { hash: status.hash }]
        }
      })
    }

    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          let transactionTime;
          await library.getBlock(receipt.logs[0].blockNumber).then(res => {
            transactionTime = moment(parseInt(res.timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
          });

          // update backend userPool record
          // console.log("test pair to add on server", pairToAddOnServer);
          // if (pairToAddOnServer) {
          //   const { token0, token1 } = pairToAddOnServer;
          //   axios.post(
          //     // fetch valid pool list from remote
          //     `https://api.acy.finance/api/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
          //     // `http://localhost:3001/api/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
          //   ).then(res => {
          //     console.log("add to server return: ", res);

          //   }).catch(e => console.log("error: ", e));
          // }
          await refreshPool(poolInfo.poolId,poolInfo.index);
          await refreshHarvestHistory(library, account);
          // clear top right loading spin
          const newData = transactions.filter(item => item.hash != status.hash);
          dispatch({
            type: "transaction/addTransaction",
            payload: {
              transactions: [
                ...newData,
                { hash: status.hash, transactionTime }
              ]
            }
          });

          // refresh the table
          // dispatch({
          //   type: "liquidity/setRefreshTable",
          //   payload: true,
          // });

          // disable button after each transaction on default, enable it after re-entering amount to add
          
          setHarvestButtonText("Done");
          hideHarvestModal();
          
          // setStateStakeData(prevState => {
          //   const prevStakeData = [...prevState];
          //   prevStakeData[selectedRowIndex].reward = prevStakeData[selectedRowIndex].reward.fill(0);;
          //   return prevStakeData;
          // });
          

          // store to localStorage
        }
      })
    };
    // const sti = setInterval(, 500);
    checkStatusAndFinish();
  }

  const withdrawCallback = status => {
    const transactions = props.transaction.transactions;
    const isCurrentTransactionDispatched = transactions.filter(item => item.hash == status.hash).length;
    //trigger loading spin on top right
    if (isCurrentTransactionDispatched == 0) {
      dispatch({
        type: "transaction/addTransaction",
        payload: {
          transactions: [...transactions, { hash: status.hash }]
        }
      })
    }

    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          let transactionTime;
          await library.getBlock(receipt.logs[0].blockNumber).then(res => {
            transactionTime = moment(parseInt(res.timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
          });

          // update backend userPool record
          // console.log("test pair to add on server", pairToAddOnServer);
          // if (pairToAddOnServer) {
          //   const { token0, token1 } = pairToAddOnServer;
          //   axios.post(
          //     // fetch valid pool list from remote
          //     `https://api.acy.finance/api/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
          //     // `http://localhost:3001/api/pool/update?walletId=${account}&action=add&token0=${token0}&token1=${token1}`
          //   ).then(res => {
          //     console.log("add to server return: ", res);

          //   }).catch(e => console.log("error: ", e));
          // }
          //refresh talbe
          await refreshPoolInfo();
          // clear top right loading spin
          const newData = transactions.filter(item => item.hash != status.hash);
          dispatch({
            type: "transaction/addTransaction",
            payload: {
              transactions: [
                ...newData,
                { hash: status.hash, transactionTime }
              ]
            }
          });

          // refresh the table
          // dispatch({
          //   type: "liquidity/setRefreshTable",
          //   payload: true,
          // });

          // disable button after each transaction on default, enable it after re-entering amount to add
          setWithdrawButtonText("Done");
          hideWithdrawModal();

          // store to localStorage
          //selectedRowData.positionId
          
        }
      })
    };
    // const sti = setInterval(, 500);
    checkStatusAndFinish();
  };
  const searchFilter = () => {
    if(token1.toLowerCase().includes(searchInput.toLowerCase()) || token2.toLowerCase().includes(searchInput.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  };

  const tableFilter = () => {
    if(selectedTable === 0) {
      return true;
    } else if(selectedTable === 1) {
      return (poolInfo.pendingReward.length === 1 && poolInfo.pendingReward[0].token) === "ACY"
    } else if(selectedTable === 2) {
      const table4 = poolInfo.pendingReward.length !== 1  ||
        (poolInfo.pendingReward.length === 1 && poolInfo.pendingReward[0].token) !== "ACY"
      if(tokenFilter) {
        let isBtcEth = false;
        poolInfo.pendingReward.forEach(({ token }) => {
          if (token === 'BTC' || token === 'ETH' || token === 'USDC' || token === 'USDT') {
            isBtcEth = true;
          }
        });
        return isBtcEth && table4;
      }
      return table4;
    }
  }

  const getFilter = () =>{
    if(dao) return false;
    return !tableFilter() || !searchFilter();
  }

  return ( poolInfo && (!isMyFarms || poolInfo.hasUserPosition) && (
    <div className={styles.tableBodyRowContainer} hidden={getFilter()}>
      {/* Table Content */}
      <div className={styles.tableBodyRowContentContainer}>
        {/* Token Title Row */}
        <div className={styles.tableBodyTitleColContainer}>
          {poolInfo.token1Logo && (
            <div className={styles.token1LogoContainer}>
              <img src={poolInfo.token1Logo} alt={poolInfo.token1} />
            </div>
          )}
          {/* conditionally hide and show token 2 logo. */}
          {/* if token 2 is undefined or null, hide token 2 logo. */}
          {poolInfo.token2Logo && (
            <div className={styles.token2LogoContainer}>
              <img src={poolInfo.token2Logo} alt={poolInfo.token2} />
            </div>
          )}

          {/* conditionally hide and show token 2 symbol */}
          {/* only display token 1 symbol if token 2 is undefined or null. */}
          <div className={styles.tokenTitleContainer}>
            {poolInfo.token1 && poolInfo.token2 && `${poolInfo.token1}-${poolInfo.token2}`}
            {poolInfo.token1 && !poolInfo.token2 && `${poolInfo.token1}s`}
            {poolInfo.token2 && !poolInfo.token1 && `${poolInfo.token2}s`}
            {!isMobile ? poolInfo.token1 && poolInfo.token2 && <span style={{ opacity: '0.5' }}> LP</span> : ''}
          </div>
        </div>

        {/* Pending Reward Column */}
        <div className={styles.tableBodyRewardColContainer}>
          <div className={styles.pendingRewardTitleContainer}>
            {(isMyFarms && !isMobile ) ? 'My Acy' : ''}
            {(!isMyFarms && !isMobile ) ? 'My Acy' : ''}
            {(isMobile) ? 'Reward' : ''}
            {isMobile}
          </div>
       
            <div className={styles.pendingReward1ContentContainer}>
              {`${AcyBalance}`}
            </div>
        </div>

        {/* Total APR Column */}
        <div className={styles.tableBodyAprColContainer}>
          <div className={styles.totalAprTitleContainer}>My Reward</div>
          <div className={styles.totalAprContentContainer}>{totalApr}%</div>
        </div>



        {/* TVL Column */}
        {!isMobile && (
          <div className={styles.tableBodyTvlColContainer}>
            {/* <div className={styles.tvlTitleContainer}>TVL</div>
            <div className={styles.tvlContentContainer}>${tvl}</div> */}
                <div>
                {walletConnected ? (
                    <button
                    type="button"
                    className={styles.daoButton}
                    onClick={() => {setShowAddLiquidity(true)}}
                    >
                    DAO
                    </button>
                ) : (
                    <button
                    type="button"
                    className={styles.daoButton}
                    onClick={connectWallet}
                    >
                    Connect Wallet
                    </button>
                )}
            </div>
          </div>
        )}

        {/* Arrow Icon Column */}
        {!hideArrow && (
          <div className={styles.tableBodyArrowColContainer}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.arrowIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
      
    <AcyModal
        visible={showAddLiquidity}
        onCancel={()=> setShowAddLiquidity(false)}
        width={400}
        bodyStyle={{
          padding: '0px',
          margin: '0px',
          background: '#FFFFFF',
          borderRadius: '1.5rem',
        }}
      >
        {/* <div className={`${styles.colItem} ${styles.swapComponent}`} > */}
            <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
              <div className={styles.trade}>
                <SwapComponent
                  onSelectToken0={token => {
                    setActiveToken0(token);
                  }}
                  onSelectToken1={token => {
                    setActiveToken1(token);

                  }}
                  onGetReceipt={null}
                />
              </div>
            </AcyCard>
          {/* </div> */}
      </AcyModal>
    </div>
    
  )
    
  );
};
export default connect(({ global, transaction, loading }) => ({
  global,
  transaction,
  loading: loading.global,
}))(DaoTableRow);

// export default FarmsTableRow;
