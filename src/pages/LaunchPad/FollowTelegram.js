import React, { useState, useCallback } from "react";
import { Collapse, Button, Icon, Row, Divider } from 'antd';
import styles from "./styles.less";
import AntCollapse from './CustomCollapse';
import arrowDownIcon from "@/assets/icon_arrow_down.svg";

const { Panel } = Collapse;

const FollowTelegram = () => {
  let [clicked, setClicked] = useState(true);  
  const [open, setOpen] = useState(["1"]);
  const [followed, setFollowed] = useState(true);
  const [disabledCollapse, setDisabledCollapse] = useState(true);

  const toggleDisabledCollapse = () => {
    setDisabledCollapse(prev => !prev)
  }
  const handleSubmit = () => {
    setOpen([]);
  };
  
  const links = [
    "https://t.me/acyfinance"
  ]

  const buttonStyle1 = {
    background: "#3498DB", 
    border:"#3498DB",
    width: '140px', 
    color: 'white', 
    height: "2em", 
    fontSize:'20px', 
    display:'flex', 
    justifyContent:'center', 
    alignItems:'center',
    boxShadow:"0.5px 0.8px #228CDB"
  }

  const buttonStyle2 = {
    background: "#1ABC9C", 
    border:"#1ABC9C",
    width: '80px', 
    color: 'white', 
    height: "2em", 
    fontSize:'16px', 
    display:'flex', 
    justifyContent:'center', 
    alignItems:'center',
    marginTop:'10px'
  }

  return (
    <div className={styles.telegramBox}>
      <div className={styles.telegramText}>
        <h2>Step 1: Join ACY Finance on Telegram</h2>
      </div>
      <div className={styles.telegramLinks}>
        <AntCollapse id={styles.telegramHeader1} header="Follow ACY Finance on Telegram">
          <Row type='flex' align='middle' justify='center'>
            <Button href={links[0]} target="_blank" style={buttonStyle1} onClick={() => setClicked(false)}>
              <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
              Click Here
            </Button>
          </Row>
          <span className={styles.greyLine}> </span>
          <Row type='flex' align='middle' justify='center'>
            <Button href={links[0]} target="_blank" style={buttonStyle2} disabled={clicked}>Continue</Button> 
            <Button type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
          </Row>
        </AntCollapse>
        <AntCollapse isDisabled={disabledCollapse} isFollowed={followed} isOpened={open} id={styles.telegramHeader1} header="Follow ACY Finance on Telegram Announcement Channel">
          <Row type='flex' align='middle' justify='center'>
            <Button href={links[0]} target="_blank" style={buttonStyle1} onClick={() => setClicked(false)}>
              <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
              Subscribe
            </Button>
          </Row>
          <span className={styles.greyLine}> </span>
          <Row type='flex' align='middle' justify='center'>
            <Button onClick={() => {setFollowed(); toggleDisabledCollapse(); handleSubmit();}} style={buttonStyle2} disabled={clicked}>Continue</Button> 
            <Button type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
          </Row>
        </AntCollapse>
      </div>
    </div>
  );
}

export default FollowTelegram;