import path from "node:path";
import env from "./env.js";

export const sourceDataDir = path.resolve(process.cwd(), env.csvDir);
