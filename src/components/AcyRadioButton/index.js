import React, { useState } from 'react';
import styles from './style.less';

const AcyRadioButton = ({ data, children, ...rest }) => {
  const [count, setCount] = useState(0);
  const addcount = index => {
    setCount(index);
  };
  return (
    <div className={styles.radioBtn} {...rest}>
      {data &&
        data.map((item, index) => {
          return (
            <div
              className={`${styles.default} ${count == index && styles.light}`}
              onClick={() => addcount(index)}
            >
              {item}
            </div>
          );
        })}
      {/* {children} */}
    </div>
  );
};
export default AcyRadioButton;
