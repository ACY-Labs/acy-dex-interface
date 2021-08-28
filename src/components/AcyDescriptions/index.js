import Item from './item';
import styles from './index.less';
const AcyDescriptions =(props)=>{
  const {children,...rest}=props;
  return <div className={styles.acydes}> 
      {children}
  </div>
}
AcyDescriptions.Item=Item;
export default AcyDescriptions;
