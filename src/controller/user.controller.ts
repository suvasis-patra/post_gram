import { User } from "../model/user.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Tokens } from "../utils/types";
import {
  validateUserLogin,
  validateUserRegistration,
  validateUserProfile,
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
  } catch (error: any) {
    console.log("something went wrong,registration failed", error);
    res
      .status(error.statusCode || 500)
      .send(error.message || "Internal Server Error");
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
  const userId = req.headers["userId"];
  // console.log(userId, req.headers);
  if (!userId) throw new ApiError(400, "Access denied");
  try {
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) throw new ApiError(401, "user not found");
    return res
      .status(200)
      .send(new ApiResponse(200, user, "user found succcessfully"));
  } catch (error) {}
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params?.userId;
    if (!userId) throw new ApiError(400, "failed to find the user");
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) throw new ApiError(411, "failed to get the user");
    return res.status(200).send(new ApiResponse(200, user, "user found"));
  } catch (error) {
    console.log("something went wrong,failed to find user", error);
  }
};

const logoutUser = async (req: Request, res: Response) => {
  const userId = req.headers["userId"];
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

const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["userid"];
    const validatePayload = validateUserProfile.safeParse(req.body);
    if (!validatePayload.success)
      throw new ApiError(422, "inappropriate input");
    const { username, name, bio, email } = req.body;
    const user = await User.findById(userId);
    if (!user) throw new ApiError(411, "access denied");
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

const TogglePostSaved = async (req: Request, res: Response) => {
  try {
    const { postId } = req.body;
    const userId = req.headers["userId"];
    // console.log("POSTID:", postId, "USERID:", userId, req.body);
    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, "User not found");
    const isPostSaved = user.saved.includes(postId);
    if (isPostSaved) {
      const response = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { saved: postId },
        },
        { new: true }
      ).select("-password -refreshToken -email");
      return res
        .status(200)
        .send(new ApiResponse(200, response, "Post unsaved successfully"));
    } else {
      const response = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { saved: postId },
        },
        { new: true }
      ).select("-password -refreshToken -email");
      return res
        .status(200)
        .send(new ApiResponse(200, response, "Post saved successfully"));
    }
  } catch (error) {
    console.log("something went wrong,failed to get save posts", error);
  }
};

const TogglePostLiked = async (req: Request, res: Response) => {
  try {
    const { postId } = req.body;
    const userId = req.headers["userId"];
    // console.log(postId, userId);
    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, "User not found");
    const isPostLiked = user.liked.includes(postId);
    if (isPostLiked) {
      const response = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { liked: postId },
        },
        { new: true }
      ).select("-password -refreshToken -email");
      return res
        .status(200)
        .send(new ApiResponse(200, response, "Post unliked successfully"));
    } else {
      const response = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { liked: postId },
        },
        { new: true }
      ).select("-password -refreshToken -email");
      return res
        .status(200)
        .send(new ApiResponse(200, response, "Post liked successfully"));
    }
  } catch (error) {
    console.log("something went wrong,failed to get save posts", error);
  }
};

const getSavedPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["userId"];
    const findUser = await User.findById(userId);
    if (!findUser) throw new ApiError(400, "User not found");
    const user = await findUser.populate("saved");
    if (!user) throw new ApiError(400, "failed to get saved posts");
    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          { savedPosts: user.saved },
          "successfully got saved post"
        )
      );
  } catch (error) {
    console.log("something went wrong,failed to get saved post", error);
  }
};
const getLikedPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["userId"];
    const findUser = await User.findById(userId);
    if (!findUser) throw new ApiError(400, "User not found");
    const user = await findUser.populate("liked");
    if (!user) throw new ApiError(400, "failed to get saved posts");
    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          { likedPosts: user.liked },
          "successfully got saved post"
        )
      );
  } catch (error) {
    console.log("something went wrong,failed to get saved post", error);
  }
};

const getTopCreators = async (req: Request, res: Response) => {
  try {
    const topCreators = await User.aggregate([
      {
        $unwind: "$posts",
      },
      {
        $group: {
          _id: "$_id",
          totalPost: { $sum: 1 },
          user: { $first: "$$ROOT" },
        },
      },
      {
        $sort: { totalPosts: -1 },
      },
      {
        $limit: 8,
      },
    ]);
    if (!topCreators) throw new ApiError(400, "failed to get top creator");
    return res
      .status(200)
      .send(new ApiResponse(200, topCreators, "successfully got top creators"));
  } catch (error) {
    console.log("something went wrong, failed to get top creators", error);
  }
};

const getUsersPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    // console.log(userId);
    const findUser = await User.findById(userId);
    if (!findUser) throw new ApiError(400, "user not found");
    const user = await findUser.populate("posts");
    if (!user) throw new ApiError(400, "failed to get user posts");
    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          { userPosts: user.posts },
          "successfully found users posts"
        )
      );
  } catch (error) {
    console.log("somethig went wrong,failed to get users post", error);
  }
};

export {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getAllUser,
  TogglePostLiked,
  TogglePostSaved,
  getLikedPosts,
  getSavedPosts,
  getTopCreators,
  getUserById,
  getUsersPosts,
  updateUserProfile,
};
