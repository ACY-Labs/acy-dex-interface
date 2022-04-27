import axios from 'axios';
import { KChartDataURL } from '../constant/index';

export function calcPercent( a, b){
  return ( (a/b) * 100 ).toFixed(2);
}

export function sortTableTime(table, key, isReverse) {
  return table.sort((a, b) => {
    if (isReverse) {
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    } else {
      return new Date(a[key]).getTime() - new Date(b[key]).getTime();
    }
  });
}

function candleSeriesDataParser(data) {
  let parsedData = [];
  data.forEach(function (item, _) {
    let parsed = {};
    parsed["time"] = item.t;
    parsed["open"] = item.o;
    parsed["high"] = item.h;
    parsed["low"] = item.l;
    parsed["close"] = item.c;
    parsedData.push(parsed);
  })
  return parsedData;
}

export async function getKChartData(tokenSymbol, preferableChainId, period, from, to, preferableSource ) {
  const kchartdata = await axios.get(
    KChartDataURL + tokenSymbol, {
      params: {
        preferableChainId: preferableChainId,
        period: period,
        from: from,
        to: to,
        preferableSource: preferableSource
      }
    })
    .then(function (response) {
      const data = response.data.prices;
      const parseddata = candleSeriesDataParser(data);
      return parseddata;
    })
    .catch(function (error) {
      console.log("test error:", error);
    });
  return kchartdata;
}