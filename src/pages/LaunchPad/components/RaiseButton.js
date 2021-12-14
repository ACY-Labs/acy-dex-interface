import React from 'react'
import "../css/ProjectsCard.css"
import telegramWIcon from '@/assets/icon_telegram_white.svg';

const RaiseButton = ({href, src, text}) => {
    return (
        <div className='raise-button'>
            <a className='raise' href={href} target="_blank" rel="noreferrer">
                <div className='inner-text'>
                    <img src={src} alt="" style={{height:'1.4em', width:'1.5em', objectFit:'contain', fontSize: '1.5em', margin: '0 10px 0 0'}} />
                    <p>{text}</p>
                </div>
            </a>
        </div>
    )
}

export default RaiseButton
