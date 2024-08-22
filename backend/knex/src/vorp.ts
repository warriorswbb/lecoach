import kx from "../config.ts";
import { TeamStats } from "./types/types.ts";

class Vorp {
  private teamId: number;
  private season: string;
  private teamName: string = "";

  teamStats: Record<string, any> = {};

  playerStats: Record<string, any> = {};

  constructor(team: number, season: string) {
    this.teamId = team;
    this.season = season;

    this.init();
  }

  private init = async () => {
    this.teamName = await this.getTeamName();
    await this.getPlayerStats();
    await this.getTeamStats();
    await this.getTeamShootingContextStats();
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

      console.log(stats);

      const ovrRtg = stats.offrtg_adj + stats.defrtg_adj;
      const avgLead = (ovrRtg * stats.pace) / 100 / 2;
      const leadBonus = (0.35 / 2) * avgLead;
      const ovrRtg_adj = ovrRtg + leadBonus;
      const offRtg_leadAdj = stats.offrtg_adj + leadBonus / 2;

      const tmTsa = stats.fga + 0.44 * stats.fta;
      const tmPts_tsTsa = stats.points / tmTsa;

      const extendedStats = {
        ...stats,
        ovrRtg,
        ovrRtg_adj,
        offRtg_leadAdj,
        tmPts_tsTsa,
      };

      if (stats) {
        this.teamStats = extendedStats;
      }
    } catch (error) {
      console.error("Error fetching team stats:", error);
      throw error;
    }
  };

  // put player stats in this.playerStats
  getPlayerStats = async () => {
    try {
      const stats = await kx("player_season_stats")
        .where({ team_id: this.teamId })
        .andWhere({ season: this.season });

      if (stats) {
        this.playerStats = stats;
      }

      for (const stat of stats) {
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

  getTeamShootingContextStats = async () => {
    // TODO after team advanced
    const teamStats = this.teamStats;
    for (const stat of teamStats[0]) {
      console.log(stat);
    }
  };

  calculateBPM = async () => {
    const games = await kx("test_table").select("*");
    return this.teamId + 1;
  };
}

export default Vorp;
