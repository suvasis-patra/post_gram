import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface UserDocument extends Document {
  username: string;
  name: string;
  email: string;
  password: string;
  bio?: string | null;
  refreshToken?: string;
  posts: mongoose.Types.ObjectId[];
  liked: mongoose.Types.ObjectId[];
  saved: mongoose.Types.ObjectId[];
  imageUrl?: mongoose.Types.ObjectId;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new mongoose.Schema<UserDocument>({
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
  refreshToken: { type: String },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  liked: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  saved: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password!, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIERY,
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIERY,
  });
};

export const User = mongoose.model<UserDocument>("User", userSchema);
