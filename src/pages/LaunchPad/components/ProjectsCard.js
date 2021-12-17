import React from 'react';
import { history } from 'umi';
import '../css/ProjectsCard.css';
import AcyIcon from '@/assets/icon_acy.svg';
import CountDown from './CountDown.js';

const ProjectsCard = ({ projectID, ddl, raise, sales, rate, title, isOngoing, isUpcoming, openProject }) => {
  let saleString = isOngoing ? ("Sale ends: " + ddl ): (isUpcoming ? ("Sale starts: " + ddl) : ("Sale ended: " + ddl))

  const onOpenProjectDetail = () => {
    history.push(`/launchpad/project/${projectID}`)
  }

  return (
    <div className="projects-card projects-container" onClick={openProject}>
      <div className="logo-countdown-container">
        <div className="logo-container">
          <div className="logo">
            <img src={AcyIcon} alt="" />
          </div>
          <div className="logo-text">{title}</div>
        </div>
        <div className="countdown-container">
          <div>
            {(isOngoing || isUpcoming) ? <CountDown ddl={ddl} />:<CountDown ddl={null} />}
          </div>
          <div>
            <p style={{ fontSize: '10px' }}>
              {saleString}
            </p>
          </div>
        </div>
      </div>

      <div className="details-container detail-text" onClick={openProject}>
        <div style={{width: "100%", display:"inline-flex", justifyContent:"space-between", padding: "0 20px 0 10px"}}>
          <span>Raise</span>
          <span>{raise}</span>
        </div>
        <div style={{width: "100%", display:"inline-flex", justifyContent:"space-between", padding: "0 20px 0 10px"}}>
          <span>Sales</span>
          <span>{sales}</span>
        </div>
        <div style={{width: "100%", display:"inline-flex", justifyContent:"space-between", padding: "0 20px 0 10px"}}>
          <span>Rate</span>
          <span>{rate}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectsCard;
