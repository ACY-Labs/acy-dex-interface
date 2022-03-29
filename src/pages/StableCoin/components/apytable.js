
import styles from './apytable.less';
import { Table } from 'antd'
const columns = [
    {
      title: 'Block',
      dataIndex: 'Block',
    },
    {
      title:'APY',
      dataIndex: 'APY',
    },
    {
      title:'Multiplier',
      dataIndex: 'Multiplier',
    },
    {
      title:'Aprx.Yield',
      dataIndex: 'AprxYield',
    },
    {
        title:'OUSD Supply',
        dataIndex: 'OUSDSupply',
    },
    {
        title:'Backing Supply',
        dataIndex: 'BackingSupply',
    },
    {
        title:'Rebasing Supply',
        dataIndex: 'RebasingSupply',
    },
    {
        title:'Non- Rebasing Supply',
        dataIndex: 'NonRebasingSupply',
    },
    {
        title:'%',
        dataIndex: 'cen',
    },
    {
        title:'Ration',
        dataIndex: 'Ration',
    }    
  ];
  
  const dataSource = [
      {
        Ration:'xxx',
        cen: 'xxx',
        NonRebasingSupply:'xxx'
      }
  ]

export const APYtable = props => {
    //read props

    return (
        <div className={styles.APYtable}>
            <div className={styles.tableHead}>
                <div className={styles.tableHeadBlock}>
                    <div className={styles.data}>APY 8.88%</div>
                    <div className={styles.expContent}>30 day trailing average</div>
                </div>
                <div className={styles.tableHeadBlock}>
                    <div className={styles.data}>564.18 OUSD</div>
                    <div className={styles.expContent}>Next rebase</div>
                </div>
            </div>
            <div color="#fff">Daily APY for the last thirty days:</div>
            <div className={styles.tableDate}>
                <Table dataSource={dataSource} columns={columns} pagination={false} width/>
            </div>
        </div>
    );
};
