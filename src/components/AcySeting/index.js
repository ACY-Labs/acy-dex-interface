import { useState } from 'react';
import { Checkbox } from 'antd';
import {AcyIcon } from '@/components/Acy';
import styles from './index.less';
const AcySeting =(props)=>{
  const {title,current,children}=props;
  const [visibale,setVisibale]=useState(true);
  const onClick=()=>{
    setVisibale(!visibale);
  }
  return <><div className={styles.listitem} onClick={onClick}>
  <span>{title}</span>
  <span>
    {current} <AcyIcon width={16} name="nabla"/>
  </span>
</div>
{
  visibale&&<div>
  {children}
</div>
}

</>
}
export default AcySeting;
