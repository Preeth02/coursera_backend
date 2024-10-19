import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../schema/courseSchema.js";
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

const createFolder = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const { courseID } = req.params;
  const creatorID = req.user._id;
  if (!title || !(title?.length > 0)) {
    throw new ApiError(400, "Title must not be empty.");
  }

  // Checks on creatorID and courseID will be done in the middleware
  const validCourseID = new mongoose.Types.ObjectId(courseID);
  const validCreatorID = new mongoose.Types.ObjectId(creatorID);

  const folder = await Folder.create({
    title,
    courseID: validCourseID,
    creatorID: validCreatorID,
  });

  if (!folder) {
    throw new ApiError(400, "There was a error while creating the folder.");
  }
  const pushFolderToTheCourse = await Course.findByIdAndUpdate(
    courseID,
    {
      $push: { folders: folder._id },
    },
    {
      new: true,
    }
  );
  if (!pushFolderToTheCourse) {
    throw new ApiError(
      400,
      "Folder was created but something went wrong while updating it to the course"
    );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { pushFolderToTheCourse, folder },
        "Folder created successfully"
      )
    );
});

const getAllFoldersOfTheCourse = asyncHandler(async (req, res) => {
  const { courseID } = req.params;
  //checks on the courseID and admin of the same course will be done in the middlewares
  const getAllFolders = await Course.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(courseID),
      },
    },
    {
      $lookup: {
        from: "folders",
        localField: "folders",
        foreignField: "_id",
        as: "courseFolders",
      },
    },
    // {
    //   $addFields: {
    //     folders: {
    //       $first: "$courseFolders",
    //     },
    //   },
    // },
    {
      $project: {
        folders: 0,
      },
    },
  ]);
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        getAllFolders,
        getAllFolders?.length > 0
          ? "Currently no folders"
          : "All the folders fetched successfully"
      )
    );
});
const deleteFolder = asyncHandler(async (req, res) => {
  const { courseID, folderID } = req.params;
  const courseVideos = await VideoContent.find({
    //courseId   <------ check it and update the comment
    folderID: new mongoose.Types.ObjectId(folderID),
  });

  if (courseVideos && courseVideos?.length > 0) {
    // Promise.all() to run all the task concurrently . It waits for all the fullfilments or the first rejection
      courseVideos.forEach(async (vids) => {
        const videoDetails = await VideoContent.findById(vids._id);
        await cloudinary.uploader
          .destroy(videoDetails?.videoURL.split("/").pop().split(".")[0], {
            resource_type: "video",
          })
          .then((result) => console.log("Deleting the video ", result));
        // console.log("Deleting the video", vids._id);
        await VideoContent.findByIdAndDelete(vids._id);
      })
    const folderRemoved = await deleteCurrentFolder(folderID, courseID);
    // console.log("Folder Removed", folderRemoved);
    if (folderRemoved?.error || !folderRemoved?.success) {
      throw new ApiError(400, folderRemoved?.message);
    }
    return res
      .status(201)
      .json(new ApiResponse(200, "Folder deleted successfully"));
  }
  const folderRemoved = await deleteCurrentFolder(folderID, courseID);
  // console.log("Folder Removed", folderRemoved);
  if (folderRemoved?.error || !folderRemoved?.success) {
    throw new ApiError(400, folderRemoved?.message);
  }
  return res
    .status(201)
    .json(new ApiResponse(200, "Folder deleted successfully"));
});

const updateFolder = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const { folderID } = req.params;
  if (!title || title?.trim().length === 0) {
    throw new ApiError(400, "Title must not be empty");
  }

  const updatedFolder = await Folder.findByIdAndUpdate(
    folderID,
    {
      $set: { title },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedFolder) {
    throw new ApiError(400, "There was an error while updating the folder");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, updatedFolder, "Folder updated successfully"));
});
export { createFolder, getAllFoldersOfTheCourse, deleteFolder, updateFolder };

const deleteCurrentFolder = async (folderID, courseID) => {
  let data;
  const deletedFolder = await Folder.findByIdAndDelete(folderID);
  if (!deletedFolder) {
    return (data = {
      error: true,
      message: "There was an error while deleting the folder.",
      success: false,
    });
  }
  const course = await Course.findByIdAndUpdate(
    courseID,
    {
      $pull: { folders: folderID },
    },
    {
      new: true,
    }
  );
  if (!course) {
    return (data = {
      error: true,
      message: "There was an error while updatingthe course.",
      success: false,
    });
  }
  return (data = {
    error: false,
    success: true,
    message: "Success",
  });
};
