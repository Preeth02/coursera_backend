import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { VideoContent } from "../schema/videoContent.js";

const verifyVideo = asyncHandler(async (req, res, next) => {
  const { courseID, folderID, videoID } = req.params;
  if (
    [videoID, courseID, folderID].some(
      (ids) => !mongoose.Types.ObjectId.isValid(ids)
    )
  ) {
    throw new ApiError(400, `Provide a valid course/folder/video ID`);
  }
  const videoDetails = await VideoContent.findById(videoID);
  if (!videoDetails) {
    throw new ApiError(404, "There's no such video found");
  }
  if (
    String(videoDetails.courseID) !== courseID ||
    String(videoDetails.folderID) !== folderID ||
    String(videoDetails.creatorID) !== req.user?._id
  ) {
    throw new ApiError(400, "You can't have access to this video");
  }
  req.videoDetails = videoDetails;
  next();
});

export default verifyVideo;
