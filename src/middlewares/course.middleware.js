import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import verifyAdmin from "./admin.middleware.js";
import verifyUser from "./auth.middleware.js";
import { Purchase } from "../schema/purchasesSchema.js";
import mongoose, { mongo } from "mongoose";
const courseUser = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  try {
    const token =
      req?.cookies?.accessToken ||
      req?.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized user");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const decodedAdminToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_ADMIN_SECRET
    );
    if (!decodedToken && !decodedAdminToken) {
      throw new ApiError(401, "Invalid Access Token");
    }
    // if (!decodedToken) {
    //   throw new ApiError(401, "Invalid Access Token");
    // }
    // req.user = decodedToken;
    const isUserPurchasedCourse = await Purchase.findOne({
      userId: decodedToken?._id,
    });
    const isAdminOfTheCourse = await Purchase.aggregate([
      {
        $match: {
          courseId: mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
          pipeline: [
            {
              $match: {
                creatorId: mongoose.Types.ObjectId(decodedAdminToken?._id),
              },
            },
            {
              $addFields: {
                course: {
                  $first: "$creatorId",
                },
              },
            },
          ],
        },
      },
    ]);
    if (
      [isUserPurchasedCourse, isAdminOfTheCourse].some(
        (fields) => fields?.length === 0
      )
    ) {
      throw new ApiError(409, "Not authorized");
    }
    (req.user = decodedToken), (req.admin = decodedAdminToken);
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export { courseUser };
