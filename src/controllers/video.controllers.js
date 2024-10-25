import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../schema/courseSchema.js";
import { VideoContent } from "../schema/videoContent.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Folder } from "../schema/folderSchema.js";
import mongoose from "mongoose";

// importing the cloudinary utils for the sake of id the admin decides to delete the course
import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { courseID, folderID } = req.params;
  if (!title || !description) {
    throw new ApiError(400, "All the fields are required");
  }
  const video = req.file?.path;
  if (!video) {
    throw new ApiError(400, "Video file is required");
  }
  const videoURL = await uploadOnCloudinary(video);
  if (!videoURL) {
    throw new ApiError(
      400,
      "Something went wrong while uploading the videofile"
    );
  }
  const videoData = await VideoContent.create({
    title,
    description,
    duration: videoURL?.duration,
    videoURL: videoURL?.url,
    courseID: new mongoose.Types.ObjectId(courseID),
    folderID: new mongoose.Types.ObjectId(folderID),
    creatorID: req.user?._id,
  });
  if (!videoData) {
    throw new ApiError(400, "There was an error while uploading the video");
  }
  const addVideoToTheFolder = await Folder.findByIdAndUpdate(
    folderID,
    {
      $push: { videoID: videoData?._id },
    },
    {
      new: true,
    }
  );
  if (!addVideoToTheFolder) {
    throw new ApiError(
      400,
      "Something went wrong while adding the video to the folder"
    );
  }
  return res
    .status(201)
    .json(new ApiResponse(200, videoData, "Video uploaded successfully"));
});

const getVideo = asyncHandler(async (req, res) => {
  return res
    .status(201)
    .json(new ApiResponse(200, req.videoDetails, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoID } = req.params;
  if (!title || !description) {
    throw new ApiError(400, "All the fields are required");
  }
  const updatedVideo = await VideoContent.findByIdAndUpdate(
    videoID,
    {
      $set: {
        title,
        description,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedVideo) {
    throw new ApiError(400, "There was an error while updating the video");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoID } = req.params;
  const videoDetails = req.videoDetails;
  await cloudinary.uploader
    .destroy(videoDetails?.videoURL.split("/").pop().split(".")[0], {
      resource_type: "video",
    })
    .then((result) => console.log(result));
  const deletedVid = await VideoContent.findByIdAndDelete(videoID);
  if (!deletedVid) {
    throw new ApiError(400, "There was an error while deleting the video");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, "Video deleted successfully"));
});
export { createVideo, getVideo, updateVideo, deleteVideo };
