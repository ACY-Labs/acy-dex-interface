import React from 'react';
import MagicCard from './MagicCard.js';
import ProjectCard from './ProjectsCard.js';
import { nFormatter } from '../utils/index.js';

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
                raise={nFormatter(obj.totalRaise, 3) + " USDT"}
                sales={nFormatter(obj.totalSale, 3) + ' ' + obj.projectToken}
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
