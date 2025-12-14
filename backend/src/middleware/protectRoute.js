import { clerkClient, requireAuth } from "@clerk/express";

import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth.userId;
      if (!clerkId)
        return res.status(401).json({ message: "Unauthorised Person" });

      let user = await User.findOne({ clerkId });

      // Auto-provision user record on first authenticated request using Clerk API
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const name =
          clerkUser?.fullName ||
          `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() ||
          "Unknown";
        const primaryEmail = clerkUser?.primaryEmailAddress?.emailAddress;
        const image = clerkUser?.imageUrl || "";

        if (!primaryEmail) {
          return res.status(404).json({ message: "User Not Found " });
        }
        // If a user with this email already exists, link Clerk ID instead of creating duplicate
        user = await User.findOne({ email: primaryEmail });
        if (user) {
          if (!user.clerkId) {
            user.clerkId = clerkId;
            await user.save();
          }
        } else {
          user = await User.create({
            name,
            email: primaryEmail,
            profileImage: image,
            clerkId,
          });
        }
      }

      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protected route middleware", error);
      res.status(500).json({ message: "internal Server Error " });
    }
  },
];
