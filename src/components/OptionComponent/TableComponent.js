import React, { useCallback, useEffect, useState } from 'react';
import className from 'classnames';
import { Divider, Icon, Input, Table, Button, Dropdown } from 'antd';
import { AcyIcon, AcyTabs, AcyTokenIcon, AcyCardList } from '@/components/Acy';

import styles from './TableComponent.less'



export function PositionTable(props){
    const [currentKey, setCurrentKey] = useState('');
    const [isHover, setIsHover] = useState(false);
    
    function columnsCoin() {
        return [
            {
                title: (
                <div
                    className={styles.tableHeaderFirst}
                    // onClick={() => { setCurrentKey('symbol') }}
                >
                    Symbol
                </div>
                ),
                dataIndex: 'symbol',
                // key: 'symbol',
                className: 'leftAlignTableHeader',
                render: (text, entry) => {
                return (
                    <div className={styles.tableHeader}>{entry.symbol}</div>
                );
                },
                visible: true,
            },
        {
            title: (
            <div
                className={styles.tableHeaderFirst}
                // onClick={() => { setCurrentKey('type') }}
            >
                Type
            </div>
            ),
            dataIndex: 'type',
            // key: 'type',
            className: 'leftAlignTableHeader',
            render: (text, entry) => {
                if (entry.type==='Short') {
                    return <div className={styles.tableData} style={{ color: 'red' }}>{entry.type}</div>;
                }else{
                    return <div className={styles.tableData} style={{ color: 'green' }}>{entry.type}</div>;
                }
            },
            visible: true,
        },
        {
            title: (
            <div
                className={styles.tableHeader}
                // onClick={() => { setCurrentKey('position') }}
            >
                Position
            </div>
            ),
            dataIndex: 'position',
            // key: 'position',
            render: (text, entry) => {
            return <div className={styles.tableData}>{entry.position}</div>;
            },
            visible: true,
        },
        {
            title: (
            <div
                className={styles.tableHeader}
                // onClick={() => { setCurrentKey('entryPrice') }}
            >
                Entry Price
            </div>
            ),
            dataIndex: 'entryPrice',
            // key: 'entryPrice',
            render: (text, entry) => {
            return <div className={styles.tableData}>{entry.entryPrice}</div>;
            },
            visible: true,
        },
        {
            title: (
            <div
                className={styles.tableHeader}
                // onClick={() => { setCurrentKey('markPrice') }}
            >
                Mark Price
            </div>
            ),
            dataIndex: 'markPrice',
            // key: 'markPrice',
            render: (text, entry) => {
            return <div className={styles.tableData}>{entry.markPrice}</div>;
            },
            visible: true,
        },
        {
            title: (
            <div
                className={styles.tableHeader}
                // onClick={() => { setCurrentKey('marginUsage') }}
            >
                Margin Usage
            </div>
            ),
            dataIndex: 'marginUsage',
            // key: 'marginUsage',
            render: (text, entry) => {
            return <div className={styles.tableData}>{entry.marginUsage}</div>;
            },
            visible: true,
        },
        {
            title: (
            <div
                className={styles.tableHeader}
                // onClick={() => { setCurrentKey('unrealizedPnl') }}
            >
                Unrealized Pnl
            </div>
            ),
            dataIndex: 'unrealizedPnl',
            // key: 'unrealizedPnl',
            render: (text, entry) => {
            return <div className={styles.tableData}>{entry.unrealizedPnl}</div>;
            },
            visible: true,
        },
        {
            title: (
            <div
                className={styles.tableHeader}
                // onClick={() => { setCurrentKey('accountFunding') }}
            >
                Account Funding
            </div>
            ),
            dataIndex: 'accountFunding',
            // key: 'accountFunding',
            render: (text, entry) => {
            return <div className={styles.tableData}>{entry.accountFunding}</div>;
            },
            visible: true,
        },
        {
            title: (
              <div
                className={styles.tableHeader}
                // onClick={() => { setCurrentKey('action') }}
              >
                Action
              </div>
            ),
            dataIndex: 'action',
            // key: 'action',
            render: (text, entry) => {
              return <Button
                type="primary"
                style={{
                marginLeft: '5px',
                background: 'transparent',
                borderColor: '#8c9196',
                }}
                onClick={()=>{
                    // props.onClosePosition(entry)
                }}>
                Close
              </Button>;
            },
            visible: true,
        },]
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
            rowKey='id'
          />
        </div>
      );
}