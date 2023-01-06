/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable import/extensions */
import React, { useState, useMemo } from 'react'
import { Icon, Table, Tooltip, Button } from 'antd'
import className from 'classnames'
import { AcyTokenIcon, AcyButton } from '@/components/Acy'
import ExchangeInfoRow from '@/components/PerpetualComponent/components/ExchangeInfoRow'
import {
  abbrNumber,
  isDesktop,
  sortTable,
} from '@/pages/Market/Util';
import styles from './SwapTokenTable.less';
// import { API_URL } from '@/constants';
import axios from 'axios'; 


export default function TokenTable(props) {
  const [tokenSortAscending, setTokenSortAscending] = useState(true);
  const [tokenDisplayNumber, setTokenDisplayNumber] = useState(9);
  const [currentKey, setCurrentKey] = useState('');
  const [isHover, setIsHover] = useState(false);
  const [weight, setWeight] = useState({})
  const [confirmation, setConfirmation] = useState({})

  const unusedWeight = useMemo(() => {
    return (
      100 - Object.values(weight).reduce((accumulator, value) => {
        return (parseFloat(accumulator) + parseFloat(value ? value : 0)).toFixed(2)
      }, 0)
    )
  }, [weight])

  const buttonDisabled = useMemo(() => {
    return unusedWeight==0? false : true
  },[weight])

  const API_URL = () => { return "http://localhost:3001/bsc-main/api" }
  const handleClick = (e) => {
    console.log("LIST",props)
    let _weight = []
    for (const [key,value] of Object.entries(weight)){
      _weight.push({
        "tokenName":key,
        "weight":value
      })
    }
    console.log("Weight",_weight)
    console.log("WalletId",props.account)
    try{
      axios.post(
          `${API_URL()}/vote/addvote?walletId=${props.account}`,{
            "lpToken":"100",
            "acyToken":"500",
            "voteWeight":_weight
          }
      ).then((response)=>{
        console.log(response)
      })
    }catch(e){
        console.log("service not working...")
    }
    // LpToken, AcyToken
  }

  function columnsCoin(isAscending, onSortChange, isBuying, onClickSelectToken) {
    return [
      // # 序号
      // {
      //   title: <div className={className(styles.tableHeaderFirst, styles.tableIndex)}> # </div>,
      //   key: 'index',
      //   width: '6rem',
      //   render: (text, record, index) => (
      //     <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
      //       {index + 1}
      //     </div>
      //   ),
      //   visible: isDesktop()
      // },
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
        width: '15%',
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
        width: '15%',
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
        width: '13%',
      },
      // Available
      // {
      //   title: <div className={styles.tableHeader}> Available </div>,
      //   dataIndex: 'available',
      //   key: 'available',
      //   render: (text, entry) => {
      //     return <div className={styles.tableData}>$ {entry.available}</div>
      //   },
      //   visible: !isBuying,
      //   width: '25%',
      // },
      // Wallet
      {
        title: <div className={styles.tableHeader}> Wallet </div>,
        dataIndex: 'wallet',
        key: 'wallet',
        render: (text, entry) => {
          return <div className={styles.tableData}> {entry.wallet}</div>
        },
        visible: isDesktop(),
        width: '25%',
      },
      {
        title: <div className={styles.tableHeader}> Weight </div>,
        dataIndex: 'poolPercent',
        key: 'poolPercent',
        render: (text, entry) => (
          <div className={styles.tableData}>{entry.poolPercent} %</div>
        ),
        visible: true,
        width: '13%',
      },
      {
        title: <div className={styles.tableHeaderFirst}> Vote Weight </div>,
        render: (text, entry) => (
          <div className={styles.inputContainer}>
            <input
              type="number"
              min="0"
              placeholder="0.0"
              className={styles.optionInput}
              value={weight[entry.name]}
              name={entry.name}
              onChange={e => {
                const { name, value } = e.target
                setWeight(prevWeight => ({
                  ...prevWeight,
                  [name]: value
                }))
              }}
              onBlur={e => {
                const { name, value} = e.target
                if (value < 0 || isNaN(value)){
                    setWeight(prevWeight => ({
                        ...prevWeight,
                        [name]: 0
                      }))
                }
                if (unusedWeight < 0){
                  setWeight(prevWeight => ({
                      ...prevWeight,
                      [name]: parseFloat(value)+parseFloat(unusedWeight)
                      }))
                }
              }}
              disabled={confirmation[entry.name]}
              max="30"
            />
            <span className={styles.inputLabel}>%</span>
          </div>
        ),
        visible: true,
        width: '19%',
      },
      // Fees
      // {
      //   title: () => {
      //     return (
      //       <Tooltip
      //         placement='bottomLeft'
      //         color='#b5b5b6'
      //         mouseEnterDelay={0.5}
      //         title={<div>Fees will be shown once you have entered an amount in the order form.</div>}
      //       >
      //         <div className={styles.tableHeader}>
      //           <div className={styles.TooltipHandle}>
      //             Fees
      //           </div>
      //         </div>
      //       </Tooltip>
      //     )
      //   },
      //   dataIndex: 'fees',
      //   key: 'fees',
      //   render: (text, entry) => {
      //     return <div className={styles.tableData}>{entry.fees}</div>
      //   },
      //   visible: isDesktop(),
      // },
      // Buttons
      // {
      //   title: <div className={styles.tableHeader}> </div>,
      //   // dataIndex: '',
      //   // key: '',
      //   render: (text, entry) => (
      //     <div className={styles.tableHeader}>
      //       {isBuying &&
      //         <AcyButton
      //           className={styles.buywith}
      //           onClick={() => {
      //             onClickSelectToken(entry)
      //           }}
      //         >
      //           Buy with {entry.symbol}
      //         </AcyButton>
      //       }
      //       {!isBuying &&
      //         <AcyButton
      //           className={styles.buywith}
      //           onClick={() => {
      //             onClickSelectToken(entry)
      //           }}
      //         >
      //           Sell with {entry.symbol}
      //         </AcyButton>
      //       }
      //     </div>
      //   ),
      //   visible: true,
      // },
    ];
  }

  return (
    <div className={styles.nobgTable}>
      <Table
        dataSource={sortTable(props.dataSourceCoin, currentKey, tokenSortAscending).slice(0, tokenDisplayNumber + 1)}
        columns={columnsCoin(tokenSortAscending, () => {
          setTokenSortAscending(!tokenSortAscending);
        }, props.isBuying, props.onClickSelectToken).filter(item => item.visible === true)}
        pagination={false}
        style={{
          cursor: isHover ? 'pointer' : 'default',
        }}
        onRowMouseEnter={() => setIsHover(true)}
        onRowMouseLeave={() => setIsHover(false)}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px' }}>
        <h4 style={{ marginTop: '4px' }}>Unused Weight : {unusedWeight}%</h4>
        <Button
          type="primary"
          style={{
            marginLeft: '10px',
            background: '#2e3032',
            borderColor: 'transparent',
            width: '30%'
          }}
          disabled={buttonDisabled}
          onClick={handleClick}
        >Vote</Button>
      </div>
    </div>
  );
}