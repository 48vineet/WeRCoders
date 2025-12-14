import mongoose from "mongoose";
import env from "./env.js";

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(env.DB_URL);
    console.log("✅ Connected to DB: ", connect.connection.host);

    // Clean up legacy typo index if it exists to prevent duplicate key errors
    try {
      const userCollection = connect.connection.collection("users");
      const indexes = await userCollection.indexes();
      const hasBadIndex = indexes.some((idx) => idx.name === "clearkId_1");
      if (hasBadIndex) {
        await userCollection.dropIndex("clearkId_1");
        console.log("🧹 Dropped legacy index 'clearkId_1'");
      }
    } catch (idxErr) {
      console.warn("Index cleanup skipped:", idxErr?.message || idxErr);
    }
  } catch (error) {
    console.error("❌Error connecting DB", error);
    process.exit(1);
  }
};
