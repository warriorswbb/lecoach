import cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";
import { teamNames } from "../constants.js";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import kx from "./config.js";


