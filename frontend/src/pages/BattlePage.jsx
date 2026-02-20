import { useUser } from "@clerk/clerk-react";
import { ClockIcon, Loader2Icon, Share2Icon, SwordIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import BattleEditorPanel from "../components/BattleEditorPanel";
import BattleJoinModal from "../components/BattleJoinModal";
import BattleResultModal from "../components/BattleResultModal";
import CountdownOverlay from "../components/CountdownOverlay";
import Navbar from "../components/Navbar";
import OutputPanel from "../components/OutputPanel";
import { PROBLEMS } from "../data/data";
import {
  useBattleByRoomId,
  useJoinBattle,
  useLeaveBattle,
  useReadyBattle,
  useRunBattleCode,
  useSubmitBattleCode,
} from "../hooks/useBattles";
import useBattleStreamClient from "../hooks/useBattleStreamClient";

function BattlePage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useUser();
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [output, setOutput] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [battleState, setBattleState] = useState(null);
  const [countdownValue, setCountdownValue] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [result, setResult] = useState(null);
  const countdownStartedRef = useRef(false);
  const joinAttemptedRef = useRef(false);

  const {
    data: battleData,
    isLoading: loadingBattle,
    refetch,
  } = useBattleByRoomId(roomId);

  const joinBattleMutation = useJoinBattle(roomId);
  const readyMutation = useReadyBattle(roomId, user?.id);
  const runMutation = useRunBattleCode(roomId);
  const submitMutation = useSubmitBattleCode(roomId);
  const leaveMutation = useLeaveBattle(roomId);

  useEffect(() => {
    if (battleData?.battle) {
      setBattleState(() => {
        const newBattle = battleData.battle;
        return {
          ...newBattle,
          participants: newBattle.participants,
          status: newBattle.status,
          startTime: newBattle.startTime,
        };
      });
    }
  }, [battleData]);

  const isParticipant = useMemo(() => {
    if (!battleState || !user?.id) return false;
    return battleState.participants?.some((p) => p.userId === user.id);
  }, [battleState, user]);

  const me = useMemo(() => {
    if (!battleState || !user?.id) return null;
    return battleState.participants?.find((p) => p.userId === user.id);
  }, [battleState, user]);

  const opponent = useMemo(() => {
    if (!battleState || !user?.id) return null;
    return battleState.participants?.find((p) => p.userId !== user.id);
  }, [battleState, user]);

  const { channel } = useBattleStreamClient(
    battleState,
    loadingBattle,
    isParticipant,
  );

  const problemData = battleState?.problemId
    ? PROBLEMS[battleState.problemId]
    : null;

  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  useEffect(() => {
    if (!battleState || !user || loadingBattle) return;
    if (isParticipant) {
      joinAttemptedRef.current = false; // Reset when they become a participant
      return;
    }
    if (joinAttemptedRef.current) return; // Already attempted to join
    if (battleState.participants?.length >= 2) return;

    if (battleState.isLocked) {
      setShowJoinModal(true);
      return;
    }

    // Mark as attempted before calling mutation
    joinAttemptedRef.current = true;

    joinBattleMutation.mutate(
      { password: undefined },
      {
        onSuccess: () => {
          refetch();
        },
        onError: () => {
          // Reset on error so user can retry
          joinAttemptedRef.current = false;
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleState, user, loadingBattle, isParticipant]);

  useEffect(() => {
    if (!channel) {
      // Stream not ready yet - polling will handle updates
      return;
    }

    const handleReady = (event) => {
      setBattleState((prev) => {
        if (!prev) return prev;
        const updated = prev.participants.map((participant) =>
          participant.userId === event.userId
            ? { ...participant, ready: event.ready }
            : participant,
        );
        return { ...prev, participants: updated };
      });
    };

    const handleCountdown = (event) => {
      setCountdownValue(event.number);
      if (event.number === 0) {
        setTimeout(() => setCountdownValue(null), 600);
      }
    };

    const handleStatus = (event) => {
      setBattleState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: event.status || prev.status,
          startTime: event.startTime || prev.startTime,
        };
      });
    };

    const handleGameOver = (event) => {
      const isWinner = event.winnerId && event.winnerId === user?.id;
      const isDraw = event.reason === "double_incorrect";

      const messageMap = {
        correct_submission: isWinner
          ? "You solved the problem first! Amazing work!"
          : "Your opponent was faster this time.",
        wrong_submission: isWinner
          ? "Your opponent's solution failed the test cases."
          : "Your solution didn't pass all test cases.",
        double_incorrect: "Neither solution passed all test cases.",
        disconnect: isWinner
          ? "Your opponent left the battle."
          : "You left the battle.",
      };

      setResult({
        isWinner,
        isDraw,
        message: messageMap[event.reason] || "Battle ended.",
      });
      setBattleState((prev) =>
        prev ? { ...prev, status: "finished", winnerId: event.winnerId } : prev,
      );
    };

    // Stream events enhance real-time updates but aren't required
    channel.on("user-ready", handleReady);
    channel.on("countdown", handleCountdown);
    channel.on("battle-status", handleStatus);
    channel.on("game-over", handleGameOver);

    return () => {
      channel.off("user-ready", handleReady);
      channel.off("countdown", handleCountdown);
      channel.off("battle-status", handleStatus);
      channel.off("game-over", handleGameOver);
    };
  }, [channel, user]);

  // Fallback countdown display when Stream events don't fire
  useEffect(() => {
    // Only start countdown once when status becomes "countdown"
    if (battleState?.status === "countdown" && !countdownStartedRef.current) {
      countdownStartedRef.current = true;

      // Simulate countdown sequence
      let count = 3;
      setCountdownValue(count);

      const interval = setInterval(() => {
        count--;
        if (count === 0) {
          setCountdownValue("Go");
          clearInterval(interval);
          // Clear countdown value after showing "Go"
          setTimeout(() => setCountdownValue(null), 600);
        } else {
          setCountdownValue(count);
        }
      }, 1000);

      return () => clearInterval(interval);
    }

    // Reset the ref when battle ends or we leave
    if (
      battleState?.status === "waiting" ||
      battleState?.status === "finished" ||
      !battleState
    ) {
      countdownStartedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleState?.status]);

  useEffect(() => {
    if (!battleState?.startTime || battleState.status !== "in-progress") return;

    const start = new Date(battleState.startTime).getTime();
    const tick = () => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [battleState?.startTime, battleState?.status]);

  useEffect(() => {
    const handleUnload = () => {
      if (!battleState || battleState.status === "finished") return;
      if (!isParticipant) return;

      fetch(`${apiBase}/battle/${roomId}/leave`, {
        method: "POST",
        credentials: "include",
        keepalive: true,
      });
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [battleState, isParticipant, apiBase, roomId]);

  const handleReady = () => {
    readyMutation.mutate(true);
  };

  const handleRunCode = () => {
    runMutation.mutate(
      { code, language: selectedLanguage },
      {
        onSuccess: (data) => {
          setOutput(data);
          if (data.correct) toast.success("All sample tests passed!");
          if (!data.correct && data.success) toast.error("Sample tests failed");
        },
      },
    );
  };

  const handleSubmitCode = () => {
    submitMutation.mutate(
      { code, language: selectedLanguage },
      {
        onSuccess: (data) => {
          setOutput(data);
          if (data.gameOver && data.result) {
            const isWinner = data.result.winnerId === user?.id;
            const isDraw = data.result.reason === "double_incorrect";

            let message;
            if (isDraw) {
              message = "Neither solution passed all test cases.";
            } else if (data.result.reason === "wrong_submission") {
              message = isWinner
                ? "Your opponent's solution failed the test cases."
                : "Your solution didn't pass all test cases.";
            } else {
              message = isWinner
                ? "You solved the problem first! Amazing work!"
                : "Your opponent was faster this time.";
            }

            setResult({ isWinner, isDraw, message });
          }
        },
      },
    );
  };

  const handleLeave = () => {
    leaveMutation.mutate(undefined, {
      onSuccess: () => navigate("/dashboard"),
    });
  };

  const joinLockedBattle = (password) => {
    joinBattleMutation.mutate(
      { password },
      {
        onSuccess: () => {
          setShowJoinModal(false);
          setTimeout(() => refetch(), 500);
        },
        onError: () => {
          // Keep modal open on error so user can retry
        },
      },
    );
  };

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  if (loadingBattle) {
    return (
      <div className="min-h-screen bg-base-300 flex items-center justify-center">
        <Loader2Icon className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!battleState) {
    return (
      <div className="min-h-screen bg-base-300 flex items-center justify-center">
        <p className="text-lg font-semibold">Battle not found.</p>
      </div>
    );
  }

  if (!isParticipant && battleState.participants?.length >= 2) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <h2 className="text-2xl font-bold mb-2">Room Full</h2>
              <p className="text-base-content/70 mb-6">
                This battle already has two participants.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <BattleJoinModal
        isOpen={showJoinModal}
        onClose={() => navigate("/dashboard")}
        onJoin={joinLockedBattle}
        isJoining={joinBattleMutation.isPending}
      />

      <BattleResultModal
        isOpen={Boolean(result)}
        result={result}
        onClose={() => navigate("/dashboard")}
        opponentName={opponent?.name}
      />

      {/* Countdown Overlay - Full Screen */}
      <CountdownOverlay value={countdownValue} />

      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel - Problem Description */}
          <Panel defaultSize={40} minSize={30}>
            <div className="h-full overflow-y-auto bg-base-200 p-6">
              {/* Battle Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
                    <SwordIcon className="w-6 h-6 text-error" />
                    {problemData?.title || "Battle Problem"}
                  </h1>
                  <div
                    className={`badge badge-lg ${
                      problemData?.difficulty === "Easy"
                        ? "badge-success"
                        : problemData?.difficulty === "Medium"
                          ? "badge-warning"
                          : "badge-error"
                    }`}
                  >
                    {problemData?.difficulty}
                  </div>
                </div>

                {/* Battle Timer */}
                {battleState?.status === "in-progress" && (
                  <div className="mb-4">
                    <div className="badge badge-primary badge-lg gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {formatTimer(elapsedSeconds)}
                    </div>
                  </div>
                )}

                {/* Players Info */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div
                    className={`p-3 rounded-lg ${me?.ready ? "bg-success/10 border border-success" : "bg-base-100"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${me?.ready ? "bg-success" : "bg-base-content/30"}`}
                      ></div>
                      <span className="text-sm font-medium truncate">
                        {me?.name || "You"}
                      </span>
                    </div>
                    {me?.submittedAt && (
                      <div
                        className={`text-xs mt-1 ${me?.lastSubmissionCorrect ? "text-success" : "text-error"}`}
                      >
                        {me?.lastSubmissionCorrect ? "✓ Correct" : "✗ Wrong"}
                      </div>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${opponent?.ready ? "bg-success/10 border border-success" : "bg-base-100"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${opponent?.ready ? "bg-success" : "bg-base-content/30"}`}
                      ></div>
                      <span className="text-sm font-medium truncate">
                        {opponent?.name || "Waiting..."}
                      </span>
                    </div>
                    {opponent?.submittedAt && (
                      <div
                        className={`text-xs mt-1 ${opponent?.lastSubmissionCorrect ? "text-success" : "text-error"}`}
                      >
                        {opponent?.lastSubmissionCorrect
                          ? "✓ Correct"
                          : "✗ Wrong"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ready Button */}
                {battleState?.status === "waiting" && (
                  <button
                    className="btn btn-primary w-full mb-4"
                    disabled={me?.ready || readyMutation.isPending}
                    onClick={handleReady}
                  >
                    {me?.ready ? "✓ Ready" : "I'm Ready"}
                  </button>
                )}
              </div>

              {/* Problem Description */}
              <div className="prose max-w-none">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <div className="text-base-content/80 mb-4">
                  {typeof problemData?.description === "string" ? (
                    <p>{problemData.description}</p>
                  ) : (
                    <>
                      {problemData?.description?.text && (
                        <p>{problemData.description.text}</p>
                      )}
                      {problemData?.description?.notes?.map((note, idx) => (
                        <p key={idx} className="mt-2">
                          {note}
                        </p>
                      ))}
                    </>
                  )}
                </div>

                {problemData?.examples && (
                  <>
                    <h2 className="text-lg font-semibold mb-2 mt-6">
                      Examples
                    </h2>
                    {problemData.examples.map((example, idx) => (
                      <div
                        key={idx}
                        className="bg-base-100 p-4 rounded-lg mb-3"
                      >
                        <p className="font-mono text-sm">
                          <strong>Input:</strong> {example.input}
                        </p>
                        <p className="font-mono text-sm">
                          <strong>Output:</strong> {example.output}
                        </p>
                        {example.explanation && (
                          <p className="text-sm text-base-content/70 mt-2">
                            <strong>Explanation:</strong> {example.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {problemData?.constraints && (
                  <>
                    <h2 className="text-lg font-semibold mb-2 mt-6">
                      Constraints
                    </h2>
                    <ul className="text-sm text-base-content/80 space-y-1">
                      {problemData.constraints.map((constraint, idx) => (
                        <li key={idx}>{constraint}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-base-300">
                <button
                  className="btn btn-outline btn-sm w-full mb-2"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/battle/${roomId}`,
                    );
                    toast.success("Room link copied!");
                  }}
                >
                  <Share2Icon className="w-4 h-4" />
                  Share Link
                </button>
                {battleState?.status !== "finished" && (
                  <button
                    className="btn btn-error btn-outline btn-sm w-full"
                    onClick={handleLeave}
                    disabled={leaveMutation.isPending}
                  >
                    Leave Battle
                  </button>
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* Right Panel - Code Editor & Output */}
          <Panel defaultSize={60} minSize={40}>
            <PanelGroup direction="vertical">
              {/* Code Editor */}
              <Panel defaultSize={70} minSize={40}>
                <BattleEditorPanel
                  code={code}
                  setCode={setCode}
                  language={selectedLanguage}
                  setLanguage={setSelectedLanguage}
                  onRun={handleRunCode}
                  onSubmit={handleSubmitCode}
                  isRunning={runMutation.isPending}
                  isSubmitting={submitMutation.isPending}
                  battleStatus={battleState?.status}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              {/* Output Panel */}
              <Panel defaultSize={30} minSize={15}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default BattlePage;
