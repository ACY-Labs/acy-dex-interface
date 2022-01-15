
import React, { useState } from 'react';
import {  Divider, Icon, Input, Table  } from 'antd';
import styles from './PositionsTable.less';
import numeral from 'numeral';
import formatNumber from 'accounting-js/lib/formatNumber.js';
import { constantInstance } from '@/constants';
import { calcPercent } from '../utils/';
import AcyEditPositionModal from '@/components/AcyEditPositionModal';

function sortTableTime(table, key, isReverse) {
  return table.sort((a, b) => {
    if (isReverse) {
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    } else {
      return new Date(a[key]).getTime() - new Date(b[key]).getTime();
    }
  });
}

const StakeHistoryTable = props => {
  const [stakeDisplayNumber, setStakeDisplayNumber] = useState(5);
  const { dataSource, isMobile } = props;
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
  const [editPosition, setEditPosition] = useState();
  const [closePosition, setClosePosition] = useState();
  
  const onHandleEditModal = (position) =>{
    setEditPosition(position);
    setIsEditModalVisible(true);
  }
  const onHandleCloseModal = (position) =>{
    setClosePosition(position);
    setIsCloseModalVisible(true);
  }
  const sampleStakeHistoryColumns = [
    {
      title: 'Positions',
      dataIndex: '',
      align : 'left',
      render: (text, record) => {
          return (
          <div>
            <div className={styles.tableEntryBig}>
              {record.token.symbol}
            </div>
            <div>
              <span >
                {record.delta.toFixed(2)}x
              </span>
              {record.isLong ? (
                <span className={styles.tableEntryGreen}>
                  Long
                </span>
              ) : (
                <span className={styles.tableEntryRed}>
                  Short
                </span>
              )}
            </div>
          </div>
          );  
      }
    },
    {
      title: 'Net Value',
      dataIndex: 'netValue',
      align : 'left',
      render: (text,record) => {
        
        return <div>
          <div className={styles.tableEntryBig}>
              ${record.netValue}
            </div>
            <div>
              {record.PnL >= 0 ? (
                <span className={styles.tableEntryGreen}>
                  +{record.PnL} (+{calcPercent(record.PnL,record.collateral)}%) 
                </span>
              ) : (
                <span className={styles.tableEntryRed}>
                  {record.PnL}
                </span>
              )}
            </div>
          </div>;
      }
    },
    {
        title: 'Size',
        dataIndex: 'totalSize',
        align : 'left' ,
        render: (text,record) => {
          return <div className={styles.tableEntryBig}>$ {text.toFixed(2)}</div>;
        }
      },
    {
      title: 'Collateral',
      dataIndex: 'collateral',
      align : 'left',
      render: (text,record) => {
        return <div className={styles.tableEntryBig}>$ {text.toFixed(2)}</div>;
      }
    },
    {
      title: 'Mark Price',
      dataIndex: 'markPrice',
      align : 'left',
      render: (text,record) => {
        return <div className={styles.tableEntryBig}>$ {text.toFixed(2)}</div>;
      }
    },
    {
      title: 'Entry Price',
      dataIndex: 'entryPrice',
      align : 'left',
      render: (text,record) => {
        return <div className={styles.tableEntryBig}>$ {text.toFixed(2)}</div>;
      }
    },
    {
        title: 'Liq. Price',
        dataIndex: 'liqPrice',
        align : 'left',
        render: (text,record) => {
          return <div className={styles.tableEntryBig}>$ {text.toFixed(2)}</div>;
        }
      },
      {
        dataIndex: '',
        key: 'transactionTime',
        align : 'left',
        render: (text,record) => {
          return <div>
            <div className = {styles.rowEditButton} onClick={() =>  onHandleEditModal(record) }>
              Edit
            </div>
            <div className = {styles.rowEditButton} onClick={() => onHandleCloseModal(record) }>
              Close
            </div>
          </div>
        }
      },
    
  ]
  const sampleStakeHistoryMobileColumns = [
    {
      title: 'Positions ',
      key: 'fromforto',
      render: record =>`${record.action} ${record.token1Symbol} and ${record.token2Symbol}`
    },
    
    {
      title: 'Time',
      dataIndex: 'transactionTime',
      key: 'transactionTime'
    },
  ]

  return (
    <div>
      <div className={styles.nobgTable}>
        <Table
          columns={isMobile&&sampleStakeHistoryMobileColumns||sampleStakeHistoryColumns}
          dataSource={sortTableTime(dataSource,'transactionTime',true).slice(0,stakeDisplayNumber+1)}
          className={styles.tableStyle}
          pagination={false}
          locale={{ emptyText: 'No Positions Yet' }}
        />
      </div>
      <AcyEditPositionModal 
        EditPosition = {editPosition}
        isModalVisible={isEditModalVisible}
        onCancel = {() => setIsEditModalVisible(false)}/>
      {/* <AcyClosePositionModal 
        EditPosition = {closePosition}
        isModalVisible={isCloseModalVisible}
        onCancel = {() => setIsCloseModalVisible(false)}/> */}
    </div>
    
  );
};

export default StakeHistoryTable;