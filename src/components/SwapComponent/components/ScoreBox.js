import React, { useState, useEffect } from 'react';
import { Progress } from 'antd';
import styles from '../styles.less'

const ScoreBox = props => {

  const {

  } = props

  const [isLike, setIsLike] = useState(false)
  const [isDislike, setIsDislike] = useState(false)
  const likeColor = isLike ? 'green' : '#a9a9b0'
  const dislikeColor = isDislike ? 'red' : '#a9a9b0'

  const vote = (like) => {
    if(like) {
      setIsLike(true)
      setIsDislike(false)
    } else {
      setIsLike(false)
      setIsDislike(true)
    }
  }

  return (
    <div className={styles.score}>
        <Progress
          width='120px'
          type="circle"
          strokeColor='green'
          percent={70}
        />
        <span className={styles.scoreTitle}>ACYscore</span>
        <div className={styles.community}>
          <div style={{textAlign: 'initial'}}>
            <span className={styles.scoreTitle}>COMMUNITY TRUST</span>
            <span style={{paddingLeft: '10px'}}>(7 votes)</span>
          </div>
          <div className={styles.vote}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className={styles.likeButton} fill={likeColor} onClick={()=>{vote(true)}}>
              <path d="M35.8 42H13.6V16.4L27.5 2l1.95 1.55q.3.25.45.7.15.45.15 1.1v.5L27.8 16.4h14.95q1.2 0 2.1.9.9.9.9 2.1v4.1q0 .35.075.725t-.075.725l-6.3 14.5q-.45 1.05-1.475 1.8Q36.95 42 35.8 42Zm-19.2-3h19.85l6.3-14.95V19.4H24.1l2.65-12.45-10.15 10.7Zm0-21.35V39Zm-3-1.25v3H6.95V39h6.65v3H3.95V16.4Z"/>
            </svg>
            <Progress
              percent={100}
              successPercent={80}
              strokeColor="red"
              showInfo={false}
              style={{marginLeft: '15px', marginRight: '15px'}}
            />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className={styles.likeButton} fill={dislikeColor} onClick={()=>{vote(false)}}>
              <path d="M5.25 31.6q-1.2 0-2.1-.9-.9-.9-.9-2.1v-4.1q0-.35-.075-.725t.075-.725l6.3-14.5Q9 7.5 10.025 6.75 11.05 6 12.2 6h22.2v25.6L20.5 46l-1.95-1.55q-.3-.25-.45-.7-.15-.45-.15-1.1v-.5L20.2 31.6ZM31.4 9H11.55l-6.3 14.95v4.65H23.9l-2.65 12.45 10.15-10.7Zm0 21.35V9Zm3 1.25v-3h6.65V9H34.4V6h9.65v25.6Z"/>
            </svg>
          </div>
        </div>
      </div>
  );
}

export default ScoreBox