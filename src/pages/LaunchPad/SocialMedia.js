import React from 'react';
import './css/LaunchpadProject.css';

const SocialMedia = ({ url, link, socialText }) => {
  const openInNewTab = u => {
    const newWindow = window.open(u, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  return (
    <div style={{display:'flex', justifyContent:'center', flexDirection:'column'}}>
      <img
        className="icon-container"
        alt=""
        src={url}
        onClick={() => {
          openInNewTab(link);
        }}
      />
      <span style={{alignSelf:'center'}}>{socialText}</span>
    </div>
  );
};

export default SocialMedia;
