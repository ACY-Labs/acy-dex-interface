import React, { useState, useEffect, useRef } from 'react';
import styles from '@/pages/Farms/Farms.less';
import { harvestAll, harvest} from '@/acy-dex-swap/core/farms';
import { AcyActionModal } from '@/components/Acy';
import { Icon } from 'antd';
import classNames from 'classnames';
import {TOKENLIST } from "@/constants";
import WithdrawModal from "./WithdrawModal";


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
    refreshPoolInfo,
    ratio
  } = props;

  const [isHarvestDisabled, setIsHarvestDisabled] = useState(false);
  const [withdrawModal,setWithdrawModal] = useState(false);
  const [withdrawButtonText,setWithdrawButtonText] = useState('Withdraw');
  const [withdrawButtonStatus,setWithdrawButtonStatus] = useState(true);
  const hideWithdrawModal = () => setWithdrawModalShow(false);

  const [harvestModal,setHarvestModal] = useState(false);
  const [harvestButtonText, setHarvestButtonText] = useState('Harvest');
  const [harvestButtonStatus,setHarvestButtonStatus] = useState(true);
  const hideHarvestModal = () => setHarvestModal(false);
  const showHarvestModal = () => setHarvestModal(true);
  const [errorMessages,setErrorMessages] = useState('');
  
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [percent,setPercent] = useState(50);


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
   const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          await refreshPoolInfo();
          setHarvestButtonText("Harvest");
          setHarvestButtonStatus(true);
          hideHarvestModal();
        }
      })
    };
    checkStatusAndFinish();
  }

  const withdrawCallback = status => {
    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {

        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          await refreshPoolInfo();
          setWithdrawButtonText("Withdraw");
          setWithdrawButtonStatus(false);
          hideWithdrawModal();      
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
                setWithdrawModalShow(true);
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
                    <img src={getLogoURIWithSymbol(reward.token)}/>
                  </div>
                  <div className={styles.token}>
                    {reward.token}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AcyActionModal>
      <WithdrawModal
        data={data}
        account={account}
        library={library}
        poolId={poolId}
        token1={token1}
        token1Logo={token1Logo}
        token2={token2}
        token2Logo={token2Logo}
        refreshPoolInfo={refreshPoolInfo}
        withdrawModalShow={withdrawModalShow}
        hideWithdrawModal={hideWithdrawModal}
        ratio={ratio}
      />
    </div>
  );
};

export default StakeRow;