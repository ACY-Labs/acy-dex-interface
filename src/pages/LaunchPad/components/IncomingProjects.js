import React from 'react';
import ExpandingCard from './ExpandingCard.js';
import '../css/ProjectsCard.css';
import { useState, useEffect } from 'react';
import $ from 'jquery';
import ProjectsCard from './ProjectsCard.js';

const IncomingProjects = ({ data }) => {
  useEffect(() => {
    // var cell = document.querySelectorAll(".card")
    // console.log(cell)
    var $cell = $('.card');

    //open and close card when hovered on card
    $cell.find('.js-expander').hover(function() {
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
    // $cell.find('.js-collapser').hover(function() {
    //   var $thisCell = $(this).closest('.card');

    //   $thisCell.removeClass('is-expanded').addClass('is-collapsed');
    //   $cell.not($thisCell).removeClass('is-inactive');
    // });
  }, []);

  const [isActiveUpcoming, setIsActiveUpcoming] = useState(false);
  const [isIncomingExpanded, setisIncomingExpanded] = useState(false);

  const toggleExpanded = (event) => {
    console.log(this)
    setisIncomingExpanded(!isIncomingExpanded)
  }

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
        <div className="cards" >
          <div className=" card [ is-collapsed ] ">
            <div className="card__inner " onMouseEnter={toggleExpanded} onMouseLeave={() => setisIncomingExpanded(!isIncomingExpanded)} > 
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
                  isUpcoming={true}
                />
              </div>
              {/* <button className='[ js-expander ] '>Hello</button> */}
              {/* <i className="fa fa-folder-o" /> */}
            </div>
            <div className="card__expander">
              <i className="fa fa-close [ js-collapser ]" />
              Expander
            </div>
          </div>
        </div>
        <div className="cards" >
          <div className=" card [ is-collapsed ] ">
            <div className="card__inner [ js-expander ] " onMouseEnter={toggleExpanded} onMouseLeave={() => setisIncomingExpanded(!isIncomingExpanded)} > 
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards" >
          <div className=" card [ is-collapsed ] ">
            <div className="card__inner [ js-expander ] " onMouseEnter={toggleExpanded} onMouseLeave={() => setisIncomingExpanded(!isIncomingExpanded)} > 
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards" >
          <div className=" card [ is-collapsed ] ">
            <div className="card__inner [ js-expander ] " onMouseEnter={toggleExpanded} onMouseLeave={() => setisIncomingExpanded(!isIncomingExpanded)} > 
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards" >
          <div className=" card [ is-collapsed ] ">
            <div className="card__inner [ js-expander ] " onMouseEnter={toggleExpanded} onMouseLeave={() => setisIncomingExpanded(!isIncomingExpanded)} > 
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards" >
          <div className=" card [ is-collapsed ] ">
            <div className="card__inner [ js-expander ] " onMouseEnter={toggleExpanded} onMouseLeave={() => setisIncomingExpanded(!isIncomingExpanded)} > 
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards" >
          <div className=" card [ is-collapsed ] ">
            <div className="card__inner [ js-expander ] " onMouseEnter={toggleExpanded} onMouseLeave={() => setisIncomingExpanded(!isIncomingExpanded)} > 
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards" >
          <div className=" card [ is-collapsed ] ">
            <div className="card__inner [ js-expander ] " onMouseEnter={toggleExpanded} onMouseLeave={() => setisIncomingExpanded(!isIncomingExpanded)} > 
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
        <div className="cards" >
          <div className=" card [ is-collapsed ] ">
            <div className="card__inner [ js-expander ] " onMouseEnter={toggleExpanded} onMouseLeave={() => setisIncomingExpanded(!isIncomingExpanded)} > 
              <div className="">
                <ProjectsCard
                  ddl="2021/12/17 00:00:00"
                  raise="250,000 USDT"
                  sales="1,000,000 ACY"
                  rate="1ACY = 0.2USDT"
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
      </div>
      <a className="see-more-incoming" onClick={() => setIsActiveUpcoming(!isActiveUpcoming)} />
    </div>
  );
};

export default IncomingProjects;
