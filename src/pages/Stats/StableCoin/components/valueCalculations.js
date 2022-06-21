
import { Table } from 'antd';
import styles from './valueCalculations.less';

const columns = [
    {
        title: '',
        dataIndex: 'tokenName',
    },
    {
        title: 'Mint Rate',
        dataIndex: 'mintRate',
    },
    {
        title: 'Redeem Rate',
        dataIndex: 'redeemRate',
    },
    {
        title: 'Basis Difference',
        dataIndex: 'basisDiff',
    },
    {
        title: 'Value',
        dataIndex: 'value',
    },
];

const dataSource = [
    {
        tokenName: 'DAI',
        mintRate: 'xxx',
        redeemRate: 'xxx',
        basisDiff: '',
        value: ''
    },
    {
        tokenName: 'USDY',
        mintRate: 'xxx',
        redeemRate: 'xxx',
        basisDiff: '',
        value: ''
    },
    {
        tokenName: 'USDC',
        mintRate: 'xxx',
        redeemRate: 'xxx',
        basisDiff: '',
        value: ''
    },
    {
        tokenName: 'Combined stablecoins',
        mintRate: 'xxx',
        redeemRate: 'xxx',
        basisDiff: '',
        value: ''
    },
    {
        tokenName: '-Total OUSD supply',
        mintRate: 'xxx',
        redeemRate: 'xxx',
        basisDiff: '',
        value: ''
    },
    {
        tokenName: 'Extra value',
        mintRate: 'xxx',
        redeemRate: 'xxx',
        basisDiff: '',
        value: ''
    }
]

export const ValueCalculations = props => {
    //read props
    const { tittle, list } = props
    return (
        <div className={styles.module}>
            <div className={styles.label}>
                Vault Value
            </div>
            <Table dataSource={dataSource} columns={columns} pagination={false} />
        </div>
    );
};