import dotenv from "dotenv";

dotenv.config({ quiet: true });

export default {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV,
};
