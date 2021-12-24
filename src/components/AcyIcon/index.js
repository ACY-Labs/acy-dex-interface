import styles from './index.less';
import {Icon} from 'antd';
import iconjs from './iconfont.js';
import { ReactComponent as Opera }  from './Opera.svg'; //

import classnames from 'classnames';
const AcyIcon = props => {
  return (
    <span {...props} className={styles.icon}>
      <i
        className={(props.big && classnames(styles[props.name], styles.big)) || styles[props.name]}
        style={props.width && { width: `${props.width}px`, height: `${props.width}px` }}
      />
      {props.title && [<br />, <p style={{ lineHeight: '40px' }}>props.title</p>]}
    </span>
  );
};
// 自定义图标
const MyIcon =Icon.createFromIconfontCN({
  scriptUrl: iconjs, // 在 iconfont.cn 上生成
});
const MyIconSvg =(props)=><Icon {...props}/>

// 包裹样式
const IconCustom=(props)=>{
  const { width,...rest }=props;
  return <span style={{margin:'5px'}}>{width&& <MyIcon style={{fontSize:`${width}px`}} {...rest} />||<MyIcon {...rest} />}</span>
}

AcyIcon.MyIcon=IconCustom;
AcyIcon.MyIconSvg=MyIconSvg;
export default AcyIcon;
