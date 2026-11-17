import { Request, Response } from "express";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/index.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/auth.middleware.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment variables");
}

export const authController = {
  signUp: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        throw ApiError({
          statusCode: 400,
          message: "Fill the required Field.",
        });
      }
      const existUser = await User.findOne({
        where: { email },
      });

      if (existUser) {
        throw ApiError({
          statusCode: 409,
          message: "User already registered.",
        });
      }

      const bcryptPassword = await bcrypt.hash(password, 10);
      const savedData = await User.create({
        name,
        email,
        password: bcryptPassword,
      });
      return res.status(200).json({
        data: savedData,
        message: "User Sign up Successfully",
        success: true,
      });
    } catch (error) {
      console.log("Auth Sign Up", error);
      throw ApiError({ statusCode: 500, message: "Internal Server Error" });
    }
  },
  signIn: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body();
      if (!email || !password) {
        throw ApiError({
          statusCode: 400,
          message: "Fill the required Field.",
        });
      }
      const existUser = await User.findOne({ where: { email } });
      if (!existUser) {
        throw ApiError({ statusCode: 400, message: "User not found." });
      }
      const comparePassword = await bcrypt.compare(
        password,
        existUser.password,
      );
      if (!comparePassword) {
        throw ApiError({ statusCode: 400, message: "Invalid Credentails" });
      }
      const token = jwt.sign(
        { id: existUser.id, name: existUser.name, email: existUser.email },
        JWT_SECRET,
        { expiresIn: "1d" },
      );
      return res.json(200).json({
        data: { data: existUser, accesstoken: token },
        success: true,
        messsage: "Login successfully.",
      });
    } catch (error) {
      console.log("Auth Sign In", error);
      throw ApiError({ statusCode: 500, message: "Internal Server Error" });
    }
  },
  me: async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user;
      res
        .status(200)
        .json({ data: user, messsage: "Profile Information", success: true });
    } catch (error) {
      console.log("Profile Detail error", error);
      throw ApiError({ statusCode: 500, message: "Internal Server Error" });
    }
  },
};
