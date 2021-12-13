import React from 'react';
import MagicCard from './MagicCard.js';
import ProjectCard from './ProjectsCard.js';

const OngoingProjects = ({ ddl, raise, sales, rate }) => {
  return (
    <div>
      <div className="">
        <MagicCard ddl={ddl} raise={raise} sales={sales} rate={rate} />
      </div>
    </div>
  );
};

export default OngoingProjects;
