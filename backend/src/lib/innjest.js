import { Inngest } from "inngest";
import User from "../models/User.js";
import { connectDB } from "./db.js";

export const innjest = new Inngest({ id: "wecode" });

const syncUser = innjest.createFunction(
  {
    id: "sync-user",
  },
  { even: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;
    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      profileImage: image_url,
    };

    await User.create(newUser);
  }
);

const deleteUserFromDB = innjest.createFunction(
  {
    id: "delete-user-from-db",
  },
  { even: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;

    await User.deleteOne({ clearkId: id });
  }
);

export const functions = [syncUser, deleteUserFromDB];
