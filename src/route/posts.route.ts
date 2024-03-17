import { Router } from "express";
import {
  createPost,
  deletePost,
  getPostWithCreator,
  getRecentPosts,
  getSinglePost,
} from "../controller/post.controller";
import { upload } from "../middleware/multer.middleware";
import { userAuth } from "../middleware/auth.middleware";

const router = Router();

router.route("/all-post").get(userAuth, getPostWithCreator);
router.route("/create-post").post(userAuth, upload.single("file"), createPost);
router.route("/recent-posts").get(userAuth, getRecentPosts);
router.route("/get-post/:id").get(userAuth, getSinglePost);
router.route("/delete-post/:id").delete(userAuth, deletePost);

export default router;
