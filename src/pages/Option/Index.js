import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect } from 'react';
import OptionComponent from '@/components/OptionComponent'

import styles from './styles.less'


const Option = props => {

  const [mode, setMode] = useState('Buy')
  const [volume, setVolume] = useState(0)
  const [percentage, setPercentage] = useState('')

  return (
    <div className={styles.main}>
        <div className={styles.rowFlexContainer}>
          Kchart here
        </div>

        <div className={styles.optionComponent}>
          <OptionComponent
            mode={mode}
            setMode={setMode}
            volume={volume}
            setVolume={setVolume}
            percentage={percentage}
            setPercentage={setPercentage}
          />
        </div>

    </div>
  );
}

export default Option
