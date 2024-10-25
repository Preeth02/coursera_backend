import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import verifyAdmin from "./admin.middleware.js";
import verifyUser from "./auth.middleware.js";
import { Purchase } from "../schema/purchasesSchema.js";
import mongoose from "mongoose";
import { VideoContent } from "../schema/videoContent.js";
const videoPurchasedOrAdmin = asyncHandler(async (req, res, next) => {
  const isUser = await new Promise((resolve) => {
    verifyUser(req, res, (err) => resolve(!err));
  });
  const isAdmin = await new Promise((resolve, reject) => {
    verifyAdmin(req, res, (err) => resolve(!err));
  });
  const { videoID } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoID)) {
    throw new ApiError(400, `Provide a valid course/folder/video ID`);
  }
  const videoDetails = await VideoContent.findById(videoID);
  if (!videoDetails) {
    throw new ApiError(404, "There's no such video found");
  }
  if (isUser) {
    const purchasedCourses = await Purchase.findOne({ userId: req.user._id });
    if (!purchasedCourses) {
      throw new ApiError("No purchase course found");
    }
    if (String(videoDetails.courseID) === String(purchasedCourses.courseId)) {
      req.videoDetails = videoDetails;
      next();
    } else throw new ApiError(400, "You don't have the access.Retry");
  } else if (isAdmin) {
    if (String(videoDetails.creatorID) === String(req.user._id)) {
      req.videoDetails = videoDetails;
      next();
    } else throw new ApiError(400, "You don't have the access.Retry");
  } else {
    throw new ApiError(400, "You don't have the access");
  }
});
export default videoPurchasedOrAdmin;
