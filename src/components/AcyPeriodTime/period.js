import styles from './index.less';
const Period =({text, isActive,...rest})=>{
  return <div {...rest} className={styles.period} style={{backgroundColor:isActive ? "#29292c" : "#757579"}}>
    {
      text
    }
  </div>
}
export default Period;
