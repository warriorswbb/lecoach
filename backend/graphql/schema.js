import { join, dirname } from "path";
import { readdirSync, readFileSync } from "fs";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { fileURLToPath } from "url";
import resolvers from "./resolvers";

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gqlFiles = readdirSync(join(__dirname, "./typedefs"));

let typeDefs = "";

gqlFiles.forEach((file) => {
  typeDefs += readFileSync(join(__dirname, "./typedefs", file), {
    encoding: "utf8",
  });
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;