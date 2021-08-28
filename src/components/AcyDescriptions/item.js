import styles from './index.less';
const Item =(props)=>{
  const {title,children,...rest}=props;
  return <div className={styles.acydesitem}> 
{children}
  </div>
}
export default Item;
