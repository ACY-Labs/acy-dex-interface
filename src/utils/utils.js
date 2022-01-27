import moment from 'moment';
import React from 'react';
import nzh from 'nzh/cn';
import { parse, stringify } from 'qs';
import { BigNumber } from '@ethersproject/bignumber';
import { bigNumberify } from "ethers/utils";
import { ethers } from 'ethers';
export const USD_DECIMALS = 30;
export const BASIS_POINTS_DIVISOR = 10000;
export const MARGIN_FEE_BASIS_POINTS = 10;
export const LIQUIDATION_FEE = expandDecimals(5, USD_DECIMALS)
export const FUNDING_RATE_PRECISION = 1000000;
export const MAX_LEVERAGE = 100 * 10000;

export function TranslateToUSD(symbol,amount,priceList){
  if(!priceList[symbol]){
    console.log("not found");
    return amount;
  } 
  else{
    let result = amount * priceList[symbol];
    return result;
  }
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

export function totalInUSD (arr,priceList){
  // console.log(priceList);
  let total = 0;
  arr.forEach(element => {
     total = total + (TranslateToUSD(element.token,element.amount,priceList));
  });
  return total
}

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  return nzh.toMoney(n);
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  }
  if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}

export function formatWan(val) {
  const v = val * 1;
  if (!v || Number.isNaN(v)) return '';

  let result = val;
  if (val > 10000) {
    result = Math.floor(val / 10000);
    result = (
      <span>
        {result}
        <span
          style={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            marginLeft: 2,
          }}
        >
          万
        </span>
      </span>
    );
  }
  return result;
}

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export function isAntdPro() {
  return window.location.hostname === 'preview.pro.ant.design';
}

// 截取字符串
export function sortAddress(text) {
  // 转为string
  text = text + "";
  const length = text.length;
  if (text.length > 10) {
    return text.substring(0, 4) + "..." + text.substring(length - 4, length);
  }
  else {
    return text;
  }
}

// 数字格式化
export function abbrNumber(number) {
  const THOUSAND = 0;
  const MILLION = 1;

  let currentDivision = -1;
  let result = '';
  let tempNumber = number;

  if (number >= 1000) {
    tempNumber /= 1000;
    currentDivision = 0;
  }

  if (number >= 1000000) {
    tempNumber /= 1000;
    currentDivision = 1;
  }

  switch (currentDivision) {
    case 0:
      result = `${tempNumber.toFixed(2)}k`;
      break;
    case 1:
      result = `${tempNumber.toFixed(2)}m`;
      break;
    default:
      result = `${number.toFixed(4)}`;
      break;
  }

  return result;
}

// 对象数组去重
export function  uniqueFun(arr,type)
{
   const res = new Map();
   return arr.filter((a)=>!res.has(a[type])&& res.set(a[type],1));
} 