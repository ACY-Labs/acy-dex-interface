import React, { forwardRef, useState, useEffect, useRef} from 'react';
import { useHistory } from 'react-router-dom';
import styles from '@/pages/Farms/Farms.less';
import { isMobile } from 'react-device-detect';
import { harvestAll, harvest, withdraw } from '@/acy-dex-swap/core/farms';
import { getUserTokenBalanceWithAddress } from '@/acy-dex-swap/utils';
import StakeModal from './StakeModal';
import { addLiquidity } from '@/acy-dex-swap/core/addLiquidity';
import { AcyActionModal, AcyModal, AcyButton, AcyBarChart } from '@/components/Acy';
import AddComponent from '@/components/AddComponent';
import { Modal, Icon, Divider } from 'antd';

const AutoResizingInput = ({ value: inputValue, onChange: setInputValue }) => {
  const handleInputChange = (e) => {
    let newVal = e.target.valueAsNumber || 0;
    newVal = newVal > 100 ? 100 : (newVal < 0 ? 0 : newVal);  // set newVal in range of 0~100
    console.log(newVal);
    setInputValue(newVal);
  };

  const inputRef = useRef();
  useEffect(() => {
    const newSize = inputValue.toString().length + 0.5;
    console.log("new size ", newSize);
    inputRef.current.style.width = newSize + "ch";
    console.log(inputRef.current.style.width);
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


const FarmsTableRow = ({
  index,
  lpTokens,
  poolId,
  stakedTokenAddr,
  token1,
  token1Logo,
  token2,
  token2Logo,
  totalApr,
  tvl,
  hidden,
  rowClickHandler,
  pendingReward,
  walletConnected,
  connectWallet,
  hideArrow = false,
  chainId,
  account,
  library,
  isMyFarms,
  userRewards,
  stakeData,
  harvestHistory,
}) => {
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
  useEffect(
    () => {
      console.log('stake Data Table row:',stakeData);
      console.log('userRewards Table row:',userRewards);
      if (!stakedTokenAddr || !chainId || !account || !library) return;
      async function getFarmTokenUserBalance() {
        const bal = await getUserTokenBalanceWithAddress(
          stakedTokenAddr,
          chainId,
          account,
          library
        );
        console.log(bal);
        setBalance(bal);
      }
      getFarmTokenUserBalance();
    },
    [stakedTokenAddr]
  );
  useEffect(
    () => {
      setErrorMessages('');
      setWithdrawButtonText('Withdraw');
    },[withdrawModal]
  );
  useEffect(
    () => {
      setErrorMessages('');
      setHarvestButtonText('Harvest');
    },[harvestModal]
  );
  
  let history = useHistory();

  const redirectLiquidity = () => {
    console.log(token1,token2);
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
    console.log("unstake button clicked 2");
    if(false) {
      
      setErrorMessages("- You can't withdraw now");
    } else {
      setWithdrawButtonStatus(false);
      setWithdrawButtonText(<>Processing <Icon type="loading" /></>);
      withdraw(poolId, selectedRowData.positionId, (selectedRowData.lpAmount * percent / 100).toString(), setWithdrawButtonText, setWithdrawButtonStatus, withdrawCallback, library, account);
    }
  };

  const withdrawCallback = status => {
    console.log("test status:", status);
    const transactions = props.transaction.transactions;
    const isCurrentTransactionDispatched = transactions.filter(item => item.hash == status.hash).length;
    console.log("is current dispatched? ", isCurrentTransactionDispatched);
    // trigger loading spin on top right
    if (isCurrentTransactionDispatched == 0) {
      dispatch({
        type: "transaction/addTransaction",
        payload: {
          transactions: [...transactions, { hash: status.hash }]
        }
      })
    }

    console.log("test test see how many times setInterval is called");
    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {
        console.log("receipt ", receipt);

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          let transactionTime;
          await library.getBlock(receipt.logs[0].blockNumber).then(res => {
            transactionTime = moment(parseInt(res.timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
            console.log("test transactionTime: ", transactionTime)
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
          console.log(buttonContent);
          setWithdrawButtonContent("Done");

          // store to localStorage
        }
      })
    };
    // const sti = setInterval(, 500);
    checkStatusAndFinish();
  };

  return (
    <div className={styles.tableBodyRowContainer}>
      {/* Table Content */}
      <div className={styles.tableBodyRowContentContainer} onClick={rowClickHandler}>
        {/* Token Title Row */}
        <div className={styles.tableBodyTitleColContainer}>
          {token1Logo && (
            <div className={styles.token1LogoContainer}>
              <img src={token1Logo} alt={token1} />
            </div>
          )}

          {/* conditionally hide and show token 2 logo. */}
          {/* if token 2 is undefined or null, hide token 2 logo. */}
          {token2Logo && (
            <div className={styles.token2LogoContainer}>
              <img src={token2Logo} alt={token2} />
            </div>
          )}

          {/* conditionally hide and show token 2 symbol */}
          {/* only display token 1 symbol if token 2 is undefined or null. */}
          <div className={styles.tokenTitleContainer}>
            {token1 && token2 && `${token1}-${token2}`}
            {token1 && !token2 && `${token1}s`}
            {token2 && !token1 && `${token2}s`}
            {!isMobile ? token1 && token2 && <span style={{ opacity: '0.5' }}> LP</span> : ''}
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
          {pendingReward && pendingReward.map((reward,idx) => (
            <div className={styles.pendingReward1ContentContainer}>
              {`${reward.amount?reward.amount:0} ${reward.token}`}
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
      { isMyFarms && stakeData && stakeData.map((data,id) => {
        return (
          <div className={styles.tableBodyDrawerContainer} hidden={hidden}>
          {/* Farm Column */}
            { id == Math.ceil(stakeData.length/2) - 1 ? (
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
          {/* Withdraw */}
          <div className={styles.tableBodyDrawerWithdrawContainer}>
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
                disabled={!withdrawButtonStatus}
                onClick={() =>{
                  setSelectedRowData(data);
                  setWithdrawModal(true);
                }}
              >
                Withdraw
              </button>
            </div>
          </div>
          {/* Harvest Reward Column */}
          <div className={styles.tableBodyDrawerWithdrawContainer}>
            <div className={styles.tableBodyDrawerWithdrawTitle}>Pending Reward</div>
            <div className={styles.tableBodyDrawerWithdrawContent}>
              <div className={styles.tableBodyDrawerWithdrawDaysContainer}>
                {pendingReward && pendingReward.map((reward,idx) => (
                  <div className={styles.tableBodyDrawerWithdrawDateContainer}>
                    {`${data.reward[idx]} ${reward.token}`}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={styles.tableBodyDrawerWithdrawButton}
                style={isHarvestDisabled ? { cursor: 'not-allowed' } : {}}
                // onClick={() => harvest(poolId, data.positionId, library, account)}
                onClick={() => {
                  setSelectedRowData(data);
                  showHarvestModal();
                }}
                disabled={isHarvestDisabled}
              >
                Harvest
              </button>
            </div>
          </div>
        </div>
        );
      })}
      {/* <AcyActionModal
        visible={withdrawModal}
        onCancel={hideWithdrawModal}
        title="Withdraw"
        content="<h2>Please confirm your withdrawal</h2>"
        confirmText={withdrawButtonText}
        onConfirm={()=>{
          
          withdrawClicked();
        }}
      >
        <div>
          <br/>Amount: 
          <div className={styles.withdrawDetailContainer}>
            <div className={styles.tokenContainer}>
              {token1Logo && (
                <div className={styles.tokenLogoContainer}>
                  <img src={token1Logo} alt={token1} />
                </div>
              )}
              {token2Logo && (
                <div className={styles.tokenLogoContainer}>
                  <img src={token2Logo} alt={token2} />
                </div>
              )}
              <div className={styles.token}>
                {token1 && token2 && `${token1}-${token2}`}
                {token1 && !token2 && `${token1}`}
                {token2 && !token1 && `${token2}`}
              </div>
            </div>
            <div className={styles.amountContainer}>
              {selectedRowData?selectedRowData.lpAmount:null}
            </div>
          </div>
          <div className={styles.errorMessages}>
                {errorMessages}
            </div>
        </div>
      </AcyActionModal> */}
      
      <AcyActionModal
        visible={harvestModal}
        onCancel={hideHarvestModal}
        confirmText={harvestButtonText}
        onConfirm={()=>{
          if(harvestButtonStatus) {
            setHarvestButtonText(<>Processing <Icon type="loading" /></>);
            setHarvestButtonStatus(false);
            harvest(poolId, selectedRowData.positionId, setHarvestButtonText,library, account)
          }
          
        }}
      >
        <div>
          
          <div className={styles.withdrawDetailContainer}>
            Rewards:
            {pendingReward.map((reward,idx) => (
              <div className={styles.withdrawDetailContainer2}>
                <div className={styles.amountContainer}>
                  {selectedRowData?selectedRowData.reward[idx]:null}
                </div>
                <div className={styles.tokenContainer}>
                  <div className={styles.tokenLogoContainer}>
                    {
                      reward.token == "ACY" ? (
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
        <AddComponent onLoggedIn={()=>setLoggedIn(true)} />
        </div>
      </AcyModal>
      
      <StakeModal
        onCancel={hideModal}
        isModalVisible={isModalVisible}
        token1={token1}
        token2={token2}
        balance={balance}
        poolId={poolId}
        stakedTokenAddr={stakedTokenAddr}
      />
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
                {token1Logo && (
                    <img src={token1Logo} alt="token" className={styles.tokenImg}/>
                )}
                {token2Logo && (
                    <img src={token2Logo} alt="token" className={styles.tokenImg}/>
                )}
              </div>
              <div className={styles.tokenSymbol}>
                {token1 && token2 && `${token1}-${token2}`}
                {token1 && !token2 && `${token1}`}
                {token2 && !token1 && `${token2}`}
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
              <div className={styles.button}
                  onClick={async () => {
                    if(!selectedRowData.locked && selectedRowData.lpAmount * percent / 100 != 0 && withdrawButtonStatus){
                      withdrawClicked();
                    }
                  }}
              >
                  {selectedRowData && selectedRowData.locked? "Locked":withdrawButtonText}
              </div>
          </div>
        </div>

      {/* </div> */}
      </AcyModal>
    </div>
  );
};

export default FarmsTableRow;
