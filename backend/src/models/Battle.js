import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    ready: { type: Boolean, default: false },
    submittedAt: { type: Date, default: null },
    lastSubmissionCorrect: { type: Boolean, default: null },
    isWinner: { type: Boolean, default: false },
    isLoser: { type: Boolean, default: false },
  },
  { _id: false },
);

const battleSchema = new mongoose.Schema(
  {
    roomId: { type: String, unique: true, required: true },
    callId: { type: String, unique: true, required: true },
    problemId: { type: String, required: true },
    participants: { type: [participantSchema], default: [] },
    status: {
      type: String,
      enum: ["waiting", "countdown", "in-progress", "finished"],
      default: "waiting",
    },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    winnerId: { type: String, default: null },
    passwordHash: { type: String, default: null },
  },
  { timestamps: true },
);

const Battle = mongoose.model("Battle", battleSchema);

export default Battle;
