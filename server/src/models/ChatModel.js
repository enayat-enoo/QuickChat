const mongoose = require("mongoose");

const chatModelSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messageModel",
      default: null,
    },
    participantInfo: {
      type: Map,
      of: {
        unreadCount: { type: Number, default: 0 },
        lastSeenMessage: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
      },
      default: {},
    },
  },
  { timestamps: true }
);

const chatModel = mongoose.model("chatModel", chatModelSchema);

module.exports = chatModel;
