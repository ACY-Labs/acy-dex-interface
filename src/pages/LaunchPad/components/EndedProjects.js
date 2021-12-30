import React from 'react';
import '../css/ProjectsCard.css';
import { useEffect, useState } from 'react';
import $ from 'jquery';
import ProjectsCard from './ProjectsCard.js';
import ExpandedContent from './ExpandedContent.js';

const EndedProjects = ({ data, openProject }) => {
  // var $cell = $('.card2');

  // console.log($cell);
  // //open and close card when clicked on card
  // $cell.find('.js-expander2').click(function() {
  //   var $thisCell = $(this).closest('.card2');
  //   var $container = $(this).closest('.expanding-card2');

  //   if ($thisCell.hasClass('is-collapsed2')) {
  //     $cell
  //       .not($thisCell)
  //       .removeClass('is-expanded2')
  //       .addClass('is-collapsed2');
  //     $thisCell.removeClass('is-collapsed2').addClass('is-expanded2');
  //     $container.addClass('expanded');
  //   } else {
  //     $thisCell.removeClass('is-expanded2').addClass('is-collapsed2');
  //     $container.removeClass('expanded');
  //   }
  // });

  const [isActiveEnded, setisActiveEnded] = useState(false);
  const [isEndedExpanded, setisEndedExpanded] = useState(false);
  return (
    <div className='ended-container active'>
      <div
        className="expanding-card2"
        style={{
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center',
        }}
      >
        {data &&
          data.map(obj => (
            <div className="cards2">
              <div className="">
                <ProjectsCard
                  projectID={obj.projectID}
                  ddl={obj.saleEnd}
                  raise={obj.totalRaise.toString() + ' USDT'}
                  sales={obj.totalSale.toString() + ' ' + obj.projectToken}
                  rate={'1 ' + obj.projectToken + ' = ' + obj.tokenPrice.toString() + ' USDT'}
                  title={obj.projectName}
                  isEnded={true}
                />
              </div>
              {/* <i className="fa fa-folder-o" /> */}
            </div>
          ))}
      </div>
    </div>
  );
};

export default EndedProjects;
