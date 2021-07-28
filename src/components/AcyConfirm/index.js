import { Modal } from 'antd';
import AcyIcon from '../AcyIcon';
import styles from './style.less';
import { rest } from 'lodash-decorators';

const AcyConfirm = ({ title, children, onCancel, ...rest }) => {
  const onhandCancel = () => {
    onCancel && onCancel(false);
  };

  return (
    <Modal
      className={styles.acyconfirm}
      bodyStyle={{
        padding: '21px 100px',
        background: '#2A2A2D',
        borderRadius: ' 20px',
      }}
      footer={null}
      closable={false}
      {...rest}
    >
      <div className={styles.title}>
        {title}
        <div onClick={onhandCancel}>
          <AcyIcon name="close" />
        </div>
      </div>
      {children}
    </Modal>
  );
};
export default AcyConfirm;
