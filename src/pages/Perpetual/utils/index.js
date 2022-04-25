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
  console.log("hereim 1.1 in getkchartdata" );
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
      console.log("hereim 1.2 kchart response", response);
      const data = response.data.prices;
      console.log("hereim 1.3 kchart data", data);
      const parseddata = candleSeriesDataParser(data);
      console.log("hereim 1.4 parseddata", parseddata);
      return parseddata;
    })
    .catch(function (error) {
      console.log("hereim 1.x test error:", error);
    });
  return kchartdata;
}