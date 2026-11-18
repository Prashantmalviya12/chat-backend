import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiErrors.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/index.model.js";
import { asyncHandler } from "../utils/asynchandler.js";

interface AuthTokenPayload extends JwtPayload {
  id: string;
  name: string;
  email: string;
}

export interface tokenUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: tokenUser;
}

export const verifyToken = asyncHandler(async (req:AuthRequest , _, next) => {
  try {
    // console.log("r",req.header("Authorization"))
    const token =
      (await req.cookies.accessToken) ||
      req.header("Authorization")?.replace("Bearer ", "");

      console.log("token",token)
      
      if (!token) {
        throw ApiError({ statusCode: 401, message: "Unauthorized" });
      }
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!,
      ) as AuthTokenPayload;
      console.log("decoded",decoded)
      
    const userExist = await User.findOne({ where: { id: decoded.id } });
    if (!userExist) {
      throw ApiError({ statusCode: 401, message: "User not found" });
    }

    req.user = userExist;

    next();
  } catch (error) {
    throw ApiError({ statusCode: 500, message: "Auth Verify Error" });
  }
});
