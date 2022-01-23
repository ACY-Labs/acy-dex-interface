import React, { useState, useEffect } from 'react';
import { Card, Icon, Input, Row, Col, Steps, Divider, Statistic } from 'antd';
import AcyIcon from '@/assets/icon_double_down.svg';
import AcyButton from '@/components/AcyButton';
import { AcyLineChart } from '@/components/Acy';
import moment from 'moment';

// console.log(styles.number);
const { Countdown } = Statistic;

const CountDown = ({ ddl }) => {
  // initial logic
  let today = new Date();
  let pDate = new Date(ddl);
  const ddl_moment_utc = moment.utc(ddl);

  function getRemainTime(now_moment) {
    var total = ddl_moment_utc.diff(now_moment) / 1000;
    var day = parseInt(total / (24 * 60 * 60)); //计算整数天数
    var afterDay = total - day * 24 * 60 * 60; //取得算出天数后剩余的秒数
    var hour = parseInt(afterDay / (60 * 60)); //计算整数小时数
    var afterHour = total - day * 24 * 60 * 60 - hour * 60 * 60; //取得算出小时数后剩余的秒数
    var min = parseInt(afterHour / 60); //计算整数分
    var afterMin = total - day * 24 * 60 * 60 - hour * 60 * 60 - min * 60; //取得算出分后剩余的秒数
    var sec = parseInt(afterMin);

    return { day: day, hour: hour, min: min, sec: sec };
  }
  const [currentTime, setTime] = useState(moment.utc());
  const [countTime, setCount] = useState({ days: 0, hours: 0, min: 0, sec: 0 });
  let { day, hour, min, sec } = getRemainTime(currentTime);

  // figure out remain time
  useEffect(async () => {
      let { day, hour, min, sec } = getRemainTime(currentTime);
      setCount({ days: day, hours: hour, min: min, sec: sec });
  }, [currentTime]);

  // 实时获取当前时间
  useEffect(async () => {
    let timer = setInterval(() => {
      setTime(moment.utc());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="countDown-container">
      {ddl_moment_utc.diff(currentTime) > 0 ? (
        <div className="countDown-box">
          <div className="countDown-number" id="b">
            <div className="countDown-number-1">{countTime.days}</div>
            <div className="countDown-number-2">DAYS</div>
          </div>
          <div className="seperator">:</div>
          <div className="countDown-number" id="b">
            <div className="countDown-number-1">{countTime.hours}</div>
            <div className="countDown-number-2">HOURS</div>
          </div>
          <div className="seperator">:</div>
          <div className="countDown-number" id="b">
            <div className="countDown-number-1">{countTime.min}</div>
            <div className="countDown-number-2">MIN</div>
          </div>
          <div className="seperator">:</div>
          <div className="countDown-number" id="b">
            <div className="countDown-number-1">{countTime.sec}</div>
            <div className="countDown-number-2">SEC</div>
          </div>
        </div>
      ) : (
        <div className="countDown-box">
          <div className="countDown-number" id="b">
            <div className="countDown-number-1">-</div>
            <div className="countDown-number-2">DAYS</div>
          </div>
          <div className="seperator">:</div>
          <div className="countDown-number" id="b">
            <div className="countDown-number-1">-</div>
            <div className="countDown-number-2">HOURS</div>
          </div>
          <div className="seperator">:</div>
          <div className="countDown-number" id="b">
            <div className="countDown-number-1">-</div>
            <div className="countDown-number-2">MIN</div>
          </div>
          <div className="seperator">:</div>
          <div className="countDown-number" id="b">
            <div className="countDown-number-1">-</div>
            <div className="countDown-number-2">SEC</div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CountDown;
