
import React, { useState } from 'react';
import {  Divider, Icon, Input, Table  } from 'antd';
import styles from './PositionsTable.less';
import numeral from 'numeral';
import formatNumber from 'accounting-js/lib/formatNumber.js';
import { constantInstance } from '@/constants';
import { calcPercent } from '../utils/';
import AcyEditPositionModal from '@/components/AcyEditPositionModal';
import AcyClosePositionModal from '@/components/AcyClosePositionModal';
import AcyCreateOrderModal from '@/components/AcyCreadeOrderModal';
import { isDesktop } from '@/pages/Market/Util';
import { BigNumber } from '@ethersproject/bignumber';
import {getLiquidationPrice, USD_DECIMALS} from  '@/utils/utils';
import { formatAmount } from '@/utils/utils';

import { ethers } from 'ethers'
function sortTableTime(table, key, isReverse) {
  return table.sort((a, b) => {
    if (isReverse) {
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    } else {
      return new Date(a[key]).getTime() - new Date(b[key]).getTime();
    }
  });
}

const PositionsTable = props => {
  const [displayNumber, setDisplayNumber] = useState(5);
  const { dataSource, isMobile } = props;
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
  const [isCreateOrderModalVisible, setIsCreateOrderModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState();

  const onHandleEditModal = (position) =>{
    setSelectedPosition(position);
    setIsEditModalVisible(true);
  }
  const onHandleCloseModal = (position) =>{
    setSelectedPosition(position);
    setIsCloseModalVisible(true);
  }

  const onHandleCreateOderModal = (position) => {
    setSelectedPosition(position);
    setIsCreateOrderModalVisible(true);
  }
  const positionsTableColumns = [
    {
      title: 'Positions',
      dataIndex: '',
      align : 'left',
      render: (text, record) => {
          return (
          <div>
            <div className={styles.tableEntryBig}>
              {record.indexToken.symbol}
            </div>
            <div>
              <span >
                {formatAmount(record.leverage, 4, 2, null , true)}x
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
      },
      visible : true
    },
    {
      title: 'Net Value',
      dataIndex: 'netValue',
      align : 'left',
      render: (text,record) => {
        
        return <div>
          <div className={styles.tableEntryBig}>
              ${formatAmount(record.netValue, USD_DECIMALS, 2, null , true)}
            </div>
            <div>
                <span className={record.hasProfit && styles.tableEntryGreen ||styles.tableEntryRed}>
                  {record.deltaStr} ({record.deltaPercentageStr})
                </span>
            </div>
          </div>;
      }
    },
    {
        title: 'Size',
        dataIndex: 'size',
        align : 'left' ,
        render: (text,record) => {
          return <div className={styles.tableEntryBig}>$ {formatAmount(text, USD_DECIMALS, 2, null , true)}</div>;
        }
      },
    {
      title: 'Collateral',
      dataIndex: 'collateral',
      align : 'left',
      render: (text,record) => {
        return <div className={styles.tableEntryBig}>$ {formatAmount(text, USD_DECIMALS, 2, null , true)}</div>;
      }
    },
    {
      title: 'Mark Price',
      dataIndex: 'markPrice',
      align : 'left',
      render: (text,record) => {
        return <div className={styles.tableEntryBig}>$ {formatAmount(text, USD_DECIMALS, 2, null , true)}</div>;
      }
    },
    {
      title: 'Entry Price',
      dataIndex: 'entryPrice',
      align : 'left',
      render: (text,record) => {
        return <div className={styles.tableEntryBig}>$ {formatAmount(text, USD_DECIMALS, 2, null , true)}</div>;
      }
    },
    {
        title: 'Liq. Price',
        dataIndex: 'liqPrice',
        align : 'left',
        render: (text,record) => {
          return <div className={styles.tableEntryBig}>$ {formatAmount(text, USD_DECIMALS, 2, null , true)}</div>;
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
            <div className = {styles.rowEditButton} onClick={() => onHandleCreateOderModal(record) }>
              Trigger
            </div>
          </div>
        }
      },
    
  ]
  const mobilePositionsTableColumns = [
    {
      title: 'Positions',
      dataIndex: '',
      align : 'left',
      render: (text, record) => {
          return (
          <div>
            <div className={styles.tableEntryBig}>
              {record.indexToken.symbol}
            </div>
            <div>
              <span >
                {formatAmount(record.leverage, 4, 2, null , true)}x
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
      },
      visible : true
    },
    {
      title: 'Net Value',
      dataIndex: 'netValue',
      align : 'left',
      render: (text,record) => {
        
        return <div>
          <div className={styles.tableEntryBig}>
              ${formatAmount(record.netValue, USD_DECIMALS, 2, null , true)}
            </div>
            <div>
                <span className={record.hasProfit && styles.tableEntryGreen ||styles.tableEntryRed}>
                  {record.deltaStr} ({record.deltaPercentageStr})
                </span>
            </div>
          </div>;
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
          <div className = {styles.rowEditButton} onClick={() => onHandleCreateOderModal(record) }>
            Trigger
          </div>
        </div>
      }
    }
  ]

  return (
    <div>
      <div className={styles.nobgTable}>
        <Table
          columns={isMobile&&mobilePositionsTableColumns || positionsTableColumns}
          dataSource={dataSource}
          className={styles.tableStyle}
          pagination={false}
          locale={{ emptyText: 'No Positions Available' }}
        />
      </div>
      <AcyEditPositionModal 
        Position = {selectedPosition}
        isModalVisible={isEditModalVisible}
        onCancel = {() => setIsEditModalVisible(false)}/>
      <AcyClosePositionModal 
        Position = {selectedPosition}
        isModalVisible={isCloseModalVisible}
        onCancel = {() => setIsCloseModalVisible(false)}/>
      <AcyCreateOrderModal 
        Position = {selectedPosition}
        isModalVisible={isCreateOrderModalVisible}
        onCancel = {() => setIsCreateOrderModalVisible(false)}/>
    </div>
    
  );
};

export default PositionsTable;
