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

function App() {

  const shots = Array.from({ length: 10000 }, () => ({
    loc_x: d3.randomNormal(0, 100)(), // Clustering around the center (x = 0) with a standard deviation of 100
    loc_y: d3.randomNormal(100, 100)(), // Clustering around the area near the basket (y = 100) with a standard deviation of 100
    shot_made_flag: Math.random() > 0.5 ? 1 : 0
  }));

  return (
    <AppWrap>
      <ShotChart shots={shots} />
    </AppWrap>
  );
}

export default App;
