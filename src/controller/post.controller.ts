import { Request, Response } from "express";
import { validatePost } from "../utils/validation";
import { ApiError } from "../utils/apiError";
import { Post } from "../model/post.model";
import { uploadToCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/apiResponse";
import { User } from "../model/user.model";

const createPost = async (req: Request, res: Response) => {
  const { caption, tag } = req.body;
  const validatePayload = validatePost.safeParse({ caption, tag });
  const userId = req.headers["userId"];
  // console.log(req.body, userId);
  if (!validatePayload.success) throw new ApiError(422, "unprocessable entity");
  const tags = tag.split(",");
  // console.log(req.file);
  const fileUpload = await uploadToCloudinary(req.file?.path!);
  if (!fileUpload) throw new ApiError(400, "failed to upload image of post");
  try {
    const post = await Post.create({
      imageUrl: fileUpload?.secure_url,
      caption,
      tags,
      creator: userId,
    });
    if (!post) throw new ApiError(500, "failed to create post");
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { $push: { posts: post._id } },
      { new: true }
    );
    return res.status(200).send(new ApiResponse(200, post, "post created"));
  } catch (error) {
    console.log("something went wrong,failed to create post", error);
  }
};

const getAllPosts = async (_: Request, res: Response) => {
  try {
    const posts = await Post.find();
    if (!posts) throw new ApiError(500, "failed to access the posts");
    return res
      .status(200)
      .send(new ApiResponse(200, posts, "accessed posts successfully"));
  } catch (error) {
    console.log("something went wrong , failed to access posts", error);
  }
};

const getSinglePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params?.id;
    const post = await Post.findById(postId);
    if (!post) throw new ApiError(400, "Post not found");
    return res
      .status(200)
      .send(new ApiResponse(200, post, "post successfully found"));
  } catch (error) {}
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["userId"];
    const postId = req.params.id;
    if (!userId || !postId) throw new ApiError(400, "failed to get the post");
    const post = await Post.findOneAndDelete({ _id: postId, creator: userId });
    if (!post) throw new ApiError(400, "failed to delete the post");
    return res
      .status(200)
      .send(new ApiResponse(200, postId, "successfully deleted post"));
  } catch (error) {
    console.log("something went wrong,failed to delete the post", error);
  }
};

const updatePost = async (req: Request, res: Response) => {
  const userId = req.headers["userId"];
  const postId = req.params.id;
  if (!userId || !postId) throw new ApiError(400, "failed to get the post");
  const post = await Post.findOneAndUpdate(
    { _id: postId, creator: userId },
    { new: true }
  );
  if (!post) throw new ApiError(400, "failed to update the post");
  return res
    .status(200)
    .send(new ApiResponse(200, post, "successfully updated the post"));
};

const getRecentPosts = async (_: Request, res: Response) => {
  try {
    const recentPostsWithCreatorInfo = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          let: { creatorId: "$creator" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$creatorId"] },
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                name: 1,
                imageUrl: 1,
                saved: 1,
                liked: 1,
                posts: 1,
              },
            },
          ],
          as: "creatorInfo",
          localField: "creator",
          foreignField: "_id",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 10,
      },
    ]);
    if (!recentPostsWithCreatorInfo)
      throw new ApiError(400, "failed to get recent posts");
    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          recentPostsWithCreatorInfo,
          "successfully fetched recent posts"
        )
      );
  } catch (error) {
    console.log("something went wrong,failed to get recent posts");
  }
};

const getPostWithCreator = async (_: Request, res: Response) => {
  try {
    const PostWithCreatorDetails = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          let: { creatorId: "$creator" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$creatorId"] },
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                name: 1,
                imageUrl: 1,
              },
            },
          ],
          as: "PostWithCreatorInfo",
          localField: "creator",
          foreignField: "_id",
        },
      },
    ]);
    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          PostWithCreatorDetails,
          "successfully got creator info"
        )
      );
  } catch (error) {
    console.log("something went wrong,failed to get creator info", error);
  }
};

export {
  createPost,
  getAllPosts,
  getSinglePost,
  deletePost,
  updatePost,
  getPostWithCreator,
  getRecentPosts,
};
