import styles from './index.less';
import classnames from 'classnames';
const AcyIcon =(props)=>{

  return <span {...props} className={styles.icon}>
      <i className={props.big&&classnames(styles[props.name],styles.big)||styles[props.name]}></i>
    </span>
}
export default AcyIcon;
