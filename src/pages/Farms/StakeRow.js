import React, { forwardRef, useState, useEffect, useRef} from 'react';
import { useHistory } from 'react-router-dom';
import styles from '@/pages/Farms/Farms.less';
import { isMobile } from 'react-device-detect';
import { harvestAll, harvest, withdraw } from '@/acy-dex-swap/core/farms';
import { getUserTokenBalanceWithAddress, API_URL } from '@/acy-dex-swap/utils';
import StakeModal from './StakeModal';
import { addLiquidity } from '@/acy-dex-swap/core/addLiquidity';
import { AcyActionModal, AcyModal, AcyButton, AcyBarChart } from '@/components/Acy';
import AddLiquidityComponent from '@/components/AddComponent';
import { Modal, Icon, Divider } from 'antd';
import { connect } from 'umi';
import moment from 'moment';
import classNames from 'classnames';
import { getPool, getPoolAccmulateReward} from '@/acy-dex-swap/core/farms';
import axios from 'axios';
import {TOKENLIST} from "@/constants";
// const supportedTokens = TOKENLIST();

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


const StakeRow = props => {
  const {
    children,
    data,
    account,
    library,
    dispatch,
    poolId,
    token1,
    token1Logo,
    token2,
    token2Logo,
    refreshPoolInfo
  } = props;

  const [isHarvestDisabled, setIsHarvestDisabled] = useState(false);
  const [withdrawModal,setWithdrawModal] = useState(false);
  const [withdrawButtonText,setWithdrawButtonText] = useState('Withdraw');
  const [withdrawButtonStatus,setWithdrawButtonStatus] = useState(true);
  const hideWithdrawModal = () => setWithdrawModal(false);
  const showWithdrawModal = () => setWithdrawModal(true);

  const [harvestModal,setHarvestModal] = useState(false);
  const [harvestButtonText, setHarvestButtonText] = useState('Harvest');
  const [harvestButtonStatus,setHarvestButtonStatus] = useState(true);
  const hideHarvestModal = () => setHarvestModal(false);
  const showHarvestModal = () => setHarvestModal(true);
  const [errorMessages,setErrorMessages] = useState('');
  
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [percent,setPercent] = useState(50);

  const ACY_LOGO = "https://acy.finance/static/media/logo.78c0179c.svg";

  //function to get logo URI
  function getLogoURIWithSymbol(symbol) {
    const supportedTokens = TOKENLIST();
    for (let j = 0; j < supportedTokens.length; j++) {
      if (symbol === supportedTokens[j].symbol) {
        return supportedTokens[j].logoURI;
      }
    }
    return 'https://storageapi.fleek.co/chwizdo-team-bucket/token image/ethereum-eth-logo.svg';
  }

  // useEffect(
  //   () => {
  //     setErrorMessages('');
  //     setWithdrawButtonText('Withdraw');
  //     setHarvestButtonStatus(true);
  //   },[withdrawModal]
  // );
  // useEffect(
  //   () => {
  //     setErrorMessages('');
  //     setHarvestButtonText('Harvest');
  //     setHarvestButtonStatus(true);
  //   },[harvestModal]
  // );
  
  
  const withdrawClicked = () => {
    if(false) {
      setErrorMessages("- You can't withdraw now");
    } else {
      setWithdrawButtonStatus(false);
      setWithdrawButtonText(<>Processing <Icon type="loading" /></>);
      if(percent < 100 ) {
        withdraw(poolId, data.positionId, (data.lpAmount * percent / 100).toString(), setWithdrawButtonText, setWithdrawButtonStatus, withdrawCallback, library, account);
      } else {
        withdraw(poolId, data.positionId, data.lpAmount.toString(), setWithdrawButtonText, setWithdrawButtonStatus, withdrawCallback, library, account);
      }
      
    }
  };

  const harvestCallback = status => {
    // const transactions = props.transaction.transactions;
    // const isCurrentTransactionDispatched = transactions.filter(item => item.hash == status.hash).length;
    // trigger loading spin on top right
    // if (isCurrentTransactionDispatched == 0) {
    //   dispatch({
    //     type: "transaction/addTransaction",
    //     payload: {
    //       transactions: [...transactions, { hash: status.hash }]
    //     }
    //   })
    // }

    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          // let transactionTime;
          // await library.getBlock(receipt.logs[0].blockNumber).then(res => {
          //   transactionTime = moment(parseInt(res.timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
          // });

          // await axios.get(
          //   // fetch valid pool list from remote
          //   `${API_URL}/farm/updatePool?poolId=${poolId}`
          // ).then( async (res) => {
            
          //   console.log("update pool on server return: ", res);
          // }).catch(e => console.log("error: ", e));

          await refreshPoolInfo();
          setHarvestButtonText("Harvest");
          setHarvestButtonStatus(true);
          hideHarvestModal();
          // clear top right loading spin
          // const newData = transactions.filter(item => item.hash != status.hash);
          // dispatch({
          //   type: "transaction/addTransaction",
          //   payload: {
          //     transactions: [
          //       ...newData,
          //       { hash: status.hash, transactionTime }
          //     ]
          //   }
          // });
          // disable button after each transaction on default, enable it after re-entering amount to add
          
          
        }
      })
    };
    checkStatusAndFinish();
  }

  const withdrawCallback = status => {
    // const transactions = props.transaction.transactions;
    // const isCurrentTransactionDispatched = transactions.filter(item => item.hash == status.hash).length;
    //trigger loading spin on top right
    // if (isCurrentTransactionDispatched == 0) {
    //   dispatch({
    //     type: "transaction/addTransaction",
    //     payload: {
    //       transactions: [...transactions, { hash: status.hash }]
    //     }
    //   })
    // }

    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          // let transactionTime;
          // await library.getBlock(receipt.logs[0].blockNumber).then(res => {
          //   transactionTime = moment(parseInt(res.timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
          // });
          //refresh talbe
          // clear top right loading spin
          // const newData = transactions.filter(item => item.hash != status.hash);
          // dispatch({
          //   type: "transaction/addTransaction",
          //   payload: {
          //     transactions: [
          //       ...newData,
          //       { hash: status.hash, transactionTime }
          //     ]
          //   }
          // });
          // await axios.get(
          //   // fetch valid pool list from remote
          //   `${API_URL}/farm/updatePool?poolId=${poolId}`
          // ).then( async (res) => {
            
          //   console.log("update pool on server return: ", res);
          // }).catch(e => console.log("error: ", e));

          await refreshPoolInfo();
          setWithdrawButtonText("Withdraw");
          setWithdrawButtonStatus(false);
          hideWithdrawModal();
          // disable button after each transaction on default, enable it after re-entering amount to add
          
      
        }
      })
    };
    checkStatusAndFinish();
  };
  const formatString = (value) => {
    let formattedStr;
    if (value >= 1000000000) {
      formattedStr = `${(value / 1000000000).toFixed(2)}b`;
    }else if (value >= 1000000) {
      formattedStr = `${(value / 1000000).toFixed(2)}m`;
    } else if (value >= 1000) {
      formattedStr = `${(value / 1000).toFixed(2)}k`;
    } else {
      formattedStr = `${(value).toFixed(4)}`;
    }
    return formattedStr;
  }

  return ( 
    <div>
      <div className={styles.tableBodyDrawerContainer} >
        {children}
        {/* <div className={styles.tableBodyDrawerWithdrawContainer}>
        <div className={styles.tableBodyDrawerWithdrawContent}>
            <div className={styles.tableBodyDrawerWithdrawDaysDateContainer}>
              <div className={styles.tableBodyDrawerWithdrawDaysContainer}>
                Remaining
              </div> */}
              {/* <div className={styles.tableBodyDrawerWithdrawDateContainer}>
                Expired Date
              </div> */}
            {/* </div>
          </div>
          <div className={styles.tableBodyDrawerWithdrawContent}>
            <div className={styles.tableBodyDrawerWithdrawDaysDateContainer}>
              <div className={styles.tableBodyDrawerWithdrawDaysContainer}>
                {data.remaining}
              </div>
            </div>
            
            <button
              type="button"
              className={styles.tableBodyDrawerWithdrawButton}
              onClick={() =>{
                setWithdrawModal(true);
              }}
            >
              {withdrawButtonText}
            </button>
          </div>
        </div> */}
        <div className={styles.tableBodyDrawerWithdrawContainer}>
          <div className={styles.tableBodyDrawerWithdrawTitle}>Remaining</div>
          <div className={styles.tableBodyDrawerWithdrawContent}>
            <div className={styles.tableBodyDrawerWithdrawDaysContainer}>
              <div className={styles.tableBodyDrawerWithdrawDateContainer}>
                {data.remaining}
              </div>
            </div>
            <button
              type="button"
              className={styles.tableBodyDrawerWithdrawButton}
              onClick={() =>{
                setWithdrawModal(true);
              }}
            >
              {withdrawButtonText}
            </button>
          </div>
        </div>
        <div className={styles.tableBodyDrawerWithdrawContainer}>
          <div className={styles.tableBodyDrawerWithdrawTitle}>Pending Reward</div>
          <div className={styles.tableBodyDrawerWithdrawContent}>
            <div className={styles.tableBodyDrawerWithdrawDaysContainer}>
              {data.reward.map((reward,idx) => (
                <div className={styles.tableBodyDrawerWithdrawDateContainer}>
                  {`${formatString(reward.amount)} ${reward.token}`}
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.tableBodyDrawerWithdrawButton}
              style={isHarvestDisabled ? { cursor: 'not-allowed' } : {}}
              onClick={async () => {
                // setSelectedRowData(data);
                showHarvestModal();
              }}
              disabled={isHarvestDisabled}
            >
              {harvestButtonText}
            </button>
          </div>
        </div>
      </div>
      <AcyActionModal
        visible={harvestModal}
        onCancel={hideHarvestModal}
        confirmText={harvestButtonText}
        onConfirm={()=>{
          if(harvestButtonStatus) {
            setHarvestButtonText(<>Processing <Icon type="loading" /></>);
            setHarvestButtonStatus(false);
            // console.log(data);
            harvest(poolId, data.positionId, setHarvestButtonText, harvestCallback,library, account)
          }

        }}
        disabled={!harvestButtonStatus}
      >
        <div> 
          <div className={styles.withdrawDetailContainer}>
            Rewards:
            {data && data.reward.map((reward,idx) => (
              <div className={styles.withdrawDetailContainer2}>
                <div className={styles.amountContainer}>
                  {formatString(reward.amount)}
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
            {/* <AcyBarChart data={harvestHistory.myAll.slice(-14)} showXAxis barColor="#1d5e91" /> */}
          </div>
        </div>
      </AcyActionModal>
      {/* withdraw modal */}
      <AcyModal 
        // backgroundColor="#0e0304" width={400} 
        width={400}
        bodyStyle={{
          padding: '21px',
          background: '#0e0304',
          borderRadius: '.5rem',
      }}
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
                {data && (data.lpAmount * percent / 100).toFixed(6)}
              </div>
            </div>
          </div>
          <div className={styles.tokenAmountContent}>
            <div className={styles.tokenAmount}>
            {token1 && token2 && `LP Token`}
            {token1 && !token2 && `Token`}
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
                
                {token1 && token2 && `${token1}-${token2} LP`}
                {token1 && !token2 && `${token1}`}
                {token2 && !token1 && `${token2}`}
              </div>
              
            </div>
          </div>
          <div className={styles.tokenAmountContent}>
            <div className={styles.tokenAmount}>
              Remaining
            </div>
            <div className={styles.tokenDetailContainer}>
              <div className={styles.tokenSymbol}>
                  {data && data.remaining }
              </div>
            </div>
          </div>
          
        </div>
        {/* <div className={styles.buttonContainer}> */}
        <div className={styles.modalButtonContainer}>
          <div className={styles.buttonPadding}>
              <button 
                className={((!withdrawButtonStatus||data.locked) && classNames(styles.button,styles.buttonDisabled)) || styles.button}
                // className={styles.button}
                onClick={async () => {
                  if(!data.locked && data.lpAmount * percent / 100 != 0 && withdrawButtonStatus){
                    withdrawClicked();
                  }
                }}
              >
                {data && data.locked? "Locked":withdrawButtonText}
              </button>
          </div>
        </div>
      {/* </div> */}
      </AcyModal>
    </div>
  );
};
export default connect(({ global, transaction, loading }) => ({
  global,
  transaction,
  loading: loading.global,
}))(StakeRow);
