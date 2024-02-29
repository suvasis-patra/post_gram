import { User } from "../model/user.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import {
  validateUserLogin,
  validateUserRegistration,
} from "../utils/validation";
import { Request, Response } from "express";

const generateAccessAndRefreshToken = async (userId: string) => {
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
    const tokens = (await generateAccessAndRefreshToken(findUser._id)) as
      | { accessToken: string; refreshToken: string }
      | undefined;
    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
      throw new ApiError(500, "Failed to generate tokens");
    }
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
  } catch (error) {}
};

export { registerUser, loginUser };
