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

const defaultProp = () => {};

const CustomCollapse = ({dataList, changeKeys = defaultProp, keys, ...props}) => {
  const [disabled, setDisabled] = useState(true);
  const [followed, setFollowed] = useState(false);
  const [opened, setOpen] = useState(false);
  let [key, setKey] = useState(["1","2","3","4"]);

  useEffect(() => {
    setFollowed(props.isFollowed)
  }, [props.isFollowed])

  const handleKeyChange = (e) => {
    changeKeys(false);
    setKey(e);
  }

  const setFun1= () => setOpen(prev => !prev);

  const combineFunc = () =>{
    setFun1();
    handleKeyChange();
  }
  
  return (
    <StyledCollapse activeKey={keys ? [] : key} onChange={combineFunc}> 
      <AntCollapse.Panel
        {...props}
        header={props.header}
        showArrow={false}
        bordered={false}
        key={props.key}
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