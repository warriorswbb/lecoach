import kx from "./config.js";

const resetTable = async () => {
  try {
    await kx("teams").del();
    await kx.raw('ALTER SEQUENCE teams_team_id_seq RESTART WITH 1');

    console.info('Table reset successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting table:', err);
    process.exit(1);
  }
};

resetTable();