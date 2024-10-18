import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../schema/courseSchema.js";
import { VideoContent } from "../schema/videoContent";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Folder } from "../schema/folderSchema.js";