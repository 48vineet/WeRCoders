import { useEffect, useState } from "react";

function BattleJoinModal({ isOpen, onClose, onJoin, isJoining }) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
    }
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-2xl mb-2">Enter Room Password</h3>
        <p className="text-base-content/70 mb-6">
          This battle room is locked. Enter the password to join.
        </p>
        <input
          type="password"
          className="input input-bordered w-full"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onJoin(password)}
            disabled={!password || isJoining}
          >
            {isJoining ? "Joining..." : "Join"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default BattleJoinModal;
