import kx from "../config.ts";

// done
const test = async () => {
  await kx("test_table").insert({
    name: 21,
    age: 23,
  });
};


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
const test2 = async () => {
    const player = new PlayerStats(10);
    const bpm = await player.calculateBPM();
  
    console.log(`Calculated BPM: ${bpm}`);
  };
  
test2();
export default PlayerStats;

test()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
