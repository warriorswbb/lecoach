import knex from "knex";
import config from "./knexfile.js";
import { teamNames } from "./constants.js";
import path from 'path';

console.log("Current Directory:", process.cwd());
console.log("Knex Configuration:", config.development);
const kx = knex(config.development);

const fillTeamTable = async () => {
  for (const team of teamNames) {
    console.log(team);
    await kx("teams").insert({
      team_city: team.city,
      team_name: team.teamName,
      team_short: team.short,
      team_school_name: team.fullSchoolName,
      team_fullname: team.fullTeamName,
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
