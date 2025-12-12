import { SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";
import { toast } from "sonner";

const HomePage = () => {
  return (
    <div>
      <button
        className="btn btn-neutral"
        onClick={() => toast.error("Clicked and Working")}
      >
        Click me
      </button>
      <SignOutButton>
        <SignInButton mode="modal">
          <button>Login</button>
        </SignInButton>
      </SignOutButton>

      <SignInButton>
        <SignOutButton></SignOutButton>
      </SignInButton>

      <UserButton></UserButton>
    </div>
  );
};

export default HomePage;
