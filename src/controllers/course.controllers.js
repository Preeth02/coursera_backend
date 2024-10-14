import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../schema/courseSchema.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { VideoContent } from "../schema/videoContent.js";
import mongoose, { Mongoose, ObjectId } from "mongoose";

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
  if ([title, description, price].some((fields) => String(fields)?.trim() === "")) {
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
  const { courseId } = req.params;

  const videos = await Course.aggregate([
    {
      $match: {
        courseID: new ObjectId(courseId),
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
              courseID: new ObjectId(courseId),
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
  const courseVideos = await VideoContent.find({
    //courseId   <------ check it and update the comment
    courseId: new ObjectId(courseId),
  });

  // Promise.all() to run all the task concurrently . It waits for all the fullfilments or the first rejection
  const results = await Promise.all(
    courseVideos.forEach(async (vids) => {
      console.log("Deleting the video", vids);
      await VideoContent.findByIdAndDelete(vids._id);

      // complete the delete controller after verifying the video controller
    })
  );
  if (!results) {
    throw new ApiError(400, "There was an error while deleting the course");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, "Course deleted successfully"));
});

const updateCourse = asyncHandler(async (req, res) => {
  const { title, description, price } = req.body;
  const { courseId } = req.params;
  if (!courseId) {
    throw new ApiError(401, "No course ID provided");
  }
  if (
    [title, description, price].some((fields) => String(fields)?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }
  const course = await Course.findByIdAndUpdate(
    courseId,
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
