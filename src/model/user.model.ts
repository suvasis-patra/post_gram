import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Enter a suitable username"],
    trim: true,
    unique: true,
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Enter your password"],
  },
  bio: {
    type: String,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  posts: [],
  liked: [],
  saved: [],
});

export const User = mongoose.model("User", userSchema);
