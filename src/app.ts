import express from "express";
import userRouter from "./route/user.route";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRouter);

export { app };
