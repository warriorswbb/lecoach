import React, { useRef, useEffect } from "react";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import styled from "styled-components";

const Test = styled.div`
  position: absolute;
  bottom: 0;
  margin-bottom: 35px;
`;

const ShotChart = ({ shots }) => {
  const plotRef = useRef();
  const markingsRef = useRef();

  useEffect(() => {
    // Clear previous plot if it exists
    while (plotRef.current.firstChild) {
      plotRef.current.removeChild(plotRef.current.firstChild);
    }

    // Create the Plot chart
    const plot = Plot.plot({
      height: 640,
      axis: null,
      x: { domain: [-250, 250] },
      y: { domain: [-50, 450] },
      color: {
        type: "log",
        scheme: "Spectral",
        legend: true,
        label: "Made shots",
      },
      marks: [
        Plot.rect(
          shots,
          Plot.bin(
            { fill: "count" },
            {
              x: "loc_x",
              y: "loc_y",
              filter: (d) => +d.shot_made_flag,
              inset: 0,
              interval: 5,
            }
          )
        ),
        Plot.gridX({ interval: 5, strokeOpacity: 0.05 }),
        Plot.gridY({ interval: 5, strokeOpacity: 0.05 }),
      ],
    });

    plotRef.current.appendChild(plot);

    // Create the markings SVG
    const svg = d3
      .select(markingsRef.current)
      .attr("width", 800)
      .attr("height", 750)
      .attr("viewBox", "-270 -500 600 592");

    svg.selectAll("*").remove(); // Clear previous SVG elements if they exist

    // Draw markings using D3.js
    const angle = Math.atan(90 / 220);
    const lines = [
      [-250, -420, 250, -420], // half
      [-250, -450, -250, 50], // left
      [250, -450, 250, 50], // right
      [250, 50, -250, 50], // bottom
      [-220, 50, -220, -90], // corner 3
      [220, 50, 220, -90], // corner 3
      [-80, 50, -80, -140], // paint
      [80, 50, 80, -140], // paint
      [-60, 50, -60, -140], // paint
      [60, 50, 60, -140], // paint
      [-80, -140, 80, -140], // free throw line
      [-30, 10, 30, 10], // backboard
      [0, 10, 0, 7.5], // rim
      [-40, 10, -40, 0], // ra
      [40, 10, 40, 0], // ra
    ];

    const circles = [
      [0, 0, 7.5], // rim
      [0, -140, 60], // key
      [0, -420, 20], // center court inner
      [0, -420, 60], // center court outer
    ];

    const arcs = [
      [0, 0, 40, Math.PI * 0.5, -Math.PI * 0.5], // ra
      [0, 0, 237.5, Math.PI * 0.5 - angle, -Math.PI * 0.5 + angle], // 3pt
    ];

    // Add lines
    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "beige")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 1)
      .selectAll("line")
      .data(lines)
      .enter()
      .append("line")
      .attr("x1", (d) => d[0])
      .attr("y1", (d) => d[1])
      .attr("x2", (d) => d[2])
      .attr("y2", (d) => d[3]);

    // Add circles
    svg
      .select("g")
      .selectAll("ellipse")
      .data(circles)
      .enter()
      .append("ellipse")
      .attr("cx", (d) => d[0])
      .attr("cy", (d) => d[1])
      .attr("rx", (d) => d[2])
      .attr("ry", (d) => d[2]);

    svg
      .select("g")
      .selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", (d) => {
        const [cx, cy, r, a1, a2] = d;
        const arcPath = d3
          .arc()
          .innerRadius(r)
          .outerRadius(r)
          .startAngle(a1)
          .endAngle(a2);
        return arcPath({ startAngle: a1, endAngle: a2 });
      })
      .attr("transform", (d) => `translate(${d[0]},${d[1]})`);

    // Cleanup when component unmounts
    return () => {
      plot.remove();
      svg.selectAll("*").remove();
    };
  }, [shots]);

  return (
    <div>
      <div ref={plotRef}></div>
      <Test>
        <svg ref={markingsRef}></svg>
      </Test>
    </div>
  );
};

export default ShotChart;
