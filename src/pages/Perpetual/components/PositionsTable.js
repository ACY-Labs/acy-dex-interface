
import React, { useState } from 'react';
import {  Divider, Icon, Input, Table  } from 'antd';
import styles from './PositionsTable.less';
import numeral from 'numeral';
import formatNumber from 'accounting-js/lib/formatNumber.js';
import { constantInstance } from '@/constants';
import { calcPercent } from '../utils/';
import AcyEditPositionModal from '@/components/AcyEditPositionModal';
import AcyClosePositionModal from '@/components/AcyClosePositionModal';
import { isDesktop } from '@/pages/Market/Util';
import {sortTableTime} from '../utils'

const PositionsTable = props => {
  const [displayNumber, setDisplayNumber] = useState(5);
  const { dataSource, isMobile } = props;
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState();
  
  const onHandleEditModal = (position) =>{
    setSelectedPosition(position);
    setIsEditModalVisible(true);
  }
  const onHandleCloseModal = (position) =>{
    setSelectedPosition(position);
    setIsCloseModalVisible(true);
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
            <div className = {styles.rowEditButton} onClick={() => onHandleCloseModal(record) }>
              Trigger
            </div>
          </div>
        }
      },
    
  ]
  const samplePositionsTableColumns = [
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
      },
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
          <div className = {styles.rowEditButton} onClick={() => onHandleCloseModal(record) }>
            Trigger
          </div>
        </div>
      }
    },
  ]

  return (
    <div>
      <div className={styles.nobgTable}>
        <Table
          columns={isMobile&&samplePositionsTableColumns || positionsTableColumns}
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
    </div>
    
  );
};

export default PositionsTable;
