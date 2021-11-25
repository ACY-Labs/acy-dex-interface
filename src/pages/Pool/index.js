import React, { useState, useEffect } from 'react';
import {Button, Menu, Dropdown, Icon, Progress, Tag, Table, Carousel} from 'antd';
import styles from './pool.less';


const Pool = (props)=> {

    let [page,setPage]= useState(0);

    useEffect(() => {




    },[page]);

    function SelectedBtn(props) {
        return(
            props.page == props.id
                ?<button className = {styles.Btn } onClick = {() => setPage(props.id)}>{props.text}</button>
                :<button className = {styles.bg_none } onClick = {() => setPage(props.id)}>{props.text}</button>
        );
    }

    return(
        <section>
        <div id = 'container' className = {styles.Container} >
            
             <div id = 'selector' className = {styles.Selector} > 
                <SelectedBtn page = {page} id = {0} text = {'upcoming'}/>
                <SelectedBtn page = {page} id = {1} text = {'ended'}/>
                <SelectedBtn page = {page} id = {2} text = {'ended NFT'}/>
        
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