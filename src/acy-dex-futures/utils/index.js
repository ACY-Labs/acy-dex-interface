import {ethers} from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
export const USD_DECIMALS = 30;
export const BASIS_POINTS_DIVISOR = 10000;
export const MARGIN_FEE_BASIS_POINTS = 10;
export const LIQUIDATION_FEE = expandDecimals(5, USD_DECIMALS)
export const FUNDING_RATE_PRECISION = 1000000;
export const MAX_LEVERAGE = 100 * 10000;

export async function getGasLimit(contract, method, params = [], value, gasBuffer) {
  const defaultGasBuffer = 200000;
  const defaultValue = bigNumberify(0);

  if (!value) {
    value = defaultValue;
  }

  let gasLimit = await contract.estimateGas[method](...params, { value });

  if (!gasBuffer) {
    gasBuffer = defaultGasBuffer;
  }

  return gasLimit.add(gasBuffer);
}
export function bigNumberify(n){
    return BigNumber.from(n);
  }
  
  export const limitDecimals = (amount, maxDecimals) => {
    let amountStr = amount.toString()
    if (maxDecimals === undefined) {
      return amountStr
    }
    if (maxDecimals === 0) {
      return amountStr.split(".")[0]
    }
    const dotIndex = amountStr.indexOf(".")
    if (dotIndex !== -1) {
      let decimals = amountStr.length - dotIndex - 1
      if (decimals > maxDecimals) {
        amountStr = amountStr.substr(0, amountStr.length - (decimals - maxDecimals))
      }
    }
    return amountStr
  }
  export const padDecimals = (amount, minDecimals) => {
    let amountStr = amount.toString()
    const dotIndex = amountStr.indexOf(".")
    if (dotIndex !== -1) {
      const decimals = amountStr.length - dotIndex - 1
      if (decimals < minDecimals) {
        amountStr = amountStr.padEnd(amountStr.length + (minDecimals - decimals), "0")
      }
    } else {
      amountStr = amountStr + ".0000"
    }
    return amountStr
  }
  export const formatAmount = (amount, tokenDecimals, displayDecimals, defaultValue, useCommas) => {
    if (!defaultValue) {
      defaultValue = "..."
    }
    if (amount === undefined || amount.toString().length === 0) {
      return defaultValue
    }
    if (displayDecimals === undefined) {
      displayDecimals = 4
    }
    let amountStr = ethers.utils.formatUnits(amount, tokenDecimals)
    amountStr = limitDecimals(amountStr, displayDecimals)
    if (displayDecimals !== 0) {
      amountStr = padDecimals(amountStr, displayDecimals)
    }
    if (useCommas) {
      return numberWithCommas(amountStr)
    }
    return amountStr
  }
  
  export function numberWithCommas(x) {
    if (!x) { return "..." }
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
  
  
  export function expandDecimals(n, decimals) {
    return bigNumberify(n).mul(bigNumberify(10).pow(decimals))
  }
  export function getLiquidationPriceFromDelta({ liquidationAmount, size, collateral, averagePrice, isLong }) {
    if (!size || size.eq(0)) { return }
  
    if (liquidationAmount.gt(collateral)) {
      const liquidationDelta = liquidationAmount.sub(collateral)
      const priceDelta = liquidationDelta.mul(averagePrice).div(size)
      return !isLong ? averagePrice.sub(priceDelta) : averagePrice.add(priceDelta)
    }
  
    const liquidationDelta = collateral.sub(liquidationAmount)
    const priceDelta = liquidationDelta.mul(averagePrice).div(size)
  
    return isLong ? averagePrice.sub(priceDelta) : averagePrice.add(priceDelta)
  }
  //fee of holding a position
  export function getPositionFee(size) {
    if (!size) {
      return bigNumberify(0);
    }
    let myBigNumber = BigNumber.from('0xfbedfa25a3259ab347f7400000');
    console.log(myBigNumber);
    console.log("finding bug here", size);
    const afterFeeUsd = size.mul(BASIS_POINTS_DIVISOR - MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR)
    return size.sub(afterFeeUsd)
  }
  export const parseValue = (value, tokenDecimals) => {
    const pValue = parseFloat(value)
    if (isNaN(pValue)) {
      return undefined
    }
    value = limitDecimals(value, tokenDecimals)
    const amount = ethers.utils.parseUnits(value, tokenDecimals)
    return bigNumberify(amount)
  }
  //deposits only act on collateral
  function getNewPositionInfo ( position , collateralDelta, method, keepLeverage){
  
    if(!collateralDelta) return {};
  
    if(collateralDelta <=0 ) return {};
  
    if(method == 'Close'){
  
      const sizeDelta = collateralDelta;
  
      let newLiqPrice = getLiquidationPrice({
        isLong: position.isLong,
        size: position.size,
        sizeDelta,
        collateral: position.collateral,
        averagePrice: position.averagePrice,
        entryFundingRate: position.entryFundingRate,
        cumulativeFundingRate: position.cumulativeFundingRate,
        increaseCollateral: false
      });
  
    let newLeverage = getLeverage({
        size: position.size,
        sizeDelta,
        collateral: position.collateral,
        increaseCollateral: false,
        entryFundingRate: position.entryFundingRate,
        cumulativeFundingRate: position.cumulativeFundingRate,
        hasProfit: position.hasProfit,
        delta: position.delta,
        includeDelta: false
      });
  
      let newSize = position.size.sub(sizeDelta);
      let delta = sizeDelta.mul(position.collateral).div(position.size)
      let newCollateral = position.collateral.sub(delta);
      if(!keepLeverage){
  
        return { 
          'Size' : formatAmount(newSize,USD_DECIMALS,2,null,true),
          'Leverage' : formatAmount(newLeverage,4,2,null,true),
          'Liq. Price' : formatAmount(newLiqPrice,USD_DECIMALS,2,null,true)
        }
  
      }
      return { 
        'Size' : formatAmount(newSize,USD_DECIMALS,2,null,true),
        'Collateral' : formatAmount(newCollateral,USD_DECIMALS,2,null,true),
        'Liq. Price' : formatAmount(newLiqPrice,USD_DECIMALS,2,null,true)
      }
  
  
    }
  
    let newLiqPrice = getLiquidationPrice({
        isLong: position.isLong,
        size: position.size,
        collateral: position.collateral,
        averagePrice: position.averagePrice,
        entryFundingRate: position.entryFundingRate,
        cumulativeFundingRate: position.cumulativeFundingRate,
        collateralDelta,
        increaseCollateral: method == 'Deposit'
      });
  
      console.log("collateral delta : ", collateralDelta.toString());
      console.log("new liq price", newLiqPrice);
    let newLeverage = getLeverage({
        size: position.size,
        collateral: position.collateral,
        collateralDelta,
        increaseCollateral: method == 'Deposit',
        entryFundingRate: position.entryFundingRate,
        cumulativeFundingRate: position.cumulativeFundingRate,
        hasProfit: position.hasProfit,
        delta: position.delta,
        includeDelta: false
      });
  
      console.log("collateral delta : ", position.collateral.toString());
  
      let newCollateral = method == 'Deposit' ? position.collateral.add(collateralDelta) : position.collateral.sub(collateralDelta);
  
      return { 
        'Collateral' : formatAmount(newCollateral,USD_DECIMALS,2,null,true),
        'Leverage' : formatAmount(newLeverage,4,2,null,true),
        'Liq. Price' : formatAmount(newLiqPrice,USD_DECIMALS,2,null,true)
      }
        
  }
  
  
  // converts a current position into a new one according to the input ammount (USD)
  export function mapPositionData(position, mode, inputAmount, keepLeverage){
  
    switch(mode){
      case 'none' :
        return { 
              'Size' : formatAmount(position.size,USD_DECIMALS,2,null,true),
              'Collateral' : formatAmount(position.collateral,USD_DECIMALS,2,null,true),
              'Leverage' : formatAmount(position.leverage,4,2,null,true),
              'Mark Price' : formatAmount(position.markPrice,USD_DECIMALS,2,null,true),
              'Liq. Price' : formatAmount(position.liqPrice,USD_DECIMALS,2,null,true)
        }
      case 'Deposit':
        return getNewPositionInfo(position, inputAmount, 'Deposit');
      case 'Withdraw' :
        return getNewPositionInfo(position, inputAmount, 'Withdraw');
      case 'Close' :
        return getNewPositionInfo(position, inputAmount, 'Close', keepLeverage);
    }
  }
  
  export function getLiquidationPrice(data) {
    let { isLong, size, collateral, averagePrice, entryFundingRate, cumulativeFundingRate, sizeDelta, collateralDelta, increaseCollateral, increaseSize } = data
    if (!size || !collateral || !averagePrice) { return }
  
    let nextSize = size ? size : bigNumberify(0)
    let remainingCollateral = collateral
  
    if (sizeDelta) {
      if (increaseSize) {
        nextSize = size.add(sizeDelta)
      } else {
        if (sizeDelta.gte(size)) {
          return
        }
        nextSize = size.sub(sizeDelta)
      }
  
      const marginFee = getMarginFee(sizeDelta)
      remainingCollateral = remainingCollateral.sub(marginFee)
    }
  
    if (collateralDelta) {
      if (increaseCollateral) {
        remainingCollateral = remainingCollateral.add(collateralDelta)
      } else {
        if (collateralDelta.gte(remainingCollateral)) {
          return
        }
        remainingCollateral = remainingCollateral.sub(collateralDelta)
      }
    }
  
    let positionFee = getPositionFee(size).add(LIQUIDATION_FEE)
    if (entryFundingRate && cumulativeFundingRate) {
      const fundingFee = size.mul(cumulativeFundingRate.sub(entryFundingRate)).div(FUNDING_RATE_PRECISION)
      positionFee = positionFee.add(fundingFee)
    }
  
    const liquidationPriceForFees = getLiquidationPriceFromDelta({
      liquidationAmount: positionFee, size: nextSize, collateral: remainingCollateral, averagePrice, isLong
    })
  
    const liquidationPriceForMaxLeverage = getLiquidationPriceFromDelta({
      liquidationAmount: nextSize.mul(BASIS_POINTS_DIVISOR).div(MAX_LEVERAGE), size: nextSize, collateral: remainingCollateral, averagePrice, isLong
    })
  
    if (!liquidationPriceForFees) { return liquidationPriceForMaxLeverage }
    if (!liquidationPriceForMaxLeverage) { return liquidationPriceForFees }
  
    if (isLong) {
      // return the higher price
      return liquidationPriceForFees.gt(liquidationPriceForMaxLeverage) ? liquidationPriceForFees : liquidationPriceForMaxLeverage
    }
  
    // return the lower price
    return liquidationPriceForFees.lt(liquidationPriceForMaxLeverage) ? liquidationPriceForFees : liquidationPriceForMaxLeverage
  }
  
  export function getLeverage ({ size, sizeDelta, increaseSize, collateral, collateralDelta, increaseCollateral, entryFundingRate, cumulativeFundingRate, hasProfit, delta, includeDelta }) {
    if (!size && !sizeDelta) { return }
    if (!collateral && !collateralDelta) { return }
  
    let nextSize = size ? size : bigNumberify(0)
    if (sizeDelta) {
      if (increaseSize) {
        nextSize = size.add(sizeDelta)
      } else {
        if (sizeDelta.gte(size)) {
          return
        }
        nextSize = size.sub(sizeDelta)
      }
    }
  
    let remainingCollateral = collateral ? collateral : bigNumberify(0)
    if (collateralDelta) {
      if (increaseCollateral) {
        remainingCollateral = collateral.add(collateralDelta)
      } else {
        if (collateralDelta.gte(collateral)) {
          return
        }
        remainingCollateral = collateral.sub(collateralDelta)
      }
    }
  
    if (delta && includeDelta) {
      if (hasProfit) {
        remainingCollateral = remainingCollateral.add(delta)
      } else {
        if (delta.gt(remainingCollateral)) {
          return
        }
  
        remainingCollateral = remainingCollateral.sub(delta)
      }
    }
  
    if (remainingCollateral.eq(0)) { return }
  
    remainingCollateral = sizeDelta ? remainingCollateral.mul(BASIS_POINTS_DIVISOR - MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR) : remainingCollateral
    if (entryFundingRate && cumulativeFundingRate) {
      const fundingFee = size.mul(cumulativeFundingRate.sub(entryFundingRate)).div(FUNDING_RATE_PRECISION)
      remainingCollateral = remainingCollateral.sub(fundingFee)
    }
  
    return nextSize.mul(BASIS_POINTS_DIVISOR).div(remainingCollateral)
  }
  
  export function getMarginFee(sizeDelta) {
    if (!sizeDelta) {
      return bigNumberify(0);
    }
    const afterFeeUsd = sizeDelta.mul(BASIS_POINTS_DIVISOR - MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR)
    return sizeDelta.sub(afterFeeUsd)
  }