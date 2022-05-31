import React, { useCallback, useEffect, useState, useRef } from 'react';
import { connect } from 'umi';
import { Icon, Button, Input } from 'antd';
import { ethers } from 'ethers';
import styles from './index.less';
import { AcyModal, AcyCuarrencyCard, AcyDescriptions, AcyButton } from '@/components/Acy';

import { useConstantLoader } from '@/constants';
import classNames from 'classnames';
import { findTokenWithSymbol } from '@/utils/txData';
import { constantInstance } from '@/constants';
import { getUserTokenBalance } from '@/acy-dex-swap/utils';
import { formatAmount, mapPositionData, USD_DECIMALS,parseValue } from '@/acy-dex-futures/utils';
import { getAllSuportedTokensPrice } from '@/acy-dex-swap/utils';
import Router from "@/acy-dex-futures/abis/Router";

const AcyEditPositionModal = ({ Position, isModalVisible, onCancel, ...props }) => {
  const {
    account,
    chainId,
    library,
    farmSetting: { API_URL: apiUrlPrefix, NATIVE_CURRENCY: nativeToken },
    farmSetting: { INITIAL_ALLOWED_SLIPPAGE },
  } = useConstantLoader();
  const [fromToken, setFromToken] = useState({ symbol: 'ACY' });
  const [editIsLong, setEditIsLong] = useState(false);
  const [positionInfo, setPositionInfo] = useState({});
  const [fromAmount, setFromAmount] = useState('');
  const [maxFromAmount, setMaxFromAmount] = useState(0);
  const [barOption, setBarOption] = useState('Deposit');
  const [buttonContent, setButtonContent] = useState('Enter Amount');
  const [buttonIsEnabled, setButtonIsEnabled] = useState(false);
  const [newPositionInfo, setNewPositionInfo] = useState();
  const [fromAmountUSD, setFromAmountUSD] = useState(0);
  const { AddressZero } = ethers.constants;
  const nativeTokenAddress = findTokenWithSymbol(nativeToken).address;

  const mode = useRef();
  mode.current = barOption;

  useEffect(
    () => {
      if (Position) setDepositMode(Position);
    },
    [Position]
  );

  useEffect(
    async () => {
      if (Position) {
        if (fromAmount == 0) setFromAmountUSD(0);
        else if (!fromToken) setFromAmountUSD(0);

        const tokenPriceList = await getAllSuportedTokensPrice();
        const tokenPrice = tokenPriceList[fromToken.symbol];
        const tokenAmountUSD = tokenPrice * fromAmount;

        setFromAmountUSD(tokenAmountUSD.toFixed(2));
        const collateralDelta = parseValue(tokenAmountUSD, USD_DECIMALS);
        setNewPositionInfo(mapPositionData(Position, mode.current, collateralDelta));
      }
    },
    [fromAmount]
  );

  const handleCancel = () => {
    onCancel();
    setDepositMode();
  };

  const unlockButton = () => {
    setButtonContent('Enter Amount');
    setButtonIsEnabled(true);
  };
  const lockButton = err => {
    //err = 0 means normal enter ammount
    //err = 1 means input amount exceeds maxFromAmount ,
    //err = 2 means PROCESSING...
    if (mode.current == 'Deposit') {
      switch (err) {
        case 0:
          setButtonContent('Enter Amount');
          setButtonIsEnabled(false);
          return;
        case 1:
          setButtonContent('Not Enough Balance');
          setButtonIsEnabled(false);
          return;
        case 2:
          setButtonContent(
            <>
              Processing <Icon type="loading" />
            </>
          );
          setButtonIsEnabled(false);
          return;
      }
    } else {
      switch (err) {
        case 0:
          setButtonContent('Enter Amount');
          setButtonIsEnabled(false);
          return;
        case 1:
          setButtonContent('Not Enough Collateral');
          setButtonIsEnabled(false);
          return;
        case 2:
          setButtonContent(
            <>
              Processing <Icon type="loading" />
            </>
          );
          setButtonIsEnabled(false);
          return;
      }
    }
  };
  const resetParams = () => {
    setFromAmount('');
    setPositionInfo(mapPositionData(Position, 'none'));
  };

  const setDepositMode = async () => {
    setBarOption('Deposit');
    setFromToken(Position.indexToken);
    setMaxFromAmount(
      parseFloat(
        await getUserTokenBalance(fromToken, chainId, account, library).catch(e => {
          console.log('Edit position update balance dispatch error', e);
          return 0;
        })
      )
    );
    lockButton(0);
    setEditIsLong(Position.isLong);

    resetParams();
  };
  const setWithdrawMode = async () => {
    setBarOption('Withdraw');
    setFromToken(Position.collateralToken);
    setMaxFromAmount(parseFloat(formatAmount(Position.collateral, USD_DECIMALS, 2, null, false)));
    lockButton(0);
    resetParams();
  };

  const onInputChanged = (input, maxFromAmount) => {
    //check if input is legit
    console.log('input has changed', maxFromAmount, input);

    if (input == '') {
      lockButton(0);
      return;
    }

    if (input <= 0) {
      lockButton(1);
      return;
    }

    if (input > maxFromAmount) {
      lockButton(1);
      return;
    }

    setButtonContent(mode.current);
    setButtonIsEnabled(true);
  };

  //reset parameters when modal is not visible
  useEffect(
    () => {
      if (!isModalVisible) {
        setBarOption('Deposit');
      }
    },
    [isModalVisible]
  );

  const onClickMain = async () => {
    lockButton(2);
    if (mode.current == 'Deposit') {
      //perform deposit collateral
      const tokenAddress0 =
        Position.collateralToken.address === AddressZero
          ? nativeTokenAddress
          : Position.collateralToken.address;
      const path = [tokenAddress0];
      const indexTokenAddress =
        Position.indexToken.address === AddressZero
          ? nativeTokenAddress
          : Position.indexToken.address;

      const priceBasisPoints = Position.isLong ? 11000 : 9000;
      const priceLimit = Position.indexToken.maxPrice.mul(priceBasisPoints).div(10000);

      //format amount
      const amount = parseValue(fromAmount, USD_DECIMALS);

      let params = [path, indexTokenAddress, amount, 0, 0, position.isLong, priceLimit];

      let method = 'increasePosition';
      let value = bigNumberify(0);
      if (collateralTokenAddress === AddressZero) {
        method = 'increasePositionETH';
        value = amount;
        params = [path, indexTokenAddress, 0, 0, position.isLong, priceLimit];
      }

      if (shouldRaiseGasError(getTokenInfo(infoTokens, collateralTokenAddress), amount)) {
        setIsSwapping(false);
        helperToast.error(`Leave at least ${formatAmount(DUST_BNB, 18, 3)} ETH for gas`);
        return;
      }

      const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner());
      callContract(chainId, contract, method, params, {
        value,
        sentMsg: 'Deposit submitted!',
        successMsg: `Deposited ${formatAmount(fromAmount, position.collateralToken.decimals, 4)} ${
          position.collateralToken.symbol
        } into ${position.indexToken.symbol} ${position.isLong ? 'Long' : 'Short'}`,
        failMsg: 'Deposit failed',
        setPendingTxns,
      })
        .then(async res => {
          setFromValue('');
          setIsVisible(false);
        })
        .finally(() => {
          setIsSwapping(false);
        });
    } else {
      //perform withdraw collateral
      const tokenAddress0 =
        Position.collateralToken.address === AddressZero
          ? nativeTokenAddress
          : Position.collateralToken.address;
      const path = [tokenAddress0];
      const priceBasisPoints = Position.isLong ? 9000 : 11000;
      const priceLimit = Position.indexToken.maxPrice.mul(priceBasisPoints).div(10000); //UNCOMMENT THIS WHEN REAL POSITION READY
      const amount = parseValue(fromAmount, USD_DECIMALS);
      console.log('printing constants', path, amount, priceBasisPoints);
      let params = [
        tokenAddress0,
        indexTokenAddress,
        fromAmount,
        0,
        position.isLong,
        account,
        priceLimit,
      ];
      let method =
        collateralTokenAddress === AddressZero || collateralTokenAddress === nativeTokenAddress
          ? 'decreasePositionETH'
          : 'decreasePosition';

      const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner());
      callContract(chainId, contract, method, params, {
        sentMsg: 'Withdrawal submitted!',
        successMsg: `Withdrew ${formatAmount(fromAmount, USD_DECIMALS, 2)} USD from ${
          position.indexToken.symbol
        } ${position.isLong ? 'Long' : 'Short'}.`,
        failMsg: 'Withdrawal failed.',
        setPendingTxns,
      })
        .then(async res => {
          setFromValue('');
          setIsVisible(false);
        })
        .finally(() => {
          setIsSwapping(false);
        });
    }
  };

  return (
    <AcyModal
      backgroundColor="#0e0304"
      width={400}
      visible={isModalVisible}
      onCancel={handleCancel}
    >
      <div className={styles.modalTitle}>
        Edit {editIsLong ? 'Long' : 'Short'} {Position && Position.indexToken.symbol}
      </div>
      <div className={styles.optionBarContainer}>
        <div
          className={
            (barOption == 'Deposit' && classNames(styles.optionBarSelected, styles.optionBar)) ||
            styles.optionBar
          }
          onClick={() => setDepositMode(Position)}
        >
          Deposit
        </div>
        <div
          className={
            (barOption == 'Withdraw' && classNames(styles.optionBarSelected, styles.optionBar)) ||
            styles.optionBar
          }
          onClick={() => setWithdrawMode()}
        >
          Withdraw
        </div>
      </div>
      <AcyCuarrencyCard
        icon={fromToken.symbol}
        title={
          barOption == 'Deposit'
            ? `Balance : ${maxFromAmount.toFixed(5)}`
            : `Max : ${maxFromAmount.toFixed(5)}`
        }
        logoURI={fromToken.logoURI}
        coin={fromToken.symbol}
        yuan="566.228"
        dollar={`${maxFromAmount}`}
        token={fromAmount}
        showBalance={true}
        onChoseToken={async () => {
          // onClickCoin();
          // setBefore(true);
        }}
        onChangeToken={e => {
          setFromAmount(e);
          onInputChanged(e, maxFromAmount);
        }}
        isLocked={true}
        library={library}
      />
      <AcyDescriptions>
        {Object.keys(positionInfo).map((key, index) => {
          return (
            <div className={styles.infoSmallBox}>
              <div className={styles.infoBoxTitle}>{key}</div>
              {newPositionInfo && key in newPositionInfo ? (
                <div className={styles.infoBoxValue}>
                  <div>
                    <div className={styles.inlineInfoBlock}>
                      ${positionInfo[key]}
                      <svg className={styles.infoBoxTransitionArrow}>
                        <path
                          fill-rule="evenodd"
                          d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
                        />
                      </svg>
                    </div>
                    {newPositionInfo[key]}
                  </div>
                </div>
              ) : (
                <div className={styles.infoBoxValue}>${positionInfo[key]}</div>
              )}
            </div>
          );
        })}
      </AcyDescriptions>
      <div className={styles.buttonContainer}>
        <AcyButton
          variant="sucess"
          disabled={!buttonIsEnabled}
          onClick={() => {
            onClickMain();
          }}
        >
          {buttonContent}
        </AcyButton>
      </div>
    </AcyModal>
  );
};

export default connect(({ transaction, position }) => ({
  transaction,
  position,
}))(AcyEditPositionModal);
