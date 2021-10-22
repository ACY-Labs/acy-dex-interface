import styles from '../components/StakeHistoryTable.less'
import numeral from 'numeral';
import formatNumber from 'accounting-js/lib/formatNumber.js';
import math from 'math.js';
import { Tooltip } from 'antd';
function abbrHash(hash) {
  let len = hash.length;
  let first = hash.slice(0, 6);
  let last = hash.slice(len - 4, len - 1);

  return first + '...' + last;
}
function toolNumber(num_str) {
  num_str = num_str.toString();
  if (num_str.indexOf("+") != -1) {
    num_str = num_str.replace("+", "");
  }
  if (num_str.indexOf("E") != -1 || num_str.indexOf("e") != -1) {
    var resValue = "",
      power = "",
      result = null,
      dotIndex = 0,
      resArr = [],
      sym = "";
    var numStr = num_str.toString();
    if (numStr[0] == "-") {
      // 如果为负数，转成正数处理，先去掉‘-’号，并保存‘-’.
      numStr = numStr.substr(1);
      sym = "-";
    }
    if (numStr.indexOf("E") != -1 || numStr.indexOf("e") != -1) {
      var regExp = new RegExp(
        "^(((\\d+.?\\d+)|(\\d+))[Ee]{1}((-(\\d+))|(\\d+)))$",
        "ig"
      );
      result = regExp.exec(numStr);
      if (result != null) {
        resValue = result[2];
        power = result[5];
        result = null;
      }
      if (!resValue && !power) {
        return false;
      }
      dotIndex = resValue.indexOf(".") == -1 ? 0 : resValue.indexOf(".");
      resValue = resValue.replace(".", "");
      resArr = resValue.split("");
      if (Number(power) >= 0) {
        var subres = resValue.substr(dotIndex);
        power = Number(power);
        //幂数大于小数点后面的数字位数时，后面加0
        for (var i = 0; i <= power - subres.length; i++) {
          resArr.push("0");
        }
        if (power - subres.length < 0) {
          resArr.splice(dotIndex + power, 0, ".");
        }
      } else {
        power = power.replace("-", "");
        power = Number(power);
        //幂数大于等于 小数点的index位置, 前面加0
        for (var i = 0; i < power - dotIndex; i++) {
          resArr.unshift("0");
        }
        var n = power - dotIndex >= 0 ? 1 : -(power - dotIndex);
        resArr.splice(n, 0, ".");
      }
    }
    resValue = resArr.join("");

    return sym + resValue;
  } else {
    return num_str;
  }
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
    title: 'Swap',
    key: 'fromforto',
    render: record =>`Swap ${record.inputTokenSymbol} for ${record.outTokenSymbol}`
  },
  {
    title: 'Total Value',
    dataIndex: 'totalToken',
    key: 'totalToken',
    render: text =><Tooltip title={text}>{text && text.toString().replace(/([0-9]+.[0-9]{2})[0-9]*/,"$1")}</Tooltip>
  },
  {
    title: 'Token Amount',
    dataIndex: 'inputTokenNum',
    key: 'inputTokenNum',
    render: (text,record) =><Tooltip title={text}>{text} {record.inputTokenSymbol}</Tooltip>
  },
  {
    title: 'Token Amount',
    dataIndex: 'outTokenNum',
    key: 'outTokenNum',
    render: (text,record) =><Tooltip title={text}>{text && formatNumber(text*1,{ precision: 3, thousand: " " })} {record.outTokenSymbol}</Tooltip>
  },
  {
    title: 'Time',
    dataIndex: 'transactionTime',
    key: 'transactionTime'
  },
]
const sampleStakeHistoryMobileColumns = [
  {
    title: 'Swap',
    key: 'fromforto',
    render: record =>`Swap ${record.inputTokenSymbol} for ${record.outTokenSymbol}`
  },
  
  {
    title: 'Time',
    dataIndex: 'transactionTime',
    key: 'transactionTime'
  },
]
export {sampleStakeHistoryColumns}
