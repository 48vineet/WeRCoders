import assert from "node:assert/strict";
import test from "node:test";
import { determineBattleOutcome } from "../src/lib/battleLogic.js";

const buildBattle = (participants, status = "in-progress") => ({
  status,
  participants,
  winnerId: null,
  endTime: null,
});

test("determineBattleOutcome marks winner on correct submission", () => {
  const battle = buildBattle([
    { userId: "user-1", name: "User 1" },
    { userId: "user-2", name: "User 2" },
  ]);

  const outcome = determineBattleOutcome({
    battle,
    submitterId: "user-1",
    correct: true,
    submittedAt: new Date("2026-02-20T10:00:00Z"),
  });

  assert.equal(outcome.gameOver, true);
  assert.equal(outcome.winnerId, "user-1");
  assert.equal(battle.winnerId, "user-1");
  assert.equal(battle.status, "finished");
});

test("determineBattleOutcome marks loser on wrong submission", () => {
  const battle = buildBattle([
    { userId: "user-1", name: "User 1" },
    { userId: "user-2", name: "User 2" },
  ]);

  const outcome = determineBattleOutcome({
    battle,
    submitterId: "user-2",
    correct: false,
    submittedAt: new Date("2026-02-20T10:00:00Z"),
  });

  assert.equal(outcome.gameOver, true);
  assert.equal(outcome.winnerId, "user-1");
  assert.equal(battle.winnerId, "user-1");
  assert.equal(battle.status, "finished");
});

test("determineBattleOutcome declares draw on simultaneous wrong submissions", () => {
  const battle = buildBattle([
    {
      userId: "user-1",
      name: "User 1",
      lastSubmissionCorrect: false,
      submittedAt: new Date("2026-02-20T10:00:00Z"),
    },
    {
      userId: "user-2",
      name: "User 2",
    },
  ]);

  const outcome = determineBattleOutcome({
    battle,
    submitterId: "user-2",
    correct: false,
    submittedAt: new Date("2026-02-20T10:00:01Z"),
    simultaneousWindowMs: 2000,
  });

  assert.equal(outcome.gameOver, true);
  assert.equal(outcome.winnerId, null);
  assert.equal(battle.winnerId, null);
  assert.equal(battle.status, "finished");
});
