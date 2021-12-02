import React, { useState, useEffect } from 'react';
import {Card, Icon, Progress} from 'antd';
import LaunchPad from './launchpad';
import styles from './styles.less';
import AcyIcon from '@/assets/icon_acy.svg';
import telegramWIcon from '@/assets/icon_telegram_white.svg';
import announcementIcon from '@/assets/icon_announcement.svg';
import listView from '@/assets/icon_list.svg';
import gridView from '@/assets/icon_grid.svg';
import moreBtn from '@/assets/icon_more.svg';

const { Meta } = Card;

const Pool = (props)=> {
    const [page, setPage] = useState(0);
    const [view, setView] = useState('grid');
    const [navPage, setnavPage] = useState(0);
    const [nextPage, setnextPage] = useState(0);

    useEffect(() => {

    },[page]);

    function SelectedBtn(props) {
      return(
        props.page === props.id ? 
          <button className={styles.Btn} onClick={() => setPage(props.id)}>
            {props.text}
          </button>
          : 
          <button className={styles.bg_none } onClick={() => setPage(props.id)}>
            {props.text}
          </button>
      );
    }

    function SelectednavBtn(props) {
      return(
        props.navPage === props.id ? 
          <button className={styles.navLink_active} onClick={() => setnavPage(props.id)}>
            {props.text}
          </button>
          : 
          <button className={styles.navLink} onClick={() => setnavPage(props.id)}>
            {props.text}
          </button>
      );
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const mouseMove = (e) => {
      let mouseX, mouseY;
      let traX, traY;
      mouseX = e.pageX;
      mouseY = e.pageY;
      traX = ((4 * mouseX) / 570) + 40;
      traY = ((4 * mouseY) / 570) + 50;
      document.getElementById('bigTitle').style.backgroundPosition = traX + "%" + traY + "%";
    }

    const onClick = () => setnextPage(1)

    function CardBlock(props) {
      return (
        <div className={styles.CardBlock}>
          <Card className={styles.Card}>
            <div id='space 1'>
              <div className={styles.projectBoxHeader}>
                <span>December 10, 2021</span>
                <div className={styles.moreWrapper}>
                  <button className={styles.projectBtnMore} type="button" onClick={() => {onClick();}}>
                    <img src={moreBtn} alt="" style={{height:'1.2em', width:'auto', objectFit:'contain', fontSize: '1.5em', margin: '0 10px 0 0'}} />
                  </button>
                </div>
              </div>
              <div className={styles.CardHead}>
                <div>
                  <img className={styles.CardImg} src={AcyIcon} alt="InPoker" />
                </div>
                <div className={styles.labelInfo}>
                  <h2 className={styles.Label0}> ACY </h2>
                  <p className={styles.Label1}> $ACY </p>
                </div>
              </div>
              <div id='text' className={styles.smalltext0}>
                <p>ACY is a fresh new approach to online poker that engages social media influencers and offers the first e-sports platform with an integrated DeFi protocol.</p>
              </div>
              <ul id='connectbar' className={styles.ConnectBar}>
                <li>
                  <a href="https://t.me/acyfinance" target="_blank" className={styles.iconbar} rel="noreferrer"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z"></path></svg></a>
                </li>
                <li>
                  <a href="https://t.me/ACYFinanceChannel" target="_blank" className={styles.iconbar} rel="noreferrer"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M576 240c0-23.63-12.95-44.04-32-55.12V32.01C544 23.26 537.02 0 512 0c-7.12 0-14.19 2.38-19.98 7.02l-85.03 68.03C364.28 109.19 310.66 128 256 128H64c-35.35 0-64 28.65-64 64v96c0 35.35 28.65 64 64 64h33.7c-1.39 10.48-2.18 21.14-2.18 32 0 39.77 9.26 77.35 25.56 110.94 5.19 10.69 16.52 17.06 28.4 17.06h74.28c26.05 0 41.69-29.84 25.9-50.56-16.4-21.52-26.15-48.36-26.15-77.44 0-11.11 1.62-21.79 4.41-32H256c54.66 0 108.28 18.81 150.98 52.95l85.03 68.03a32.023 32.023 0 0 0 19.98 7.02c24.92 0 32-22.78 32-32V295.13C563.05 284.04 576 263.63 576 240zm-96 141.42l-33.05-26.44C392.95 311.78 325.12 288 256 288v-96c69.12 0 136.95-23.78 190.95-66.98L480 98.58v282.84z"></path></svg></a>
                </li>
                <li>
                  <a href="https://twitter.com/ACYFinance" target="_blank" className={styles.iconbar} rel="noreferrer"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg></a>
                </li>
                <li>
                  <a href="https://acy.finance/" target="_blank" className={styles.iconbar} rel="noreferrer"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 496 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z"></path></svg></a>
                </li>
                <li>
                  <a href="https://www.google.com" target="_blank" className={styles.iconbar} rel="noreferrer"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm57.1 120H305c7.7 0 13.4 7.1 11.7 14.7l-38 168c-1.2 5.5-6.1 9.3-11.7 9.3h-38c-5.5 0-10.3-3.8-11.6-9.1-25.8-103.5-20.8-81.2-25.6-110.5h-.5c-1.1 14.3-2.4 17.4-25.6 110.5-1.3 5.3-6.1 9.1-11.6 9.1H117c-5.6 0-10.5-3.9-11.7-9.4l-37.8-168c-1.7-7.5 4-14.6 11.7-14.6h24.5c5.7 0 10.7 4 11.8 9.7 15.6 78 20.1 109.5 21 122.2 1.6-10.2 7.3-32.7 29.4-122.7 1.3-5.4 6.1-9.1 11.7-9.1h29.1c5.6 0 10.4 3.8 11.7 9.2 24 100.4 28.8 124 29.6 129.4-.2-11.2-2.6-17.8 21.6-129.2 1-5.6 5.9-9.5 11.5-9.5zM384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"></path></svg></a>
                </li>
              </ul>
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
                <Progress strokeColor={{'0%': '#eb5c20','100%': '#c6224e'}} percent={90} status='active' /> 
              </div>
              <span className={styles.lineSeperator} />
              <div className={styles.daysLeft} style={{color: 'black'}}>
                2 Days Left
              </div>
            </div>
          </Card>
        </div>
      );
  }

  function ListCard(props){
    return (
      <div className={styles.projectBoxWrapper}>
        <div className={styles.projectContainer}>
          <div className={styles.projectBox1}>
            <span style={{display: 'inline-flex', justifyContent: 'center'}}>December 10, 2020</span>
            <div style={{width: '100%', height: '100%', padding: '2rem 0', justifyContent: 'center', display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop: '0.5rem'}}>
              <div>
                <img src={AcyIcon} alt="" style={{height: '60px', width: '60px', verticalAlign: 'middle', borderStyle: 'none'}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', paddingLeft: '0.5rem'}}>
                <p style={{fontWeight: '600', fontSize: '1.25em', color: '#000'}}> ACY </p>
                <p style={{display: 'inline-flex', justifyContent: 'center', lineHeight: '1', color: '#000'}}> $ACY </p>
              </div>
            </div>
          </div>
          <div className={styles.projectBox2}>
            <p>ACY is a fresh new approach to online poker that engages social media influencers and offers the first e-sports platform with an integrated DeFi protocol.</p>
            <ul id='connectbar' className={styles.ConnectBar1}>
              <li>
                <a href="https://t.me/acyfinance" target="_blank" className={styles.iconbar} rel="noreferrer"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z"></path></svg></a>
              </li>
              <li>
                <a href="https://t.me/ACYFinanceChannel" target="_blank" className={styles.iconbar} rel="noreferrer"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M576 240c0-23.63-12.95-44.04-32-55.12V32.01C544 23.26 537.02 0 512 0c-7.12 0-14.19 2.38-19.98 7.02l-85.03 68.03C364.28 109.19 310.66 128 256 128H64c-35.35 0-64 28.65-64 64v96c0 35.35 28.65 64 64 64h33.7c-1.39 10.48-2.18 21.14-2.18 32 0 39.77 9.26 77.35 25.56 110.94 5.19 10.69 16.52 17.06 28.4 17.06h74.28c26.05 0 41.69-29.84 25.9-50.56-16.4-21.52-26.15-48.36-26.15-77.44 0-11.11 1.62-21.79 4.41-32H256c54.66 0 108.28 18.81 150.98 52.95l85.03 68.03a32.023 32.023 0 0 0 19.98 7.02c24.92 0 32-22.78 32-32V295.13C563.05 284.04 576 263.63 576 240zm-96 141.42l-33.05-26.44C392.95 311.78 325.12 288 256 288v-96c69.12 0 136.95-23.78 190.95-66.98L480 98.58v282.84z"></path></svg></a>
              </li>
              <li>
                <a href="https://twitter.com/ACYFinance" target="_blank" className={styles.iconbar} rel="noreferrer"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg></a>
              </li>
              <li>
                <a href="https://acy.finance/" target="_blank" className={styles.iconbar} rel="noreferrer"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 496 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z"></path></svg></a>
              </li>
              <li>
                <a href="https://www.google.com" target="_blank" className={styles.iconbar} rel="noreferrer"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm57.1 120H305c7.7 0 13.4 7.1 11.7 14.7l-38 168c-1.2 5.5-6.1 9.3-11.7 9.3h-38c-5.5 0-10.3-3.8-11.6-9.1-25.8-103.5-20.8-81.2-25.6-110.5h-.5c-1.1 14.3-2.4 17.4-25.6 110.5-1.3 5.3-6.1 9.1-11.6 9.1H117c-5.6 0-10.5-3.9-11.7-9.4l-37.8-168c-1.7-7.5 4-14.6 11.7-14.6h24.5c5.7 0 10.7 4 11.8 9.7 15.6 78 20.1 109.5 21 122.2 1.6-10.2 7.3-32.7 29.4-122.7 1.3-5.4 6.1-9.1 11.7-9.1h29.1c5.6 0 10.4 3.8 11.7 9.2 24 100.4 28.8 124 29.6 129.4-.2-11.2-2.6-17.8 21.6-129.2 1-5.6 5.9-9.5 11.5-9.5zM384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"></path></svg></a>
              </li>
            </ul>
            <div style={{paddingTop: '0.5rem'}}>
              <span style={{color: 'black'}}>Price: 1 ACY = 100 BTC</span>
              <span style={{color: 'black', marginLeft: '4em'}}>Start: 25 Nov, 11:00 UTC</span>
            </div>
            <div className={styles.boxProgressWrapper}>
              <Progress strokeColor={{'0%': '#eb5c20','100%': '#c6224e'}} percent={90} status='active' /> 
            </div>
          </div>
          <div className={styles.projectBox3}>
            <div className={styles.twoInfos}>
              <button className={styles.listprojectBtnMore} type="button" onClick={() => {onClick();}}>
                <img src={moreBtn} alt="" style={{height:'1.2em', width:'auto', objectFit:'contain', fontSize: '1.5em'}} />
              </button>
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
        {nextPage === 0 &&
          <div>
            <div className={styles.pooltopContainer}>
              <div className={styles.bigTitle} id='bigTitle' onMouseMove={mouseMove}>
                THE BEST <br />IDO PROJECTS
              </div>
            </div>
            <div className={styles.bottomContainer}>
              <p className={styles.titleDesc}>
                Launching hand-picked high-quality projects on the Blockchain.
              </p>
              <div className={styles.buttonContainer}>
                <div>
                  <a href="https://www.google.com" className={styles.btnApply} target="_blank" rel="noreferrer">
                    <Icon type="rocket" style={{fontSize: '2em', margin: '0 10px 0 0'}} />
                    Apply As A Project
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
                      <SelectednavBtn text='Pools 🔥' />
                    </div>
                  </div>
                </div>
              </div>
              <section>
                <div className={styles.appContainer}>
                  <div className={styles.appHeader}>
                    <div className={styles.appHeaderLeft}>
                      <div className={styles.searchWrapper}>
                        <input className={styles.searchInput} type="text" placeholder="Search IDO Projects" />
                        <Icon type="search" />
                      </div>
                    </div>
                  </div>
                  <div className={styles.projectsSection}>
                    <div className={styles.projectsSectionLine}>
                      <div className={styles.projectsStatus}>
                        <div className={styles.itemStatus}>
                          <span className={styles.statusNumber}>45</span>
                          <span className={styles.statusType}>In Progress</span>
                        </div>
                        <div className={styles.itemStatus}>
                          <span className={styles.statusNumber}>24</span>
                          <span className={styles.statusType}>Upcoming</span>
                        </div>
                        <div className={styles.itemStatus}>
                          <span className={styles.statusNumber}>62</span>
                          <span className={styles.statusType}>Total Projects</span>
                        </div>
                      </div>
                      <div className={styles.viewActions}>
                        <button className={styles.viewBtn} onClick={() => setView('list')} type="button" title="List View">
                          <img src={listView} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                        </button>
                        <button className={styles.viewBtn} onClick={() => setView('grid')} type="button" title="Grid View">
                          <img src={gridView} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                        </button>
                      </div>
                    </div>
                    <div>
                      {view === 'list' &&
                        <div className={styles.projectBoxes}>
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
                      {view === 'grid' &&
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
                  </div>
                </div>
              </section>
            </div>
          </div>
        }
        {nextPage === 1 &&
          <LaunchPad />
        }
      </div>
    )
};

export default Pool;