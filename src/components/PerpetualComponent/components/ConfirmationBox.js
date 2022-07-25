import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { BsArrowRight } from 'react-icons/bs';

import { getConstant } from '@/acy-dex-futures/utils/Constants'

import {
  USD_DECIMALS,
  PRECISION,
  BASIS_POINTS_DIVISOR,
  LIMIT,
  MIN_PROFIT_TIME,
  INCREASE,
  expandDecimals,
  getExchangeRate,
  getProfitPrice,
  getTimeRemaining,
  formatAmount,
  useLocalStorageSerializeKey,
  getExchangeRateDisplay,
  DEFAULT_SLIPPAGE_AMOUNT,
  SLIPPAGE_BPS_KEY,
  formatDateTime,
  calculatePositionDelta,
} from '../constant/index';
import { useConstantLoader } from '@/constants';
import Modal from '../Modal/Modal';
import Tooltip from '../Tooltip/Tooltip';
import Checkbox from '../Checkbox/Checkbox';
import ExchangeInfoRow from './ExchangeInfoRow';
import { constantInstance } from '@/constants';

import styles from './ConfirmationBox.less';

const HIGH_SPREAD_THRESHOLD = expandDecimals(1, USD_DECIMALS).div(100); // 1%;

function getSpread(fromTokenInfo, toTokenInfo) {
  if (fromTokenInfo && fromTokenInfo.maxPrice && toTokenInfo && toTokenInfo.minPrice) {
    const fromDiff = fromTokenInfo.maxPrice.sub(fromTokenInfo.minPrice);
    const fromSpread = fromDiff.mul(PRECISION).div(fromTokenInfo.maxPrice);
    const toDiff = toTokenInfo.maxPrice.sub(toTokenInfo.minPrice);
    const toSpread = toDiff.mul(PRECISION).div(toTokenInfo.maxPrice);
    const value = fromSpread.add(toSpread);
    return {
      value,
      isHigh: value.gt(HIGH_SPREAD_THRESHOLD),
    };
  }
}

