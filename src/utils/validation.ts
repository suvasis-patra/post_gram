import zod, { ZodSchema } from "zod";

export const validateUserRegistration = zod.object({
  username: zod.string().min(2, "Username is too short").max(32),
  name: zod.string().min(2).max(32),
  email: zod.string().email("Enter a valid email"),
  password: zod
    .string()
    .min(8, "Password is too weak, Atleast have 8 charecters")
    .max(32),
});

export const validateUserLogin = zod.object({
  username: zod.string().min(2, "Username is too short").max(32),
  password: zod
    .string()
    .min(8, "Password is too weak, Atleast have 8 charecters")
    .max(32),
});

export const validatePost = zod.object({
  caption: zod.string().min(2),
  tag: zod.string(),
});

export const validateUserProfile = zod.object({
  username: zod.string().min(2, "Username is too short").max(32),
  name: zod.string().min(2).max(32),
  email: zod.string().email("Enter a valid email"),
  bio: zod.string().min(2, "too short bio"),
});

export const validatePassword = zod.object({
  password: zod
    .string()
    .min(8, "Password is too weak, Atleast have 8 charecters")
    .max(32),
});
