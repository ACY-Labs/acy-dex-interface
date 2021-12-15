import React from 'react';
import MagicCard from './MagicCard.js';
import ProjectCard from './ProjectsCard.js';

const OngoingProjects = ({ ddl, raise, sales, rate, isOngoing}) => {
  return (
    <div>
      <div className="">
        <MagicCard ddl={ddl} raise={raise} sales={sales} rate={rate} isOngoing={isOngoing} />
      </div>
    </div>
  );
};

export default OngoingProjects;
