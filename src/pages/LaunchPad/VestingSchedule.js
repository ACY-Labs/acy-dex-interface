import React from 'react';
import './css/LaunchpadProject.css';
import tick from '@/assets/tick-launchpad.svg';

const VestingSchedule = () => {
  return (
    <div>
      <div className="procedure vesting-procedure">
        <hr aria-orientation="vertical" className="verticalDivideLine vesting-schedule-line" />
        <div className="procedureNumber">
          <img src={tick} alt="tick-icon" />
        </div>
        <div className="vesting-schedule-text">
          <p className="vesting-percentage">30%</p>
          <p className="vesting-text">
            <span className="claimable-text">Claimable at</span>
            <br />
            12/17/2021, 9:30:00pm
          </p>
        </div>
      </div>

      <div className="procedure vesting-procedure">
        <hr aria-orientation="vertical" className="verticalDivideLine vesting-schedule-line" />
        <div className="procedureNumber">
          <img src={tick} alt="tick-icon" />
        </div>
        <div className="vesting-schedule-text">
          <p className="vesting-percentage">23.3%</p>
          <p className="vesting-text">
            <span className="claimable-text">Claimable at</span> <br />
            12/17/2021, 9:30:00pm
          </p>
        </div>
      </div>

      <div className="procedure vesting-procedure">
        <hr aria-orientation="vertical" className="verticalDivideLine vesting-schedule-line" />
        <div className="procedureNumber">
          <img src={tick} alt="tick-icon" />
        </div>
        <div className="vesting-schedule-text">
          <p className="vesting-percentage">23.3%</p>
          <p className="vesting-text">
            <span className="claimable-text">Claimable at</span> <br />
            12/17/2021, 9:30:00pm
          </p>
        </div>
      </div>

      <div className="procedure vesting-procedure">
        <div className="procedureNumber">
          <img src={tick} alt="tick-icon" />
        </div>
        <div className="vesting-schedule-text">
          <p className="vesting-percentage">23.4%</p>
          <p className="vesting-text">
            <span className="claimable-text">Claimable at</span> <br />
            12/17/2021, 9:30:00pm
          </p>
        </div>
      </div>
    </div>
  );
};

export default VestingSchedule;
