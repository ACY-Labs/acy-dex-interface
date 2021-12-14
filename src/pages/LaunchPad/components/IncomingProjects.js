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
        className={isIncomingExpanded ? "expanded expanding-card" : "expanding-card" }
        style={{
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center',
        }}
        
      >
        <div className="cards">
          <div className=" card [ is-collapsed ]">
            <div className="card__inner [ js-expander ]" onClick={() => setisIncomingExpanded(!isIncomingExpanded)}>
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards">
          <div className=" card [ is-collapsed ]">
            <div className="card__inner [ js-expander ]" onClick={() => setisIncomingExpanded(!isIncomingExpanded)}>
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards">
          <div className=" card [ is-collapsed ]">
            <div className="card__inner [ js-expander ]" onClick={() => setisIncomingExpanded(!isIncomingExpanded)}>
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards">
          <div className=" card [ is-collapsed ]">
            <div className="card__inner [ js-expander ]" onClick={() => setisIncomingExpanded(!isIncomingExpanded)}>
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards">
          <div className=" card [ is-collapsed ]">
            <div className="card__inner [ js-expander ]" onClick={() => setisIncomingExpanded(!isIncomingExpanded)}>
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards">
          <div className=" card [ is-collapsed ]">
            <div className="card__inner [ js-expander ]" onClick={() => setisIncomingExpanded(!isIncomingExpanded)}>
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards">
          <div className=" card [ is-collapsed ]">
            <div className="card__inner [ js-expander ]" onClick={() => setisIncomingExpanded(!isIncomingExpanded)}>
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards">
          <div className=" card [ is-collapsed ]">
            <div className="card__inner [ js-expander ]" onClick={() => setisIncomingExpanded(!isIncomingExpanded)}>
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards">
          <div className=" card [ is-collapsed ]">
            <div className="card__inner [ js-expander ]" onClick={() => setisIncomingExpanded(!isIncomingExpanded)}>
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        
      </div>
      <a className="see-more-incoming" onClick={() => setIsActiveUpcoming(!isActiveUpcoming)} />
    </div>
  );
};

export default IncomingProjects;
