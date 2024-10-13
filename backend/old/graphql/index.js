import { ApolloServer } from "@apollo/server";
import { env } from "../config/environment";
import schema from './schema'; // We imported this

const apolloServer = new ApolloServer({
  schema,
  playground: env.development,
});

export default apolloServer;
