const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 20,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 4,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "https://fallback.avatar",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 100,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastseen: {
      type: Date,
      default: Date.now,
    },
    socketId: {
      type: String,
      default: null,
    },
    peerId: {
      type: String,
      default: null,
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
      },
    ],
  },
  { timestamps: true }
);

const userModel = mongoose.model('userModel',userSchema);

module.exports = userModel;
