import express from "express";
import path from "path";
import env from "./lib/env.js";

const app = express();
const __dirname = path.resolve();

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Api is up and running " });
});

if (env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(env.PORT, () => {
  console.log("app is hosted on port no", env.PORT);
});
