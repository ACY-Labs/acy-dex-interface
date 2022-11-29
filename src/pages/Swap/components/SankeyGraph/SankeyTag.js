import React, { useEffect, useRef } from "react";
import * as d3 from 'd3'
import * as d3sankey from 'd3-sankey';

const size = {
  width: 1000,
  height: 50
};

const Tag = ({ data, width, length, colors }) => {
  const link = d3sankey.sankeyLinkHorizontal();

  return (
    <>
      <rect
        x={Math.floor(1000 / length) + (data.index % length) * 100}
        y={10 + Math.floor(data.index / length) * 20}
        width={15}
        height={15}
        fill={colors(0.05 + 0.95 * (data.index) / length)}
        data-index={data.index}
      />
      <text
        x={Math.floor(1000 / length) + 20 + (data.index % length) * 100}
        y={18 + Math.floor(data.index / length) * 20}
        style={{
          fill: d3.rgb("white"),
          alignmentBaseline: "middle",
          fontSize: 9,
          pointerEvents: "none",
          userSelect: "none"
        }}
      >
        {data.name}
      </text>
    </>
  );
};

export default function SankeyTag(props) {
  const graph = useRef(null);
  const offset = useRef(null);

  const sankey = d3sankey
    .sankey()
    .nodeAlign(d3sankey.sankeyJustify)
    .nodeWidth(10)
    .nodePadding(10)
    .extent([[0, 0], [size.width, size.height]]);

  if (props.data) {
    graph.current = sankey(props.data);
    const { links, nodes } = graph.current;

    return (
      <svg width={size.width} height={size.height}>
        <g>
          {links.map((d, i) => (
            <Tag
              data={d}
              width={d.width}
              length={links.length}
              colors={d3.interpolateRainbow}
            />
          ))}
        </g>
      </svg>
    );
  }

  return <div>Loading</div>;
};