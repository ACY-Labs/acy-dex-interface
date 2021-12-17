import React from 'react';
import './css/LaunchpadProject.css';

const VestingSchedule = () => {
  return (
    <div>
      <div className="procedure">
        <hr aria-orientation="vertical" className="verticalDivideLine" />
        <div className="procedureNumber">1</div>
        <div>
          <p>Allocation</p>
          <p className="shortText"></p>
          <p className="shortText"></p>
        </div>
      </div>

      <div className="procedure" style={{ marginTop: '24px' }}>
        <hr aria-orientation="vertical" className="verticalDivideLine" />
        <div className="procedureNumber">2</div>
        <div>
          <p>Sale</p>
          <p className="shortText"></p>
          <p className="shortText"></p>
        </div>
      </div>

      <div className="procedure" style={{ marginTop: '24px' }}>
        <div className="procedureNumber">3</div>
        <div>
          <p>Vesting</p>
        </div>
      </div>
    </div>
  );
};

export default VestingSchedule;
