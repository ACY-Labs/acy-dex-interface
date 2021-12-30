import React from 'react';
import './css/LaunchpadProject.css';

const SocialMedia = ({ url, link }) => {
  const openInNewTab = url => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  return (
    <div>
      <img
        className="icon-container"
        src={url}
        onClick={() => {
          openInNewTab(link);
        }}
      />
    </div>
  );
};

export default SocialMedia;
