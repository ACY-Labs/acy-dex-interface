import styles from './exchangeTable.less';
import { Table } from 'antd'
import React, { useState } from 'react';

export const ExchangeTable = props => {
  //read props

  const columns = [
    {
      title: 'Exchange',
      dataIndex: 'Exchange',
    },
    {
      title:'Est. received',
      dataIndex: 'Estreceived',
    },
    {
      title:'Gas estimate',
      dataIndex: 'Gasestimate',
    },
    {
      title:'Diff',
      dataIndex: 'Diff',
    }
  ];
  
  const dataSource = [
    {
      Exchange: 'Filpper',
      Estreceived: '——',
      Gasestimate: '——',
      Diff: '——',
    },
    {
      Exchange: 'Origin Vault',
      Estreceived: '——',
      Gasestimate: '——',
      Diff: '——',
    },
    {
      Exchange: 'Uniswap V3',
      Estreceived: '——',
      Gasestimate: '——',
      Diff: '——',
    },
  ]
  const [stakeDisplayNumber, setStakeDisplayNumber] = useState(5);
  return (
    <div className={styles.exchangeTable}>
      <Table dataSource={dataSource} columns={columns} pagination={false} />

    </div>
    
  );
};
