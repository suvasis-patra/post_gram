import mongoose, { Document } from "mongoose";

interface PostDocument extends Document {
  imageUrl: string;
  caption: string;
  likes: number;
  tags: string[];
  creator: mongoose.Types.ObjectId;
}

const postSchema = new mongoose.Schema<PostDocument>(
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
      required: true,
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model<PostDocument>("Post", postSchema);
