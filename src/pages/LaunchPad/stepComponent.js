import { Steps,Divider } from 'antd';
import React, { useState, useEffect } from "react";
import SwapInput from './SwapInput';
import styles from './styles.less';
import { Card, Icon, Input, Row, Col } from 'antd';
import AcyIcon from '@/assets/icon_double_down.svg';
import AcyButton from '@/components/AcyButton';
import { AcyLineChart } from '@/components/Acy';

const { Step } = Steps;

const stepComponent = (props) => {
  
  const [percent, setPercentage] = useState(0);
  const [current, setCurrent] = useState(1);
  const [status, setStatus] = useState('process');

  return (
    <div  className = {styles.stepBar} >
              <div className = {styles.stepColor} 
              id = "steps">
              <Steps size = "small" direction ="vertical" labelPlacement= "vertical" current={current} >
                <Step title ="Preparation" />
                <Step title="Whitelist"  />
                <Step title="Lottery"  />
                <Step title="Sale"  />
                <Step title="Distribution"  />
              </Steps>
              {/* <Divider /> */}
            
              </div>
              
      </div>  
  )
}

export default stepComponent;