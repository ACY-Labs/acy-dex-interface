import { StarFilled } from '@ant-design/icons';
import styles from './index.less';

const KpSymbolNav = (props: any) => {
  const { data,onChange } = props;
  return (
    <div className={styles.sn}>
      <div>
        <StarFilled
          style={{
            color: '#EB5C20',
          }}
        />
      </div>
      <div>
        <ul className={styles.ul}>
          {data?.map((item) => (
            <li onClick={()=>onChange&&onChange(item)} className={`${styles.hoverTranslation}`}>
              <span>{item}</span>
              {/* <span
                className={`${
                  (item.value?.indexOf('-') > -1 && styles.up) || styles.down
                }`}
              >
                {item.value}
              </span> */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default KpSymbolNav;
