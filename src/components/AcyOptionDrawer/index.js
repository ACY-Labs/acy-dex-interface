import { Row, Col, Drawer } from 'antd';
import styles from './styles.less';
import styled from "styled-components";
import React, { useEffect } from 'react';


const StyledDrawer = styled(Drawer)`
  .ant-drawer{
    border-radius: 0px;
    border: 0.75px solid #232323;
  }
  .ant-drawer-header{
    background-color: black;
    // border-bottom: 0.75px solid #232323;
  }
  .ant-drawer-content{
    background-color: black;
    border: 0.75px solid #232323;
    
  }
  ant-drawer-content-wrapper{
    transform: translateY(0%);
  }
  .ant-drawer-close{
    color: #b5b5b6;
  }
`

const AcyOptionDrawer = (props) => {
    const {
        visibleToken,
        setVisibleToken,
        activeToken,
        onClose,
        setActiveToken,
        optionSymbols
    } = props;

    // const onClose = () => {
    //     // Object.entries(visibleToken).forEach((token) => {
    //     //   let tokenKey = token[0]
    //     let newDict = visibleToken
    //     newDict[activeToken.symbol] = false
    //     setVisibleToken(newDict)
    //     console.log("option refactor onclose after", visibleToken, activeToken.symbol, visibleToken[activeToken.symbol])
    //     // })
    // }
    const onClickDropdown = (e) => {
        console.log("option refactor onClickDropdown", e)
    }

    useEffect(()=>{
        console.log("option refactor in drawer: ", visibleToken[activeToken.symbol])
    }, [visibleToken])
    console.log("option refactor drawer", optionSymbols, activeToken.symbol, optionSymbols[activeToken.symbol])
    return (

        <Drawer
            className={styles.drawerContent}
            placement="bottom"
            onClose={onClose}
            // visible={}
            visible={visibleToken[activeToken.symbol]}
            getContainer={false}
            closeIcon={true}
            height={"517px"}
            style={{ width: "20rem" }}
            destroyOnClose={true}
        >
            <div className={styles.optionslist}>
                {optionSymbols[activeToken.symbol].map((option) => (
                    <div
                        className={styles.item}
                        onClick={() => {
                            onClickDropdown(option)
                            // setSymbol(option.tokenSymbol + 'USD-' + option.optionSymbol + '-' + option.type)
                            onClose()
                        }}
                    >
                        {option.tokenSymbol}-{option.optionSymbol}-{option.type}
                        {option.type == "C" ?
                            <Col span={6} style={{ fontSize: "0.75rem", float: "right", color: "#FA3C58" }}>$200 -3.4%</Col>
                            :
                            <Col span={6} style={{ fontSize: "0.75rem", float: "right", color: "#46E3AE" }}>$200 +3.4%</Col>
                        }
                    </div>
                ))}
            </div>
        </Drawer>

    )
}
export default AcyOptionDrawer;