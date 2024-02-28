import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  liked: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  saved: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password!, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIERY,
  });
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIERY,
  });
};

export const User = mongoose.model("User", userSchema);
