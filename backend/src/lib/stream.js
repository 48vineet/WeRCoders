import { StreamChat } from "stream-chat";
import env from "./env.js";

const apiKey = env.STREAM_API_KEY;
const apiSecret = env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Secret Or Api Key Is Missing");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser([userData]);
    console.log(" Stream : User Upserted Successfully : ", userData);
  } catch (error) {
    console.error("Error while upserting stream user", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log(" Stream : User Deleted Successfully : ", userId);
  } catch (error) {
    console.error("Error while deleteing stream user", error);
  }
};
