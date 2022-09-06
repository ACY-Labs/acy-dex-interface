import React, { useCallback, useEffect, useState } from 'react';
import className from 'classnames';
import { Divider, Icon, Input, Table, Button, Dropdown, Row, Col } from 'antd';
import { AcyIcon, AcyTabs, AcyTokenIcon, AcyCardList } from '@/components/Acy';

import styles from './styles.less'
import styled from "styled-components";

const StyledButton = styled(Button)`
.ant-btn:hover, .ant-btn:focus {
    color: #fff !important;
    border-color: black !important;
}
.ant-btn:hover, .ant-btn:focus, .ant-btn:active, .ant-btn.active {
    background: black;
}
.ant-btn, .ant-btn:active, .ant-btn:focus {
    outline: none;
}
`

export function LivePairsTable(props) {
    const [currentKey, setCurrentKey] = useState('');
    const [isHover, setIsHover] = useState(false);

    function columnsCoin() {
        return [
            {
                title: (
                    <div className={styles.tableHeaderFirst}>
                        #
                    </div>
                ),
                key: 'index',
                width: '6rem',
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
                key: 'name',
                className: 'leftAlignTableHeader',
                render: (text, entry) => {
                    return (
                        <div className={styles.tableHeader}>
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
                        onClick={() => { setCurrentKey('price') }}
                    >
                        Explanation
                    </div>
                ),
                dataIndex: 'price',
                key: 'price',
                render: (text, entry) => {
                    return <div className={styles.tableData}>wqefulqwbefiewoifnhlwenfwbefjebrfljenk</div>;
                },
                visible: true,
            },
            {
                //Buttons
                dataIndex: 'volume',
                key: 'volume',
                render: (text, entry) => {
                    return <div className={styles.tableData}>
                        <StyledButton className={styles.button}>
                            Deposit
                        </StyledButton>
                        <StyledButton className={styles.button}>
                            Withdraw
                        </StyledButton>
                        <StyledButton className={styles.button}>
                            Transfer
                        </StyledButton>
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
