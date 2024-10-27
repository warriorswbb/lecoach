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
  const rimRadius = 50; // Radius near the rim
  const midRangeMin = 40; // Minimum distance for midrange shots
  const midRangeMax = arcRadius - 5; // Maximum distance for midrange shots
  const buffer = 10; // Buffer zone for shots just outside the arc
  const cornerDistX = 250; // X distance from the center for corner shots (closer to actual corner three position)
  const cornerDistY = 20; // Y distance closer to the baseline for corner shots
  
  const shots = Array.from({ length: 30000 }, () => {
    let loc_x, loc_y, distanceFromCenter;
    const shotType = Math.random();
  
    if (shotType < 0.3) {
      // Rim shots (20% of the shots)
      loc_x = d3.randomNormal(0, 20)(); // Cluster around the rim center
      loc_y = d3.randomNormal(0, 20)(); // Cluster near the rim center
    } else if (shotType < 0.5) {
      // Midrange shots (20% of the shots)
      do {
        loc_x = d3.randomNormal(0, 80)(); // Wider spread for midrange shots
        loc_y = d3.randomNormal(0, 80)();
        distanceFromCenter = Math.sqrt(loc_x * loc_x + loc_y * loc_y);
      } while (distanceFromCenter < midRangeMin || distanceFromCenter > midRangeMax);
    } else if (shotType < 0.9) {
      // Three-point shots, outside the arc but not corners (30% of the shots)
      do {
        loc_x = d3.randomNormal(0, 100)(); // Cluster around the center
        loc_y = d3.randomNormal(0, 100)();
        distanceFromCenter = Math.sqrt(loc_x * loc_x + loc_y * loc_y);
      } while (distanceFromCenter <= arcRadius + buffer);
    } else {
      // Corner three-point shots (30% of the shots)
      loc_x = d3.randomNormal(Math.random() > 0.5 ? cornerDistX : -cornerDistX, 20)(); // Left or right corner
      loc_y = d3.randomNormal(-cornerDistY, 30)(); // Very close to the baseline
    }
  
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
