import React, { useState, useCallback } from "react";
import { Form, Tooltip, Button, Icon, Row } from 'antd';
import InputEmail from "./inputEmail";
import styled from "styled-components";
import SwapTicket from "./swapTicket";
import styles from "./styles.less";
import prevIcon from '@/assets/icon_prevpage.svg';
import nextIcon from '@/assets/icon_nextpage.svg';
import AntCollapse from "./CustomCollapse";

const StyledInput = styled.input`
  font-size: 24px;
  background-color: inherit;
  color: white;
  width: 90%;
  border-width: 1px;
  line-height: 50px;
  margin-left: 20px;
  border-right: 0px solid transparent;
  border-top: 0px solid transparent;
  border-left: 0px solid transparent;
  &:focus {
    outline-width: 0;
    filter: brightness(2);
  }
`;

const FollowTelegram = () => {
  const panelIdx = ["1","2","3","4", "5", "6"]
  const [name, setName] = useState("")
  const [showInput, setShowInput] = React.useState(false)
  const [showForm, setShowForm] = useState(false)
  const [clicked, setClicked] = useState({
    1 : true,
    2 : true,
    3 : true,
    4 : true,
    5 : true,
    6 : true
  })
  const [show, setShow] = useState({
    1 : false,
    2 : false,
    3 : false,
    4 : false,
    5 : false,
    6 : false
  })
  const [followed, setFollowed] = useState({
    1 : false,
    2 : false,
    3 : false,
    4 : false,
    5 : false,
    6 : false
  })
  
  const onClick = () => setShowInput(true)

  const onLinkClick = (n) => {
    const val = !clicked[n]
    setClicked(prev => ({...prev, [n] : val}))
  }

  const handleFollow = (idx) => {
    const val = !followed[idx]
    setFollowed(prev => ({...prev, [idx] : val}))
  }

  const handleShow = (panelId) => {
    const val = !show[panelId]
    setShow(prev => ({...prev, [panelId] : val}))
  }

  const links = "https://www.youtube.com/"

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
      { !showForm ? (
        <div className={styles.telegramContainer}>
          <div className={styles.telegramLinks}>
            <AntCollapse isFollowed={followed[1]} show={show[1]} panelID={panelIdx[0]} setShow={setShow} disabled={followed[1]} header="Enter your Username and Email">
              <InputEmail />
              <Row type='flex' align='middle' justify='center'>
                <Button onClick={() => {handleShow(1); }} style={buttonStyle2} disabled={clicked}>Submit</Button> 
              </Row>
            </AntCollapse>
            <AntCollapse isFollowed={followed[2]} show={show[2]} panelID={panelIdx[1]} setShow={setShow} disabled={followed[2]} header="Follow ACY Finance on Telegram">
              <Row type='flex' align='middle' justify='center'>
                <Button href={links} target="_blank" style={buttonStyle1} onClick={() => {onLinkClick(1);}}>
                  <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
                  Subscribe
                </Button>
              </Row>
              <span className={styles.greyLine}> </span>
              <Row type='flex' align='middle' justify='center'>
                <Tooltip title="Visit the link above to continue">
                  <Button onClick={() => {handleFollow(2); handleShow(2); }} style={buttonStyle2} disabled={clicked[1]}>Continue</Button> 
                </Tooltip>
                <Button onClick={() => {handleShow(2); }} type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
              </Row>
            </AntCollapse>
            <AntCollapse isFollowed={followed[3]} show={show[3]} panelID={panelIdx[2]} setShow={setShow} disabled={followed[3]} header="Follow ACY Finance on Telegram Announcement Channel">
              <Row type='flex' align='middle' justify='center'>
                <Button href={links} target="_blank" style={buttonStyle1} onClick={() => {onLinkClick(2); onClick();}}>
                  <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
                  Subscribe
                </Button>
              </Row>
              <span className={styles.greyLine}> </span>
              { showInput ? <userInput /> : null }
              <Row type='flex' align='middle' justify='center'>
                <Tooltip title="Visit the link above to continue">
                  <Button onClick={() => {handleFollow(3); handleShow(3); }} style={buttonStyle2} disabled={clicked[2]}>Continue</Button> 
                </Tooltip>
                <Button onClick={() => {handleShow(3); }} type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
              </Row>
            </AntCollapse>
            <AntCollapse isFollowed={followed[4]} show={show[4]} panelID={panelIdx[3]} setShow={setShow} disabled={followed[4]} header="Follow ACY Finance on Twitter">
              <Row type='flex' align='middle' justify='center'>
                <Button href={links} target="_blank" style={buttonStyle1} onClick={() => {onLinkClick(3);}}>
                  <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
                  Subscribe
                </Button>
              </Row>
              <span className={styles.greyLine}> </span>
              <Row type='flex' align='middle' justify='center'>
                <Tooltip title="Visit the link above to continue">
                  <Button onClick={() => {handleFollow(4); handleShow(4);}} style={buttonStyle2} disabled={clicked[3]}>Continue</Button> 
                </Tooltip>
                <Button onClick={() => {handleShow(4); }} type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
              </Row>
            </AntCollapse>
            <AntCollapse isFollowed={followed[5]} show={show[5]} panelID={panelIdx[4]} setShow={setShow} disabled={followed[5]} header="Retweet ACY Finance on Twitter">
              <Row type='flex' align='middle' justify='center'>
                <Button href={links} target="_blank" style={buttonStyle1} onClick={() => {onLinkClick(4);}}>
                  <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
                  Subscribe
                </Button>
              </Row>
              <span className={styles.greyLine}> </span>
              <Row type='flex' align='middle' justify='center'>
                <Tooltip title="Visit the link above to continue">
                  <Button onClick={() => {handleFollow(5); handleShow(5); }} style={buttonStyle2} disabled={clicked[4]}>Continue</Button> 
                </Tooltip>
                <Button onClick={() => {handleShow(5); }} type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
              </Row>
            </AntCollapse>
            <Row type='flex' align='middle' justify='space-around'>
              <img src={prevIcon} alt="" style={{height:'1.2em', width:'auto', objectFit:'contain', margin: '25px 0', float:'left'}} />
              <img src={nextIcon} id={styles.nextPage} alt="" style={{height:'1.2em', width:'auto', objectFit:'contain', margin: '25px 0', float:'right'}} onClick={() => setShowForm(() => true)}  />
            </Row>
          </div>
        </div>
      ) : (
        <SwapTicket />
      )}
    </div>
  );
}

export default Form.create({ name: 'formname' })(FollowTelegram);