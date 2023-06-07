import React, { useCallback, useEffect, useState } from 'react';
import className from 'classnames';
import { Divider, Icon, Input, Table, Button, Dropdown } from 'antd';
import { AcyIcon, AcyTabs, AcyTokenIcon, AcyCardList } from '@/components/Acy';
import {ClosePositionModal} from '@/components/ClosePositionModal';
import {formatNumber} from '@/acy-dex-futures/utils'


import styles from './TableComponent.less'



export function PositionTable(props){
    const {chainId} = props
    const [currentKey, setCurrentKey] = useState('');
    const [isHover, setIsHover] = useState(false);
    const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState();
    
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
                let res = formatNumber(entry.entryPrice)
                return <div className={styles.tableData}>{res}</div>;
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
                let res = formatNumber(entry.markPrice)
                return <div className={styles.tableData}>{res}</div>;
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
                let res = formatNumber(entry.marginUsage)
                return <div className={styles.tableData}>{res}</div>;
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
                let res = formatNumber(entry.unrealizedPnl)
                return <div className={styles.tableData}>{res}</div>;
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
                return parseFloat(entry.accountFunding) == 0 ?
                <div className={styles.tableData}>{entry.accountFunding}</div>
                : <div className={styles.tableData}>{formatNumber(entry.accountFunding)}</div>
            },
            visible: true,
        },
        {
            title: (
            <div
                className={styles.tableHeader}
                // onClick={() => { setCurrentKey('accountFunding') }}
            >
                Liquidation Price
            </div>
            ),
            dataIndex: 'liquidationPrice',
            // key: 'liquidationPrice',
            render: (text, entry) => {
                let res = formatNumber(entry.liquidationPrice)
                return <div className={styles.tableData}>{res}</div>;
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
                    setSelectedPosition(entry);
                    setIsCloseModalVisible(true)
                }}>
                Close
              </Button>;
            },
            visible: true,
        },]
    }


    return (
        <div>
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
            <ClosePositionModal 
            isModalVisible={isCloseModalVisible} 
            onCancel = {() => setIsCloseModalVisible(false)}
            position = {selectedPosition}
            chainId = {chainId}
            />
        </div>
      );
}