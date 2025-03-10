import kx from "../config.ts";
import { TeamStats, PlayerStats } from "./types/types.ts";
import {
  PositionPercentageWeights,
  OffensiveRoleWeights,
  OffRoleIntercept,
  Intercept,
  BPMCoefficients,
  // OBPMCoefficients,
  PosConst,
} from "./constants.ts";

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

        // % of stats
        const percent_min = player.mins / (teamStats.mins / 5);

        // using decimal and not percent right now
        player["percent_min"] = percent_min;
        player["percent_treb"] = player.reb / teamStats.reb / percent_min;
        player["percent_stl"] = player.steal / teamStats.steal / percent_min;
        player["percent_pf"] = player.pf / teamStats.pf / percent_min;
        player["percent_ast"] = player.assist / teamStats.assist / percent_min;
        player["percent_blk"] = player.block / teamStats.block / percent_min;
      }

      teamStats["threshPts"] = teamTreshPts;

      for (const player of Object.values(players)) {
        const percent_min = player.mins / (teamStats.mins / 5);
        player["percent_threshPts"] =
          player.threshPts / teamTreshPts / percent_min;
      }

    } catch (error) {
      console.error("Error fetching player stats:", error);
      throw error;
    }
  };

  // helper sum product functions for estimating positions
  sumProd = <T extends Record<string, number>>(obj1: T, obj2: T): number => {
    let sumProduct = 0;

    const keys = Object.keys(obj1) as (keyof T)[];

    keys.forEach((key) => {
      sumProduct += (obj1[key] || 0) * (obj2[key] || 0);
    });

    return sumProduct;
  };

  sumProdList = (arr1: number[], arr2: number[]): number => {
    let sumProduct = 0;

    for (let i = 0; i < arr1.length; i++) {
      sumProduct += (arr1[i] || 0) * (arr2[i] || 0);
    }

    return sumProduct;
  };

  // estimate positions
  estimatePlayerPositions = async () => {
    const players = this.playerStats;
    const team = this.teamStats;
    const PPW = PositionPercentageWeights;
    const estPosList: { name: string; position: number }[] = [];
    const plyrMins: number[] = [];

    for (const player of Object.values(players)) {
      const percentObject = {
        percent_treb: player.percent_treb,
        percent_stl: player.percent_stl,
        percent_pf: player.percent_pf,
        percent_ast: player.percent_ast,
        percent_blk: player.percent_blk,
      };

      const estPos1 = this.sumProd(percentObject, PPW) + Intercept;
      estPosList.push({
        name: player.player_name,
        position: estPos1,
      });
      plyrMins.push(player.mins); // used for team avg
    }

    if (estPosList.length === 0) {
      console.error("No player stats to estimate positions");
    }

    // values can't be over 5 or under 1
    const trimEstPos1 = estPosList.map((player) => {
      player.position = Math.max(Math.min(player.position, 5), 1);
      return player.position;
    });

    // const tmAvg1 = this.sumProdList(trimEstPos1, plyrMins) / team.mins;
    // console.log(tmAvg1); 3.0492456886882726 close enough to 3

    // add position to player objects
    estPosList.forEach((player) => {
      const matchingPlayer = this.playerStats.find(
        (p: PlayerStats) => p.player_name === player.name
      );

      if (matchingPlayer) {
        matchingPlayer.position = player.position;
      } else {
        console.error("No matching player found for", player.name);
      }
    });
  };

  // estimate offesive roles
  estimateOffensiveRoles = async () => {
    const players = this.playerStats;
    const team = this.teamStats;
    const ORW = OffensiveRoleWeights;
    const offRoleList: { name: string; offRole: number }[] = [];
    const trimOffRoles: number[] = [];
    const plyrMins: number[] = [];

    for (const player of Object.values(players)) {
      const offrole =
        OffRoleIntercept +
        ORW.ast * player.percent_ast +
        ORW.thresh * player.percent_threshPts;

      // default pos is 4, min weight is 50
      const minAdj1 = (offrole * player.mins + 4 * 50) / (player.mins + 50);

      const trim1 = Math.max(Math.min(minAdj1, 5), 1);

      offRoleList.push({
        name: player.player_name,
        offRole: trim1,
      });

      plyrMins.push(player.mins);
      trimOffRoles.push(trim1);
    }

    // const tmAvg1 = this.sumProdList(trimOffRoles, plyrMins) / team.mins;
    // console.log(tmAvg1); 3.0388120288637963 close enough to 3

    // add position to player objects
    offRoleList.forEach((player) => {
      const matchingPlayer = this.playerStats.find(
        (p: PlayerStats) => p.player_name === player.name
      );

      if (matchingPlayer) {
        matchingPlayer.offRole = player.offRole;
      } else {
        console.error("No matching player found for", player.name);
      }
    });
  };

  // calculate bpm coefficients
  calculateBPMCoefficients = async () => {
    type CoefficientsKeys = keyof typeof BPMCoefficients.pos1;
    const players = this.playerStats;

    const coefficients: CoefficientsKeys[] = [
      "adj_pts",
      "fga",
      "fta",
      "fg3",
      "ast",
      "to",
      "orb",
      "drb",
      "trb",
      "stl",
      "blk",
      "pf",
    ];

    for (const player of Object.values(players)) {
      for (const coeff of coefficients) {
        const posKey = coeff === "adj_pts" ? "position" : "offRole";
        player[`bpmCoeff_${coeff}`] =
          ((5 - player[posKey]) / 4) * BPMCoefficients.pos1[coeff] +
          ((player[posKey] - 1) / 4) * BPMCoefficients.pos5[coeff];
      }
    }
  };

  // raw bpm
  calculateRawBPM = async () => {
    const players = this.playerStats;

    const categories = [
      {
        coeffs: [
          "bpmCoeff_adj_pts",
          "bpmCoeff_fga",
          "bpmCoeff_fta",
          "bpmCoeff_fg3",
        ],
        p100s: ["adj_pts_p100", "fga_p100", "fta_p100", "fg3_p100"],
        result: "scoringRawBpm",
      },
      {
        coeffs: ["bpmCoeff_ast", "bpmCoeff_to"],
        p100s: ["ast_p100", "to_p100"],
        result: "ballHandlingBpm",
      },
      {
        coeffs: ["bpmCoeff_orb", "bpmCoeff_drb", "bpmCoeff_trb"],
        p100s: ["orb_p100", "drb_p100", "trb_p100"],
        result: "reboundingBpm",
      },
      {
        coeffs: ["bpmCoeff_stl", "bpmCoeff_blk", "bpmCoeff_pf"],
        p100s: ["stl_p100", "blk_p100", "pf_p100"],
        result: "defenseBpm",
      },
    ];
    // raw bpm = 4 cats + pos const
    for (const player of Object.values(players)) {
      for (const { coeffs, p100s, result } of categories) {
        player[result] = this.sumProdList(
          coeffs.map((key) => player[key]),
          p100s.map((key) => player[key])
        );
      }

      let posConst = 0;
      const guard = player.position < 3;

      posConst = guard
        ? ((player.position - 1) / 2) * PosConst.pos3 +
          ((3 - player.position) / 2) * PosConst.pos1
        : ((player.position - 3) / 2) * PosConst.pos5 +
          ((5 - player.position) / 2) * PosConst.pos3;
      posConst += PosConst.offSlope * (player.offRole - 3);

      const rawBpm =
        player.scoringRawBpm +
        player.ballHandlingBpm +
        player.reboundingBpm +
        player.defenseBpm +
        posConst;

      player["rawBpm"] = rawBpm;
    }
  };

  // bpm calculation
  calculateBpmVorp = async () => {
    const players = this.playerStats;

    for (const player of Object.values(players)) {
      const contribRaw = player.percent_min * player.rawBpm;
      const bpm = contribRaw + player.rawBpm;
      const contrib = player.percent_min * bpm;
      const vorp = (bpm + 2) * player.percent_min;

      player["bpm"] = bpm;
      player["contrib"] = contrib;
      player["vorp"] = vorp;
    }
  };
}

export default Vorp;
