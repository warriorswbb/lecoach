import fs from 'fs';
import csv from 'csv-parser';
import kx from './config.js';

async function updateTeamSeasonStats() {
  const teams = await kx('teams').select('team_id', 'team_fullName');
  const teamNameToId = teams.reduce((acc, team) => {
    acc[team.team_fullName] = team.team_id;
    return acc;
  }, {});

  const updates = [];

  fs.createReadStream('teams.csv')
    .pipe(csv())
    .on('data', (row) => {
      const teamFullName = row.Team;
      const possession = row.Poss;
      const teamId = teamNameToId[teamFullName];

      if (teamId) {
        updates.push({
          team_id: teamId,
          possession: possession
        });
      }
    })
    .on('end', async () => {
      for (const update of updates) {
        await kx('team_season_stats')
          .where('team_id', update.team_id)
          .update({ possession: update.possession });
      }
      console.log('Team season stats updated successfully.');
    })
    .on('error', (error) => {
      console.error('Error reading the CSV file:', error);
    });
}

updateTeamSeasonStats();
