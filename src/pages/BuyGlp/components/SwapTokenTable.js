/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable import/extensions */
import React, { useState } from 'react'
import { Icon, Table, Tooltip } from 'antd'
import className from 'classnames'
import { AcyTokenIcon,AcyButton } from '@/components/Acy'
import {
  abbrNumber,
  isDesktop,
  sortTable,
} from '@/pages/Market/Util';
import styles from './SwapTokenTable.less';

export default function TokenTable(props) {
    const [tokenSortAscending, setTokenSortAscending] = useState(true);
    const [tokenDisplayNumber, setTokenDisplayNumber] = useState(9);
    const [currentKey, setCurrentKey] = useState('');
    const [isHover, setIsHover] = useState(false);
    
    function columnsCoin(isAscending, onSortChange, isBuying, onClickSelectToken) {
      return [
        // # 序号
        {
          title: <div className={className(styles.tableHeaderFirst, styles.tableIndex)}> # </div>,
          key: 'index',
          width: '6rem',
          render: (text, record, index) => (
            <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
              {index + 1}
            </div>
          ),
          visible: isDesktop()
        },
        // Name 标题
        {
          title: <div className={styles.tableHeaderFirst}> Name </div>,
          dataIndex: 'name',
          key: 'name',
          className: 'leftAlignTableHeader',
          render: (text, entry) => (
            <div className={styles.tableHeader}>
              {/* <AcyTokenIcon symbol={entry.logoURL} /> */}
              <span>{' '}{entry.name}</span>
            </div>
            ),
          visible: true,
        },
        // Price 价格
        {
            title: <div className={styles.tableHeader}> Price </div>,
            dataIndex: 'price',
            key: 'price',
            render: (text, entry) => {
              return <div className={styles.tableData}>$ {entry.price}</div>
            },
            visible: isDesktop(),
        },
        // Pool
        {
            title: <div className={styles.tableHeader}> Pool </div>,
            dataIndex: 'pool',
            key: 'pool',
            render: (text, entry) => {
              return <div className={styles.tableData}>$ {entry.pool}</div>
            },
            visible: isBuying,
        },
        // Available
        {
            title: <div className={styles.tableHeader}> Available </div>,
            dataIndex: 'available',
            key: 'available',
            render: (text, entry) => {
              return <div className={styles.tableData}>$ {entry.available}</div>
            },
            visible: !isBuying,
        },
        // Wallet
        {
            title: <div className={styles.tableHeader}> Wallet </div>,
            dataIndex: 'wallet',
            key: 'wallet',
            render: (text, entry) => {
              return <div className={styles.tableData}> {entry.wallet}</div>
            },
            visible: isDesktop(),
        },
        // Fees
        {
            title: () => {
              return(
                <Tooltip 
                  placement='bottomLeft' 
                  color='#b5b5b6' 
                  mouseEnterDelay={0.5}
                  title={<div>Fees will be shown once you have entered an amount in the order form.</div>}
                >
                  <div className={styles.tableHeader}> 
                    <div className={styles.TooltipHandle}>
                      Fees
                    </div>
                  </div>
                </Tooltip>
              )
            },
            dataIndex: 'fees',
            key: 'fees',
            render: (text, entry) => {
              return <div className={styles.tableData}>{entry.fees}</div>
            },
            visible: isDesktop(),
        },
        // Buttons
        {
            title: <div className={styles.tableHeader}> </div>,
            // dataIndex: '',
            // key: '',
            render: (text, entry) => (
              <div className={styles.tableHeader}>
                {isBuying && 
                  <AcyButton 
                    className={styles.buywith} 
                    onClick={()=>{
                      onClickSelectToken(entry)
                    }}
                  >
                    Buy with {entry.symbol}
                  </AcyButton>
                }
                {!isBuying && 
                  <AcyButton 
                    className={styles.buywith} 
                    onClick={()=>{
                    onClickSelectToken(entry)
                  }}
                  >
                    Sell with {entry.symbol}
                  </AcyButton>
                }
              </div>
              ),
            visible: true,
          },
      ];
    }

    return (
      <Table
        dataSource={sortTable(props.dataSourceCoin, currentKey, tokenSortAscending).slice(
          0,
          tokenDisplayNumber + 1
        )}
        columns={columnsCoin(tokenSortAscending, () => {
          setTokenSortAscending(!tokenSortAscending);
        },props.isBuying,props.onClickSelectToken).filter(item => item.visible === true)}
        pagination={false}
        style={{
          marginBottom: '20px',
          cursor: isHover ? 'pointer' : 'default',
        }}
        onRowMouseEnter={() => setIsHover(true)}
        onRowMouseLeave={() => setIsHover(false)}
        footer={() => (
          <div className={styles.tableSeeMoreWrapper}>
            {props.dataSourceCoin.slice(0, tokenDisplayNumber + 1).length > tokenDisplayNumber && (
              <a
                className={styles.tableSeeMore}
                onClick={() => {
                  setTokenDisplayNumber(tokenDisplayNumber + 5);
                }}
              >
                See More...
              </a>
            )}
          </div>
        )}
      />
    );
  }