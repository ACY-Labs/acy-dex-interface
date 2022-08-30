import React, { useCallback, useEffect, useState } from 'react';
import className from 'classnames';
import { Divider, Icon, Input, Table, Button, Dropdown } from 'antd';
import { AcyIcon, AcyTabs, AcyTokenIcon, AcyCardList } from '@/components/Acy';

import styles from './TableComponent.less'

export function TradeHistoryTable(props) {
  const [currentKey, setCurrentKey] = useState('');
  const [isHover, setIsHover] = useState(false);

  function columnsCoin() {
    return [
      {
        title: (
          <div
            className={styles.tableHeaderFirst}
            onClick={() => { setCurrentKey('date') }}
          >
            Date
          </div>
        ),
        dataIndex: 'date',
        key: 'date',
        className: 'leftAlignTableHeader',
        render: (text, entry) => {
          return (
            <div className={styles.tableHeader}>{entry.date}</div>
          );
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('type') }}
          >
            Type
          </div>
        ),
        dataIndex: 'type',
        key: 'type',
        render: (text, entry) => {
          if (entry.type == 'sell') {
            return <div className={styles.tableData} style={{ color: 'red' }}>{entry.type}</div>;
          } else {
            return <div className={styles.tableData} style={{ color: 'green' }}>{entry.type}</div>;
          }
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('price') }}
          >
            Price USD
          </div>
        ),
        dataIndex: 'price',
        key: 'price',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.price}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('price_bnb') }}
          >
            Price BNB
          </div>
        ),
        dataIndex: 'price_bnb',
        key: 'price_bnb',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.price_bnb}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('amount_mine') }}
          >
            Amount MINE
          </div>
        ),
        dataIndex: 'amount_mine',
        key: 'amount_mine',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.amount_mine}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('total_bnb') }}
          >
            Total BNB
          </div>
        ),
        dataIndex: 'total_bnb',
        key: 'total_bnb',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.total_bnb}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('maker') }}
          >
            Maker
          </div>
        ),
        dataIndex: 'maker',
        key: 'maker',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.maker.slice(0,4)}...{entry.maker.slice(entry.maker.length-4,entry.maker.length)}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('clue') }}
          >
            Clue
          </div>
        ),
        dataIndex: 'clue',
        key: 'clue',
        render: (text, entry) => {
          return <div style={{display: 'flex'}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill='#b5b6b6' viewBox="0 0 50 50" className={styles.function}><path d="M30.2 42v-6.25h-7.7v-20.5h-4.65v6.5H4V6h13.85v6.25H30.2V6H44v15.75H30.2v-6.5h-4.7v17.5h4.7v-6.5H44V42ZM7 9v9.75Zm26.2 20.25V39ZM33.2 9v9.75Zm0 9.75H41V9h-7.8Zm0 20.25H41v-9.75h-7.8ZM7 18.75h7.85V9H7Z"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill='#b5b6b6' viewBox="0 0 50 50" className={styles.function}><path d="M9 39h20V29h10V9H9v30Zm0 3q-1.25 0-2.125-.875T6 39V9q0-1.25.875-2.125T9 6h30q1.25 0 2.125.875T42 9v21L30 42Zm6-15v-3h8.5v3Zm0-8v-3h18v3ZM9 39V9v30Z"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill='#b5b6b6' viewBox="0 0 50 50" className={styles.function}><path d="M22 40q-.85 0-1.425-.575Q20 38.85 20 38V26L8.05 10.75q-.7-.85-.2-1.8Q8.35 8 9.4 8h29.2q1.05 0 1.55.95t-.2 1.8L28 26v12q0 .85-.575 1.425Q26.85 40 26 40Zm2-13.8L36 11H12Zm0 0Z"/></svg>
          </div>;
        },
        visible: true,
      },
    ];
  }

  return (
    <div className={styles.nobgTable}>
      <Table
        dataSource={props.dataSource}
        columns={columnsCoin().filter(item => item.visible == true)}
        pagination={false}
        style={{
          marginBottom: '20px',
          cursor: isHover ? 'pointer' : 'default',
        }}
        onRowMouseEnter={() => setIsHover(true)}
        onRowMouseLeave={() => setIsHover(false)}
      />
    </div>
  );
}

export function PoolsActivityTable(props) {
  const [currentKey, setCurrentKey] = useState('');
  const [isHover, setIsHover] = useState(false);

  function columnsCoin() {
    return [
      {
        key: 'index',
        width: '6rem',
        render: (text, entry) => {
          if (entry.type == 'add') {
            return <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '24px' }} fill="green" viewBox="0 0 50 50"><path d="M22.5 38V25.5H10v-3h12.5V10h3v12.5H38v3H25.5V38Z"/></svg>;
          } else {
            return <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '24px' }} fill="red" viewBox="0 0 50 50"><path d="M10 25.5v-3h28v3Z"/></svg>;
          }
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeaderFirst}
            onClick={() => { setCurrentKey('token_amount') }}
          >
            Token Amount
          </div>
        ),
        dataIndex: 'token_amount',
        key: 'token_amount',
        className: 'leftAlignTableHeader',
        render: (text, entry) => {
          return (
            <div className={styles.tableHeader}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{entry.fromAmount} {entry.fromSymbol}</span>
                <span>{entry.toAmount} {entry.toSymbol}</span>
              </div>
            </div>
          );
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('token_value') }}
          >
            Token Value
          </div>
        ),
        dataIndex: 'token_value',
        key: 'token_value',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.token_value}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('ago') }}
          >
            Ago
          </div>
        ),
        dataIndex: 'ago',
        key: 'ago',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.ago}</div>;
        },
        visible: true,
      },
    ];
  }

  return (
    <div className={styles.nobgTable}>
      <Table
        dataSource={props.dataSource}
        columns={columnsCoin().filter(item => item.visible == true)}
        pagination={false}
        style={{
          marginBottom: '20px',
          cursor: isHover ? 'pointer' : 'default',
        }}
        onRowMouseEnter={() => setIsHover(true)}
        onRowMouseLeave={() => setIsHover(false)}
      />
    </div>
  );
}