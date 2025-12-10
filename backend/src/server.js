import cors from "cors";
import express from "express";
import { serve } from "inngest/express";
import path from "path";
import { connectDB } from "./lib/db.js";
import env from "./lib/env.js";
import { functions, inngest } from "./lib/innjest.js";

const app = express();
const __dirname = path.resolve();

//! middlewares

app.use(express.json());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Api is up and running " });
});

if (env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log("app is hosted on port no", env.PORT);
    });
  } catch (error) {
    console.error("Error while conneting DB");
  }
};

startServer();
