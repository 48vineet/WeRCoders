import { Code2Icon, LockIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { PROBLEMS } from "../data/data";
import { useCreateBattle } from "../hooks/useBattles";

function BattleCreatePage() {
  const navigate = useNavigate();
  const [problemId, setProblemId] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState("");

  const createBattleMutation = useCreateBattle();
  const problems = Object.values(PROBLEMS);

  const handleCreateBattle = () => {
    if (!problemId) return;

    createBattleMutation.mutate(
      {
        problemId,
        password: isLocked ? password : undefined,
      },
      {
        onSuccess: (data) => {
          navigate(`/battle/${data.roomId}`);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="text-3xl font-black mb-2">Create 1v1 Battle</h1>
            <p className="text-base-content/70 mb-6">
              Choose a problem and invite a friend to compete.
            </p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="label">
                  <span className="label-text font-semibold">
                    Select Problem
                  </span>
                </label>
                <select
                  className="select w-full"
                  value={problemId}
                  onChange={(event) => setProblemId(event.target.value)}
                >
                  <option value="" disabled>
                    Choose a coding problem...
                  </option>
                  {problems.map((problem) => (
                    <option key={problem.id} value={problem.id}>
                      {problem.title} ({problem.difficulty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-secondary"
                  checked={isLocked}
                  onChange={(event) => setIsLocked(event.target.checked)}
                />
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <LockIcon className="size-4" />
                    Lock room with password
                  </p>
                  <p className="text-sm text-base-content/60">
                    Share the password with your opponent to join.
                  </p>
                </div>
              </div>

              {isLocked && (
                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Room Password
                    </span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter a secure password"
                  />
                </div>
              )}

              {problemId && (
                <div className="alert alert-success">
                  <Code2Icon className="size-5" />
                  <div>
                    <p className="font-semibold">Battle Summary:</p>
                    <p>
                      Problem:{" "}
                      <span className="font-medium">
                        {PROBLEMS[problemId].title}
                      </span>
                    </p>
                    <p>
                      Mode: <span className="font-medium">1v1 Competitive</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                className="btn btn-ghost"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>
              <button
                className="btn btn-secondary"
                disabled={
                  createBattleMutation.isPending ||
                  !problemId ||
                  (isLocked && !password)
                }
                onClick={handleCreateBattle}
              >
                {createBattleMutation.isPending
                  ? "Creating..."
                  : "Create Battle"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleCreatePage;
