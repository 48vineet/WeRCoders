import mongoose from "mongoose";
import env from "./env.js";

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(env.DB_URL);
    console.log("✅ Connected to DB: ", connect.connection.host);
  } catch (error) {
    console.error("❌Error connecting DB", error);
    process.exit(1);
  }
};
