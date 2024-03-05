import { Router } from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getSinglePost,
} from "../controller/post.controller";
import { upload } from "../middleware/multer.middleware";

const router = Router();

router.route("/all-post").get(getAllPosts);
router.route("/create-post").post(upload.single("file"), createPost);
router.route("/get-post/:id").get(getSinglePost);
router.route("/delete-post/:id").delete(deletePost);

export default router;
