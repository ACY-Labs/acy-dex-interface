import React, { useState, useEffect, useRef} from 'react';
import styles from '@/pages/Farms/Farms.less';
import { withdraw } from '@/acy-dex-swap/core/farms';
import { AcyModal } from '@/components/Acy';
import { Icon } from 'antd';
import classNames from 'classnames';
import axios from 'axios';
import {API_URL, useConstantLoader } from "@/constants";
import Pattern from '@/utils/pattern';
import { StepBackwardFilled } from '@ant-design/icons';

const AutoResizingInput = ({ value: inputValue, onChange: setInputValue }) => {
    const handleInputChange = (e) => {
        const check = Pattern.coinNum.test(e.target.value);
        // newVal = newVal > 100 ? 100 : (newVal < 0 ? 0 : newVal);  // set newVal in range of 0~100
        if(check) {
            const value = parseFloat(e.target.value?e.target.value:0);
            setInputValue(e.target.value);
        }
    };

    const inputRef = useRef();
    useEffect(() => {
        const newSize = 8 + 0.5;
        inputRef.current.style.width = newSize + "ch";
    }, [inputValue]);

    useEffect(() => {
        setInputValue(inputValue);
    }, [setInputValue, inputValue]);

    return (
        <input
        ref={inputRef}
        type="text"
        className={styles.amountInput}
        value={inputValue}
        onChange={handleInputChange}
        autoFocus
        />
    );
};

const WithdrawModal = props => {
  const {
    data,
    account,
    library,
    poolId,
    token1,
    token1Logo,
    token2,
    token2Logo,
    refreshPoolInfo,
    hideWithdrawModal,
    withdrawModalShow,
    ratio,
    token1Ratio,
    token2Ratio
  } = props;

  const [withdrawModal,setWithdrawModal] = useState(false);
  const [withdrawButtonText,setWithdrawButtonText] = useState('Withdraw');
  const [withdrawButtonStatus,setWithdrawButtonStatus] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [percent,setPercent] = useState(50);
  const [totalUSDBalance, setTotalUSDBalance] = useState(0);
  const [lpValue, setLpValue] = useState(0);
  const [USDValue, setUSDValue] = useState(0);
  const {tokenList: supportedTokens, farmSetting: { API_URL: apiUrlPrefix}} = useConstantLoader();

  useEffect(() => {
    setTotalUSDBalance(data.lpAmount*ratio);
  }, [data, ratio]);

  useEffect(() => {
    if(withdrawAmount > totalUSDBalance || withdrawAmount == totalUSDBalance.toFixed(2)) {
        setPercent(100);
        setWithdrawAmount(totalUSDBalance.toFixed(2));
        setWithdrawButtonStatus(true);
      } else {
        setPercent(Math.round((withdrawAmount||0)/(totalUSDBalance||1)*100));
        if(!withdrawAmount || withdrawAmount == 0) {
            setWithdrawButtonStatus(false);
        } else {
            setWithdrawButtonStatus(true);
        }
      }
  }, [withdrawAmount]);

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

  const getTokenInde = (symbol) => {
    
  }

  const addPair = async ()  => {
    console.log("add to server return: ");
    if(token1 && token2 ) {
      let token1Detail = supportedTokens.find(token => token.symbol == token1)
      let token2Detail = supportedTokens.find(token => token.symbol == token2)
      if(token1Detail && token2Detail) {
        await axios.post(
          // update User pool
          `${apiUrlPrefix}/pool/update?walletId=${account}&action=add&token0=${token1Detail.address}&token1=${token2Detail.address}`
        ).then(res => {
        }).catch(e => console.log("error: ", e));
      }
    }
  };

  const withdrawCallback = status => {
    const checkStatusAndFinish = async () => {
      await library.getTransactionReceipt(status.hash).then(async receipt => {
        if (!receipt) {
          setTimeout(checkStatusAndFinish, 500);
        } else {
          await refreshPoolInfo();
          setWithdrawButtonText("Withdraw");
          setWithdrawButtonStatus(false);
          await addPair();
          hideWithdrawModal();    
        }
      })
    };
    checkStatusAndFinish();
  };

  const updateBalancePercentage = e => {
    const check = Pattern.coinNum.test(e.target.value);
    if(!check) return;
    if(e.target.value > 100) {
      setWithdrawAmount((parseFloat(totalUSDBalance).toFixed(2)));
      setPercent(100);
    } else{
        setWithdrawAmount((parseFloat((totalUSDBalance * (e.target.value)) / 100)).toFixed(2));
        setPercent(e.target.value);
    }
    setPercent(e.target.value);
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
    <AcyModal
        width={400}
        bodyStyle={{
            padding: '21px',
            background: '#0e0304',
            borderRadius: '.5rem',
        }}
        visible={withdrawModalShow} 
        onCancel={hideWithdrawModal}>
        <div className={styles.removeAmountContainer}>
            <div className={styles.balanceAmountContainer}>
            <div className={styles.balanceAmount}>
                {`Withdraw amount: ${(withdrawAmount>totalUSDBalance&&withdrawAmount!=totalUSDBalance.toFixed(2)?withdrawAmount/ratio:data.lpAmount*percent/100).toFixed(10)}  ${token2?` LP`: `${token1}`}`}
            </div>
            <div className={styles.balanceAmountInputContainer}>
                <input
                className={styles.balanceAmountInput}
                value={percent}
                onChange={e => updateBalancePercentage(e)}
                />
                <span className={styles.balanceAmountSuffix}>%</span>
            </div>
            </div>
            <div className={styles.amountText}>
            $ <AutoResizingInput value={withdrawAmount} onChange={setWithdrawAmount} />
            </div>
            <div className={styles.sliderContainer}>
            <input
                value={percent}
                type="range"
                className={styles.sliderInput}
                onChange={e => {
                updateBalancePercentage(e);
                }}
            />
            </div>
        </div>
        <div className={styles.tokenAmountContainer}>
            {/* <div className={styles.tokenAmountContent}>
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
            </div> */}
            { token1 && (
              <div>
                <div className={styles.tokenAmountContent}>
                  <div className={styles.tokenAmount}>
                    {token1Logo && (
                        <img src={token1Logo} alt="token" className={styles.tokenImg}/>
                    )}
                      {token1}
                  </div>
                  <div className={styles.tokenDetailContainer}>
                      <div className={styles.tokenSymbol}>
                        {data && (data.lpAmount * percent * token1Ratio/ 100).toFixed(6)}
                      </div>
                  </div>
                </div>
              </div>
            )}
            { token2 && (
              <div>
                <div className={styles.tokenAmountContent}>
                  <div className={styles.tokenAmount}>
                    {token2Logo && (
                        <img src={token2Logo} alt="token" className={styles.tokenImg}/>
                    )}
                      {token2}
                  </div>
                  <div className={styles.tokenDetailContainer}>
                      <div className={styles.tokenSymbol}>
                        {data && (data.lpAmount * percent * token2Ratio / 100).toFixed(6)}
                      </div>
                  </div>
                </div>
              </div>
            )}
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
        <div className={styles.modalButtonContainer}>
            <div className={styles.buttonPadding}>
                <button 
                className={((!withdrawButtonStatus||data.locked) && classNames(styles.button,styles.buttonDisabled)) || styles.button}
                onClick={async () => {
                    if(!data.locked && data.lpAmount * percent / 100 != 0 && withdrawButtonStatus){
                    withdrawClicked();
                    }
                }}
                >
                {data && data.locked? `Remaining: ${data.remaining}`:withdrawButtonText}
                </button>
            </div>
        </div>
    </AcyModal>
  );
};

export default WithdrawModal;