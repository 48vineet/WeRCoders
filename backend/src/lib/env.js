import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load backend/.env explicitly so deployments running from repo root still pick it up.
dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const env = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV,
};

const missing = ["DB_URL"].filter((key) => !env[key]);
if (missing.length) {
  throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}

export default env;
