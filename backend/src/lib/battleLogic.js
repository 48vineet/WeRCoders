export const normalizeOutput = (output = "") =>
  output
    .trim()
    .split("\n")
    .map((line) =>
      line
        .trim()
        .replace(/\[\s+/g, "[")
        .replace(/\s+\]/g, "]")
        .replace(/\s*,\s*/g, ","),
    )
    .filter((line) => line.length > 0)
    .join("\n");

export const outputsMatch = (actual, expected) =>
  normalizeOutput(actual) === normalizeOutput(expected);

export const determineBattleOutcome = ({
  battle,
  submitterId,
  correct,
  submittedAt,
  simultaneousWindowMs = 2000,
}) => {
  if (battle.status === "finished") {
    return { gameOver: false, reason: "already_finished" };
  }

  const submitter = battle.participants.find(
    (participant) => participant.userId === submitterId,
  );
  const opponent = battle.participants.find(
    (participant) => participant.userId !== submitterId,
  );

  if (!submitter) {
    return { gameOver: false, reason: "not_participant" };
  }

  submitter.submittedAt = submittedAt;
  submitter.lastSubmissionCorrect = correct;

  if (!correct) {
    const opponentSubmittedAt = opponent?.submittedAt
      ? new Date(opponent.submittedAt).getTime()
      : null;
    const currentSubmittedAt = new Date(submittedAt).getTime();

    if (
      opponent &&
      opponent.lastSubmissionCorrect === false &&
      opponentSubmittedAt !== null &&
      Math.abs(currentSubmittedAt - opponentSubmittedAt) <= simultaneousWindowMs
    ) {
      submitter.isLoser = true;
      opponent.isLoser = true;
      battle.status = "finished";
      battle.endTime = submittedAt;
      battle.winnerId = null;
      return {
        gameOver: true,
        winnerId: null,
        loserId: null,
        reason: "double_incorrect",
      };
    }

    submitter.isLoser = true;
    if (opponent) opponent.isWinner = true;
    battle.status = "finished";
    battle.endTime = submittedAt;
    battle.winnerId = opponent?.userId || null;

    return {
      gameOver: true,
      winnerId: opponent?.userId || null,
      loserId: submitterId,
      reason: "wrong_submission",
    };
  }

  submitter.isWinner = true;
  if (opponent) opponent.isLoser = true;
  battle.status = "finished";
  battle.endTime = submittedAt;
  battle.winnerId = submitterId;

  return {
    gameOver: true,
    winnerId: submitterId,
    loserId: opponent?.userId || null,
    reason: "correct_submission",
  };
};
