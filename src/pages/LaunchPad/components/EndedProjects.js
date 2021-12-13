import React from 'react';
import ExpandingCard from './ExpandingCard.js';
import '../css/ProjectsCard.css';
import { useEffect, useState } from 'react';
import $ from 'jquery';
import ProjectsCard from './ProjectsCard.js';

const EndedProjects = ({ data }) => {
  useEffect(() => {
    var $cell = $('.card2');

    //open and close card when clicked on card
    $cell.find('.js-expander2').click(function() {
      var $thisCell = $(this).closest('.card2');

      if ($thisCell.hasClass('is-collapsed2')) {
        $cell
          .not($thisCell)
          .removeClass('is-expanded2')
          .addClass('is-collapsed2')
          .addClass('is-inactive2');
        $thisCell.removeClass('is-collapsed2').addClass('is-expanded2');

        if ($cell.not($thisCell).hasClass('is-inactive2')) {
          //do nothing
        } else {
          $cell.not($thisCell).addClass('is-inactive2');
        }
      } else {
        $thisCell.removeClass('is-expanded2').addClass('is-collapsed2');
        $cell.not($thisCell).removeClass('is-inactive2');
      }
    });

    //close card when click on cross
    $cell.find('.js-collapser2').click(function() {
      var $thisCell = $(this).closest('.card2');

      $thisCell.removeClass('is-expanded2').addClass('is-collapsed2');
      $cell.not($thisCell).removeClass('is-inactive2');
    });
  }, []);

  const [isActiveEnded, setisActiveEnded] = useState(false);
  return (
    <div>
      <div className={isActiveEnded ? 'ended-container active' : 'ended-container'}>
        <div
          className="expanding-card2"
          style={{
            zIndex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
          }}
        >
          <div className="cards2">
            <div className=" card2 [ is-collapsed2 ]">
              <div className="card2__inner2 [ js-expander2 ]">
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
              <div className="card2__expander2">Expander</div>
            </div>
          </div>
          <div className="cards2">
            <div className=" card2 [ is-collapsed2 ]">
              <div className="card2__inner2 [ js-expander2 ]">
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
              <div className="card2__expander2">Expander</div>
            </div>
          </div>
          <div className="cards2">
            <div className=" card2 [ is-collapsed2 ]">
              <div className="card2__inner2 [ js-expander2 ]">
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
              <div className="card2__expander2">Expander</div>
            </div>
          </div>
          <div className="cards2">
            <div className=" card2 [ is-collapsed2 ]">
              <div className="card2__inner2 [ js-expander2 ]">
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
              <div className="card2__expander2">Expander</div>
            </div>
          </div>
          <div className="cards2">
            <div className=" card2 [ is-collapsed2 ]">
              <div className="card2__inner2 [ js-expander2 ]">
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
              <div className="card2__expander2">Expander</div>
            </div>
          </div>
          <div className="cards2">
            <div className=" card2 [ is-collapsed2 ]">
              <div className="card2__inner2 [ js-expander2 ]">
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
              <div className="card2__expander2">Expander</div>
            </div>
          </div>
          <div className="cards2">
            <div className=" card2 [ is-collapsed2 ]">
              <div className="card2__inner2 [ js-expander2 ]">
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
              <div className="card2__expander2">Expander</div>
            </div>
          </div>
          <div className="cards2">
            <div className=" card2 [ is-collapsed2 ]">
              <div className="card2__inner2 [ js-expander2 ]">
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
              <div className="card2__expander2">Expander</div>
            </div>
          </div>
          <div className="cards2">
            <div className=" card2 [ is-collapsed2 ]">
              <div className="card2__inner2 [ js-expander2 ]">
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
              <div className="card2__expander2">Expander</div>
            </div>
          </div>
          <div className="cards2">
            <div className=" card2 [ is-collapsed2 ]">
              <div className="card2__inner2 [ js-expander2 ]">
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
              <div className="card2__expander2">Expander</div>
            </div>
          </div>
        </div>
        <a className="see-more-ended" onClick={() => setisActiveEnded(!isActiveEnded)} />
      </div>
    </div>
  );
};

export default EndedProjects;
