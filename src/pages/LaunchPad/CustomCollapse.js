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
  .ant-collapse-header{
      fontSize: 25px;
  }
`;

const CustomCollapse = (props) => {
  const [disabled, setDisabled] = useState(true);
  const [followed, setFollowed] = useState(false);
  const [open, setOpen] = useState(["1"]);

  useEffect(() => {
    setDisabled(props.isDisabled);
  }, [props.isDisabled])

  useEffect(() => {
    setFollowed(props.isFollowed)
  }, [props.isFollowed])

  useEffect(() => {
    setOpen(props.isOpened)
  }, [props.isOpened])

  const setFun1= () => setDisabled(prev => !prev);
  const setFun2= () => () => setOpen(prev => !prev);

  const combineFunc = () =>{
    setFun1();
    setFun2();
  }
  

  return (
    <StyledCollapse activeKey={open} onChange={combineFunc()}>
      <AntCollapse.Panel
        header={props.header}
        key="1"
        showArrow={false}
        bordered={false}
        extra={
          <span>
            <span style={{ color: "#0076de", float: "right" }}>
              {followed ? <div id={styles.emptyBox}><p>+10</p></div> : <img src={tickIcon} alt="" style={{height:'1.2em', marginLRight:'10px', width:'auto', objectFit:'contain'}} />}
              {disabled ? <div id={styles.themeBox}><p>+10</p></div> : <img src={arrowDownIcon} alt="" style={{height:'1.2em', marginLRight:'10px', width:'auto', objectFit:'contain'}} />}
            </span>
          </span>
        }
      >
      {props.children}
      </AntCollapse.Panel>
    </StyledCollapse>
  );
};

export default CustomCollapse;
