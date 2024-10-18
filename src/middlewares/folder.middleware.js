import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Course } from "../schema/courseSchema.js";
import mongoose from "mongoose";

const verifyFolderAdmin = asyncHandler(async (req, res, next) => {
  const { courseID } = req.params;
  const creatorID = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(courseID)) {
    throw new ApiError(400, "Not a valid course id");
  }
  const isValidCourseID = await Course.findById(courseID);
  if (!isValidCourseID) {
    throw new ApiError(404, "Course with the ID not found");
  }
//   console.log(isValidCourseID)
  if (creatorID !== String(isValidCourseID?.creatorID)) {
    throw new ApiError(
      401,
      "Access denied!! Admin can only make changes in the folders of his course"
    );
  }
  next();
});
export default verifyFolderAdmin;
