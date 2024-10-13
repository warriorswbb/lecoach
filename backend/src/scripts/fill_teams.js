import { teamNames } from "../constants.js";
import kx from "./config.js";

// done
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
