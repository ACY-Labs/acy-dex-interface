import React from 'react';
import '../css/ProjectsCard.css';
import AcyIcon from '@/assets/icon_acy.svg';
import CountDown from './CountDown.js';

const ProjectsCard = ({ ddl, raise, sales, rate }) => {
  console.log(typeof raise);
  let raiseString = 'Raise' + raise.padStart(50 - 6);
  let salesString = 'Sales' + sales.padStart(50 - 5);
  let rateString = 'Rate' + rate.padStart(50 - 7);
  console.log(raiseString);
  return (
    <div className="projects-card projects-container">
      <div className="logo-countdown-container">
        <div className="logo-container">
          <div className="logo">
            <img src={AcyIcon} alt="" />
          </div>
          <div>ACY Finance</div>
        </div>
        <div className="countdown-container">
          <div>
            <CountDown ddl={ddl} />
          </div>
          <div>
            <p style={{ fontSize: '10px' }}>Sale ends: {ddl}</p>
          </div>
        </div>
      </div>

      <div className="details-container detail-text">
        <p style={{ whiteSpace: 'pre' }}>{raiseString}</p>
        <p style={{ whiteSpace: 'pre' }}>{salesString}</p>
        <p style={{ whiteSpace: 'pre' }}>{rateString}</p>
      </div>
    </div>
  );
};

export default ProjectsCard;
