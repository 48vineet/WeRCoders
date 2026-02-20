import confetti from "canvas-confetti";
import { ScaleIcon, ShieldXIcon, TrophyIcon } from "lucide-react";
import { useEffect } from "react";

function BattleResultModal({ isOpen, result, onClose, opponentName }) {
  if (!isOpen || !result) return null;

  const { isWinner, isDraw, message } = result;

  // Trigger confetti for winner
  useEffect(() => {
    if (isOpen && isWinner) {
      const duration = 2500;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 40 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 25,
          spread: 360,
          origin: { x: randomInRange(0.2, 0.8), y: Math.random() - 0.2 },
          colors: ["#a3a3a3", "#d4d4d4", "#737373", "#525252", "#fafafa"],
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isOpen, isWinner]);

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg bg-base-100 border border-base-content/10 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-6 pt-4">
          {isWinner ? (
            <div className="w-28 h-28 rounded-full bg-base-content/5 border-2 border-base-content/20 flex items-center justify-center">
              <TrophyIcon className="w-16 h-16 text-base-content/80" />
            </div>
          ) : isDraw ? (
            <div className="w-28 h-28 rounded-full bg-base-content/5 border-2 border-base-content/20 flex items-center justify-center">
              <ScaleIcon className="w-16 h-16 text-base-content/60" />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-base-content/5 border-2 border-base-content/20 flex items-center justify-center">
              <ShieldXIcon className="w-16 h-16 text-base-content/50" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-4xl mb-3 text-center text-base-content">
          {isWinner ? "Victory" : isDraw ? "Draw" : "Defeated"}
        </h3>

        {/* Subtitle with opponent name */}
        {opponentName && !isDraw && (
          <p className="text-lg text-center mb-3 text-base-content/70">
            {isWinner ? (
              <span>
                You defeated{" "}
                <span className="font-semibold text-base-content">
                  {opponentName}
                </span>
              </span>
            ) : (
              <span>
                <span className="font-semibold text-base-content">
                  {opponentName}
                </span>{" "}
                wins
              </span>
            )}
          </p>
        )}

        {/* Message */}
        <p className="text-base-content/60 text-center mb-6">{message}</p>

        {/* Divider */}
        <div className="border-t border-base-content/10 my-4"></div>

        {/* Stats or encouragement */}
        <div className="bg-base-200/50 rounded-lg p-4 mb-6">
          {isWinner ? (
            <p className="text-center text-base-content/70">
              Great problem-solving skills! Keep it up.
            </p>
          ) : isDraw ? (
            <p className="text-center text-base-content/60">
              A close match! Try again for a decisive win.
            </p>
          ) : (
            <p className="text-center text-base-content/60">
              Every loss is a lesson. Keep practicing!
            </p>
          )}
        </div>

        <div className="modal-action justify-center">
          <button
            className="btn btn-ghost border border-base-content/20 min-w-40 hover:bg-base-content/10"
            onClick={onClose}
          >
            Return to Lobby
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/80" onClick={onClose}></div>
    </div>
  );
}

export default BattleResultModal;
