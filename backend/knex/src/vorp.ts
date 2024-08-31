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
    } catch (error) {
      console.error("Error fetching player stats:", error);
      throw error;
    }
  };

  // shooting context and per 100 stats
  getTeamShootingContextStats = async () => {
    try {
      const players = this.playerStats;
      const teamStats = this.teamStats;

      if (!players || !teamStats) {
        return;
      }

      let teamTreshPts = 0;

      for (const player of Object.values(players)) {
        const tsa = player.fga + 0.44 * player.fta;
        const pts_tsa = !tsa ? 0 : player.points / tsa;

        if (!teamStats.tmPts_tsTsa || !teamStats.pace) {
          throw new Error(
            `Missing team stats: tmPts_tsTsa or pace for ${player.player_name}`
          );
        }

        player["tsa"] = tsa;
        player["pts_tsTsa"] = pts_tsa;
        player["pts_adj"] = (pts_tsa - teamStats.tmPts_tsTsa + 1) * tsa;
        player["poss"] = (player.mins * teamStats?.pace) / 48;
        player["threshPts"] = tsa * (pts_tsa - (teamStats.tmPts_tsTsa - 0.33));

        if (player.threshPts) {
          teamTreshPts += player.threshPts;
        }

        // per 100 stats
        player["adj_pts_p100"] = (player.pts_adj / player.poss) * 100;
        player["fga_p100"] = (player.fga / player.poss) * 100;
        player["fta_p100"] = (player.fta / player.poss) * 100;
        player["fg3_p100"] = (player.fg3 / player.poss) * 100;
        player["ast_p100"] = (player.assist / player.poss) * 100;
        player["to_p100"] = (player.turn / player.poss) * 100;
        player["orb_p100"] = (player.oreb / player.poss) * 100;
        player["drb_p100"] = (player.dreb / player.poss) * 100;
        player["trb_p100"] = (player.reb / player.poss) * 100;
        player["stl_p100"] = (player.steal / player.poss) * 100;
        player["blk_p100"] = (player.block / player.poss) * 100;
        player["pf_p100"] = (player.pf / player.poss) * 100;

        console.log(player);

        // % of stats
        const percent_min = player.mins / (teamStats.mins / 5);

        console.log(percent_min);

        // using decimal and not percent right now
        player["percent_min"] = percent_min;
        player["percent_treb"] = player.reb / teamStats.reb / percent_min;
        player["percent_stl"] = player.steal / teamStats.steal / percent_min;
        player["percent_pf"] = player.pf / teamStats.pf / percent_min;
        player["percent_ast"] = player.assist / teamStats.assist / percent_min;
        player["percent_blk"] = player.block / teamStats.block / percent_min;
      }

      teamStats["threshPts"] = teamTreshPts;
      console.log(teamStats);

      for (const player of Object.values(players)) {
        const percent_min = player.mins / (teamStats.mins / 5);
        player["percent_threshPts"] =
          player.threshPts / teamTreshPts / percent_min;
      }

      console.log(players);
    } catch (error) {
      console.error("Error fetching player stats:", error);
      throw error;
    }
  };

  // estimate positions
  estimatePlayerPositions = async () => {
    
  };

  // final step
  calculateBPM = async () => {
    const games = await kx("test_table").select("*");
    return this.teamId + 1;
  };
}

export default Vorp;
