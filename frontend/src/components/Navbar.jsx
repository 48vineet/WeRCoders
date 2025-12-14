import { UserButton } from "@clerk/clerk-react";
import { BookOpen, LampDesk, LayoutDashboardIcon } from "lucide-react";
import { Link, useLocation } from "react-router";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={"/"}
          className="flex items-center gap-3 hover:scale-105 transition-transform duration-300 "
        >
          <div className="size-10 rounded-xl bg-linear-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
            <LampDesk className="size-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className=" text-white text-xl bg-linear-to-r from-primary via-secondary to-accent bg-clip-text font-mono tracking-wider">
              WeRCoders
            </span>
            <span className="text-xs text-base-content/60 font-medium -mt-1">
              Let's Code Together
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {/* Problems Page Link */}
          <Link
            to={"/problems"}
            className={`px-4 py-2.5 rounded-lg transition-all delay-200 ${
              isActive("/problems")
                ? "bg-primary text-primary-content "
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
            }`}
          >
            <div className="flex items-center gap-2.5 ">
              <BookOpen className="size-4 " />
              <span className="font-medium hidden sm:inline ">Problems</span>
            </div>
          </Link>
          {/* Dashboard Page Link */}
          <Link
            to={"/dashboard"}
            className={`px-4 py-2.5 rounded-lg transition-all delay-200 ${
              isActive("/dashboard")
                ? "bg-primary text-primary-content "
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
            }`}
          >
            <div className="flex items-center gap-2.5 ">
              <LayoutDashboardIcon className="size-4 " />
              <span className="font-medium hidden sm:inline ">Dashboard</span>
            </div>
          </Link>
          <div className="ml-2 sm:ml-4 mt-2">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
