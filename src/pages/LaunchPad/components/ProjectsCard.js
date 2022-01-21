import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import '../css/ProjectsCard.css';
import AcyIcon from '@/assets/icon_acy.svg';
import PaycerIcon from '@/assets/icon_paycer_logo.svg';
import CountDown from './CountDown.js';
import FormatedTime from '@/components/FormatedTime';

const ProjectsCard = ({ projectID, start, ddl, raise, sales, rate, title, isOngoing, isUpcoming, tokenLogoUrl }) => {
  let saleString = start + '(UTC)';
  const history = useHistory();
  const onOpenProjectDetail = (p) => {
    history.push(`/launchpad/project/${p}`);
  };

  const stripTitle = (title) => {
    let words = title.trim().split(' ');
    return words.slice(0, 2).join(' ');
  }

  return (
    <div className="projects-card projects-container" onClick={() => onOpenProjectDetail(projectID)}>
      <div className="logo-countdown-container">
        <div className="logo-container">
          <div className="logo">
            <img src={tokenLogoUrl} alt="" />
          </div>
          <div className="logo-text">{stripTitle(title)}</div>
        </div>
        <div className="countdown-container">
          <div>
            {/* {isOngoing || isUpcoming ?<CountDown ddl={start} /> : <CountDown ddl={null} /> } */}
            <CountDown ddl={start} />
          </div>

          <div>
            <p style={{ fontSize: '10px', color: '#fff' }}>
              <FormatedTime utc_string={start} />
            </p>
          </div>
        </div>
      </div>

      <div className="details-container detail-text">
        <div
          style={{
            width: '100%',
            display: 'inline-flex',
            justifyContent: 'space-between',
            padding: '0 20px 0 10px',
          }}
        >
          <span style={{ color: '#fff', marginLeft: '1rem' }}>Raise</span>
          <span style={{ color: '#fff', marginRight: '0.5rem' }}>{raise}</span>
        </div>
        <div
          style={{
            width: '100%',
            display: 'inline-flex',
            justifyContent: 'space-between',
            padding: '0 20px 0 10px',
          }}
        >
          <span style={{ color: '#fff', marginLeft: '1rem' }}>Sales</span>
          <span style={{ color: '#fff', marginRight: '0.5rem' }}>{sales}</span>
        </div>
        <div
          style={{
            width: '100%',
            display: 'inline-flex',
            justifyContent: 'space-between',
            padding: '0 20px 0 10px',
          }}
        >
          <span style={{ color: '#fff', marginLeft: '1rem' }}>Rate</span>
          <span style={{ color: '#fff', marginRight: '0.5rem' }}>{rate}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectsCard;
