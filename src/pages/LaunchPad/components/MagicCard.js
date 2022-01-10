import React from 'react';
import '../css/MagicCard.css';
import ProjectsCard from './ProjectsCard.js';

const MagicCard = ({ projectID, start, ddl, raise, sales, rate, title, projectTokenUrl, isOngoing }) => {
  return (
    <div className="magic-card-body">
      <div className="magic-card">
        <ProjectsCard projectID={projectID} start={start} ddl={ddl} raise={raise} sales={sales} rate={rate} title={title} tokenLogoUrl={projectTokenUrl} isOngoing={isOngoing} />
      </div>
      <div className="magic-card-before" />
      <div className="magic-card-after" />
    </div>
  );
};

export default MagicCard;
