import crypto from "crypto";
import {
  BATTLE_PROBLEM_IDS,
  getBattleProblem,
} from "../data/battleProblems.js";
import { determineBattleOutcome, outputsMatch } from "../lib/battleLogic.js";
import { executeCode } from "../lib/piston.js";
import {
  chatClient,
  streamClient,
  streamConfigured,
} from "../lib/stream.js";
import Battle from "../models/Battle.js";

const streamUnavailableResponse = (res) =>
  res.status(503).json({
    message: "Stream services are not configured on this deployment.",
  });

const hashPassword = (password) =>
  crypto.createHash("sha256").update(password).digest("hex");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const serializeBattle = (battle) => {
  if (!battle) return null;
  const battleObj = battle.toObject({ virtuals: true });
  delete battleObj.passwordHash;
  battleObj.isLocked = Boolean(battle.passwordHash);
  const problem = getBattleProblem(battle.problemId);
  battleObj.problem = problem
    ? { id: problem.id, title: problem.title, difficulty: problem.difficulty }
    : null;
  return battleObj;
};

const ensureParticipant = (battle, userId) =>
  battle.participants.find((participant) => participant.userId === userId);

const getExpectedOutput = (problemId, language) => {
  const problem = getBattleProblem(problemId);
  return problem?.expectedOutput?.[language] || null;
};

const sendBattleEvent = async (battle, event, userId = null) => {
  try {
    const channel = chatClient.channel("messaging", battle.callId);
    // Include user_id if provided, otherwise use first participant
    const eventWithUser = {
      ...event,
      user_id: userId || battle.participants[0]?.userId || "system",
    };
    await channel.sendEvent(eventWithUser);
  } catch (error) {
    console.log(`Failed to send ${event.type} event:`, error.message);
    // Don't throw - allow battle to continue without events
  }
};

const startCountdown = async (battle) => {
  battle.status = "countdown";
  await battle.save();

  const firstUserId = battle.participants[0]?.userId;

  await sendBattleEvent(
    battle,
    {
      type: "battle-status",
      status: "countdown",
    },
    firstUserId,
  );

  const countdownSequence = [3, 2, 1, 0];
  for (const number of countdownSequence) {
    await sendBattleEvent(
      battle,
      {
        type: "countdown",
        number,
        label: number === 0 ? "Go" : String(number),
      },
      firstUserId,
    );
    await delay(1000);
  }

  battle.status = "in-progress";
  battle.startTime = new Date();
  await battle.save();

  await sendBattleEvent(
    battle,
    {
      type: "battle-status",
      status: "in-progress",
      startTime: battle.startTime.toISOString(),
    },
    firstUserId,
  );
};

