import Period from './period';
import styles from './index.less';
const AcyPeriodTime =({times,onhandPeriodTimeChoose,...rest})=>{

  return <div {...rest}>
    {times&&times.map(item=><Period onClick={()=>onhandPeriodTimeChoose(item)} text={item}/>)}
  </div>
}
export default AcyPeriodTime;
