import React from 'react';
import './css/LaunchpadProject.css';
import tick from '@/assets/icon-tick-white.svg';
import moment from 'moment'
import { useState } from "react";

const VestingSchedule = ({ startDate }) => {
  let vestingStartDate = moment(startDate);
  return (
    <div>
      <div className="procedure vesting-procedure">
        <hr aria-orientation="vertical" className="verticalDivideLine vesting-schedule-line" />
        <div className="procedureNumber">
          <img src={tick} alt="tick-icon" className="vesting-tick-icon"/>
        </div>
        <div className="vesting-schedule-text">
          <div className='vesting-percentage-claim-container'>
            <p className="vesting-percentage">30%</p>
            <button className={vestingStartDate.isBefore() ? "claim-btn claim-btn-active" : "claim-btn claim-btn-inactive"} id="claim-btn-1">Claim</button>
          </div>
          <p className="vesting-text">
            <span className="claimable-text">Claimable at</span>
            <br />
            {vestingStartDate.add(0, "months").format("h:mm A D MMM YYYY")}
          </p>
        </div>
      </div>

      <div className="procedure vesting-procedure">
        <hr aria-orientation="vertical" className="verticalDivideLine vesting-schedule-line" />
        <div className="procedureNumber">
          <img src={tick} alt="tick-icon" className="vesting-tick-icon"/>
        </div>
        <div className="vesting-schedule-text">
        <div className='vesting-percentage-claim-container'>
            <p className="vesting-percentage">23.3%</p>
            <button className={vestingStartDate.isBefore() ? "claim-btn claim-btn-active" : "claim-btn claim-btn-inactive"} id="claim-btn-1">Claim</button>
          </div>
          <p className="vesting-text">
            <span className="claimable-text">Claimable at</span> <br />
            {vestingStartDate.add(1, "months").format("h:mm A D MMM YYYY")}
          </p>
        </div>
      </div>

      <div className="procedure vesting-procedure">
        <hr aria-orientation="vertical" className="verticalDivideLine vesting-schedule-line" />
        <div className="procedureNumber">
          <img src={tick} alt="tick-icon" className="vesting-tick-icon"/>
        </div>
        <div className="vesting-schedule-text">
        <div className='vesting-percentage-claim-container'>
            <p className="vesting-percentage">23.3%</p>
            <button className={vestingStartDate.isBefore() ? "claim-btn claim-btn-active" : "claim-btn claim-btn-inactive"} id="claim-btn-1">Claim</button>
          </div>
          <p className="vesting-text">
            <span className="claimable-text">Claimable at</span> <br />
            {vestingStartDate.add(2, "months").format("h:mm A D MMM YYYY")}
          </p>
        </div>
      </div>

      <div className="procedure vesting-procedure">
        <div className="procedureNumber">
          <img src={tick} alt="tick-icon" className="vesting-tick-icon"/>
        </div>
        <div className="vesting-schedule-text">
        <div className='vesting-percentage-claim-container'>
            <p className="vesting-percentage">23.4%</p>
            <button className={vestingStartDate.isBefore() ? "claim-btn claim-btn-active" : "claim-btn claim-btn-inactive"} id="claim-btn-1">Claim</button>
          </div>
          <p className="vesting-text">
            <span className="claimable-text">Claimable at</span> <br />
            {vestingStartDate.add(3, "months").format("h:mm A D MMM YYYY")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VestingSchedule;
