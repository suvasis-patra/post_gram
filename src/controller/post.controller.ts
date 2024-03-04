import { Request, Response } from "express";
import { validatePost } from "../utils/validation";
import { ApiError } from "../utils/apiError";
import { Post } from "../model/post.model";
import { uploadToCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/apiResponse";

const createPost = async (req: Request, res: Response) => {
  const validatePayload = validatePost.safeParse(req.body);
  const userId = req.headers["userId"];
  if (!validatePayload.success) throw new ApiError(422, "unprocessable entity");
  const { caption, tags } = req.body;
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

export { createPost, getAllPosts, getSinglePost, deletePost, updatePost };
