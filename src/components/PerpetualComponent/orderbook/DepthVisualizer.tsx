/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-filename-extension */
import { FunctionComponent } from 'react';

interface DepthVisualizerProps {
  depth: number;
  orderType: string;
}

const DepthVisualizerColors = {
  BIDS: "#113534",
  ASKS: "#3d1e28"
};

const DepthVisualizer: FunctionComponent<DepthVisualizerProps> = ({ depth, orderType }) => (
  <div
    style={{
      // backgroundColor: `${orderType === "bids" ? DepthVisualizerColors.BIDS : DepthVisualizerColors.ASKS}`,
      height: "1.7em",
      width: `${depth}%`,
      position: "relative",
      top: 21,
      left: 0,
      marginTop: -24,
      zIndex: 1,
    }}
  />
);

export default DepthVisualizer;