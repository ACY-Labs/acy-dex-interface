import React, { useState, useEffect } from 'react';
import { AcyCardList, AcyIcon } from '@/components/Acy';
import Modal from '../../PerpetualComponent/Modal/Modal';
import { Layout, Menu,AutoComplete, Row, Col, Button, Input, Select, Divider, Table } from 'antd';
import {
  DownOutlined,
  DisconnectOutlined,
  CheckCircleTwoTone,
  SwapOutlined,
  FileOutlined
} from '@ant-design/icons';

import * as future from '@/constants/future.js';

import styles from './styles.less';
import { symbol } from 'prop-types';


const TransferModal = props => {

  const {
    chainId,
    library,
    account,
    tokens,
    handleCancel,
  } = props

  const [activeToken, setActiveToken] = useState("");
  const [activeSymbol, setActiveSymbol] = useState("");

  const symbolList = ["BTCUSDT", "ETHUSDT", "BTCUSD-50000-C", "BTCUSD-40000-P"]

  const selectToken = token => {
    setActiveToken(token);
  }
  const selectSymbol = symbol => {
    setActiveSymbol(symbol);
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
        <Row style={{ fontSize: "1rem", backgroundColor: "black" }}>Symbol</Row>
          <Row>
            <div className={styles.coin} >
              <Select
                value={activeSymbol}
                onChange={selectSymbol}
                dropdownClassName={styles.dropDownMenu}
              >
                {symbolList.map(symbol => (
                  <Option className={styles.optionItem} value={symbol}>
                    <Col offset={1} span={13}> <div> {symbol}</div> </Col>
                  </Option>
                ))}
              </Select>
            </div>
          </Row>
          <Row style={{ fontSize: "1rem", marginTop: "1rem", backgroundColor: "black" }}>Coin</Row>
          <Row>
            <div className={styles.coin} >
              <Select
                // defaultValue="Trade"
                value={activeToken}
                onChange={selectToken}
                dropdownClassName={styles.dropDownMenu}
              >
                {tokens.map(token => (
                  <Option className={styles.optionItem} value={token.symbol}>
                    <Col span={10}> <img src={tokenImgURL[token.symbol]} style={{ width: '20px', height: '20px' }} /></Col>
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
                value={0}
                onChange={e => {

                }}
                style={{ height: "2rem" }}
              />
            </div>
          </Row>
          <Row span={24} style={{ fontSize: "1rem", marginTop: "1rem" }}>Available: 0.0000BTC</Row>

          <Row span={24} style={{ width: "10rem" }}>
            <Button className={styles.confirmButton}>
              {getPrimaryText()}
            </Button>
          </Row>
        </Col>
      </Modal>
    </div>
  );
}

export default TransferModal