export default function ConfirmationBox(props) {
  const {
    fromToken,
    fromTokenInfo,
    toToken,
    toTokenInfo,
    isLong,
    isMarketOrder,
    type,
    isShort,
    toAmount,
    fromAmount,
    onConfirmationClick,
    setIsConfirming,
    shortCollateralAddress,
    hasExistingPosition,
    leverage,
    existingPosition,
    existingLiquidationPrice,
    displayLiquidationPrice,
    shortCollateralToken,
    isPendingConfirmation,
    triggerPriceUsd,
    triggerRatio,
    fees,
    feesUsd,
    isSubmitting,
    fromUsdMin,
    toUsdMax,
    nextAveragePrice,
    collateralTokenAddress,
    feeBps,
    chainId,
    orders,
  } = props;

  const [savedSlippageAmount] = useLocalStorageSerializeKey(
    [chainId, SLIPPAGE_BPS_KEY],
    DEFAULT_SLIPPAGE_AMOUNT
  );
  const [isProfitWarningAccepted, setIsProfitWarningAccepted] = useState(false);

  const tokens = constantInstance.perpetuals.tokenList

  let minOut;
  let fromTokenUsd;
  let toTokenUsd;

  let collateralAfterFees = fromUsdMin;
  if (feesUsd) {
    collateralAfterFees = fromUsdMin.sub(feesUsd);
  }

  const getTitle = () => {
    if (!isMarketOrder) {
      return 'Confirm Limit Order';
    }
    return isLong ? 'Confirm Long' : 'Confirm Short';
  };
  const title = getTitle();

  const existingOrder = useMemo(
    () => {
      const wrappedToken = constantInstance.perpetuals.wrappedToken;
      for (const order of orders) {
        if (order.type !== INCREASE) continue;
        const sameToken =
          order.indexToken === wrappedToken.address
            ? toToken.isNative
            : order.indexToken === toToken.address;
        if (order.isLong === isLong && sameToken) {
          return order;
        }
      }
    },
    [orders, chainId, isLong, toToken.address, toToken.isNative]
  );

  const getError = () => {
    if (hasExistingPosition && !isMarketOrder) {
      const { delta, hasProfit } = calculatePositionDelta(triggerPriceUsd, existingPosition);
      if (hasProfit && delta.eq(0)) {
        return 'Invalid price, see warning';
      }
    }
    if (isMarketOrder && hasPendingProfit && !isProfitWarningAccepted) {
      return 'Forfeit profit not checked';
    }
    return false;
  };

  const getPrimaryText = () => {
    if (!isPendingConfirmation) {
      const error = getError();
      if (error) {
        return error;
      }

      const action = isMarketOrder ? (isLong ? 'Long' : 'Short') : 'Create Order';

      if (
        isMarketOrder &&
        hasExistingPosition &&
        existingPosition.delta.eq(0) &&
        existingPosition.pendingDelta.gt(0)
      ) {
        return isLong ? `Forfeit profit and ${action}` : `Forfeit profit and Short`;
      }

      return action;
    }

    if (!isMarketOrder) {
      return 'Creating Order...';
    }
    if (isLong) {
      return 'Longing...';
    }
    return 'Shorting...';
  };

  const isPrimaryEnabled = () => {
    if (getError()) {
      return false;
    }
    return !isPendingConfirmation && !isSubmitting;
  };

  const spread = getSpread(fromTokenInfo, toTokenInfo);
  // it's meaningless for limit/stop orders to show spread based on current prices
  const showSpread = isMarketOrder && !!spread;

  const renderSpreadWarning = useCallback(
    () => {
      if (!isMarketOrder) {
        return null;
      }

      if (spread && spread.isHigh) {
        return (
          <div className={styles.ConfirmationBoxWarning}>
            <Tooltip
              handle="Tips"
              position="center-bottom"
              renderContent={() => {
                return (
                  <>
                    {renderFeeWarning()}
                    The spread is > 1%, please ensure the trade details are acceptable before comfirming
                  </>
                );
              }}
            />
          </div>
        );
      }
    },
    [isMarketOrder, spread]
  );

  const renderFeeWarning = useCallback(
    () => {
      if (type === LIMIT || !feeBps || feeBps <= 50) {
        return null;
      }

      if (!collateralTokenAddress) {
        return null;
      }

      const collateralToken = constantInstance.perpetuals.getToken(collateralTokenAddress);
      console.log("hereim symbol", tokens, collateralToken)

      return (
        <div>
          Warning:&nbsp;
          Fees are high to swap from {fromToken.symbol} to {collateralToken.symbol}.&nbsp;
          {collateralToken.symbol} is needed for collateral. <br /><br />
        </div>
      );
    },
    [feeBps, collateralTokenAddress, chainId, fromToken.symbol, toToken.symbol, type]
  );

  const hasPendingProfit =
    existingPosition && existingPosition.delta.eq(0) && existingPosition.pendingDelta.gt(0);

  const renderMinProfitWarning = useCallback(
    () => {
      if (hasExistingPosition) {
        const minProfitExpiration = existingPosition.lastIncreasedTime + MIN_PROFIT_TIME;
        if (
          isMarketOrder &&
          existingPosition.delta.eq(0) &&
          existingPosition.pendingDelta.gt(0)
        ) {
          const profitPrice = getProfitPrice(existingPosition.markPrice, existingPosition);
          return (
            <div className={styles.ConfirmationBoxWarning}>
              <Tooltip
                handle="Tips"
                position="center-bottom"
                renderContent={() => {
                  return (
                    <>
                      {renderFeeWarning()}
                      Increasing this position at the current price will forfeit a&nbsp;
                      <a
                        href="https://gmxio.gitbook.io/gmx/trading#minimum-price-change"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        pending profit
                      </a>{' '}
                      of {existingPosition.deltaStr}.<br />
                      <br />
                      Profit price: {existingPosition.isLong ? '>' : '<'} $
                      {formatAmount(profitPrice, USD_DECIMALS, 2, true)}. This rule only applies for the
                      next {getTimeRemaining(minProfitExpiration)}, until{' '}
                      {formatDateTime(minProfitExpiration)}.
                    </>
                  );
                }}
              />
            </div>
          );
        }
        if (!isMarketOrder) {
          const { delta, hasProfit } = calculatePositionDelta(triggerPriceUsd, existingPosition);
          if (hasProfit && delta.eq(0)) {
            const profitPrice = getProfitPrice(existingPosition.markPrice, existingPosition);
            return (
              <div className={styles.ConfirmationBoxWarning}>
                <Tooltip
                  handle="Tips"
                  position="center-bottom"
                  renderContent={() => {
                    return (
                      <>
                        {renderFeeWarning()}
                        This order will forfeit a&nbsp;
                        <a
                          href="https://gmxio.gitbook.io/gmx/trading#minimum-price-change"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          profit
                        </a>{' '}
                        of {existingPosition.deltaStr}.<br />
                        Profit price: {existingPosition.isLong ? '>' : '<'} $
                        {formatAmount(profitPrice, USD_DECIMALS, 2, true)}. This rule only applies for the
                        next {getTimeRemaining(minProfitExpiration)}, until{' '}
                        {formatDateTime(minProfitExpiration)}.
                      </>
                    );
                  }}
                />
              </div>
            );
          }
        }
      }

      return (
        <div className={styles.ConfirmationBoxWarning}>
          <Tooltip
            handle="Tips"
            position="center-bottom"
            renderContent={() => {
              return (
                <>
                  {renderFeeWarning()}
                  A minimum price change of&nbsp;
                  <a
                    href="https://gmxio.gitbook.io/gmx/trading#minimum-price-change"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1.5%
                  </a>{' '}
                  is required for a position to be in profit. This only applies for the first{' '}
                  {MIN_PROFIT_TIME / 60 / 60} hours after increasing a position.
                </>
              );
            }}
          />
        </div>
      );
    },
    [hasExistingPosition, existingPosition, isMarketOrder, triggerPriceUsd]
  );

  const renderExistingOrderWarning = useCallback(
    () => {
      if (!existingOrder) {
        return;
      }
      const indexToken = constantInstance.perpetuals.getToken(existingOrder.indexToken);
      const sizeInToken = formatAmount(
        existingOrder.sizeDelta.mul(PRECISION).div(existingOrder.triggerPrice),
        USD_DECIMALS,
        4,
        true
      );
      return (
        <div className={styles.ConfirmationBoxWarning}>
          <Tooltip
            handle="Tips"
            position="center-bottom"
            renderContent={() => {
              return (
                <>
                  {renderFeeWarning()}
                  You have an active Limit Order to Increase {existingOrder.isLong ? 'Long' : 'Short'}{' '}
                  {sizeInToken} {indexToken.symbol} ($
                  {formatAmount(existingOrder.sizeDelta, USD_DECIMALS, 2, true)}) at price $
                  {formatAmount(existingOrder.triggerPrice, USD_DECIMALS, 2, true)}
                </>
              );
            }}
          />
        </div>
      );
    },
    [existingOrder, chainId]
  );

  // TODO handle unaprproved order plugin (very unlikely case)
  const renderMain = useCallback(
    () => {
      return (
        <div className={styles.ConfirmationBoxMain}>
          <span>
            Pay&nbsp;{formatAmount(fromAmount, fromToken.decimals, 4, true)} {fromToken.symbol} ($
            {formatAmount(fromUsdMin, USD_DECIMALS, 2, true)})
          </span>
          <div className={styles.ConfirmationBoxMainIcon} />
          <div>
            {isLong ? 'Long' : 'Short'}&nbsp;
            {formatAmount(toAmount, toToken.decimals, 4, true)} {toToken.symbol} ($
            {formatAmount(toUsdMax, USD_DECIMALS, 2, true)})
          </div>
        </div>
      );
    },
    [fromAmount, fromToken, toToken, fromUsdMin, toUsdMax, isLong, toAmount]
  );

  const INCREASE_ORDER_EXECUTION_GAS_FEE = getConstant(chainId, 'INCREASE_ORDER_EXECUTION_GAS_FEE');
  const executionFee = INCREASE_ORDER_EXECUTION_GAS_FEE;
  const renderExecutionFee = useCallback(
    () => {
      if (isMarketOrder) {
        return null;
      }
      return (
        <ExchangeInfoRow label="Execution Fee">
          {formatAmount(executionFee, 18, 4)} ETH
        </ExchangeInfoRow>
      );
    },
    [isMarketOrder, executionFee]
  );

  const renderAvailableLiquidity = useCallback(
    () => {
      let availableLiquidity;
      const riskThresholdBps = 5000;
      let isLiquidityRisk;
      const token = isLong ? toTokenInfo : shortCollateralToken;

      if (!token || !token.poolAmount || !token.availableAmount) {
        return null;
      }

      if (isShort) {
        availableLiquidity = token.availableAmount;

        const sizeTokens = toUsdMax.mul(expandDecimals(1, token.decimals)).div(token.minPrice);
        isLiquidityRisk = availableLiquidity
          .mul(riskThresholdBps)
          .div(BASIS_POINTS_DIVISOR)
          .lt(sizeTokens);
      } else {
        availableLiquidity = token.availableAmount;
        isLiquidityRisk = availableLiquidity
          .mul(riskThresholdBps)
          .div(BASIS_POINTS_DIVISOR)
          .lt(toAmount);
      }

      if (!availableLiquidity) {
        return null;
      }

      return (
        <ExchangeInfoRow label="Available Liquidity">
          <Tooltip
            position="right-bottom"
            handleClassName={isLiquidityRisk ? 'negative' : null}
            handle={
              <>
                {formatAmount(availableLiquidity, token.decimals, token.isStable ? 0 : 2, true)}{' '}
                {token.symbol}
              </>
            }
            renderContent={() =>
              isLiquidityRisk
                ? 'There may not be sufficient liquidity to execute your order when the price conditions are met'
                : 'The order will only execute if the price conditions are met and there is sufficient liquidity'
            }
          />
        </ExchangeInfoRow>
      );
    },
    [toTokenInfo, shortCollateralToken, isShort, isLong, toAmount, toUsdMax]
  );

  const renderMarginSection = useCallback(
    () => {
      return (
        <>
          <div className={styles.ConfirmationBoxInfo}>
            {renderMain()}
            {/* {renderFeeWarning()} */}
            {renderMinProfitWarning()}
            {renderExistingOrderWarning()}
            {hasPendingProfit && isMarketOrder && (
              <div className={styles.PositionEditor}>
                <Checkbox
                  isChecked={isProfitWarningAccepted}
                  setIsChecked={setIsProfitWarningAccepted}
                >
                  <span className={styles.muted}>Forfeit profit</span>
                </Checkbox>
              </div>
            )}
            {type === LIMIT && renderAvailableLiquidity()}
            {isShort && (
              <ExchangeInfoRow isImportant={true} label="Profits In">
                {constantInstance.perpetuals.getToken(shortCollateralAddress).symbol}
              </ExchangeInfoRow>
            )}
            {isLong && 
              <ExchangeInfoRow isImportant={true} label="Profits In" value={fromToken.symbol} />
            }
            <ExchangeInfoRow label="Leverage">
              {hasExistingPosition && toAmount && toAmount.gt(0) && (
                <div className={styles.inlineBlock}>
                  {formatAmount(existingPosition.leverage, 4, 2)}x
                  <BsArrowRight className={styles.transitionArrow} />
                </div>
              )}
              {toAmount && leverage && leverage.gt(0) && `${formatAmount(leverage, 4, 2)}x`}
              {!toAmount && leverage && leverage.gt(0) && `-`}
              {leverage && leverage.eq(0) && `-`}
            </ExchangeInfoRow>
            <ExchangeInfoRow label="Liq. Price">
              {hasExistingPosition && toAmount && toAmount.gt(0) && (
                <div className={styles.inlineBlock}>
                  ${formatAmount(existingLiquidationPrice, USD_DECIMALS, 2, true)}
                  <BsArrowRight className={styles.transitionArrow} />
                </div>
              )}
              {toAmount &&
                displayLiquidationPrice &&
                `$${formatAmount(displayLiquidationPrice, USD_DECIMALS, 2, true)}`}
              {!toAmount && displayLiquidationPrice && `-`}
              {!displayLiquidationPrice && `-`}
            </ExchangeInfoRow>
            <ExchangeInfoRow label="Fees">
              ${formatAmount(feesUsd, USD_DECIMALS, 2, true)}
            </ExchangeInfoRow>
            <ExchangeInfoRow label="Collateral">
              <Tooltip
                handle={`$${formatAmount(collateralAfterFees, USD_DECIMALS, 2, true)}`}
                position="right-bottom"
                renderContent={() => {
                  return (
                    <>
                      Your position's collateral after deducting fees.
                      <br />
                      <br />
                      Pay amount: ${formatAmount(fromUsdMin, USD_DECIMALS, 2, true)}
                      <br />
                      Fees: ${formatAmount(feesUsd, USD_DECIMALS, 2, true)}
                      <br />
                    </>
                  );
                }}
              />
            </ExchangeInfoRow>
            {showSpread && (
              <ExchangeInfoRow label="Spread" isWarning={spread.isHigh} isTop={true}>
                {formatAmount(spread.value.mul(100), USD_DECIMALS, 2, true)}%
              </ExchangeInfoRow>
            )}
            {isMarketOrder && (
              <ExchangeInfoRow label="Entry Price">
                {hasExistingPosition && toAmount && toAmount.gt(0) && (
                  <div className={styles.inlineBlock}>
                    ${formatAmount(existingPosition.averagePrice, USD_DECIMALS, 2, true)}
                    <BsArrowRight trclassName={styles.transitionArrow} />
                  </div>
                )}
                {nextAveragePrice && `$${formatAmount(nextAveragePrice, USD_DECIMALS, 2, true)}`}
                {!nextAveragePrice && `-`}
              </ExchangeInfoRow>
            )}
            {!isMarketOrder && (
              <ExchangeInfoRow label="Limit Price" isTop={true}>
                ${formatAmount(triggerPriceUsd, USD_DECIMALS, 2, true)}
              </ExchangeInfoRow>
            )}
            <ExchangeInfoRow label="Borrow Fee">
              {isLong && toTokenInfo && formatAmount(toTokenInfo.fundingRate, 4, 4)}
              {isShort &&
                shortCollateralToken &&
                formatAmount(shortCollateralToken.fundingRate, 4, 4)}
              {((isLong && toTokenInfo && toTokenInfo.fundingRate) ||
                (isShort && shortCollateralToken && shortCollateralToken.fundingRate)) &&
                '% / 1h'}
            </ExchangeInfoRow>
            {renderExecutionFee()}
          </div>
        </>
      );
    },
    [
      renderMain,
      renderMinProfitWarning,
      shortCollateralAddress,
      isShort,
      isLong,
      toTokenInfo,
      nextAveragePrice,
      toAmount,
      hasExistingPosition,
      existingPosition,
      isMarketOrder,
      triggerPriceUsd,
      showSpread,
      spread,
      displayLiquidationPrice,
      existingLiquidationPrice,
      feesUsd,
      leverage,
      renderExecutionFee,
      shortCollateralToken,
      renderExistingOrderWarning,
      chainId,
      renderFeeWarning,
      hasPendingProfit,
      isProfitWarningAccepted,
      renderAvailableLiquidity,
      type,
      fromUsdMin,
      collateralAfterFees,
    ]
  );

  return (
    <div className={styles.ConfirmationBox}>
      <Modal isVisible={true} setIsVisible={() => setIsConfirming(false)} label={title}>
        {renderMarginSection()}
        <div className={styles.ConfirmationBoxRow}>
          <button
            onClick={onConfirmationClick}
            className={styles.ConfirmationBoxButton}
            disabled={!isPrimaryEnabled()}
          >
            {getPrimaryText()}
          </button>
        </div>
      </Modal>
    </div>
  );
}
