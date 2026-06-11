import { StreamClient } from "@stream-io/node-sdk";
import { StreamChat } from "stream-chat";
import env from "./env.js";

const apiKey = env.STREAM_API_KEY;
const apiSecret = env.STREAM_API_SECRET;
export const streamConfigured = Boolean(apiKey && apiSecret);

const createUnavailableError = (serviceName) =>
  new Error(
    `${serviceName} is not configured. Set STREAM_API_KEY and STREAM_API_SECRET or STREAM_SECRET_KEY.`,
  );

const createUnavailableChatChannel = () => ({
  create: async () => {
    throw createUnavailableError("Stream chat");
  },
  addMembers: async () => {
    throw createUnavailableError("Stream chat");
  },
  delete: async () => {
    throw createUnavailableError("Stream chat");
  },
  sendEvent: async () => {
    throw createUnavailableError("Stream chat");
  },
});

const createUnavailableChatClient = () => ({
  createToken: () => {
    throw createUnavailableError("Stream chat");
  },
  upsertUser: async () => {
    throw createUnavailableError("Stream chat");
  },
  deleteUser: async () => {
    throw createUnavailableError("Stream chat");
  },
  channel: () => createUnavailableChatChannel(),
});

const createUnavailableStreamClient = () => ({
  video: {
    call: () => ({
      getOrCreate: async () => {
        throw createUnavailableError("Stream video");
      },
      delete: async () => {
        throw createUnavailableError("Stream video");
      },
    }),
  },
});

if (!apiKey || !apiSecret) {
  console.warn(
    "Stream credentials are missing. Stream-dependent routes will return service-unavailable responses.",
  );
}

export const chatClient = streamConfigured
  ? StreamChat.getInstance(apiKey, apiSecret) // for chat
  : createUnavailableChatClient();
export const streamClient = streamConfigured
  ? new StreamClient(apiKey, apiSecret) // for vc
  : createUnavailableStreamClient();

export const upsertStreamUser = async (userData) => {
  if (!streamConfigured) return;

  try {
    await chatClient.upsertUser(userData);
    console.log("Stream: User Upserted Successfully:", userData);
  } catch (error) {
    console.error("Error while upserting stream user", error);
  }
};

export const deleteStreamUser = async (userId) => {
  if (!streamConfigured) return;

  try {
    await chatClient.deleteUser(userId);
    console.log(" Stream : User Deleted Successfully : ", userId);
  } catch (error) {
    console.error("Error while deleteing stream user", error);
  }
};
