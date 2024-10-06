import { Router } from "express";
import verifyAdmin from "../middlewares/admin.middleware.js";
import {
  createCourse,
  deleteCourse,
  getCourseVideos,
  updateCourse,
} from "../controllers/course.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyUser from "../middlewares/auth.middleware";
const router = Router();

router
  .route("/create-course")
  .post(verifyAdmin, upload.single("imageURL"), createCourse);

router.route("/get-course-videos").get();
