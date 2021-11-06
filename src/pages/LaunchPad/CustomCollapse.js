import React, { useState } from "react";
import { Collapse as AntCollapse } from "antd";
import styled from "styled-components";
import styles from "./styles.less";
import arrowDownIcon from "@/assets/icon_arrow_down.svg";
import rewardIcon from "@/assets/icon_reward.svg";
import tickIcon from "@/assets/icon_tick.svg";
import telegramIcon from '@/assets/icon_follow_telegram.svg';
import twitterIcon from '@/assets/icon_follow_twitter.svg';

const StyledCollapse = styled(AntCollapse)`
  &&& {
    border: none;
    border-radius: 0 10px 0 0;
    box-shadow: none;  
    background-color: #0e0304;
    .ant-collapse-content {
      background-color: #0e0304;
      color: #b5b5b6;
    }
    
    .ant-collapse-header {
      color: #b5b5b6;
    }
  }
  
`;

const CustomCollapse = (props) => {
  const [opened, setOpen] = useState(false);
  const [key, setKey] = useState([]);

  const addPanelID = (num) => {
    if(key.length === 0)
      setKey(state => [...state, num])
    else
      setKey([])
  }

  const handleShowPanel = (id) => {
    const val = !props.show
    props.setShow(prev => ({...prev, [key[id]]: false}))
    props.setShow(prev => ({...prev, [id] : val}))
  }  

  const combineFunc = () => {
    addPanelID(props.panelID)
    handleShowPanel(props.panelID)
  }

  return (
    <StyledCollapse 
      accordian 
      expandIcon={telegramIcon}
      activeKey={props.show ? key : []} 
      onChange={combineFunc}
    > 
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
                !props.show && !props.isFollowed && props.panelID !== "1" && <img src={rewardIcon} alt="" style={{height:'1.2em', marginLRight:'10px', width:'auto', objectFit:'contain'}} />  // show this box
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