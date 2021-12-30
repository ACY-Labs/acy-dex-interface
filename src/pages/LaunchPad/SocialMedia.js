import React from 'react';
import './css/LaunchpadProject.css';

const SocialMedia = ({ url, link }) => {
  const openInNewTab = u => {
    const newWindow = window.open(u, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  return (
    <div>
      <img
        className="icon-container"
        alt=""
        src={url}
        onClick={() => {
          openInNewTab(link);
        }}
      />
    </div>
  );
};

export default SocialMedia;
