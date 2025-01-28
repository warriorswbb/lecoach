import kx from "../config.ts";
import { TeamStats, PlayerStats, TeamShotDistribution } from "./types/types.ts";

class ShotDistribution {
  async getTeamShotDistribution(
    season: string,
    teamAbbr: string
  ): Promise<TeamShotDistribution> {
    const shots = await kx("play_by_play")
      .where({ play_actor_team: teamAbbr, season: season, shot: true })
      .select("shot_x", "shot_y", "shot_result");

    let threes = 0;
    let twos = 0;
    let madeThrees = 0;
    let madeTwos = 0;

    shots.forEach((shot) => {
      const distance = Math.sqrt(
        Math.pow(shot.shot_x, 2) + Math.pow(shot.shot_y, 2)
      );

      if (distance > 222) {
        threes++;
        if (shot.shot_result === "made") madeThrees++;
      } else {
        twos++;
        if (shot.shot_result === "made") madeTwos++;
      }
    });

    const threePointPercentage = threes > 0 ? (madeThrees / threes) * 100 : 0;
    const twoPointPercentage = twos > 0 ? (madeTwos / twos) * 100 : 0;

    return {
      threes,
      twos,
      threePointPercentage: threePointPercentage.toFixed(2),
      twoPointPercentage: twoPointPercentage.toFixed(2),
    };
  }
}

export default ShotDistribution;
