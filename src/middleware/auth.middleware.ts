import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../model/user.model";
const userAuth = async (req: Request, _: Response, next: NextFunction) => {
  const token =
    req.cookies || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) throw new ApiError(401, "Unauthorized request");
  const decodeToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  try {
    const user = await User.findById(decodeToken._id);
    if (!user) throw new ApiError(401, "invalid token");
    req.headers["userId"] = user?._id;
    next();
  } catch (error) {
    console.log("Authentication error", error);
  }
};

export { userAuth };
