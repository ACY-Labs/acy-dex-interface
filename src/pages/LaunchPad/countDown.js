import { Steps,Divider,Statistic, Row, Col } from 'antd';
import React, { useState, useEffect } from "react";
import SwapInput from './SwapInput';
import styles from './styles.less';
import { Card, Icon, Input, Row, Col } from 'antd';
import AcyIcon from '@/assets/icon_double_down.svg';
import AcyButton from '@/components/AcyButton';
import { AcyLineChart } from '@/components/Acy';

const { Countdown } = Statistic;
const deadline = Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30; // Moment is also OK

function onFinish() {
    console.log('finished!');
  }
  
  function onChange(val) {
    if (4.95 * 1000 < val && val < 5 * 1000) {
      console.log('changed!');
    }
  }

  const countDown = (props) => {

    
  }