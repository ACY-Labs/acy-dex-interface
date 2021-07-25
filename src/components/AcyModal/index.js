import { Modal } from 'antd';
import styles from './style.less';
import { rest } from 'lodash-decorators';

const AcyModal = ({ children, ...rest }) => {
  return (
    <Modal
    className={styles.acymodal}
      {...rest}
      bodyStyle={{
        padding: '21px',
        background:'#2A2A2D',
        borderRadius:' 20px'
      }}
      footer={null}
      closable={false}
    >
      {children}
    </Modal>

  );
}
export default AcyModal;