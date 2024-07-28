import kx from "./config.js";

const resetTable = async () => {
  try {
    await kx("games").del();
    // await kx.raw('ALTER SEQUENCE players_id_seq RESTART WITH 1');

    console.info('Table reset successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting table:', err);
    process.exit(1);
  }
};

resetTable();