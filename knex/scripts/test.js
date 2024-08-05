import kx from "./config.js";

// done
const test = async () => {
  await kx("test_table").insert({
    name: 21,
    age: 23,
  });
};

test()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
