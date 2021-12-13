import React, { useState, useEffect } from "react";
import SwapInput from './SwapInput';
import styles from './styles.less';
import { Card, Icon, Input, Row, Col, Steps,Divider,Statistic } from 'antd';
import AcyIcon from '@/assets/icon_double_down.svg';
import AcyButton from '@/components/AcyButton';
import { AcyLineChart } from '@/components/Acy';

const { Countdown } = Statistic;
console.log('style')
console.log(styles);
  function getRemainTime(now) {
    var ddl = '2021/12/11 00:00:00';
    //var now = Date.now()
    var date1 = new Date(now);
    var date2 = new Date(ddl);

      var s1 = date1.getTime(),s2 = date2.getTime();
      var total = (s2 - s1)/1000;

      var day = parseInt(total / (24*60*60));//计算整数天数
      var afterDay = total - day*24*60*60;//取得算出天数后剩余的秒数
      var hour = parseInt(afterDay/(60*60));//计算整数小时数
      var afterHour = total - day*24*60*60 - hour*60*60;//取得算出小时数后剩余的秒数
      var min = parseInt(afterHour/60);//计算整数分
      var afterMin = total - day*24*60*60 - hour*60*60 - min*60;//取得算出分后剩余的秒数
      var sec = parseInt(afterMin);

      return {day:day,hour:hour,min:min,sec:sec};

  }

  const countDown = (props) => {

    let [currentTime,setTime] = useState(Date.now());

    let [countTime,setCount] = useState({days:0,hours:0,min:0,sec:0});

    let  {day,hour,min,sec } =   getRemainTime(currentTime);


    //figure out remain time

    useEffect(async () => {

      let  {day,hour,min,sec } =   getRemainTime(currentTime);

      setCount({days:day,hours:hour,min:min,sec:sec});
    },[currentTime])


    // 实时获取当前时间
    useEffect(async () => {
      let timer = setInterval(() => {
        setTime(Date.now());
      }, 1000);

      return () => {clearInterval(timer);
      }

    },[]);
   
    return(
      
      <div className={styles.countDown}>
        <div className={styles.cntdwn}>
          <div className={styles.number}>
            <div className={styles.countnumber}>
              {countTime.days}
            </div>
            <div>DAYS</div>
          </div>
          <div className={styles.seperator}>:</div>
          <div className={styles.number}>
            <div className={styles.countnumber}>
              {countTime.hours}
            </div>
            <div>HOURS</div>
          </div>
          <div className={styles.seperator}>:</div>
          <div className={styles.number}>
            <div className={styles.countnumber}>
              {countTime.min}
            </div>
            <div>MIN</div>
          </div>
          <div className={styles.seperator}>:</div>
          <div className={styles.number}>
            <div className={styles.countnumber}>
              {countTime.sec}
            </div>
            <div>SEC</div>
          </div>
        </div>
      </div>
    )
  }
  export default countDown;