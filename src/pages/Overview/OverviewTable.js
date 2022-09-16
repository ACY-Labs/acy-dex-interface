import React, { useCallback, useEffect, useState } from 'react';
import className from 'classnames';
import { Divider, Icon, Input, Table, Button, Dropdown, Row, Col } from 'antd';
import { AcyIcon, AcyTabs, AcyTokenIcon, AcyCardList } from '@/components/Acy';

import styles from './styles.less'
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";


export function LivePairsTable(props) {
    const [currentKey, setCurrentKey] = useState('');
    const [isHover, setIsHover] = useState(false);
    const [visibleModal, setVisibleModal] = useState(false);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);


    const columnsCoin =
         [
            {
                title: (
                    <div
                        className={styles.tableDataFirstColumn}
                        onClick={() => { setCurrentKey('index') }}
                    >
                        #
                    </div>
                ),
                key: 'index',
                width: '6rem',
                defaultSortOrder: 'descend',
                render: (text, record, index) => (
                    <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
                        {index + 1}
                    </div>
                ),
                visible: true,
            },
            {
                title: (
                    <div
                        className={styles.tableHeaderFirst}
                        onClick={() => { setCurrentKey('name') }}
                    >
                        Page Name
                    </div>
                ),
                dataIndex: 'name',
                defaultSortOrder: 'descend',
                key: 'name',
                render: (text, entry) => {
                    return (
                        <div className={styles.tableData}>
                            <Col>
                                <Row style={{ fontSize: "0.8rem" }}>
                                    {text}
                                </Row>
                                <Row style={{ fontSize: "1.2rem" }}>0.000000 BTC</Row>
                            </Col>
                        </div>
                    );
                },
                visible: true,
            },
            {
                title: (
                    <div
                        className={styles.tableHeaderFirst}
                        onClick={() => { setCurrentKey('Price') }}
                    >
                        Price
                    </div>
                ),
                dataIndex: 'Price',
                key: 'Price',
                defaultSortOrder: 'descend',
                render: (text, entry) => {
                    return <div className={styles.tableData}>0.000</div>;
                },
                visible: true,
            },
            {
                title: (
                    <div
                        className={styles.tableHeaderFirst}
                        onClick={() => { setCurrentKey('Balance') }}
                    >
                        Balance
                    </div>
                ),
                dataIndex: 'Balance',
                key: 'Balance',
                defaultSortOrder: 'descend',
                render: (text, entry) => {
                    return <div className={styles.tableData}>999.99</div>;
                },
                visible: true,
            },
            {
                title: (
                    <div
                        className={styles.tableHeaderFirst}
                        onClick={() => { setCurrentKey('Button') }}
                    >

                    </div>
                ),
                dataIndex: 'Button',
                key: 'Button',
                defaultSortOrder: 'descend',
                render: (text, entry) => {
                    return <div className={styles.tableData} style={{ float: "right" }}>
                        <Button className={styles.button} onClick={() => { handleOnClick("Deposit", entry.name) }}>
                            Deposit
                        </Button>
                        <Button className={styles.button} onClick={() => { handleOnClick("Withdraw", entry.name) }}>
                            Withdraw
                        </Button>
                        <Button className={styles.button} onClick={() => { handleOnClick("Transfer", entry.name) }}>
                            Transfer
                        </Button>
                        <Button className={styles.button} onClick={() => { handleOnClick("Send", entry.name) }}>
                            Send
                        </Button>
                    </div>;
                },
                visible: true,
            },
            Table.EXPAND_COLUMN,
        ];
    

    const handleOnClick = (type, row) => {
        console.log("hjhjhjhj overview js onclick", type, row);
        setVisibleModal(true);
    }

    const onTableRowExpand = (expanded, record) => {
        const keys = [];
        if (expanded) {
            keys.push(record.key); // I have set my record.id as row key. Check the documentation for more details.
        }
        console.log("hjhjhj expand table ", expanded, keys)
        setExpandedRowKeys(keys);
    };

    return (
        <div >
            <Table
                dataSource={props.dataSource}
                columns={columnsCoin}
                style={{
                    marginBottom: '20px',
                    cursor: isHover ? 'pointer' : 'default',
                }}
                pagination={false}
                expandIconColumnIndex={0}
                expandedRowKeys={expandedRowKeys}
                onExpand={onTableRowExpand}
                rowKey={record => record.key}
                expandable={{
                    expandIcon: ({ expanded, onExpand, record }) =>
                        {expanded ? (
                            <MinusCircleTwoTone onClick={e => onExpand(record, e)} />
                        ) : (
                            <PlusCircleTwoTone onClick={e => onExpand(record, e)} />
                        )},
    
                    expandRowByClick: true,
                    expandedRowRender: (record1) => (
                        <div style={{ background: '#1b1d23' }}>
                            woweih {record1}
                            {/* <KpChildTable
                          style={{ margin: '0' }}
                          columns={childAssetColumns}
                          showHeader={false}
                          pagination={false}
                          dataSource={record1.pools}
                          onRow={(record2) => {
                            return {
                              onClick: (event) => {
                                setR1(record1);
                                setR2(record2);
                              }, // 点击行
                            };
                          }}
                        /> */}
                        </div>
                    ),
                }}
                onRowMouseEnter={() => setIsHover(true)}
                onRowMouseLeave={() => setIsHover(false)}
            />
        </div>
    );
}
