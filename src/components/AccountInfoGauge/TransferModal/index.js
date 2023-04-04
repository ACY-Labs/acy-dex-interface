import React, { useState, useEffect, useMemo } from 'react';
import { AcyCardList, AcyIcon } from '@/components/Acy';
import Modal from '../../PerpetualComponent/Modal/Modal';
import { Layout, Menu, AutoComplete, Row, Col, Button, Input, Select, Divider, Table } from 'antd';
import {
  DownOutlined,
  DisconnectOutlined,
  CheckCircleTwoTone,
  SwapOutlined,
  FileOutlined
} from '@ant-design/icons';
import useSWR from 'swr';
import Reader from '@/abis/future-option-power/Reader.json'
import { getContract } from '@/constants/future_option_power.js';
import { fetcher } from '@/acy-dex-futures/utils';
import { useWeb3React } from '@web3-react/core';
import { useConnectWallet } from '@/components/ConnectWallet';
import * as future from '@/constants/future.js';
import { AddressZero } from '@ethersproject/constants';
import ERC20 from '@/abis/future-option-power/ERC20.json';

import { symbol } from 'prop-types';
import { transfer } from '@/services/derivatives';
import Router from '@/abis/future-option-power/Router.json';
import styles from './styles.less';

const TransferModal = props => {

  const {
    chainId,
    library,
    account,
    tokens,
    handleCancel,
  } = props

  const [selectedToken, setSelectedToken] = useState("")
  const [activeToken, setActiveToken] = useState()
  const [tokenValue, setTokenValue] = useState(0)
  const [fromSymbol, setFromSymbol] = useState("")
  const [toSymbol, setToSymbol] = useState("")

  const selectToken = token => {
    setActiveToken(token)
    setSelectedToken(token.symbol)
  }

  const tokenImgURL = {
    'MATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
    'WMATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
    'BTC': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
    'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    'USDC': 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389',
    'USDT': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
    'BNB': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850',
    'ACY': 'https://storageapi.fleek.co/5bec74db-774b-4b8a-b735-f08a5ec1c1e6-bucket/icon_acy.svg',
  }
  const getPrimaryText = () => {
    if (account == undefined) {
      return "Connect Wallet"
    } else {
      return "Transfer"
    }
  }

  const connectWalletByLocalStorage = useConnectWallet()
  const { active, activate } = useWeb3React();

  const routerAddress = getContract(chainId, "router")
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")
  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")

  const { data: symbolsInfo, mutate: updateSymbolsInfo } = useSWR([chainId, readerAddress, "getSymbolsInfo", poolAddress, []], {
    fetcher: fetcher(library, Reader)
  });

  const { data: tokenInfo, mutate: updateTokenInfo } = useSWR([chainId, readerAddress, "getTokenInfo", poolAddress, account || PLACEHOLDER_ACCOUNT], {
    fetcher: fetcher(library, Reader)
  });

  let whitelistedTokens = []
  tokenInfo?.map(token => {
    whitelistedTokens.push({ symbol: token.symbol, address: token.token })
  })

  useEffect(() => {
    if (active) {
      library.on('block', () => {
        updateSymbolsInfo(undefined, true)
        updateTokenInfo()
      })
      return () => {
        library.removeAllListeners('block')
      }
    }
  },
    [active,
      library,
      chainId,
      updateSymbolsInfo,
    ]
  )

  const onClickPrimary = () => {
    if (!account) {
      connectWalletByLocalStorage()
      return
    }
    transfer(chainId, library, routerAddress, Router, activeToken, tokenValue, fromSymbol, toSymbol)
  }

  return (
    <div className={styles.myModal} style={{ borderRadius: "5px" }}>
      <Modal
        setIsVisible={handleCancel}
        isVisible={true}
        label="Transfer"
        className={styles.myModal}
        style={{ backgroundColor: "black", minHeight: "35rem", borderRadius: "5px" }}
      >
        <Col>
          <Row style={{ fontSize: "1rem", backgroundColor: "black" }}>From</Row>
          <Row>
            <div className={styles.coin} >
              <Select
                value={fromSymbol}
                onChange={e => { setFromSymbol(e) }}
                dropdownClassName={styles.dropDownMenu}
              >
                {symbolsInfo?.map(symbolInfo => (
                  <Option className={styles.optionItem} value={symbolInfo.symbol}>
                    <Col offset={1} span={13}> <div> {symbolInfo.symbol}</div> </Col>
                  </Option>
                ))}
              </Select>
            </div>
          </Row>
          <Row style={{ fontSize: "1rem", backgroundColor: "black" }}>To</Row>
          <Row>
            <div className={styles.coin} >
              <Select
                value={toSymbol}
                onChange={e => { setToSymbol(e) }}
                dropdownClassName={styles.dropDownMenu}
              >
                {symbolsInfo?.map(symbolInfo => (
                  <Option className={styles.optionItem} value={symbolInfo.symbol}>
                    <Col offset={1} span={13}> <div> {symbolInfo.symbol}</div> </Col>
                  </Option>
                ))}
              </Select>
            </div>
          </Row>
          <Row style={{ fontSize: "1rem", marginTop: "1rem", backgroundColor: "black" }}>Coin</Row>
          <Row>
            <div className={styles.coin} >
              <Select
                value={selectedToken}
                onChange={selectToken}
                dropdownClassName={styles.dropDownMenu}
              >
                {whitelistedTokens.map(token => (
                  <Option className={styles.optionItem} value={token}>
                    {tokenImgURL[token.symbol] && <Col span={10}> <img src={tokenImgURL[token.symbol]} style={{ width: '20px', height: '20px' }} /></Col>}
                    <Col offset={1} span={13}> <div> {token.symbol}</div> </Col>
                  </Option>
                ))}
              </Select>
            </div>
          </Row>
          <Row style={{ fontSize: "1rem", marginTop: "1rem", backgroundColor: "black" }}>Amount</Row>
          <Row>
            <div className={styles.tokenAmount} >
              <Input
                value={tokenValue}
                onChange={e => { setTokenValue(e.target.value) }}
                style={{ height: "2rem" }}
              />
            </div>
          </Row>
          {/* <Row span={24} style={{ fontSize: "1rem", marginTop: "1rem" }}>Available: 0.0000BTC</Row> */}

          <Row span={24} style={{ width: "10rem" }}>
            <Button className={styles.confirmButton} onClick={onClickPrimary}>
              {getPrimaryText()}
            </Button>
          </Row>
        </Col>
      </Modal>
    </div>
  );
}

export default TransferModal