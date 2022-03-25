import { TokenInfo } from '@/constants/token_list.js';
import { useChartInit, useChartUpdate } from './hooks';
// import Tab from '../../../acy-dex-futures/Tab/Tab';
import '../styles.css';

export interface DataItem {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Props {
  token1: TokenInfo;
  token2: TokenInfo;
}

const KChart: React.FC<Props> = ({ token2 }) => {
  const chartToken = token2;

  const { chartRef, chartSeries } = useChartInit();
  useChartUpdate(chartToken, chartSeries);

  return (
    <div className="PriceChart">
      <div className="TopInner">
        <span>{chartToken.symbol} Price</span>
      </div>
      <div className="BotInner">
        <div className="KChartHeader">
          <div className="KChartControl">
            {/* <div className='TabBlock'> </div> */}
            {/* <Tab options={Object.keys(CHART_PERIODS)} option={period} setOption={setPeriod} /> */}
          </div>
          <div className="KChartStat" />
        </div>
        <div className="KChartBox" ref={chartRef} />
      </div>
    </div>
  );
};

export default KChart;
