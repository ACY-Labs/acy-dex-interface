import React, { useState, useEffect } from "react";
import { Collapse as AntCollapse } from "antd";
import styled from "styled-components";
import styles from "./styles.less";
import arrowDownIcon from "@/assets/icon_arrow_down.svg";
import tickIcon from "@/assets/icon_tick.svg";

const StyledCollapse = styled(AntCollapse)`
  &&& {
    border: none;
    border-radius: 0px;
    background-color: #f7f7f7;
    box-shadow: none;   
  }
  .ant-collapse-content {
    background: #f7f7f7;
  }
  .ant-collapse-header {
      fontSize: 25px;
  }
`;

const CustomCollapse = (props) => {
  const [followed, setFollowed] = useState(false);
  const [opened, setOpen] = useState(false);
  const [key, setKey] = useState([props.keys]);

  useEffect(() => {
    setFollowed(props.isFollowed)
  }, [props.isFollowed])

  const handlePanel= () => setOpen(prev => !prev);
  const handlePanelClose = () => props.setShow(prev => !prev);

  const combineFunc = () =>{
    handlePanel();
    handlePanelClose();
  }

  return (
    <StyledCollapse accordian activeKey={props.show ? key : []} onChange={combineFunc}> 
      <AntCollapse.Panel
        {...props}
        header={props.header}
        showArrow={false}
        bordered={false}
        key={props.keys}
        extra={
          <span>
            <span style={{float: 'right'}}>
              {followed ? <img src={tickIcon} alt="" style={{height:'1.2em', marginLRight:'10px', width:'auto', objectFit:'contain'}} /> :  ""}
            </span>
            <div className={styles.extraContainer}>
              {
                !opened && !followed && <div id={styles.themeBox}><p>+10</p></div>  // show this box
              }
              {
                opened && !followed && <img src={arrowDownIcon} alt="" style={{height:'1.2em', marginLRight:'10px', width:'auto', objectFit:'contain'}} />  // show this icon
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