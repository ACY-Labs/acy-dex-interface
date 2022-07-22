import React, { useEffect, useState, useMemo } from 'react';
import {Table, Button} from 'antd'
import {clsx} from 'clsx'
import {
    getTokenInfo,
    formatAmount,
    USD_DECIMALS
} from '@/acy-dex-futures/utils/index'
import {
    isDesktop
} from '@/pages/Market/Util';
import className from 'classnames'
import styles from './VoteCard.less';


const VoteCard = (props) => {
    const [isHover, setIsHover] = useState(false);
    const [tokenSortAscending, setTokenSortAscending] = useState(true);
    const [tokenDisplayNumber, setTokenDisplayNumber] = useState(9);
    const {
        isBuying,
        setIsBuying,
        setSwapTokenAddress,
        setIsWaitingForApproval,
        tokenList,
        infoTokens,
        glpAmount,
        glpPrice,
        usdgSupply,
        totalTokenWeights
    } = props

    const tokenListData = []
    let totalPool = 0
    tokenList.map((token) => {
        const tokenInfo = getTokenInfo(infoTokens, token.address)
        let managedUsd
        if (tokenInfo && tokenInfo.managedUsd) {
        managedUsd = tokenInfo.managedUsd
        }
        const tData = {
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            pool: formatAmount(managedUsd, USD_DECIMALS, 2, true),
            poolPercent: 0,
        }
        totalPool += parseFloat(tData.pool.replace(",",""))      
        tokenListData.push(tData)
    })
    tokenListData.map((tData) => {
        tData.poolPercent = parseFloat(tData.pool.replace(",",""))/totalPool*100
        return tData;
    })
    const [weight, setWeight] = useState({})
    const [confirmation, setConfirmation] = useState({})
    const handleChange = e => {
        const {name, value} = e.target
        setWeight(prevWeight => ({
            ...prevWeight,
            [name]: value
        }))
    }
    const unusedWeight = useMemo(() => {
        return(
            100 - 
            Object.values(weight).reduce((accumulator,value) => {

                return (parseFloat(accumulator) + parseFloat(
                    value ? value : 0
                    ))
                .toFixed(2)
            },0)
        )
    },[weight])
    function columnsCoin(){
        return [
            {
                title: <div className={className(styles.tableHeaderFirst, styles.tableIndex)}> # </div>,
                key: 'index',
                width: '6rem',
                render: (text, record, index) => (
                  <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
                    {index + 1}
                  </div>
                ),
                visible: isDesktop(),
                width: '10%',
            },
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
                width: '30%',
            },
            {
                title: <div className={styles.tableHeaderFirst}> Pool </div>,
                dataIndex: 'pool',
                key: 'pool',
                className: 'leftAlignTableHeader',
                render: (text, entry) => (
                  <div className={styles.tableData}>$ {entry.pool}</div>
                ),
                visible: true,
                width: '15%',
            },
            {
                title: <div className={styles.tableHeaderFirst}> Current Weight </div>,
                dataIndex: 'poolPercent',
                key: 'poolPercent',
                className: 'leftAlignTableHeader',
                render: (text, entry) => (
                  <div className={styles.tableData}>{entry.poolPercent} %</div>
                ),
                visible: true,
                width: '25%',
            },
            {
                title: <div className={styles.tableHeaderFirst}> Vote Weight </div>,
                //dataIndex: 'poolPercent',
                //key: 'poolPercent',
                //className: 'leftAlignTableHeader',
                render: (text, entry) => (
                    <div className={styles.inputContainer}>
                        <input
                        type="number"
                        min="0"
                        placeholder="0.0"
                        className={styles.optionInput}
                        value={weight[entry.name]}
                        name={entry.name}
                        onChange={handleChange}
                        disabled={confirmation[entry.name]}
                        max="30"
                        />
                        <span className={styles.inputLabel}>%</span>
                    </div>
                ),
                visible: true,
                width: '20%',
            },
        ]
    }
    return (
        <>
        <div className={styles.nobgTable}>
            <Table
                dataSource={tokenListData}
                columns={columnsCoin()}
                pagination={false}
                style={{
                    marginBottom: '20px',
                    cursor: isHover ? 'pointer' : 'default',
                }}
                onRowMouseEnter={() => setIsHover(true)}
                onRowMouseLeave={() => setIsHover(false)}
                footer={() => (
                    <div className={styles.tableSeeMoreWrapper}>
                        {tokenListData.slice(0, tokenDisplayNumber + 1).length > tokenDisplayNumber && (
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
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                <h4 style={{marginTop:'4px'}}>Unused Weight : {unusedWeight}%</h4>
                <Button
                    type="primary"
                    style={{
                      marginLeft: '10px',
                      background: '#2e3032',
                      borderColor: 'transparent',
                      width: '30%'
                    }}
                >Vote</Button>
            </div>
        </div>
        </>
    );
};

export default VoteCard;