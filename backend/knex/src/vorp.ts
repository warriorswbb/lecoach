import kx from "../config.ts";

class Vorp {
  private teamId: number;
  private season: string;

  teamPoss: number = 0;

  constructor(team: number, season: string) {
    this.teamId = team;
    this.season = season;
  }

  // fetch team season stats
  allTeamStats = async () => {
    try {
      const stats = await kx("team_season_stats")
        .where({ team_one: this.teamId })
        .andWhere({ season: this.season })
        .first();
    
      this.teamPoss = stats?.poss_per_game;
      console.log(this.teamPoss);
      return stats;
    } catch (error) {
      console.error("Error fetching team stats:", error);
      throw error;
    }
  };

  calculateBPM = async () => {
    const games = await kx("test_table").select("*");
    console.log(games);
    return this.teamId + 1;
  };
}

export default Vorp;
