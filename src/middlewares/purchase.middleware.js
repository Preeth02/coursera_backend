import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Purchase } from "../schema/purchasesSchema.js";
import mongoose from "mongoose";

const verifyPurchase = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const userpurchasedcourses = await Purchase.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "courseDetails",
        pipeline: [
          {
            $lookup: {
              from: "folders",
              localField: "folders",
              foreignField: "_id",
              as: "folders",
            },
          },
        ],
      },
    },
    {
      $project: {
        courseDetails: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 1,
      },
    },
  ]);
  if (!userpurchasedcourses) {
    throw new ApiError(400, "No courses have been purchased yet");
  }
  req.purchasedCourses = userpurchasedcourses;
  next();
});

export default verifyPurchase;
