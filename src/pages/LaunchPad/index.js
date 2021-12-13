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
import listView from '@/assets/icon_list.svg';
import gridView from '@/assets/icon_grid.svg';
import moreBtn from '@/assets/icon_more.svg';
import data from './projectdata';

const { Meta } = Card;

const Pool = (props)=> {
    const [page, setPage] = useState(0);
    const [view, setView] = useState('grid');
    const [projectStatus, setProjectStatus] = useState('inProgress');
    const [navPage, setnavPage] = useState(0);
    const [filter, setFilter] = useState('');

    const searchText = (e) => {
      setFilter(e.target.value)
    }

    // project variables
    const [projectCount, setProjectCount] = useState(0);
    useEffect(() => {
      axios.get(`http://localhost:3001/api/launch/projects`).then(res => {
        // see if get request is successful
        console.log(res)
        // get all project count
        setProjectCount(res.data.length)
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

    function CardBlock(props) {
      return (
        <div className={styles.CardBlock}>
          <Card className={styles.Card} onClick={() => {onClick();}}>
            <div id='space 1'>
              <div className={styles.projectBoxHeader}>
                <span>December 10, 2021</span>
              </div>
              <div className={styles.CardHead}>
                <div>
                  <img className={styles.CardImg} src={AcyIcon} alt="InPoker" />
                </div>
                <div>
                  {/* {data.cardData.map((item, index) => {
                    return(
                      <div className={styles.labelInfo}>
                        <h2 className={styles.Label0}> {item.projectName} </h2>
                        <p className={styles.Label1}> {item.projectToken} </p>
                      </div>
                    )
                  })} */}
                  <div className={styles.labelInfo}>
                    <h2 className={styles.Label0}> ACY </h2>
                    <p className={styles.Label1}> $ACY </p>
                  </div>
                </div>
                <div id='text' className={styles.smalltext0}>
                  <p>ACY is a fresh new approach to online poker that engages social media influencers and offers the first e-sports platform with an integrated DeFi protocol.</p>
                </div>
                <div id='connectbar' className={styles.ConnectBar}>
                  <a href={links[0]} target="_blank" rel="noreferrer" className={styles.iconbar}>
                    <img src={telegramOIcon} alt="" style={{height:'1.1em', width:'auto', objectFit:'contain', margin: '0 5px 0 0', float:'left'}} />
                  </a>
                  <a href={links[1]} target="_blank" rel="noreferrer" className={styles.iconbar}>
                    <img src={announcementFIcon} alt="" style={{height:'1em', width:'auto', objectFit:'contain', margin: '0 5px 0', float:'left'}} />
                  </a>
                  <a href={links[2]} target="_blank" rel="noreferrer" className={styles.iconbar}>
                    <img src={twitterOIcon} alt="" style={{height:'1.2em', width:'auto', objectFit:'contain', margin: '0 5px 0', float:'left'}} />
                  </a>
                  <a href={links[3]} target="_blank" rel="noreferrer" className={styles.iconbar}>
                    <Icon type="link" style={{margin: '0 5px 0'}} />
                  </a>
                  <a href={links[4]} target="_blank" rel="noreferrer" className={styles.iconbar}>
                    <Icon type="file" style={{margin: '0 5px 0'}} theme="filled" />
                  </a>
                </div>
              </div>
              <div id='space 2'>
                <div className={styles.smalltext}>
                  Price: 
                  <span className={styles.maintext}>
                    1 ACY = 100 BTC
                  </span>
                </div>
                <div className={styles.smalltext}>
                  Start: 
                  <span className={styles.maintext}>
                    25 Nov, 11:00 UTC
                  </span>
                </div>
                <div className={styles.boxProgressWrapper}>
                  <Progress strokeColor={{'0%': '#eb5c20','100%': '#c6224e'}} percent={0} status='active' /> 
                </div>
                <span className={styles.lineSeperator} />
                <div className={styles.daysLeft}>
                  2 Days Left
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
  }

  function ListCard(props){
    return (
      <div className={styles.projectBoxWrapper} onClick={() => {onClick();}}>
        <div className={styles.projectContainer}>
          <div className={styles.projectBox1}>
            <span style={{display: 'inline-flex', justifyContent: 'center', color: '#fff'}}>December 10, 2020</span>
            <div style={{width: '80%', height: '100%', padding: '2rem 0', justifyContent: 'space-between', display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop: '0.5rem'}}>
              <div>
                <img src={AcyIcon} alt="" style={{height: '60px', width: '60px', verticalAlign: 'middle', borderStyle: 'none'}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', paddingLeft: '0.5rem'}}>
                <p style={{fontWeight: '600', fontSize: '1.25em', color: '#fff'}}> ACY </p>
                <p style={{display: 'inline-flex', justifyContent: 'center', lineHeight: '1', color: '#fff'}}> $ACY </p>
              </div>
            </div>
          </div>
          <div className={styles.projectBox2}>
            <p>ACY is a fresh new approach to online poker that engages social media influencers and offers the first e-sports platform with an integrated DeFi protocol.</p>
            <div id='connectbar' className={styles.ConnectBar1}>
              <a href={links[0]} target="_blank" rel="noreferrer" className={styles.iconbar}>
                <img src={telegramOIcon} alt="" style={{height:'1.1em', width:'auto', objectFit:'contain', margin: '0 5px 0 0', float:'left'}} />
              </a>
              <a href={links[1]} target="_blank" rel="noreferrer" className={styles.iconbar}>
                <img src={announcementFIcon} alt="" style={{height:'1em', width:'auto', objectFit:'contain', margin: '0 5px 0', float:'left'}} />
              </a>
              <a href={links[2]} target="_blank" rel="noreferrer" className={styles.iconbar}>
                <img src={twitterOIcon} alt="" style={{height:'1.2em', width:'auto', objectFit:'contain', margin: '0 5px 0', float:'left'}} />
              </a>
              <a href={links[3]} target="_blank" rel="noreferrer" className={styles.iconbar}>
                <Icon type="link" style={{margin: '0 5px 0'}} />
              </a>
              <a href={links[4]} target="_blank" rel="noreferrer" className={styles.iconbar}>
                <Icon type="file" style={{margin: '0 5px 0'}} theme="filled" />
              </a>
            </div>
            <div style={{paddingTop: '0.5rem'}}>
              <span style={{color: 'white'}}>Price: 1 ACY = 100 BTC</span>
              <span style={{color: 'white', marginLeft: '4em'}}>Start: 25 Nov, 11:00 UTC</span>
            </div>
            <div className={styles.boxProgressWrapper}>
              <Progress strokeColor={{'0%': '#eb5c20','100%': '#c6224e'}} percent={90} status='active' /> 
            </div>
          </div>
          <div className={styles.projectBox3}>
            <div className={styles.twoInfos}>
              <span className={styles.listdaysLeft}>
                2 Days Left
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

    return(
      <div className={styles.launchRoot}>
        <div className={styles.pooltopContainer}>
          <div className={styles.bigTitle} id='bigTitle' onMouseMove={mouseMove}>
            THE BEST <br />IDO PROJECTS
          </div>
        </div>
        <div className={styles.launchbottomContainer}>
          <p className={styles.titleDesc}>
            Launching profitable projects on Multichain.
          </p>
          <div className={styles.buttonContainer}>
            <div>
              <a href="https://forms.gle/gsLNsgDy2BXHNZda9" className={styles.btnApply} target="_blank" rel="noreferrer">
                <Icon type="rocket" style={{fontSize: '2em', margin: '0 10px 0 0'}} />
                Apply for IDO
              </a>
            </div>
            <div>
              <a href="https://t.me/acyfinance" className={styles.btnTelegram} target="_blank" rel="noreferrer">
                <img src={telegramWIcon} alt="" style={{height:'1.4em', width:'1.5em', objectFit:'contain', fontSize: '1.5em', margin: '0 10px 0 0'}} />
                Telegram
              </a>
            </div>
            <div>
              <a href="https://t.me/ACYFinanceChannel" className={styles.btnTelegram} target="_blank" rel="noreferrer">
                <img src={announcementIcon} alt="" style={{height:'1.4em', width:'1.5em', objectFit:'contain', fontSize: '1.5em', margin: '0 10px 0 0'}} />
                Announcements
              </a>
            </div>
          </div>
        </div>
        <div className={styles.btmContent}>
          <div className={styles.darkbg}>
            <div className={styles.navContainer}>
              <div className={styles.nav} role="tablist">
                <div className={styles.navItem}>
                  <span style={{color:'white', fontSize:'1.5rem'}}>Pools  
                    <span role="img" aria-label="fire">🔥</span> 
                  </span>
                </div>
              </div>
            </div>
          </div>
          <section>
            <div className={styles.appContainer}>
              <div className={styles.appHeader}>
                <div className={styles.appHeaderLeft}>
                  <div className={styles.searchWrapper}>
                    <input className={styles.searchInput} value={filter} onChange={searchText.bind(this)} type="text" placeholder="Search IDO Projects" />
                    <Icon type="search" />
                  </div>
                </div>
              </div>
              <div className={styles.projectsSection}>
                <div className={styles.projectsSectionLine}>
                  <div className={styles.projectsStatus}>
                    <div className={styles.itemStatus} onClick={() => {switchProject('inProgress'); goToPos();}}>
                      <span className={styles.statusNumber}>45</span>
                      <span className={styles.statusType}>Live</span>
                    </div>
                    <div className={styles.itemStatus} onClick={() => {switchProject('upcoming');}}>
                      <span className={styles.statusNumber}>24</span>
                      <span className={styles.statusType}>Upcoming</span>
                    </div>
                    <div className={styles.itemStatus} onClick={() => {switchProject('ended');}}>
                      <span className={styles.statusNumber}>10</span>
                      <span className={styles.statusType}>Ended</span>
                    </div>
                    <div className={styles.itemStatus} onClick={() => {switchProject('allProjects'); goToPos();}}>
                      <span className={styles.statusNumber}>{projectCount}</span>
                      <span className={styles.statusType}>Total Projects</span>
                    </div>
                  </div>
                  <div className={styles.viewActions}>
                    <button className={styles.viewBtn} onClick={() => setView('list')} type="button" title="List View">
                      <img src={listView} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain'}} />
                    </button>
                    <button className={styles.viewBtn} onClick={() => setView('grid')} type="button" title="Grid View">
                      <img src={gridView} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain'}} />
                    </button>
                  </div>
                </div>
                <div>
                  {view === 'list' &&
                    <div className={styles.projectBoxes} ref={myPos}>
                      {projectStatus === 'inProgress' &&
                        <div>
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                        </div>
                      }
                      {projectStatus === 'upcoming' &&
                        <div>
                          <ListCard />
                          <ListCard />
                        </div>
                      }
                      {projectStatus === 'ended' &&
                        <div>
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                        </div>
                      }
                      {projectStatus === 'allProjects' &&
                        <div>
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                          <ListCard />
                        </div>
                      }
                    </div>
                  }
                  {view === 'grid' &&
                    <div className={styles.projectBoxes} ref={myPos}>
                      {projectStatus === 'inProgress' &&
                        <div className={styles.projectBoxes}>
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                        </div>
                      }
                      {projectStatus === 'upcoming' &&
                        <div className={styles.projectBoxes}>
                          <CardBlock />
                          <CardBlock />
                        </div>
                      }
                      {projectStatus === 'ended' &&
                        <div className={styles.projectBoxes}>
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                        </div>
                      }
                      {projectStatus === 'allProjects' &&
                        <div className={styles.projectBoxes}>
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                          <CardBlock />
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
};

export default Pool;