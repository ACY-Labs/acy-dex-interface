import React, { useState } from "react";
import Sankey from "./Sankey";
import SankeyTag from "./SankeyTag";

export default function SankeyGraph() {
  const data = {
    nodes: [
      { name: "WETH", value: 7 },
      { name: "WMATIC", value: 1 },
      { name: "WBTC", value: 1 },
      { name: "USDT", value: 2 },
      { name: "USDC", value: 3 }
    ],

    links: [
      { name: "Apeswap", source: 0, target: 4, value: 1 },
      { name: "Dodo V2", source: 0, target: 2, value: 0.6 },
      { name: "Kyber DMM", source: 2, target: 3, value: 0.1 },
      { name: "QuickSwap", source: 3, target: 4, value: 0.1 },
      { name: "Uniswap", source: 2, target: 1, value: 0.5 },
      { name: "Honeyswap", source: 0, target: 1, value: 0.25 },
      { name: "CafeSwap", source: 1, target: 4, value: 0.75 }
    ]
  };

  // const data = useState(sample)
  
  return (
    <div>
      <Sankey data={data} />
      <SankeyTag data={data} />
    </div>
  );
}
