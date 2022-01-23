import moment from 'moment';
import { useState } from 'react';
import './index.css';

const FormatedTime = ({ utc_string, utc_second, visible = true, format = "YYYY-MM-DD HH:mm:ss A" }) => {

  const utc_moment = moment.utc(utc_second ? Number(utc_second) * 1000 : utc_string).locale('en');
  // const [timeString, setTimeString] = useState()
  const [timezone, setTimeZone] = useState('UTC');

  const tz_map = {
    'UTC': 0,
    'SGT': 8
  }

  const timeString = () => {
    return utc_moment.add(tz_map[timezone], 'hours').format(format) + ' ';
  }

  const onClickTimeZone = () => {
    if (timezone === 'UTC') {
      setTimeZone('SGT');
    } else {
      setTimeZone('UTC');
    }
  }

  return (
    <>
      {visible &&
        <p className='time-string'>
          {timeString()}
          <span onClick={onClickTimeZone} className='timezone-symbol'>({timezone})</span>
        </p>
      }
    </>
  )
}

export default FormatedTime;