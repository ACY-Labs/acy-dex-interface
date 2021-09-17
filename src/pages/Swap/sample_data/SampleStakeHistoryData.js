import styles from '../components/StakeHistoryTable.less'

function abbrHash(hash) {
  let len = hash.length;
  let first = hash.slice(0, 6);
  let last = hash.slice(len - 4, len - 1);

  return first + '...' + last;
}

export default [
  {
    "time": "5/6/2021",
    "amount": "400 sACY",
    "reward": "40% wBTC 60% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0x9aaED666836F3acb0563c3f74fb2a0Ae8353C961",
    "to": "0xe4293B5ff8Da1412Df3B7d0FF04a75342C252eD2"
  },
  {
    "time": "5/4/2021",
    "amount": "500 sACY",
    "reward": "50% wBTC 50% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0xe4293B5ff8Da1412Df3B7d0FF04a75342C252eD2",
    "to": "0x9aaED666836F3acb0563c3f74fb2a0Ae8353C962"
  },
  {
    "time": "5/1/2021",
    "amount": "600 sACY",
    "reward": "50% UNI 50% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0xBbaC040675b4A68dF6A9fDb1e321C547da8732FA",
    "to": "0xe4293B5ff8Da1412Df3B7d0FF04a75342C252eD3"
  },
  {
    "time": "5/2/2021",
    "amount": "200 sACY",
    "reward": "50% CRV 50% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0x9aaED666836F3acb0563c3f74fb2a0Ae8353C962",
    "to": "0x9aaED666836F3acb0563c3f74fb2a0Ae8353C963"
  },
  {
    "time": "4/6/2021",
    "amount": "400 sACY",
    "reward": "40% wBTC 60% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0xe4293B5ff8Da1412Df3B7d0FF04a75342C252eD3",
    "to": "0xe4293B5ff8Da1412Df3B7d0FF04a75342C252eD4"
  },
  {
    "time": "4/4/2021",
    "amount": "500 sACY",
    "reward": "50% wBTC 50% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0xBbaC040675b4A68dF6A9fDb1e321C547da8732FA",
    "to": "0x9aaED666836F3acb0563c3f74fb2a0Ae8353C964"
  },
  {
    "time": "2/1/2021",
    "amount": "600 sACY",
    "reward": "50% UNI 50% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0x9aaED666836F3acb0563c3f74fb2a0Ae8353C963",
    "to": "0xe4293B5ff8Da1412Df3B7d0FF04a75342C252eD5"
  },
  {
    "time": "3/2/2021",
    "amount": "200 sACY",
    "reward": "50% CRV 50% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0xe4293B5ff8Da1412Df3B7d0FF04a75342C252eD4",
    "to": "0x9aaED666836F3acb0563c3f74fb2a0Ae8353C965"
  },
  {
    "time": "7/6/2021",
    "amount": "400 sACY",
    "reward": "40% wBTC 60% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0xBbaC040675b4A68dF6A9fDb1e321C547da8732FA",
    "to": "0xe4293B5ff8Da1412Df3B7d0FF04a75342C252eD6"
  },
  {
    "time": "7/4/2021",
    "amount": "500 sACY",
    "reward": "50% wBTC 50% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0x9aaED666836F3acb0563c3f74fb2a0Ae8353C964",
    "to": "0xBbaC040675b4A68dF6A9fDb1e321C547da8732FA"
  },
  {
    "time": "8/13/2021",
    "amount": "600 sACY",
    "reward": "50% UNI 50% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0xe4293B5ff8Da1412Df3B7d0FF04a75342C252eD5",
    "to": "0xBbaC040675b4A68dF6A9fDb1e321C547da8732FA"
  },
  {
    "time": "8/15/2021",
    "amount": "200 sACY",
    "reward": "50% CRV 50% ETH",
    "lock_period": "3M",
    "alpha": "4.70%",
    "from": "0xBbaC040675b4A68dF6A9fDb1e321C547da8732FA",
    "to": "0x9aaED666836F3acb0563c3f74fb2a0Ae8353C967"
  }
]

const sampleStakeHistoryColumns = [
  {
    title: 'Time',
    dataIndex: 'time',
    key: 'time',
  },
  {
    title: 'Pay',
    dataIndex: 'from',
    key: 'from',
    render: text =>text&& <p className={styles.tableData}>{abbrHash(text)}</p>,
  },
  {
    title: 'Receive',
    dataIndex: 'to',
    key: 'to',
    render: text =>text&& <p className={styles.tableData}>{abbrHash(text)}</p>,
  },
  {
    title: 'Alpha',
    dataIndex: 'alpha',
    key: 'alpha',
    render: text => <p className={styles.tableData}>{text}</p>,
  },
  
]

export {sampleStakeHistoryColumns}
