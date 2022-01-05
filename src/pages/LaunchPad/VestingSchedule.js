import React from 'react';
import './css/LaunchpadProject.css';
import moment from 'moment'
import { Button} from 'antd';
import tick from '@/assets/icon-tick-white.svg';

const VestingSchedule = ({ vestingDate, stageData, vestingClick }) => {
  const len = vestingDate.length
  const curDate = moment(new Date())
  const t = new Date()
  console.log("TEST DATE")
  console.log(curDate)
  console.log(t)
  console.log(curDate > vestingDate[0])
  console.log(t > vestingDate[0])
  // setState
  return (
    <div>
      {
        [...Array(len)].map((_1, index) => {
          return (
            <div className="procedure vesting-procedure">
              {index === len - 1 ? "" : <hr aria-orientation="vertical" className={curDate > vestingDate[index] ? "verticalDivideLine vesting-schedule-line" : "verticalDivideLine_NotActive vesting-schedule-line"} />}
              <div className={curDate < vestingDate[index]  ? "procedureNumber_NotActive" : "procedureNumber"}>
                <img src={tick} alt="tick-icon" className="vesting-tick-icon" />
              </div>
              <div className="vesting-schedule-text">
                <div className='vesting-percentage-claim-container'>
                  <p className="vesting-percentage">{stageData[index]}%</p>
                  <Button
                    className="claim-btn"
                    id="claim-btn"
                    disabled={!(curDate > vestingDate[index])}
                    onClick={vestingClick}
                  >
                    Claim
                  </Button>
                </div>
                <p className="vesting-text">
                  <span className="claimable-text">Claimable at</span>
                  <br />
                  {vestingDate[index]}
                </p>
              </div>
            </div>
          )
        })
      }
    </div>
  );
}; 

export default VestingSchedule;
