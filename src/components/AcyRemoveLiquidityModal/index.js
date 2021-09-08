import React from 'react';
import { AcyModal } from '@/components/Acy';

const AcyRemoveLiquidityModal = ({ isModalVisible }) => {
  return (
    <AcyModal width={400} visible={isModalVisible}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <h2 style={{ margin: 0 }}>RemoveLiquidity</h2>
        <div>
          <span style={{ fontSize: 30 }}>&times;</span>
        </div>
      </div>
    </AcyModal>
  );
};

export default AcyRemoveLiquidityModal;
