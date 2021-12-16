import React from 'react';
import { useHistory } from 'react-router-dom';
import MagicCard from './MagicCard.js';
import ProjectCard from './ProjectsCard.js';

const OngoingProjects = ({ ddl, raise, sales, rate, title, isOngoing, openProject}) => {
  return (
    <div>
      <div className="">
        <MagicCard ddl={ddl} raise={raise} sales={sales} rate={rate} title={title} isOngoing={isOngoing} openProject={openProject} />
      </div>
    </div>
  );
};

export default OngoingProjects;
