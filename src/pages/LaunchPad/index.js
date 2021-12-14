import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import {Card, Icon, Progress, Button} from 'antd';
import LaunchPad from './launchpad';
import styles from './styles.less';
import AcyIcon from '@/assets/icon_acy.svg';
import telegramWIcon from '@/assets/icon_telegram_white.svg';
import telegramOIcon from '@/assets/icon_telegram_orange.svg';
import twitterOIcon from '@/assets/icon_twitter_orange.svg';
import announcementIcon from '@/assets/icon_announcement.svg';
import announcementFIcon from '@/assets/icon_announcement_fill.svg';
import OngoingProjects from "./components/OngoingProjects.js"
import IncomingProjects from "./components/IncomingProjects.js"
import ExpandingCard from "./components/ExpandingCard.js"
import EndedProjects from "./components/EndedProjects.js"
import BubblyButton from "./components/BubblyButton.js"
import RaiseButton from "./components/RaiseButton.js"
import $ from 'jquery';

const { Meta } = Card;

const Pool = (props)=> {
    const [projectStatus, setProjectStatus] = useState('inProgress');
    const [navPage, setnavPage] = useState(0);
    const [filter, setFilter] = useState('');

    const searchText = (e) => {
      setFilter(e.target.value)
    }

    // project variables
    useEffect(() => {
      axios.get(`http://localhost:3001/api/launch/projects`).then(res => {
        // see if get request is successful
        console.log(res)
        // get all project count
      }).catch(e => console.log("error: ", e));
    },[]);

    const mouseMove = (e) => {
      let mouseX, mouseY;
      let traX, traY;
      mouseX = e.pageX;
      mouseY = e.pageY;
      traX = ((4 * mouseX) / 570) + 40;
      traY = ((4 * mouseY) / 570) + 50;
      document.getElementById('bigTitle').style.backgroundPosition = traX + "%" + traY + "%";
    }

    const history = useHistory();
    const onClick = () => {
      history.push("/launchpad/project")
    }

    const switchProject = (str) => setProjectStatus(str)
    const myPos = useRef();
    const goToPos = () => {
      myPos.current.scrollIntoView();
    }

    const links = [
      'https://t.me/acyfinance',
      'https://t.me/ACYFinanceChannel',
      'https://twitter.com/ACYFinance',
      'https://acy.finance/',
      'https://github.com/ACY-Labs/ACY-Finance-Whitepaper'
    ]

    return(
      <div className={styles.launchRoot}>
        <div className={styles.pooltopContainer}>
          <div className={styles.bigTitle} id='bigTitle' onMouseMove={mouseMove}>
            THE BEST <br />IDO PROJECTS
          </div>
        </div>
        <div className={styles.launchbottomContainer}>
          <p className={styles.titleDesc}>
            Launching Profitable Projects on Multichain.
          </p>
          <div className={styles.buttonContainer}>
            <div>
              <BubblyButton href={"https://forms.gle/gsLNsgDy2BXHNZda9"} className={styles.btnApply }/>
            </div>
            <div>
              <RaiseButton href={"https://t.me/acyfinance"} className={styles.btnApply} src={telegramWIcon} text={"Telegram"}/>
            </div>
            <div>
              <RaiseButton href={"https://t.me/ACYFinanceChannel"} className={styles.btnApply} src={announcementIcon} text={"Announcements"}/>
            </div>
          </div>
        </div>
        <div className={styles.btmContent}>
          <section>
            <div className={styles.projectBoxes}>
              <div className={styles.titleBlock}>
                <span className={styles.anyStatusTitle}>Ongoing Projects</span>
                <div className={styles.lineSeperator} />
              </div>
              <div className={styles.projectsContainer}>
                <OngoingProjects ddl="2021/12/17 00:00:00" raise="250,000 USDT" sales="1,000,000 ACY" rate="1ACY = 0.2USDT" />
                <OngoingProjects ddl="2021/12/17 00:00:00" raise="250,000 USDT" sales="1,000,000 ACY" rate="1ACY = 0.2USDT" />
                <OngoingProjects ddl="2021/12/17 00:00:00" raise="250,000 USDT" sales="1,000,000 ACY" rate="1ACY = 0.2USDT" />
              </div>
            </div>
            <div className={styles.projectBoxes}>
              <div className={styles.titleBlock}>
                <span className={styles.anyStatusTitle}>Upcoming Projects</span>
                <div className={styles.lineSeperator} />
              </div>
              <div className={styles.projectsContainer}>
                <IncomingProjects />
              </div>
            </div>
            <div className={styles.projectBoxes}>
              <div className={styles.titleBlock}>
                <span className={styles.anyStatusTitle}>Ended Projects</span>
                <div className={styles.lineSeperator} />
              </div>
              <div className={styles.projectsContainer}>
                <EndedProjects />
              </div>
            </div>
          </section>
        </div>
        
      </div>
    )
};

export default Pool;