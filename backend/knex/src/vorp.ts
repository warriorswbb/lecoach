import kx from "../config.ts";

class Vorp {
  private teamId: number;
  private season: string;
  private teamName: string = "";

  teamStats: Record<string, any> = {};
  playerStats: Record<string, any> = {};

  teamPoss: number = 0;

  constructor(team: number, season: string) {
    this.teamId = team;
    this.season = season;

    this.init();
  }

  private init = async () => {
    this.teamName = await this.getTeamName(); // gets team name
  };

  // get team name
  private getTeamName = async () => {
    try {
      const team = await kx("teams").where({ team_id: this.teamId }).first();
      return team?.team_name;
    } catch (error) {
      console.error("Error fetching team name:", error);
    }
  };

  // store team stats into this.teamStats
  getTeamStats = async () => {
    try {
      const stats = await kx("team_season_stats")
        .where({ team_one: this.teamId })
        .andWhere({ season: this.season })
        .first();

      this.teamPoss = stats?.poss_per_game;
      if (stats) {
        this.teamStats = stats;
      }
    } catch (error) {
      console.error("Error fetching team stats:", error);
      throw error;
    }
  };

  getPlayerStats = async () => {
    try {
      const stats = await kx("player_season_stats")
        .where({ team_id: this.teamId })
        .andWhere({ season: this.season });

      if (stats) {
        this.playerStats = stats;
      }

      for (const stat of stats) {
        console.log(stat["id"]);

        const playerNameRecord = await kx("players")
          .where({ id: stat["player_id"] })
          .first();

        if (playerNameRecord) {
          stat["player_name"] = playerNameRecord.player_name;
        }
      }

      // console.log(this.playerStats);
    } catch (error) {
      console.error("Error fetching player stats:", error);
      throw error;
    }
  };

  calculateBPM = async () => {
    const games = await kx("test_table").select("*");
    return this.teamId + 1;
  };
}

export default Vorp;
