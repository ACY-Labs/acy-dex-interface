import React, { Component, useState, useCallback } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Table, Row, Col, Input, Divider, Icon, Badge } from 'antd';
import styles from './styles.less';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
  AcyCard,
  AcyIcon,
  AcyPeriodTime,
  AcyTabs,
  AcyCuarrencyCard,
  AcyConnectWalletBig,
  AcyModal,
  AcyInput,
  AcyCoinItem,
  AcyLineChart,
  AcyBarChart,
  AcyConfirm,
  AcyApprove,
} from '@/components/Acy';

export const TransactionType = {
  ALL: 'All',
  SWAP: 'Swap',
  ADD: 'Add',
  REMOVE: 'Remove',
};

export function abbrHash(hash) {
  let len = hash.length;
  let first = hash.slice(0, 6);
  let last = hash.slice(len - 4, len - 1);

  return first + '...' + last;
}

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
      result = `${number.toFixed(2)}`;
      break;
  }

  return result;
}

export function isDesktop() {
  const { innerWidth: width, innerHeight: height } = window;
  if (innerWidth < 768) return false;
  return true;
}

// sort the table
// Reverse means high to low
function sortTableRegular(table, key, isReverse) {
  return table.sort((a, b) => {
    if (isReverse) {
      return b[key] - a[key];
    } else {
      return a[key] - b[key];
    }
  });
}

function sortTableTime(table, key, isReverse) {
  return table.sort((a, b) => {
    if (isReverse) {
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    } else {
      return new Date(a[key]).getTime() - new Date(b[key]).getTime();
    }
  });
}

function sortString(table, key, isReverse) {
  return table.sort((a, b) => {
    if (isReverse) {
      return b[key].localeCompare(a[key]);
    } else {
      return a[key].localeCompare(b[key]);
    }
  });
}

// wrapper sort function
export function sortTable(table, key, isReverse) {
  if (key == 'time') return sortTableTime(table, key, isReverse);
  else if (key == 'name' || key == 'coin1' || key == 'coin2' || key == 'account')
    return sortString(table, key, isReverse);
  else return sortTableRegular(table, key, isReverse);
}

// open link in new tab
export const openInNewTab = url => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};
