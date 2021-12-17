import React from 'react';
import { useHistory } from 'react-router-dom';
import {Icon} from 'antd';
import MagicCard from './MagicCard.js';
import ProjectCard from './ProjectsCard.js';

const OngoingProjects = ({ data }) => {
  const history = useHistory();
  const onOpenProjectDetail = (projectId) => {
    history.push(`/launchpad/project/${projectId}`)
  }

  return (
    <>
      {
        data && data.map((obj) => 
          <div>
            <div class="">
              <MagicCard
                projectID={obj.projectID}
                ddl={obj.saleEnd}
                raise={obj.totalRaise.toString() + " USDT"} 
                sales={obj.totalRaise.toString()+ ' ' + obj.projectToken} 
                rate={"1 " + obj.projectToken + " = " + obj.tokenPrice.toString() + " USDT"}
                title={obj.projectName} 
                isOngoing
                openProject={() => onOpenProjectDetail(obj.projectID.toString())}
              />
            </div>
          </div>
        )
      }
    </>
  );
};

export default OngoingProjects;
