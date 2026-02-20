import { useUser } from "@clerk/clerk-react";
import {
  Loader2Icon,
  LockIcon,
  SwordIcon,
  UnlockIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useActiveBattles } from "../hooks/useBattles";
import {
  useActiveSessions,
  useCreateSession,
  useMyRecentSessions,
} from "../hooks/useSessions";

import ActiveSessions from "../components/ActiveSessions";
import CreateSessionModal from "../components/CreateSessionModal";
import Navbar from "../components/Navbar";
import RecentSessions from "../components/RecentSessions";
import StatsCards from "../components/StatsCards";
import WelcomeSection from "../components/WelcomeSection";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" });

  const createSessionMutation = useCreateSession();

  const { data: activeSessionsData, isLoading: loadingActiveSessions } =
    useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } =
    useMyRecentSessions();
  const { data: activeBattlesData, isLoading: loadingActiveBattles } =
    useActiveBattles();

  const handleCreateRoom = () => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;

    createSessionMutation.mutate(
      {
        problem: roomConfig.problem,
        difficulty: roomConfig.difficulty.toLowerCase(),
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          navigate(`/session/${data.session._id}`);
        },
      },
    );
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];
  const activeBattles = activeBattlesData?.battles || [];

  const isUserInSession = (session) => {
    if (!user.id) return false;

    return (
      session.host?.clerkId === user.id ||
      session.participant?.clerkId === user.id
    );
  };

  const isUserInBattle = (battle) => {
    if (!user?.id) return false;
    return battle.participants?.some((p) => p.userId === user.id);
  };

  return (
    <>
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <WelcomeSection
          onCreateSession={() => setShowCreateModal(true)}
          onCreateBattle={() => navigate("/battle/create")}
        />

        {/* Grid layout */}
        <div className="container mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* 1v1 Battle Section - Takes the first spot */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title flex items-center gap-2 mb-4">
                  <SwordIcon className="w-5 h-5 text-error" />
                  1v1 Battles
                  {activeBattles.length > 0 && (
                    <span className="badge badge-sm badge-primary">
                      {activeBattles.length} active
                    </span>
                  )}
                </h2>

                {loadingActiveBattles ? (
                  <div className="flex justify-center py-4">
                    <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : activeBattles.length === 0 ? (
                  <p className="text-sm text-base-content/60 text-center py-6">
                    No active battles. Create one to start!
                  </p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {activeBattles.map((battle) => {
                      // First participant is always the host
                      const host = battle.participants?.[0];
                      return (
                        <div
                          key={battle.roomId}
                          className="flex items-center justify-between p-4 bg-base-200 rounded-xl hover:bg-base-300 transition-colors border border-base-content/5"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-base truncate">
                                {battle.problem?.title || "Battle"}
                              </span>
                              {battle.isLocked ? (
                                <LockIcon className="w-4 h-4 text-warning" />
                              ) : (
                                <UnlockIcon className="w-4 h-4 text-success" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-base-content/60">
                              {host && (
                                <span className="flex items-center gap-1">
                                  <span className="text-base-content/40">
                                    Host:
                                  </span>
                                  <span className="font-medium text-base-content/80">
                                    {host.name || "Unknown"}
                                  </span>
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <UsersIcon className="w-4 h-4" />
                                {battle.participants?.length || 0}/2
                              </span>
                              <span
                                className={`badge badge-sm ${
                                  battle.status === "waiting"
                                    ? "badge-ghost"
                                    : battle.status === "in-progress"
                                      ? "badge-ghost text-success"
                                      : "badge-ghost"
                                }`}
                              >
                                {battle.status === "waiting"
                                  ? "Waiting"
                                  : battle.status === "in-progress"
                                    ? "In Progress"
                                    : battle.status}
                              </span>
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-outline hover:btn-primary"
                            onClick={() => navigate(`/battle/${battle.roomId}`)}
                          >
                            {isUserInBattle(battle)
                              ? "Resume"
                              : battle.isLocked
                                ? "Join"
                                : "Enter"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <ActiveSessions
              sessions={activeSessions}
              isLoading={loadingActiveSessions}
              isUserInSession={isUserInSession}
            />
          </div>

          {/* Stats Cards - Full width at bottom */}
          <div className="mt-6">
            <StatsCards
              activeSessionsCount={activeSessions.length}
              recentSessionsCount={recentSessions.length}
            />
          </div>

          <RecentSessions
            sessions={recentSessions}
            isLoading={loadingRecentSessions}
          />
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
      />
    </>
  );
}

export default DashboardPage;
