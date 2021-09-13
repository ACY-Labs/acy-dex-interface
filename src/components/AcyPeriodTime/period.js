import styles from './index.less';
const Period =({text, isActive,...rest})=>{
  return <div {...rest} className={styles.period} style={{border:isActive ? "solid 1px #eb5c20" : ""}}>
    {
      text
    }
  </div>
}
export default Period;
