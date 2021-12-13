import React from 'react'
import "../css/MagicCard.css"
import ProjectsCard from "./ProjectsCard.js"

const MagicCard = ({ddl, raise, sales, rate}) => {
    return (
        <div className='magic-card-body'>
            <div className='magic-card-before'></div>
            <div className='magic-card'>
                <ProjectsCard ddl={ddl} raise={raise} sales={sales} rate={rate}/>
            </div>
            <div className='magic-card-after'></div>
        </div>
    )
}

export default MagicCard
