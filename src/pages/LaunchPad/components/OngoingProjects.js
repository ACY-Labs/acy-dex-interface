import React from 'react';
import MagicCard from './MagicCard.js';
import ProjectCard from './ProjectsCard.js';

const OngoingProjects = ({ data }) => {

  return (
    <>
      {
        data && data.map((obj) => 
          <div>
            <div class="">
              <MagicCard
                projectID={obj.projectID}
                start={obj.saleStart}
                ddl={obj.saleEnd}
                raise={obj.totalRaise.toString() + " USDT"} 
                sales={obj.totalRaise.toString()+ ' ' + obj.projectToken} 
                rate={"1 " + obj.projectToken + " = " + obj.tokenPrice.toString() + " USDT"}
                title={obj.projectName} 
                projectTokenUrl={obj.projectTokenUrl}
                isOngoing
              />
            </div>
          </div>
        )
      }
    </>
  );
};

export default OngoingProjects;
