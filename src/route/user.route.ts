import { Router } from "express";
import {
  TogglePostLiked,
  TogglePostSaved,
  getAllUser,
  getCurrentUser,
  getLikedPosts,
  getSavedPosts,
  getTopCreators,
  getUserById,
  getUsersPosts,
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/user.controller";
import { userAuth } from "../middleware/auth.middleware";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

router.route("/current-user").get(userAuth, getCurrentUser);
router.route("/logout").post(userAuth, logoutUser);
router.route("/like-post").patch(userAuth, TogglePostLiked);
router.route("/save-post").patch(userAuth, TogglePostSaved);
router.route("/get-liked-post").get(userAuth, getLikedPosts);
router.route("/get-saved-posts").get(userAuth, getSavedPosts);
router.route("/top-creator").get(userAuth, getTopCreators);
router.route("/get-user/:userId").get(userAuth, getUserById);
router.route("/get-user-posts/:userId").get(userAuth, getUsersPosts);
router.route("/get-all-users").get(userAuth, getAllUser);
export default router;
