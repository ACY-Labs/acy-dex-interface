import React from 'react';
import styles from '../css/ExpandingCard.css';
import '../css/ProjectsCard.css';
import { useEffect } from 'react';
import $ from 'jquery';
import ProjectsCard from './ProjectsCard.js';

const ExpandingCard = () => {
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
  return (
    <div className="expanding-card">
      <div className="cards">
        <div className=" card [ is-collapsed ] ">
          <div className="card__inner [ js-expander ]">
            <span>Card</span>
            <i className="fa fa-folder-o" />
          </div>
          <div className="card__expander">
            <i className="fa fa-close [ js-collapser ]" />
            Expander
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandingCard;