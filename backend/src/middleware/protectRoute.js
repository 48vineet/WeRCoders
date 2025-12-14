import { clerkClient, requireAuth } from "@clerk/express";

import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth.userId;
      if (!clerkId)
        return res.status(401).json({ message: "Unauthorised Person" });

      // Fetch latest identity details from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const name =
        clerkUser?.fullName ||
        `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() ||
        "Unknown";
      const primaryEmail = clerkUser?.primaryEmailAddress?.emailAddress;
      const image = clerkUser?.imageUrl || "";

      if (!primaryEmail) {
        return res
          .status(422)
          .json({ message: "Clerk account missing primary email" });
      }

      const filter = {
        $or: [{ clerkId }, { email: primaryEmail }],
      };

      const update = {
        $set: {
          name,
          email: primaryEmail,
          profileImage: image,
        },
        // Only set clerkId on insert to avoid overwriting an existing mismatched record
        $setOnInsert: { clerkId },
      };

      const options = {
        new: true,
        upsert: true,
      };

      let user;
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          user = await User.findOneAndUpdate(filter, update, options);
          break;
        } catch (err) {
          // Retry a bounded number of times on duplicate key errors (race on unique email/clerkId)
          if (err?.code === 11000 && attempt < maxAttempts) {
            continue;
          }
          if (err?.code === 11000) {
            return res
              .status(409)
              .json({ message: "Account conflict detected. Please retry." });
          }
          throw err;
        }
      }

      // Explicitly detect email reuse with a different Clerk ID without overwriting
      if (
        user?.email === primaryEmail &&
        user?.clerkId &&
        user.clerkId !== clerkId
      ) {
        console.warn("Clerk ID conflict: existing user has different clerkId", {
          existingClerkId: user.clerkId,
          incomingClerkId: clerkId,
          email: primaryEmail,
        });
        return res
          .status(409)
          .json({
            message: "Account conflict: email linked to another Clerk user",
          });
      }

      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protected route middleware", error);
      res.status(500).json({ message: "internal Server Error " });
    }
  },
];
