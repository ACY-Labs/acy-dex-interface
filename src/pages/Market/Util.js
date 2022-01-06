export const TransactionType = {
  ALL: 'All',
  SWAP: 'Swap',
  ADD: 'Add',
  REMOVE: 'Remove',
};

export const FEE_PERCENT = 0.003;

export function abbrHash(hash) {
  if(!hash) return "???";
  let len = hash.length;
  let first = hash.slice(0, 5);
  let last = hash.slice(len - 4, len);

  return first + '...' + last;
}

export function abbrNumber(number) {
  if(!number) number = 0;

  const THOUSAND = 0;
  const MILLION = 1;
  const BILLION = 2;

  let currentDivision = -1;
  let result = '';
  let tempNumber = number;

  if (number >= 1000) {
    tempNumber /= 1000;
    currentDivision = 0;
  }

  if (number >= 1000000) {
    tempNumber /= 1000;
    currentDivision = 1;
  }

  if (number >= 1000000000) {
    tempNumber /= 1000;
    currentDivision = 2;
  }

  switch (currentDivision) {
    case 0:
      result = `${tempNumber.toFixed(2)}k`;
      break;
    case 1:
      result = `${tempNumber.toFixed(2)}m`;
      break;
    case 2:
      result = `${tempNumber.toFixed(2)}b`;
      break;
    default:
      result = `${number?number.toFixed(2):0}`;
      break;
  }

  if (number < 0.01 && number > 0) {
    return '<0.01';
  }

  return result;
}

export function isDesktop() {
  const { innerWidth: width, innerHeight: height } = window;
  if (innerWidth < 768) return false;
  return true;
}

// sort the table
// Reverse means high to low
function sortTableRegular(table, key, isReverse) {
  return table.sort((a, b) => {
    if (isReverse) {
      return b[key] - a[key];
    } else {
      return a[key] - b[key];
    }
  });
}

function sortTableTime(table, key, isReverse) {
  return table.sort((a, b) => {
    if (isReverse) {
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    } else {
      return new Date(a[key]).getTime() - new Date(b[key]).getTime();
    }
  });
}

function sortString(table, key, isReverse) {
  return table.sort((a, b) => {
    if (isReverse) {
      return b[key].localeCompare(a[key]);
    } else {
      return a[key].localeCompare(b[key]);
    }
  });
}

// wrapper sort function
export function sortTable(table, key, isReverse) {
  if (key == 'time') return sortTableTime(table, key, isReverse);
  else if (key == 'name' || key == 'symbol' || key == 'coin1' || key == 'coin2' || key == 'account')
    return sortString(table, key, isReverse);
  else return sortTableRegular(table, key, isReverse);
}

// open link in new tab
export const openInNewTab = url => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

export function calcPercentChange(today, prev) {
  return ((today - prev) / prev) * 100;
}

export const formatDollarAmount = (num, digits) => {
  const formatter = new Intl.NumberFormat([], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return formatter.format(num);
};

export const formattedNum = (number, usd = false, acceptNegatives = false) => {
  if (isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0;
  }
  let num = parseFloat(number);

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0), true);
  }

  if (num === 0) {
    if (usd) {
      return '$0';
    }
    return 0;
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001';
  }

  if (num > 1000) {
    return usd ? formatDollarAmount(num, 0) : Number(parseFloat(num).toFixed(0)).toLocaleString();
  }

  if (usd) {
    if (num < 0.1) {
      return formatDollarAmount(num, 4);
    } else {
      return formatDollarAmount(num, 2);
    }
  }

  return Number(parseFloat(num).toFixed(4)).toString();
};
