import express from "express";
import {
  createBattle,
  getActiveBattles,
  getBattleByRoomId,
  joinBattle,
  joinBattleByPassword,
  leaveBattle,
  runCode,
  setReady,
  submitCode,
} from "../controllers/battleController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create", protectRoute, createBattle);
router.get("/active", protectRoute, getActiveBattles);
router.post("/join-by-password", protectRoute, joinBattleByPassword);
router.get("/:roomId", protectRoute, getBattleByRoomId);
router.post("/join/:roomId", protectRoute, joinBattle);
router.post("/:roomId/ready", protectRoute, setReady);
router.post("/:roomId/run", protectRoute, runCode);
router.post("/:roomId/submit", protectRoute, submitCode);
router.post("/:roomId/leave", protectRoute, leaveBattle);

export default router;
