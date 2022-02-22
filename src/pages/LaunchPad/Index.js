import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Card } from 'antd';
import styles from './styles.less';
import telegramWIcon from '@/assets/icon_telegram_white.svg';
import announcementIcon from '@/assets/icon_announcement.svg';
import OngoingProjects from './components/OngoingProjects.js';
import IncomingProjects from './components/IncomingProjects.js';
import EndedProjects from './components/EndedProjects.js';
import BubblyButton from './components/BubblyButton.js';
import RaiseButton from './components/RaiseButton.js';
import { getProjects } from '@/services/api';
import ExpandingContent from './components/ExpandedContent';
import { useConnectWallet } from '@/components/ConnectWallet';
import { useWeb3React } from '@web3-react/core';
import { API_URL } from '@/constants';
import moment from 'moment';

const { Meta } = Card;

const Pool = props => {
  const [ongoingData, setOngoingData] = useState([]);
  const [upcomingData, setUpcomingData] = useState([]);
  const [endedData, setEndedData] = useState([]);

  const history = useHistory();
  const onClickProject = projectID => {
    console.log('ProjectID: ', projectID);
    history.push(`/launchpad/project/${projectID}`);
  };

  // wallet connect
  const { account, chainId, library, activate } = useWeb3React();
  const connectWalletByLocalStorage = useConnectWallet();

  useEffect(() => {
    if (!account) {
      connectWalletByLocalStorage();
    }
  }, [account]);

  // project variables
  useEffect(() => {
    console.log("api url", API_URL())
    getProjects(API_URL())
      .then(res => {
        if (res) {
          const newOngoingData = [];
          const newUpcomingData = [];
          const newEndedData = [];
          // get all projects from db
          res.forEach(obj => {
            console.log(obj);
            if (obj.projectStatus === 'Ongoing') newOngoingData.push(obj);
            else if (obj.projectStatus === 'Upcoming') newUpcomingData.push(obj);
            else if (obj.projectStatus === 'Ended') newEndedData.push(obj);
          });
          console.log(API_URL());
          
          // "2/22/2022 00:00:00 "
          // TODO: fault in backend but parse it in frontend for now
          newOngoingData.sort((a, b) => {
            return moment.utc(a.saleStart, "M/D/YYYY hh:mm:ss ") > moment.utc(b.saleStart, "M/D/YYYY hh:mm:ss ") ? 1 : -1;
          });
          
          newUpcomingData.sort((a, b) => {
            return moment.utc(a.saleStart, "M/D/YYYY hh:mm:ss ") > moment.utc(b.saleStart, "M/D/YYYY hh:mm:ss ") ? 1 : -1;
          });
          
          // show ended project in desencding order
          newEndedData.sort((a, b) => {
            return moment.utc(a.saleEnd, "M/D/YYYY hh:mm:ss ") < moment.utc(b.saleEnd, "M/D/YYYY hh:mm:ss ") ? 1 : -1;
          });
          
          setOngoingData([...newOngoingData]);
          setUpcomingData([...newUpcomingData]);
          setEndedData([...newEndedData]);
        } else {
          console.log('Failed to retrieve data from database');
        }
      })
      .catch(e => console.error(e));
  }, [account, chainId]);

  const mouseMove = e => {
    let mouseX, mouseY;
    let traX, traY;
    mouseX = e.pageX;
    mouseY = e.pageY;
    traX = (4 * mouseX) / 570 + 40;
    traY = (4 * mouseY) / 570 + 50;
    document.getElementById('bigTitle').style.backgroundPosition = traX + '%' + traY + '%';
  };

  const links = [
    'https://t.me/acyfinance',
    'https://t.me/ACYFinanceChannel',
    'https://twitter.com/ACYFinance',
    'https://acy.finance/',
    'https://github.com/ACY-Labs/ACY-Finance-Whitepaper',
  ];

  return (
    <div className={styles.launchRoot}>
      <div className={styles.pooltopContainer}>
        <div className={styles.bigTitle} id="bigTitle" onMouseMove={mouseMove}>
          THE BEST <br />
          IDO PROJECTS
        </div>
      </div>
      <div className={styles.launchbottomContainer}>
        <p className={styles.titleDesc}>Launching Profitable Projects on Multichain.</p>
        <div className={styles.buttonContainer}>
          <div>
            <BubblyButton href="https://forms.gle/gsLNsgDy2BXHNZda9" className={styles.btnApply} />
          </div>
          <div>
            <RaiseButton
              href={links[0]}
              className={styles.btnApply}
              src={telegramWIcon}
              text="Telegram"
            />
          </div>
          <div>
            <RaiseButton
              href={links[1]}
              className={styles.btnApply}
              src={announcementIcon}
              text="Announcements"
            />
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
              <OngoingProjects data={ongoingData} />
            </div>
          </div>
          <div className={styles.projectBoxes}>
            <div className={styles.titleBlock}>
              <span className={styles.anyStatusTitle}>Upcoming Projects</span>
              <div className={styles.lineSeperator} />
            </div>
            <div className={styles.projectsContainer}>
              <IncomingProjects data={upcomingData} />
            </div>
          </div>
          <div className={styles.projectBoxes}>
            <div className={styles.titleBlock}>
              <span className={styles.anyStatusTitle}>Ended Projects</span>
              <div className={styles.lineSeperator} />
            </div>
            <div className={styles.projectsContainer}>
              <EndedProjects data={endedData} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Pool;
