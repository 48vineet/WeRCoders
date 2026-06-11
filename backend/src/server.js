import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import { serve } from "inngest/express";
import fs from "fs";
import path from "path";
import { connectDB } from "./lib/db.js";
import env from "./lib/env.js";
import { functions, inngest } from "./lib/innjest.js";
import battleRoutes from "./routes/battleRoutes.js";
import chatRoutes from "./routes/chatRoute.js";
import sessionRoutes from "./routes/sessionRoutes.js";

const app = express();
const __dirname = path.resolve();
const clerkConfigured = Boolean(
  env.CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY,
);

//! middlewares

app.use(express.json());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
if (clerkConfigured) {
  app.use(clerkMiddleware());
}
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
    signingKey: env.INNGEST_SIGNING_KEY, // required to verify webhook signatures
  }),
);
app.use("/api/battle", battleRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/session", sessionRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Api is up and running " });
});

const frontendIndexPath = path.join(__dirname, "../frontend/dist/index.html");

if (fs.existsSync(frontendIndexPath)) {
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
