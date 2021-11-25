import React, { useState, useEffect } from 'react';
import {Button, Menu, Dropdown, Icon, Progress, Tag, Table, Carousel} from 'antd';
import styles from './pool.less';


const Pool = (props)=> {

    let [current,setCurrent]= useState(0);

    return(
        <section>
        <div id = 'container' className = {styles.Container} >
            
             <div id = 'selector' className = {styles.Selector} > 
                <Button className = {styles.Btn }>upcoming</Button>
                <Button className = {styles.Btn}>ended</Button>
                <Button className = {styles.Btn}>ended NFT</Button>
        
             </div>
             <section>
                 <div className={styles.Row}>


                 </div>
             </section>
        
        
        
        
        </div>
        </section>
    )
};

export default Pool