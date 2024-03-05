import { Router } from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getSinglePost,
} from "../controller/post.controller";
import { upload } from "../middleware/multer.middleware";
import { userAuth } from "../middleware/auth.middleware";

const router = Router();

router.route("/all-post").get(userAuth, getAllPosts);
router.route("/create-post").post(userAuth, upload.single("file"), createPost);
router.route("/get-post/:id").get(userAuth, getSinglePost);
router.route("/delete-post/:id").delete(userAuth, deletePost);

export default router;
