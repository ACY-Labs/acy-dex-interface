import cx from 'classnames';
import styles from './ConfirmationBox.less';

export default function ExchangeInfoRow(props) {
  const { label, children, value, isTop, isWarning, isImportant } = props;

  return (
    <div className={styles.ExchangeInfoRow}>
      <div className={styles.ExchangeInfoLabel}>{label}</div>
      {isWarning ?
        <div className={styles.ExchangeInfoValueWarning}>
          {children || value}
        </div>
        :
        <>
          {isImportant ?
            <div className={styles.alignRightImportant}>
              {children || value}
            </div>
            :
            <div className={styles.alignRight}>
              {children || value}
            </div>
          }
        </>
      }
    </div>
  );
}
