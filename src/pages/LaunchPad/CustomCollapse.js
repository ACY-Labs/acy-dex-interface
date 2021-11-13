import React, { useState } from "react";
import { Collapse as AntCollapse } from "antd";
import styled from "styled-components";
import styles from "./styles.less";
import arrowDownIcon from "@/assets/icon_arrow_down.svg";
import tickIcon from "@/assets/icon_tick.svg";

const StyledCollapse = styled(AntCollapse)`
  {
    border: none;
    border-radius: 0 10px 0 0;
    box-shadow: none;  
    background: #cccfd8;
    .ant-collapse-content {
      border-top: 1px solid #000;
      background: #cccfd8;
      color: #000000;
    }
    .ant-collapse-header {
      color: #000000;
    }
    .ant-collapse > .ant-collapse-item{
      border-bottom: 1px solid #000;
    }
  }
`;


const CustomCollapse = (props) => {
  const [opened, setOpen] = useState(false)
  const [key, setKey] = useState([])

  const addPanelID = (num) => {
    if(key.length === 0)
      setKey(state => [...state, num])
    else
      setKey([])
  }

  /* const handlePanel= () => {
    setOpen(prev => !prev)
  } */

  const handleShowPanel = (id) => {
    const val = !props.show
    props.setShow(prev => ({...prev, [key[id]]: false}))
    props.setShow(prev => ({...prev, [id] : val}))
  }  

  const combineFunc = () => {
    //handlePanel()
    addPanelID(props.panelID)
    handleShowPanel(props.panelID)
  }

  return (
    <StyledCollapse activeKey={props.show ? key : []} onChange={combineFunc}> 
      <AntCollapse.Panel
        {...props}
        header={props.header}
        showArrow={false}
        bordered={false}
        disabled={props.isFollowed}
        key={props.panelID}
        extra={
          <span>
            <div className={styles.extraContainer}>
              {
                !props.show && !props.isFollowed && <div className={styles.themeBox}> <span style={{color:'#29292c', fontWeight: '500'}}>{props.rewards}</span> </div>
              }
              {
                props.show && !props.isFollowed && <img src={arrowDownIcon} alt="" style={{height:'1.2em', marginRight:'10px', width:'auto', objectFit:'contain'}} />  // show this icon
              }
              {
                props.isFollowed ? <img src={tickIcon} alt="" style={{height:'1.2em', marginLRight:'10px', width:'auto', objectFit:'contain'}} /> :  ""
              }
            </div>
          </span>
        }
      >
      {props.children}
      </AntCollapse.Panel>
    </StyledCollapse>
  );
};

export default CustomCollapse;