import React from 'react';
import Lottie from '@/assets/lottie/svg';
import { useState } from 'react';
import '../css/ProjectsCard.css';

const ExpandedContentCards = ({ src, alt, index }) => {
  return (
    <div className="expanded-content-card">
      <img src={src} alt={alt} className="expanded-content-icon" />
      <p className="expanded-content-text">{index}</p>
    </div>
  );
};

const ExpandedContent = () => {
  const {
    apple,
    banana,
    brezel,
    burger,
    carrot,
    cheese,
    cherry,
    chocolateBar,
    corn,
    donut,
    eggs,
    frenchFries,
    honey,
    iceCream,
    lemon,
    meat,
    peach,
    pineapple,
    pizza,
    popcorn,
    raspberry,
    steak,
    strawberry,
    watermelon,
  } = Lottie;

  const expandedContentCards = () => {
    const cards = [];
    const url = [
      apple,
      banana,
      brezel,
      burger,
      carrot,
      cheese,
      cherry,
      chocolateBar,
      corn,
      donut,
      eggs,
      frenchFries,
      honey,
      iceCream,
      lemon,
      meat,
      peach,
      pineapple,
      pizza,
      popcorn,
      raspberry,
      steak,
      strawberry,
      watermelon,
    ];
    for (let i = 0; i < 12; i++) {
      cards.push(<ExpandedContentCards src={url[i]} alt="apple" index={i + 1} />);
    }
    return cards;
  };

  return <div className="expanded-content-container">{expandedContentCards()}</div>;
};

export default ExpandedContent;
