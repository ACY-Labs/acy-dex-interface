import styles from '../styles.less'

export default [
  {
    "time": "2021-05-06",
    "amount": "400 sACY",
    "reward": "40% wBTC 60% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
  {
    "time": "2021-05-04",
    "amount": "500 sACY",
    "reward": "50% wBTC 50% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
  {
    "time": "2021-05-01",
    "amount": "600 sACY",
    "reward": "50% UNI 50% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
  {
    "time": "2021-05-02",
    "amount": "200 sACY",
    "reward": "50% CRV 50% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
  {
    "time": "2021-04-06",
    "amount": "400 sACY",
    "reward": "40% wBTC 60% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
  {
    "time": "2021-04-04",
    "amount": "500 sACY",
    "reward": "50% wBTC 50% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
  {
    "time": "2021-02-01",
    "amount": "600 sACY",
    "reward": "50% UNI 50% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
  {
    "time": "2021-03-02",
    "amount": "200 sACY",
    "reward": "50% CRV 50% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
  {
    "time": "2021-07-06",
    "amount": "400 sACY",
    "reward": "40% wBTC 60% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
  {
    "time": "2021-07-04",
    "amount": "500 sACY",
    "reward": "50% wBTC 50% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
  {
    "time": "2021-08-13",
    "amount": "600 sACY",
    "reward": "50% UNI 50% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
  {
    "time": "2021-08-15",
    "amount": "200 sACY",
    "reward": "50% CRV 50% ETH",
    "lock period": "3M",
    "apy": "4.7%",
  },
]

const sampleStakeHistoryColumns = [
  {
    title: 'Time',
    dataIndex: 'time',
    key: 'time',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: text => <p className={styles.tableData}>{text}</p>,
  },
  {
    title: 'Reward',
    dataIndex: 'reward',
    key: 'reward',
    render: text => <p className={styles.tableData}>{text}</p>,
  },
  {
    title: 'Lock Period',
    dataIndex: 'lock period',
    key: 'lock period',
    render: text => <p className={styles.tableData}>{text}</p>,
  },
  {
    title: 'APY',
    dataIndex: 'apy',
    key: 'apy',
    render: text => <p className={styles.tableData}>{text}</p>,
  },
]

export {sampleStakeHistoryColumns}
