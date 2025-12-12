import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";

function App() {
  const { isSignedIn } = useUser();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemsPage /> : <Navigate to="/" />}
        ></Route>
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
