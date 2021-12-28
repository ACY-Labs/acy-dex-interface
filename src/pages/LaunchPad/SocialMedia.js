import React from 'react'
import './css/LaunchpadProject.css';

const SocialMedia = ({url, link}) => {
    return (
        <div>
            <img className= "icon-container" src={url} />
        </div>
    )
}

export default SocialMedia
