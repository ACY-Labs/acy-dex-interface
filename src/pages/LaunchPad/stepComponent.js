import { Steps } from 'antd';
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
              <AcyLineChart 
                  
                  data={props.chartData}
                  showXAxis={true}
                  showYAxis={true}
                  showGradient={true}
                  lineColor="#e29227"
                  bgColor="#2f313500"
              />
              <div className = {styles.stepColor} id = "steps">
              <Steps direction="vertical" current={current}>
                <Step title="Preparation" description="This project is in preparation phase.Stay tuned." />
                <Step title="Whitelist" description="You can now whitelist yourself for the lottery." />
                <Step title="Lottery" description="See if you have any winning lottery tickets." />
                <Step title="Sale" description="Winner can participate in the token sale." />
                <Step title="Distribution" description="The tokens get distributed to Sale participants" />
              </Steps>
              </div>
              
      </div>  
  )
}

export default stepComponent;