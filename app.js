import express from "express";
import server from "./graphql";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";

const app = express();

const startServer = async () => {
  await server.start();
  app.use("/", bodyParser.json(), expressMiddleware(server));
};

startServer();

export default app;
