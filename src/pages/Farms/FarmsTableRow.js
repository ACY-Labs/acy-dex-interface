import React, { forwardRef, useState, useEffect, useRef} from 'react';
import { useHistory } from 'react-router-dom';
import styles from '@/pages/Farms/Farms.less';
import { isMobile } from 'react-device-detect';
import { harvestAll, harvest, withdraw } from '@/acy-dex-swap/core/farms';
import { getUserTokenBalanceWithAddress } from '@/acy-dex-swap/utils';
import StakeModal from './StakeModal';
import { addLiquidity } from '@/acy-dex-swap/core/addLiquidity';
import { AcyActionModal, AcyModal, AcyButton, AcyBarChart } from '@/components/Acy';
import AddLiquidityComponent from '@/components/AddComponent';
import { Modal, Icon, Divider } from 'antd';
import { connect } from 'umi';
import moment from 'moment';
import classNames from 'classnames';
import { getPool, getPoolAccmulateReward} from '@/acy-dex-swap/core/farms';
import supportedTokens from '@/constants/TokenList';
import StakeRow from './StakeRow';

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


const FarmsTableRow = props => {
  const {
    index,
    lpTokens,
    rowClickHandler,
    walletConnected,
    connectWallet,
    hideArrow = false,
    chainId,
    account,
    library,
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
      stakeData: newPool.stakeData
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
      <div className={styles.tableBodyRowContentContainer} onClick={()=> setHidden(prevState => !prevState)}>
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
            {(isMyFarms && !isMobile ) ? 'Accumulated Reward' : ''}
            {(!isMyFarms && !isMobile ) ? 'Accumulated Reward' : ''}
            {(isMobile) ? 'Reward' : ''}
            {isMobile}
          </div>
          {poolInfo.pendingReward && poolInfo.pendingReward.map((reward,idx) => (
            <div className={styles.pendingReward1ContentContainer}>
              {`${reward.amount?reward.amount.slice(0,8):0} ${reward.token}`}
            </div>
          ))}
        </div>

        {/* Total APR Column */}
        <div className={styles.tableBodyAprColContainer}>
          <div className={styles.totalAprTitleContainer}>APR</div>
          <div className={styles.totalAprContentContainer}>{totalApr}%</div>
        </div>

        {/* TVL Column */}
        {!isMobile && (
          <div className={styles.tableBodyTvlColContainer}>
            <div className={styles.tvlTitleContainer}>TVL</div>
            <div className={styles.tvlContentContainer}>${tvl}</div>
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

      {/* Table Drawer */}
      {!isMyFarms && (
        <div className={styles.tableBodyDrawerContainer} hidden={hidden}>
        {/* Staking Propotion */}
        {!isMyFarms && (
          <div className={styles.tableBodyDrawerStakingPropotionContainer}>
            <div className={styles.tableBodyDrawerStakingPropotionTitle}>Staking Propotion = 20%</div>
            {/* <div className={styles.tableBodyDrawerStakingPropotionEquation}> ({token1}-{token2} LP) / ({token1}-{token2}) = 20% </div> */}
          </div>
        )}
        {/* Add Liquidity */}
        {!isMyFarms && (
          <div className={styles.tableBodyDrawerAddLiquidityContainer}>
            <div className={styles.tableBodyDrawerAddLiquidityTitle}>Add Liquidity</div>
              <button
                type="button"
                className={styles.tableBodyDrawerAddLiquidityButton}
                onClick={()=> setShowAddLiquidity(true)}
              >
                Add
              </button>
          </div>
        )}
        {/* Farm Column */}
        <div className={styles.tableBodyDrawerFarmContainer}>
          <div className={styles.tableBodyDrawerWalletTitle}>Start Farming</div>
            <div>
              {walletConnected ? (
                <button
                  type="button"
                  className={styles.tableBodyDrawerWalletButton}
                  onClick={showModal}
                >
                  Stake LP
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.tableBodyDrawerWalletButton}
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      { poolInfo.stakeData && poolInfo.stakeData.map((data,id) => {
        return (
        <div hidden={hidden||!isMyFarms}>
          {/* Farm Column */}   
          <StakeRow 
            data={data}
            library={library}
            account={account}
            harvestHistory={harvestHistory}
            poolId={poolId}
            refreshHarvestHistory={refreshHarvestHistory}
            token1={poolInfo.token1}
            token1Logo={poolInfo.token1Logo}
            token2={poolInfo.token2}
            token2Logo={poolInfo.token2Logo}
            refreshPoolInfo={refreshPoolInfo}
          >
              { id == Math.ceil(poolInfo.stakeData.length/2) - 1 ? (
            <div className={styles.tableBodyDrawerFarmContainer}>
              <div>
                <div className={styles.tableBodyDrawerWalletTitle}>Start Farming</div>
                <div>
                  {walletConnected ? (
                    <button
                      type="button"
                      className={styles.tableBodyDrawerWalletButton}
                      onClick={showModal}
                    >
                      Stake LP
                    </button>
                      ) : (
                    <button
                      type="button"
                      className={styles.tableBodyDrawerWalletButton}
                      onClick={connectWallet}
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
            ) : (
              <div className={styles.index0tableBodyDrawerFarmContainer}>
                {/* lp Amount {stakeData[id].lpAmount} */}
              </div>
            )}      
          </StakeRow>
          {/* <div className={styles.tableBodyDrawerWithdrawContainer}>
            <div className={styles.tableBodyDrawerWithdrawTitle}>Remaining</div>
            <div className={styles.tableBodyDrawerWithdrawContent}>
              <div className={styles.tableBodyDrawerWithdrawDaysDateContainer}>
                <div className={styles.tableBodyDrawerWithdrawDaysContainer}>
                  {data.remaining}
                </div>
                <div className={styles.tableBodyDrawerWithdrawDateContainer}>
                  {data.dueDate}
                </div>
              </div>
              
              <button
                type="button"
                className={styles.tableBodyDrawerWithdrawButton}
                onClick={() =>{
                  setSelectedRowData(data);
                  setWithdrawModal(true);
                }}
              >
                Withdraw
              </button>
            </div>
          </div>
          <div className={styles.tableBodyDrawerWithdrawContainer}>
            <div className={styles.tableBodyDrawerWithdrawTitle}>Pending Reward</div>
            <div className={styles.tableBodyDrawerWithdrawContent}>
              <div className={styles.tableBodyDrawerWithdrawDaysContainer}>
                {data.reward.map((reward,idx) => (
                  <div className={styles.tableBodyDrawerWithdrawDateContainer}>
                    {`${reward.amount} ${reward.token}`}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={styles.tableBodyDrawerWithdrawButton}
                style={isHarvestDisabled ? { cursor: 'not-allowed' } : {}}
                onClick={async () => {
                  setSelectedRowData(data);
                  showHarvestModal();
                }}
                disabled={isHarvestDisabled}
              >
                Harvest
              </button>
            </div>
          </div> */}
        </div>
        );
      })}
      
      <AcyActionModal
        visible={harvestModal}
        onCancel={hideHarvestModal}
        confirmText={harvestButtonText}
        onConfirm={()=>{
          if(harvestButtonStatus) {
            setHarvestButtonText(<>Processing <Icon type="loading" /></>);
            setHarvestButtonStatus(false);
            harvest(poolId, selectedRowData.positionId, setHarvestButtonText, harvestCallback,library, account)
          }

        }}
        disabled={!harvestButtonStatus}
      >
        <div> 
          
          <div className={styles.withdrawDetailContainer}>
            Rewards:
            {selectedRowData && selectedRowData.reward.map((reward,idx) => (
              <div className={styles.withdrawDetailContainer2}>
                <div className={styles.amountContainer}>
                  {reward.amount}
                </div>
                <div className={styles.tokenContainer}>
                  <div className={styles.tokenLogoContainer}>
                    { reward.token == "ACY" ? (
                        <img src={ACY_LOGO}/>
                      ) : (
                        <img src={'https://storageapi.fleek.co/chwizdo-team-bucket/ACY%20Token%20List/'+reward.token+'.svg'}/>
                      )
                    }
                  </div>
                  <div className={styles.token}>
                    {reward.token}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.harvestChart} >
            <AcyBarChart data={harvestHistory.myAll.slice(-14)} showXAxis barColor="#1d5e91" />
          </div>
        </div>
      </AcyActionModal>
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
        <div>
        <AddLiquidityComponent 
          onLoggedIn={()=>setLoggedIn(true)} 
          isFarm={true}
          token={{
            token1: poolInfo.token1,
            token2: poolInfo.token2
          }}
        />
        </div>
      </AcyModal>
      
      <StakeModal
        onCancel={hideModal}
        isModalVisible={isModalVisible}
        token1={poolInfo.token1}
        token2={poolInfo.token2}
        balance={balance}
        poolId={poolInfo.poolId}
        stakedTokenAddr={poolInfo.lpTokens}
        refreshPoolInfo={refreshPoolInfo}
        account={account}
        library={library}
        chainId={chainId}
      />
      {/* withdraw modal */}
      <AcyModal 
        backgroundColor="#0e0304" width={400} 
        visible={withdrawModal} 
        onCancel={hideWithdrawModal}>
        <div className={styles.removeAmountContainer}>
          <div>Withdraw Amount</div>
          <div className={styles.amountText}>
            <AutoResizingInput value={percent} onChange={setPercent} />%
          </div>
          <div className={styles.sliderContainer}>
            <input
              value={percent}
              type="range"
              className={styles.sliderInput}
              onChange={e => {
                setPercent(parseInt(e.target.value));
              }}
            />
          </div>
        </div>
        <div className={styles.tokenAmountContainer}>
          <div className={styles.tokenAmountContent}>
            <div className={styles.tokenAmount}>
              Amount
            </div>
            <div className={styles.tokenDetailContainer}>
              <div className={styles.tokenSymbol}>
                {selectedRowData && selectedRowData.lpAmount * percent / 100}
              </div>
            </div>
          </div>
          <div className={styles.tokenAmountContent}>
            <div className={styles.tokenAmount}>
              LP Token
            </div>
            <div className={styles.tokenDetailContainer}>
              <div>
                {poolInfo.token1Logo && (
                    <img src={poolInfo.token1Logo} alt="token" className={styles.tokenImg}/>
                )}
                {poolInfo.token2Logo && (
                    <img src={poolInfo.token2Logo} alt="token" className={styles.tokenImg}/>
                )}
              </div>
              <div className={styles.tokenSymbol}>
                
                {poolInfo.token1 && poolInfo.token2 && `${poolInfo.token1}-${poolInfo.token2}`}
                {poolInfo.token1 && !poolInfo.token2 && `${token1}`}
                {poolInfo.token2 && !poolInfo.token1 && `${poolInfo.token2}`}
                <span>&nbsp;LP</span>
              </div>
              
            </div>
          </div>
          <div className={styles.tokenAmountContent}>
            <div className={styles.tokenAmount}>
              Remaining
            </div>
            <div className={styles.tokenDetailContainer}>
              <div className={styles.tokenSymbol}>
                  {selectedRowData && selectedRowData.remaining }
              </div>
            </div>
          </div>
          
        </div>
        {/* <div className={styles.buttonContainer}> */}
 
        <div className={styles.modalButtonContainer}>
          <div className={styles.buttonPadding}>
              <button 
                  className={(!withdrawButtonStatus && classNames(styles.button,styles.buttonDisabled)) || styles.button}
                  // className={styles.button}
                  onClick={async () => {
                    if(!selectedRowData.locked && selectedRowData.lpAmount * percent / 100 != 0 && withdrawButtonStatus){
                      withdrawClicked();
                    }
                  }}
              >
                  {selectedRowData && selectedRowData.locked? "Locked":withdrawButtonText}
              </button>
          </div>
        </div>
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
}))(FarmsTableRow);

// export default FarmsTableRow;
