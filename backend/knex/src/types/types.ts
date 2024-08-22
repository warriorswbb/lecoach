export type TeamStats = {
    id: number;
    season: string;
    team_one: number;
    games_played?: number; // Optional since it's not marked as `notNullable`
    wins?: number;
    mins: number;
    fg3: number;
    fga3: number;
    fg2: number;
    fga2: number;
    fga: number;
    ft: number;
    fta: number;
    fg?: number;
    fg_percent?: number;
    "3pt_percent"?: number;
    "2pt_percent"?: number;
    efg_percent?: number;
    ft_percent?: number;
    oreb: number;
    dreb: number;
    reb: number;
    pf: number;
    assist: number;
    turn: number;
    block: number;
    steal: number;
    points: number;
    possessions?: number;
    offrtg?: number;
    defrtg?: number;
    offrtg_adj?: number;
    defrtg_adj?: number;
    pace?: number;
  };
  