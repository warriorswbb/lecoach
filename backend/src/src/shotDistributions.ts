import kx from "../config.ts";
import { TeamStats, PlayerStats, TeamShotDistribution } from "./types/types.ts";

class ShotDistribution {
  async getTeamShotDistribution(
    season: string,
    teamAbbr: string
  ): Promise<TeamShotDistribution> {
    const shots = await kx("play_by_play")
      .where({ play_actor_team: teamAbbr, season: season })
      .select("shot_x", "shot_y");

    let threes = 0;
    let twos = 0;

    shots.forEach((shot) => {
      const distance = Math.sqrt(
        Math.pow(shot.shot_x, 2) + Math.pow(shot.shot_y, 2)
      );
      if (distance > 222) {
        threes++;
      } else {
        twos++;
      }
    });

    return { threes, twos };
  }
}

export default ShotDistribution;
