import styles from './index.less';
const Period =({text,...rest})=>{
  return <div {...rest} className={styles.period}>
    {
      text
    }
  </div>
}
export default Period;
