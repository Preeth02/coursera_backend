import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { Course } from "../schema/courseSchema.js";
import mongoose from "mongoose";
// import { User } from "../schema/userSchema.js";

const verifyCourseAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req?.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized admin");
    }
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_ADMIN_SECRET
    );
    if (!decodedToken) {
      throw new ApiError(401, "Invalid Access Token");
    }
    const { courseId } = req?.params;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      throw new ApiError(400, "Provide valid course id");
    }
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, "No available course with that ID");
    }
    if (String(course?.creatorID) === decodedToken?._id) next();
    else
      throw new ApiError(400, "Access denied!! Your not the course creator.");
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export default verifyCourseAdmin;
