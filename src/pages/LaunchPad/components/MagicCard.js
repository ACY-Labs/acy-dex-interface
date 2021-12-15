import React from 'react';
import '../css/MagicCard.css';
import ProjectsCard from './ProjectsCard.js';

const MagicCard = ({ ddl, raise, sales, rate, isOngoing}) => {
  return (
    <div className="magic-card-body">
      <div className="magic-card">
        <ProjectsCard ddl={ddl} raise={raise} sales={sales} rate={rate} isOngoing={isOngoing} />
      </div>
      <div className="magic-card-before" />
      <div className="magic-card-after" />
    </div>
  );
};

export default MagicCard;
