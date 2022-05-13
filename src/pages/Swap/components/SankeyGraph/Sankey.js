import React, { useEffect, useRef } from "react";
import * as d3 from './d3'
import * as d3sankey from './d3-sankey';

const size = {
  width: 600,
  height: 300
};

const getMousePosition = event => {
  const CTM = event.target.getScreenCTM();

  return {
    x: (event.clientX - CTM.e) / CTM.a,
    y: (event.clientY - CTM.f) / CTM.d
  };
};

const Rect = ({ index, x0, x1, y0, y1, name, value, length, colors }) => {
  return (
    <>
      <rect
        x={x0 < size.width / 2 ? x0 : x0 - 20}
        y={y0}
        width={40}
        height={y1 - y0}
        fill={d3.rgb(30, 69, 96)}
        // fill={colors(index / length)}
        data-index={index}
      />
      <text
        x={x0 < size.width / 2 ? x0 + 5 : x0 - 17}
        y={(y1 + y0) / 2}
        style={{
          fill: d3.rgb("white"),
          // fill: d3.rgb(colors(index / length)).darker(),
          alignmentBaseline: "middle",
          fontSize: 9,
          // textAnchor: x0 < size.width / 2 ? "start" : "end",
          pointerEvents: "none",
          userSelect: "none"
        }}
      >
        {name}
      </text>
    </>
  );
};

const Link = ({ data, width, length, colors }) => {
  const link = d3sankey.sankeyLinkHorizontal();

  return (
    <>
      <defs>
        <linearGradient
          id={`gradient-${data.index}`}
          gradientUnits="userSpaceOnUse"
          x1={data.source.x1}
          x2={data.target.x0}
        >
          <stop offset="0" stopColor={colors(data.source.index / length)} />
          <stop offset="100%" stopColor={colors(data.target.index / length)} />
        </linearGradient>
      </defs>
      <path
        d={link(data)}
        fill="none"
        // stroke={d3.rgb(colors(data.index))}
        stroke={`url(#gradient-${data.index})`}
        strokeOpacity={0.9}
        strokeWidth={width}
      />
    </>
  );
};

// const Rect = ({ index, x0, x1, y0, y1, name, value, length, colors }) => (
//   <>
//     <rect
//       x={x0}
//       y={y0}
//       width={x1 - x0 + 10}
//       height={y1 - y0}
//       fill={colors(index / length)}
//       data-index={index}
//     />
//     <text
//       x={x0 < size.width / 2 ? x1 + 16 : x0 - 6}
//       y={(y1 + y0) / 2}
//       style={{
//         fill: d3.rgb("black").darker(),
//         alignmentBaseline: "middle",
//         fontSize: 9,
//         textAnchor: x0 < size.width / 2 ? "start" : "end",
//         pointerEvents: "none",
//         userSelect: "none"
//       }}
//     >
//       {name}
//     </text>
//   </>
// );

// const Link = ({ data, width, length, colors }) => {
//   const link = d3sankey.sankeyLinkHorizontal();

//   return (
//     <>
//       <defs>
//         <linearGradient
//           id={`gradient-${data.index}`}
//           gradientUnits="userSpaceOnUse"
//           x1={data.source.x1}
//           x2={data.target.x0}
//         >
//           <stop offset="0" stopColor={colors(data.source.index / length)} />
//           <stop offset="100%" stopColor={colors(data.target.index / length)} />
//         </linearGradient>
//       </defs>
//       <path
//         d={link(data)}
//         fill="none"
//         stroke={`url(#gradient-${data.index})`}
//         strokeOpacity={0.8}
//         strokeWidth={width}
//       />
//     </>
//   );
// };

export default function Sankey(props) {
  const dragElement = useRef(null);
  const graph = useRef(null);
  const offset = useRef(null);

  const sankey = d3sankey
    .sankey()
    .nodeAlign(d3sankey.sankeyJustify)
    .nodeWidth(10)
    .nodePadding(10)
    .extent([[0, 0], [size.width, size.height]]);

  const onMouseUp = e => {
    dragElement.current = null;
  };

  const onMouseDown = e => {
    if (e.target.tagName === "rect") {
      dragElement.current = e.target;
      offset.current = getMousePosition(e);
      offset.current.y -= parseFloat(e.target.getAttributeNS(null, "y"));
    }
  };

  const onMouseMove = e => {
    if (dragElement.current) {
      const coord = getMousePosition(e);
      dragElement.current.setAttributeNS(null, "y", coord.y - offset.current.y);
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  if (props.data) {
    graph.current = sankey(props.data);
    const { links, nodes } = graph.current;

    return (
      <svg width={size.width} height={size.height}>
        <g>
          {links.map((d, i) => (
            <Link
              data={d}
              width={d.width}
              length={nodes.length}
              colors={d3.interpolateCool}
            />
          ))}
        </g>
        <g>
          {nodes.map((d, i) => (
            <Rect
              index={d.index}
              x0={d.x0}
              x1={d.x1}
              y0={d.y0}
              y1={d.y1}
              name={d.name}
              value={d.value}
              length={nodes.length}
              colors={d3.interpolateCool}
            />
          ))}
        </g>
      </svg>
    );
  }

  return <div>Loading</div>;
};
