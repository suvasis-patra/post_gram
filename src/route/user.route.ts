import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/user.controller";
import { userAuth } from "../middleware/auth.middleware";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

router.route("/current-user").get(userAuth, getCurrentUser);
router.route("/logout").post(logoutUser);

export default router;
