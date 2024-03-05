import express from "express";
import userRouter from "./route/user.route";
import postRouter from "./route/posts.route";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRouter);

export { app };