export async function createBattle(req, res) {
  try {
    if (!streamConfigured) {
      return streamUnavailableResponse(res);
    }

    const { problemId, password } = req.body;
    if (!problemId || !BATTLE_PROBLEM_IDS.has(problemId)) {
      return res.status(400).json({ message: "Invalid problem selected" });
    }

    const roomId = crypto.randomUUID().split("-")[0];
    const callId = `battle_${roomId}`;

    const battle = await Battle.create({
      roomId,
      callId,
      problemId,
      passwordHash: password ? hashPassword(password) : null,
      participants: [
        {
          userId: req.user.clerkId,
          name: req.user.name,
          ready: false,
        },
      ],
    });

    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: req.user.clerkId,
        custom: { battleId: battle._id.toString(), roomId, problemId },
      },
    });

    const channel = chatClient.channel("messaging", callId, {
      name: `${getBattleProblem(problemId)?.title || "Battle"} Room`,
      created_by: { id: req.user.clerkId },
      members: [req.user.clerkId],
    });
    await channel.create();

    res.status(201).json({ roomId, battle: serializeBattle(battle) });
  } catch (error) {
    console.error("Error in createBattle controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getBattleByRoomId(req, res) {
  try {
    const { roomId } = req.params;
    const battle = await Battle.findOne({ roomId });
    if (!battle) return res.status(404).json({ message: "Battle not found" });

    res.status(200).json({ battle: serializeBattle(battle) });
  } catch (error) {
    console.error("Error in getBattleByRoomId controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveBattles(req, res) {
  try {
    const battles = await Battle.find({
      status: { $in: ["waiting", "countdown", "in-progress"] },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res
      .status(200)
      .json({ battles: battles.map((battle) => serializeBattle(battle)) });
  } catch (error) {
    console.error("Error in getActiveBattles controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinBattle(req, res) {
  try {
    if (!streamConfigured) {
      return streamUnavailableResponse(res);
    }

    const { roomId } = req.params;
    const { password } = req.body || {};
    const clerkId = req.user.clerkId;

    const battle = await Battle.findOne({ roomId });
    if (!battle) return res.status(404).json({ message: "Battle not found" });

    if (battle.status === "finished") {
      return res.status(400).json({ message: "Battle has already ended" });
    }

    const existingParticipant = ensureParticipant(battle, clerkId);
    if (existingParticipant) {
      return res.status(200).json({ battle: serializeBattle(battle) });
    }

    if (battle.participants.length >= 2) {
      return res.status(409).json({ message: "Battle room is full" });
    }

    if (battle.passwordHash) {
      if (!password || hashPassword(password) !== battle.passwordHash) {
        return res.status(403).json({ message: "Invalid room password" });
      }
    }

    battle.participants.push({
      userId: clerkId,
      name: req.user.name,
      ready: false,
    });
    await battle.save();

    const channel = chatClient.channel("messaging", battle.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ battle: serializeBattle(battle) });
  } catch (error) {
    console.error("Error in joinBattle controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function setReady(req, res) {
  try {
    const { roomId } = req.params;
    const { ready } = req.body;
    const clerkId = req.user.clerkId;

    const battle = await Battle.findOne({ roomId });
    if (!battle) return res.status(404).json({ message: "Battle not found" });

    const participant = ensureParticipant(battle, clerkId);
    if (!participant) {
      return res.status(403).json({ message: "Not a battle participant" });
    }

    participant.ready = Boolean(ready);

    // Send event immediately for faster UI update
    try {
      await sendBattleEvent(
        battle,
        {
          type: "user-ready",
          userId: clerkId,
          ready: participant.ready,
        },
        clerkId,
      );
    } catch (eventError) {
      console.error("Error sending ready event", eventError);
    }

    // Then save to DB
    await battle.save();

    const allReady =
      battle.participants.length === 2 &&
      battle.participants.every((p) => p.ready);

    res.status(200).json({ battle: serializeBattle(battle) });

    if (allReady && battle.status === "waiting") {
      setImmediate(() => {
        startCountdown(battle).catch((error) => {
          console.error("Countdown error", error);
        });
      });
    }
  } catch (error) {
    console.error("Error in setReady controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function runCode(req, res) {
  try {
    const { roomId } = req.params;
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Code and language required" });
    }

    const battle = await Battle.findOne({ roomId });
    if (!battle) return res.status(404).json({ message: "Battle not found" });

    const participant = ensureParticipant(battle, req.user.clerkId);
    if (!participant) {
      return res.status(403).json({ message: "Not a battle participant" });
    }

    const result = await executeCode(language, code);
    const expectedOutput = getExpectedOutput(battle.problemId, language);
    const correct =
      result.success && expectedOutput
        ? outputsMatch(result.output, expectedOutput)
        : false;

    res.status(200).json({ ...result, correct });
  } catch (error) {
    console.error("Error in runCode controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function submitCode(req, res) {
  try {
    const { roomId } = req.params;
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Code and language required" });
    }

    const battle = await Battle.findOne({ roomId });
    if (!battle) return res.status(404).json({ message: "Battle not found" });

    const participant = ensureParticipant(battle, req.user.clerkId);
    if (!participant) {
      return res.status(403).json({ message: "Not a battle participant" });
    }

    if (battle.status !== "in-progress" && battle.status !== "countdown") {
      return res.status(400).json({ message: "Battle has not started yet" });
    }

    const result = await executeCode(language, code);
    const expectedOutput = getExpectedOutput(battle.problemId, language);
    const correct =
      result.success && expectedOutput
        ? outputsMatch(result.output, expectedOutput)
        : false;

    const submittedAt = new Date();
    const outcome = determineBattleOutcome({
      battle,
      submitterId: req.user.clerkId,
      correct,
      submittedAt,
    });

    await battle.save();

    if (outcome.gameOver) {
      await sendBattleEvent(
        battle,
        {
          type: "game-over",
          winnerId: outcome.winnerId,
          loserId: outcome.loserId,
          reason: outcome.reason,
        },
        req.user.clerkId,
      );
    }

    res.status(200).json({
      ...result,
      correct,
      gameOver: outcome.gameOver,
      result: outcome,
    });
  } catch (error) {
    console.error("Error in submitCode controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function leaveBattle(req, res) {
  try {
    const { roomId } = req.params;
    const clerkId = req.user.clerkId;

    const battle = await Battle.findOne({ roomId });
    if (!battle) return res.status(404).json({ message: "Battle not found" });

    if (battle.status === "finished") {
      return res.status(200).json({ battle: serializeBattle(battle) });
    }

    const participant = ensureParticipant(battle, clerkId);
    if (!participant) {
      return res.status(403).json({ message: "Not a battle participant" });
    }

    const opponent = battle.participants.find((p) => p.userId !== clerkId);

    participant.isLoser = true;
    if (opponent) opponent.isWinner = true;

    battle.status = "finished";
    battle.endTime = new Date();
    battle.winnerId = opponent?.userId || null;

    await battle.save();

    try {
      await sendBattleEvent(
        battle,
        {
          type: "game-over",
          winnerId: battle.winnerId,
          loserId: clerkId,
          reason: "disconnect",
        },
        clerkId,
      );
    } catch (eventError) {
      console.log(
        "Failed to send leave event, continuing:",
        eventError.message,
      );
    }

    res.status(200).json({ battle: serializeBattle(battle) });
  } catch (error) {
    console.error("Error in leaveBattle controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Find and join battle by password
export async function joinBattleByPassword(req, res) {
  try {
    if (!streamConfigured) {
      return streamUnavailableResponse(res);
    }

    const { password } = req.body;
    const clerkId = req.user.clerkId;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const passwordHash = hashPassword(password);

    // Find battle with matching password that is still joinable
    const battle = await Battle.findOne({
      passwordHash,
      status: { $in: ["waiting", "countdown", "in-progress"] },
      "participants.1": { $exists: false }, // Less than 2 participants
    });

    if (!battle) {
      return res
        .status(404)
        .json({
          message: "No battle found with this password or room is full",
        });
    }

    // Check if already a participant
    const existing = ensureParticipant(battle, clerkId);
    if (existing) {
      return res
        .status(200)
        .json({ roomId: battle.roomId, battle: serializeBattle(battle) });
    }

    // Check if room is full
    if (battle.participants.length >= 2) {
      return res.status(400).json({ message: "Battle room is full" });
    }

    // Add participant
    battle.participants.push({
      userId: clerkId,
      name: req.user.name,
      ready: false,
    });
    await battle.save();

    // Add to Stream channel
    try {
      const channel = chatClient.channel("messaging", battle.callId);
      await channel.addMembers([clerkId]);
    } catch (streamError) {
      console.log("Failed to add to Stream channel:", streamError.message);
    }

    res
      .status(200)
      .json({ roomId: battle.roomId, battle: serializeBattle(battle) });
  } catch (error) {
    console.error("Error in joinBattleByPassword controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
