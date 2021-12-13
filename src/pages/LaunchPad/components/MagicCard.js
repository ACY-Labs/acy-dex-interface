import React from 'react'
import "../css/MagicCard.css"
import ProjectsCard from "./ProjectsCard.js"

const MagicCard = () => {
    return (
        <div className='magic-card-body'>
            <div className='magic-card-before'></div>
            <div className='magic-card'>
            <ProjectsCard ddl="2021/12/17 00:00:00" raise="250,000 USDT" sales="1,000,000 ACY" rate="1ACY = 0.2USDT"/>
            </div>
            <div className='magic-card-after'></div>
        </div>
    )
}

export default MagicCard
