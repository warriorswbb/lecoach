import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import ShotChart from "./components/ShotChart";
import styled from "styled-components";

const AppWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #282c34;
  height: 100vh;
  width: 100vw;
`;

const ShotChartContainer = styled.div`
  height: 50vh;
  width: 50vw;
`;

function App() {
  const arcRadius = 227; // Radius of the 3-point line arc
  const buffer = 5; // Buffer zone to keep points away from the arc (adjust as needed)
  
  const shots = Array.from({ length: 10000 }, () => {
    let loc_x, loc_y, distanceFromCenter;
  
    do {
      loc_x = d3.randomNormal(0, 100)(); // Cluster around the center
      loc_y = d3.randomNormal(0, 100)(); // Cluster near the basket
      distanceFromCenter = Math.sqrt(loc_x * loc_x + loc_y * loc_y); // Distance from center (0,0)
    } while (
      distanceFromCenter > arcRadius - buffer && 
      distanceFromCenter < arcRadius + buffer
    );
  
    return {
      loc_x,
      loc_y,
      shot_made_flag: Math.random() > 0.5 ? 1 : 0,
    };
  });

  return (
    <AppWrap>
      <ShotChartContainer>
        <ShotChart shots={shots} />
      </ShotChartContainer>
    </AppWrap>
  );
}

export default App;
