import styles from './style.less';

const AcyWarp = ({ children, ...rest }) => {
  return (
    <div className={styles.coinWarp} {...rest}>
      {children}
    </div>
  );
};
export default AcyWarp;
