import React, { useEffect } from 'react';
import './css/LaunchpadProject.css';
import moment from 'moment'
import { Button } from 'antd';
import tick from '@/assets/icon-tick-white.svg';
import FormatedTime from '@/components/FormatedTime';

const VestingSchedule = ({ vestingDate, stageData, vestingClick, receivedData }) => {
  const len = vestingDate.length;
  const curDate = new Date();
  const vestingData = [];

  console.log('receivedData', receivedData);

  const ClaimButton = () => {
    let claimType = receivedData.distributionType;
    console.log('claimType', receivedData, claimType);
    if (claimType === "contract") {
      return (
        <div style={{ width: 80 }}>
          <Button
            className="claim-btn"
            onClick={vestingClick}
          >
            Claim
          </Button>
        </div>
      )
    } else if (claimType === "project") {
      return (
        <div>
          <Button
            className="claim-btn"
          >
            Distributed by Project
          </Button>
        </div>
      )
    }
    return (
      <div style={{ width: 80 }}>
        <Button
          className="claim-btn"
          onClick={vestingClick}
        >
          Claim
        </Button>
      </div>
    );
  }

  // setState
  return (
    <div className='vesting-schedule-container'>
      <div style={{ width: 100 }}></div>
      <div className='vesting-procedure-container'>
        {
          [...Array(len)].map((_1, index) => {
            return (
              <div className="procedure vesting-procedure">
                {index === len - 1 ?
                  "" : <hr aria-orientation="vertical" className={curDate > new Date(vestingDate[index]) ? "verticalDivideLine vesting-schedule-line" : "verticalDivideLine_NotActive vesting-schedule-line"} />}

                <div className={curDate < new Date(vestingDate[index]) ? "procedureNumber_NotActive" : "procedureNumber"}>
                  <img src={tick} alt="tick-icon" className="vesting-tick-icon" />
                </div>

                <div className="vesting-schedule-text">
                  <div className='vesting-percentage-claim-container'>
                    <div className="vesting-percentage-container">
                      <p className="vesting-percentage">{stageData[index]}%</p>
                    </div>
                    <div className="vesting-text-container">
                      <p className="vesting-text">
                        <FormatedTime utc_second={vestingDate[index]} />
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )
          })
        }
      </div>
      <ClaimButton />
    </div>
  );
};

export default VestingSchedule;
