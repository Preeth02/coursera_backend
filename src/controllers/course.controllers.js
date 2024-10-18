import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../schema/courseSchema.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { VideoContent } from "../schema/videoContent.js";
import { Folder } from "../schema/folderSchema.js";
import mongoose, { Schema } from "mongoose";

// importing the cloudinary utils for the sake of id the admin decides to delete the course
import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createCourse = asyncHandler(async (req, res) => {
  const creatorID = req.user._id;
  const { title, description, price } = req.body;
  if (
    [title, description, price].some((fields) => String(fields)?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  const image = req.file?.path; // req.file for single image or video
  if (!image) {
    throw new ApiError(400, "Image file is required..");
  }

  const imageURL = await uploadOnCloudinary(image);
  if (!imageURL) {
    throw new ApiError(400, "There was an error while uploading the image.");
  }
  const course = await Course.create({
    title,
    description,
    price,
    imageURL: imageURL?.url,
    creatorID,
  });

  if (!course) {
    throw new ApiError(400, "There was an error while creating the course.");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, course, "Course created successfully!!"));
});

const getCourseVideos = asyncHandler(async (req, res) => {
  const { courseID } = req.params;

  const videos = await Course.aggregate([
    {
      $match: {
        courseID: new mongoose.Types.ObjectId(courseID),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "courseVideos",
        foreignField: "_id",
        as: "course",
        pipeline: [
          {
            $match: {
              courseID: new mongoose.Types.ObjectId(courseID),
            },
          },
        ],
      },
    },
  ]);
  // if (!videos || videos?.length === 0) {
  //   throw new ApiError(404, "No videos found in the course");
  // }

  return res
    .status(201)
    .json(
      new ApiResponse(200, videos, "Videos of the course fetched successfully")
    );
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);
  const courseFolders = course?.folders;
  // // Promise.all() to run all the task concurrently . It waits for all the fullfilments or the first rejection
  if (courseFolders && courseFolders?.length > 0 && courseFolders !== null) {
    courseFolders.forEach(async (folder) => {
      const folderData = await Folder.findById(String(folder));
      const videoIDS = folderData?.videoID;
      if (videoIDS && videoIDS?.length > 0) {
        videoIDS.forEach(async (vid) => {
          const vidDel = await VideoContent.findByIdAndDelete(String(vid));
          if (!vidDel) {
            throw new ApiError(
              400,
              "There was an error while deleting the videos of the course try again"
            );
          }
        });
      }
      const folDel = await Folder.findByIdAndDelete(String(folder));
      if (!folDel) {
        throw new ApiError(
          400,
          "There was an error while deleting the videos of the course try again"
        );
      }
    });
  }
  const deletedCourse = await Course.findByIdAndDelete(courseId);
  if (!deletedCourse) {
    throw new ApiError(400, "There was an error while deleting the course");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, "Course deleted successfully"));
});

const updateCourse = asyncHandler(async (req, res) => {
  const { title, description, price } = req.body;
  const { courseID } = req.params;
  if (!courseID) {
    throw new ApiError(401, "No course ID provided");
  }
  if (
    [title, description, price].some((fields) => String(fields)?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }
  const course = await Course.findByIdAndUpdate(
    courseID,
    {
      $set: {
        title: title.trim(),
        description: description.trim(),
        price,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!course) {
    throw new ApiError(400, "There was a error while updating the course");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, course, "Course updated successfully"));
});

export { createCourse, getCourseVideos, updateCourse, deleteCourse };
