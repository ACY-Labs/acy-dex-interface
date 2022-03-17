
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
            {/* <div className={styles.tableData}>
                <table className={styles.APYtableData}>
                    <tr>
                        <td className={styles.tableTh}>Block</td>
                        <td className={`${styles.tableTh}, ${styles.hind}`}>APY</td>
                        <td className={styles.tableTh}>Multiplier</td>
                        <td className={styles.tableTh}>Unboosted</td>
                        <td className={styles.tableTh}>Aprx.Yield</td>
                        <td className={styles.tableTh}>OUSD Supply</td>
                        <td className={styles.tableTh}>Backing Supply</td>
                        <td className={styles.tableTh}>Rebasing Supply</td>
                        <td className={styles.tableTh}>Non- Rebasing Supply</td>
                        <td className={styles.tableTh}>%</td>
                        <td className={styles.tableTh}>Ration</td>
                    </tr>
                    <tr>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={`${styles.tableTh}, ${styles.hind}`}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                    </tr>
                    <tr>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={`${styles.tableTh}, ${styles.hind}`}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                        <td className={styles.tableTr}>datadata</td>
                    </tr>
                </table>
            </div> */}
        </div>
    );
};
