import React from 'react'
import { Card, Icon, Progress, Button } from 'antd';
import "../css/ProjectsCard.css"
import { useEffect, useState } from "react"; 

const BubblyButton = () => {
    const [isButtonActive, setIsButtonActive] = useState(false);
    // this.buttonRef = React.createRef();
    useEffect(() => {
        var animateButton = function(e) {

            e.preventDefault;
            //reset animation
            e.target.classList.remove('animate');
            
            e.target.classList.add('animate');
            setTimeout(function(){
              e.target.classList.remove('animate');
            },700);
          };
          
          var bubblyButtons = document.getElementsByClassName("bubbly-button");
          
          for (var i = 0; i < bubblyButtons.length; i++) {
            bubblyButtons[i].addEventListener('click', animateButton, false);
        }
        
    }, [isButtonActive])
    return (
        <div>
            <button className="bubbly-button" onClick={() => setIsButtonActive(!isButtonActive)}>

                <div className='inner-text'>
                    <Icon type="rocket" style={{fontSize: '2em', margin: '0 10px 0 0'}} />
                    <p>Apply for IDO</p>
                </div>
            </button>
        </div>
    )
}

export default BubblyButton
