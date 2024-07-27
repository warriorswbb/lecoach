import { teamNames } from "../constants/constant.js";
import knex from "knex";

const fillTeamTable = async () => {
  for (const team of teamNames) {
    console.log(team);
    await knex("teams").insert({
      team_city: team.team_city,
      team_name: team.team_city.teamName,
      team_short: team.team_city.short,
      team_school_name: team.team_city.fullSchoolName,
      team_fullname: team.team_city.fullTeamName,
    });
  }
};

fillTeamTable()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
