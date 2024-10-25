import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Purchase } from "../schema/purchasesSchema.js";
import mongoose from "mongoose";
import { Course } from "../schema/courseSchema.js";

const purchaseCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(404, "Invalid course ID");
  }
  // Integrate RazorPay here.
  const isValidCourse = await Course.findById(courseId);
  if (!isValidCourse) {
    throw new ApiError(404, "No course with the Id found");
  }
  const alreadyPurchased = await Purchase.findOne({ courseId, userId });
  if (alreadyPurchased) {
    console.log(alreadyPurchased);
    throw new ApiError(409, "You have already purchased the course");
  }

  const purchaseCourse = await Purchase.create({
    courseId,
    userId,
  });

  if (!purchaseCourse) {
    throw new ApiError(400, "Something went wrong when purchasing the course.");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        purchaseCourse,
        "Course purchased successfully!!! Thank you for purchasing the course."
      )
    );
});

const getPurchasedCourses = asyncHandler(async (req, res) => {
  const purchasedCourses = req.purchasedCourses;
  if (!purchasedCourses || purchasedCourses?.length === 0) {
    throw new ApiError(404, "No purchases have been made by the user");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        purchasedCourses,
        "All the purchased courses fetched successfully"
      )
    );
});

export { purchaseCourse,getPurchasedCourses };
