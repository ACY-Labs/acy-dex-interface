import React from 'react';
import ExpandingCard from './ExpandingCard.js';
import '../css/ProjectsCard.css';
import { useState, useEffect } from 'react';
import $ from 'jquery';
import ProjectsCard from './ProjectsCard.js';

const IncomingProjects = ({ data }) => {
  useEffect(() => {
    var $cell = $('.card');

    //open and close card when clicked on card
    $cell.find('.js-expander').click(function() {
      var $thisCell = $(this).closest('.card');

      if ($thisCell.hasClass('is-collapsed')) {
        $cell
          .not($thisCell)
          .removeClass('is-expanded')
          .addClass('is-collapsed')
          .addClass('is-inactive');
        $thisCell.removeClass('is-collapsed').addClass('is-expanded');

        if ($cell.not($thisCell).hasClass('is-inactive')) {
          //do nothing
        } else {
          $cell.not($thisCell).addClass('is-inactive');
        }
      } else {
        $thisCell.removeClass('is-expanded').addClass('is-collapsed');
        $cell.not($thisCell).removeClass('is-inactive');
      }
    });

    //close card when click on cross
    $cell.find('.js-collapser').click(function() {
      var $thisCell = $(this).closest('.card');

      $thisCell.removeClass('is-expanded').addClass('is-collapsed');
      $cell.not($thisCell).removeClass('is-inactive');
    });
  }, []);

  const [isActiveUpcoming, setIsActiveUpcoming] = useState(false);
  const [isIncomingExpanded, setisIncomingExpanded] = useState(false);

  return (
    <div className={isActiveUpcoming ? 'incoming-container active' : 'incoming-container'}>
      <div
        className={isIncomingExpanded ? "expanded expanding-card" : "expanding-card"}
        style={{
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center',
        }}
      >
        {
          data && data.map((obj) =>
            <div className="cards">
              <div className=" card [ is-collapsed ]">
                <div className="card__inner [ js-expander ]" onClick={() => setisIncomingExpanded(!isIncomingExpanded)}>
                  <div className="">
                    <ProjectsCard
                      ddl={obj.saleEnd}
                      raise={obj.totalRaise.toString() + " USDT"}
                      sales={obj.totalSale.toString() + ' ' + obj.projectToken}
                      rate={"1 " + obj.projectToken + " = " + obj.tokenPrice.toString() + " USDT"}
                      title={obj.projectName}
                      isUpcoming={true}
                    />
                  </div>
                  {/* <i className="fa fa-folder-o" /> */}
                </div>
                <div className="card__expander">
                  <i className="fa fa-close [ js-collapser ]" />
                  Expander
                </div>
              </div>
            </div>
          )
        }
      </div>
      {
        data.length > 3 ? <a className="see-more-incoming" onClick={() => setIsActiveUpcoming(!isActiveUpcoming)} /> : ""
      }
      
    </div>
  );
};

export default IncomingProjects;
