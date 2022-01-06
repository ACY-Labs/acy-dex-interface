import React from 'react';
import './css/LaunchpadProject.css';
import moment from 'moment'
import { Button} from 'antd';
import tick from '@/assets/icon-tick-white.svg';

const VestingSchedule = ({ vestingDate, stageData, vestingClick }) => {
  // if (!vestingDate) return;
  const len = vestingDate.length
  const curDate = new Date()
  // setState
  return (
    <div>
      {
        [...Array(len)].map((_1, index) => {
          return (
            <div className="procedure vesting-procedure">
              {index === len - 1 ? "" : <hr aria-orientation="vertical" className={curDate > new Date(vestingDate[index]) ? "verticalDivideLine vesting-schedule-line" : "verticalDivideLine_NotActive vesting-schedule-line"} />}
              <div className={curDate < new Date(vestingDate[index])  ? "procedureNumber_NotActive" : "procedureNumber"}>
                <img src={tick} alt="tick-icon" className="vesting-tick-icon" />
              </div>
              <div className="vesting-schedule-text">
                <div className='vesting-percentage-claim-container'>
                  <div className="vesting-percentage-container">
                    <p className="vesting-percentage">{stageData[index]}%</p>
                  </div>
                  <Button
                    className="claim-btn"
                    id="claim-btn"
                    disabled={!(curDate > new Date(vestingDate[index]))}
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
