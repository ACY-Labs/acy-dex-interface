import { React } from 'react';
import { Modal } from 'antd';
import styles from '@/pages/Dao/styles.less';
import SampleToken from '@/pages/Dao/sample_data/SampleToken';
import placeholderTokenImg from '@/pages/Dao/placeholder-round.png';

const TokenSelectionModal = ({ isModalVisible, handleCancel, handleClick }) => (
  <Modal
    className={styles.modal}
    visible={isModalVisible}
    onCancel={handleCancel}
    bodyStyle={{
      padding: '21px',
      background: '#2A2A2D',
      borderRadius: ' 20px',
    }}
    footer={null}
    closable={false}
  >
    {SampleToken.map((token) => (
      <div className={styles.modalListItem} key={token.symbol} onClick={() => handleClick(token)}>
        <div className={styles.modalListLogoContainer}>
          <img src={token.logoURI || placeholderTokenImg} alt={token.symbol} className={styles.modalListLogo} />
        </div>
        <div className={styles.modalListSymbol}>{token.symbol}</div>
      </div>
    ))}
  </Modal>
)

export default TokenSelectionModal
