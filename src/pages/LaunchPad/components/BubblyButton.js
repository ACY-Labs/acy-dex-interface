import React from 'react'
import { Card, Icon, Progress, Button } from 'antd';
import "../css/ProjectsCard.css"
import { useEffect, useState } from "react"; 

const BubblyButton = ({href, className}) => {
    const [isButtonActive, setIsButtonActive] = useState(false);
    // this.buttonRef = React.createRef();
    
        const animateButton = function(e) {

            e.preventDefault;
            //reset animation
            e.target.classList.remove('animate');
            
            e.target.classList.add('animate');
            setTimeout(function(){
              e.target.classList.remove('animate');
            },700);
          };
          
          
    
    return (
        <div>
            <a className="bubbly-button animate" href="https://forms.gle/gsLNsgDy2BXHNZda9" target="_blank" rel="noreferrer">
                <div className='inner-text'>
                    <Icon type="rocket" style={{fontSize: '2em', margin: '0 10px 0 0'}} />
                    <p>Apply for IDO</p>
                </div>
            </a>
        </div>
    )
}

export default BubblyButton
