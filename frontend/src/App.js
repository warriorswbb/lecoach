import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import ShotChart from "./components/ShotChart";

function App() {
  const svgRef = useRef();

  const shots = Array.from({ length: 50000 }, () => ({
    loc_x: Math.floor(Math.random() * 500) - 250, // X-coordinate from -250 to 250
    loc_y: Math.floor(Math.random() * 500) - 50,  // Y-coordinate from -50 to 450
    shot_made_flag: Math.random() > 0.5 ? 1 : 0   // Randomly assign 0 or 1
  }));

  const Markings = ({
    stroke = "currentColor",
    strokeWidth = 1,
    strokeOpacity = 1,
  } = {}) => {
    const angle = Math.atan(90 / 220);
    const lines = [
      [-250, 420, 250, 420], // half
      [-250, 450, -250, -50], // left
      [250, 450, 250, -50], // right
      [250, -50, -250, -50], // bottom
      [-220, -50, -220, 90], // corner 3
      [220, -50, 220, 90], // corner 3
      [-80, -50, -80, 140], // paint
      [80, -50, 80, 140], // paint
      [-60, -50, -60, 140], // paint
      [60, -50, 60, 140], // paint
      [-80, 140, 80, 140], // free throw line
      [-30, -10, 30, -10], // backboard
      [0, -10, 0, -7.5], // rim
      [-40, -10, -40, 0], // ra
      [40, -10, 40, 0], // ra
    ];
    const circles = [
      [0, 0, 7.5], // rim
      [0, 140, 60], // key
      [0, 420, 20], // center court inner
      [0, 420, 60], // center court outer
    ];
    const arcs = [
      [0, 0, 40, -Math.PI * 0.5, Math.PI * 0.5], // ra
      [0, 0, 237.5, -Math.PI * 0.5 - angle, Math.PI * 0.5 + angle], // 3pt
    ];

    useEffect(() => {
      const svg = d3
        .select(svgRef.current)
        .attr("width", 500)
        .attr("height", 500)
        .attr("viewBox", "-300 -500 600 600");

      svg.selectAll("*").remove();

      svg
        .append("g")
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .selectAll("line")
        .data(lines)
        .enter()
        .append("line")
        .attr("x1", (d) => d[0])
        .attr("y1", (d) => d[1])
        .attr("x2", (d) => d[2])
        .attr("y2", (d) => d[3]);

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
    }, [stroke, strokeWidth, strokeOpacity]);

    return <svg ref={svgRef}></svg>;
  };

  return (
    <div className="App">
      <div>
        <ShotChart shots={shots} />
      </div>
    </div>
  );
}

export default App;
