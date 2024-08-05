import kx from "../config.ts";

class PlayerStats {
  name: number;

  constructor(name: number) {
    this.name = name;
  }

  calculateBPM = async () => {
    const games = await kx("test_table").select("*");
    console.log(games);
    return this.name + 1;
  };
}

export default PlayerStats;
