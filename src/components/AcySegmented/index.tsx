import styles from './index.less';
import { useState, useEffect } from 'react';

const Segmented = (props: any) => {
  const { options, onChange, defaultIndex } = props;
  const [data, setData] = useState([]);
  const [ind, setInd] = useState(defaultIndex || 0);

  useEffect(() => {
    setData(options);
  }, [options]);
  
  return (
    <div className={`${styles.seg}`}>
      {data.map((item, index) => (
        <div
          onClick={() => {setInd(index); onChange&&onChange(item)}}
          className={`${styles.item} ${(index == ind && styles.active) || ''}`}
        >
          {item}
        </div>
      ))}
    </div>
  );
};
export default Segmented;
