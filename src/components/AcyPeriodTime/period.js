import styles from './index.less';
const Period = ({ text, isActive, ...rest }) => {
  return (
    <div {...rest} className={styles.period}>
      <div
        className={styles.periodInner}
        style={{ backgroundColor: isActive ? '#1b1b1c' : '#29292c' }}
      >
        {text}
      </div>
    </div>
  );
};
export default Period;
