import { Inngest } from "inngest";
import User from "../models/User.js";
import { connectDB } from "./db.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

// Shared Inngest client instance used by all functions
export const inngest = new Inngest({ id: "wecode" });

const syncUser = inngest.createFunction(
  {
    id: "sync-user",
  },
  { event: "clerk/user.created" },
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

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage,
    });

    //todo send email welcome message after login (after completion of whole video)
  }
);

const deleteUserFromDB = inngest.createFunction(
  {
    id: "delete-user-from-db",
  },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;

    await User.deleteOne({ clerkId: id });
    await deleteStreamUser(id.toString());
  }
);

export const functions = [syncUser, deleteUserFromDB];
