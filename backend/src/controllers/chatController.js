import { chatClient, streamConfigured } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  if (!streamConfigured) {
    return res.status(503).json({
      message: "Stream services are not configured on this deployment.",
    });
  }

  try {
    const token = chatClient.createToken(req.user.clerkId);
    res.status(200).json({
      token,
      userId: req.user.clerkId,
      userName: req.user.name,
      userImage: req.user.profileImage,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
}
