import styles from './index.less';
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
export default AcyIcon;
