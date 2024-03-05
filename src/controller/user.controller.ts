import { User } from "../model/user.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Tokens } from "../utils/types";
import {
  validateUserLogin,
  validateUserRegistration,
  validateUsername,
} from "../utils/validation";
import { Request, Response } from "express";

const generateAccessAndRefreshToken = async (
  userId: string
): Promise<Tokens | undefined> => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, "user not found");
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("something went wrong,Failed to generate tokens", error);
  }
};

const registerUser = async (req: Request, res: Response) => {
  const validatePayload = validateUserRegistration.safeParse(req.body);
  if (!validatePayload.success) throw new ApiError(422, "Unprocessable entity");
  const { username, email, password, name } = req.body;
  try {
    const existUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existUser) throw new ApiError(400, "User already exist");
    const user = await User.create({ username, email, password, name });
    if (!user)
      throw new ApiError(500, "something went wrong,failed to register user");
    return res
      .status(200)
      .send(new ApiResponse(200, user, "user registerd successfully"));
  } catch (error) {
    console.log("something went wrong,registration failed", error);
  }
};

const loginUser = async (req: Request, res: Response) => {
  const validatePayload = validateUserLogin.safeParse(req.body);
  if (!validatePayload.success)
    throw new ApiError(400, "invalid user credentials");
  const { username, password } = req.body;
  try {
    const findUser = await User.findOne({ username });
    if (!findUser) throw new ApiError(401, "User does not exist");
    const isPasswordCorrect = await findUser.isPasswordCorrect(password);
    if (!isPasswordCorrect) throw new ApiError(411, "incorrect password");
    const tokens = await generateAccessAndRefreshToken(findUser._id);
    if (!tokens) throw new ApiError(500, "Failed to generate tokens");
    const { accessToken, refreshToken } = tokens;
    const loggedInUser = await User.findById(findUser._id).select(
      "-password -refreshToken"
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .send(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "user loggedin successfully"
        )
      );
  } catch (error) {
    console.log("something went wrong,failed to login user", error);
  }
};

const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.headers["userid"];
  console.log(userId, req.headers);
  if (!userId) throw new ApiError(400, "Access denied");
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(401, "user not found");
    return res
      .status(200)
      .send(new ApiResponse(200, user, "user found succcessfully"));
  } catch (error) {}
};

const logoutUser = async (req: Request, res: Response) => {
  const userId = req.headers["userid"];
  // console.log(req.headers, userId);
  if (!userId) throw new ApiError(400, "Access denied");
  try {
    await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .send(new ApiResponse(200, {}, "user logged out successfully"));
  } catch (error) {
    console.log("something went wrong,failed to logout", error);
  }
};

const getAllUser = async (_: Request, res: Response) => {
  try {
    const users = await User.find();
    if (!users) throw new ApiError(500, "failed to access users");
    return res.status(200).send(new ApiResponse(200, users, "success"));
  } catch (error) {
    console.log("something went wrong, failed to get the users", error);
  }
};

const updateUsername = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["userid"];
    const validatePayload = validateUsername.safeParse(req.body);
    if (!validatePayload.success)
      throw new ApiError(422, "inappropriate input");
    const { username } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    );
    if (!updatedUser) throw new ApiError(500, "failed to update username");
  } catch (error) {
    console.log("something went wrong , failed to change username", error);
  }
};

export {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getAllUser,
  updateUsername,
};
