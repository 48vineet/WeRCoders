import { TrophyIcon, UsersIcon } from "lucide-react";

function StatsCards({ activeSessionsCount, recentSessionsCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Active Count */}
      <div className="card bg-base-100 border border-base-content/10 hover:border-primary/40 transition-colors">
        <div className="card-body flex-row items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <UsersIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="text-4xl font-black">{activeSessionsCount}</div>
            <div className="text-sm text-base-content/60">Active Sessions</div>
          </div>
          <div className="ml-auto">
            <div className="badge badge-primary badge-lg">Live</div>
          </div>
        </div>
      </div>

      {/* Recent Count */}
      <div className="card bg-base-100 border border-base-content/10 hover:border-secondary/40 transition-colors">
        <div className="card-body flex-row items-center gap-4">
          <div className="p-4 bg-secondary/10 rounded-2xl">
            <TrophyIcon className="w-8 h-8 text-secondary" />
          </div>
          <div>
            <div className="text-4xl font-black">{recentSessionsCount}</div>
            <div className="text-sm text-base-content/60">Total Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
