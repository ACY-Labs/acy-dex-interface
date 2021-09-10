import React, { useState } from 'react';
import { AcySmallButtonGroup } from '@/components/AcySmallButton';
import styles from './Farms.less'
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FarmsTable from './FarmsTable';

const Farms = () => {
  const [selectedTable, setSelectedTable] = useState(0)

  return (
    <PageHeaderWrapper>
      <div className={styles.farmsContainer}>
        <AcySmallButtonGroup
          activeButton={selectedTable}
          buttonList={[
            ['All', () => setSelectedTable(0)],
            ['Radium', () => setSelectedTable(1)],
            ['Fusion', () => setSelectedTable(2)],
          ]}
          containerClass={styles.tableToggleButtonContainer}
        />
        <FarmsTable />
      </div>
    </PageHeaderWrapper>
  )
}

export default Farms
