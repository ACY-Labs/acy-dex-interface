import React, { useState } from "react";
import Sankey from "./Sankey";

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
      { source: 0, target: 4, value: 1 },
      { source: 0, target: 2, value: 0.6 },
      { source: 2, target: 3, value: 0.1 },
      { source: 3, target: 4, value: 0.1 },
      { source: 2, target: 1, value: 0.5 },
      { source: 0, target: 1, value: 0.25 },
      { source: 1, target: 4, value: 0.75 }
    ]
  };

  // const data = useState(sample)
  
  return (
    <div>
      <Sankey data={data} />
    </div>
  );
}
