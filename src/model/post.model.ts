import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      requierd: true,
    },
    caption: {
      type: String,
      requierd: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String, trim: true }],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
