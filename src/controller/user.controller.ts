import { User } from "../model/user.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { validateUserRegistration } from "../utils/validation";
import { Request, Response } from "express";
const registerUser = async (req: Request, res: Response) => {
  const validatePayload = validateUserRegistration.safeParse(req.body);
  if (!validatePayload.success) throw new ApiError(422, "Unprocessable entity");
  const { username, email, password, name } = req.body;
  try {
    const existUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existUser) throw new ApiError(400, "User already exist");
    const user = await User.create({ username, email, password, name });
    if (!user)
      throw new ApiError(500, "something went wrong,failed to register user");
    return res
      .status(200)
      .send(new ApiResponse(200, user, "user registerd successfully"));
  } catch (error) {
    console.log("something went wrong,registration failed", error);
  }
};

export { registerUser };
