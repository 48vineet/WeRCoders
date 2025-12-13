import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={!isSignedIn ? <HomePage /> : <Navigate to="/dashboard" />}
        ></Route>
        <Route
          path="/dashboard"
          element={isSignedIn ? <DashboardPage /> : <Navigate to="/" />}
        ></Route>
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemsPage /> : <Navigate to="/" />}
        ></Route>
        <Route
          path="/problem/:id"
          element={isSignedIn ? <ProblemPage /> : <Navigate to="/" />}
        ></Route>
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
