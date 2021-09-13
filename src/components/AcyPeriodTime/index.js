import Period from './period';
import styles from './index.less';
import React, { useState } from 'react';
const AcyPeriodTime = ({ times, onhandPeriodTimeChoose, ...rest }) => {
  const [activeItem, setActiveItem] = useState(times[0]);

  return (
    <div {...rest}>
      {times &&
        times.map(item => (
          <Period
            onClick={() => {
              onhandPeriodTimeChoose(item);
              setActiveItem(item);
            }}
            text={item}
            isActive={activeItem == item}
          />
        ))}
    </div>
  );
};
export default AcyPeriodTime;
