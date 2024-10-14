import { Router } from "express";
import verifyAdmin from "../middlewares/admin.middleware.js";
import {
  createCourse,
  deleteCourse,
  getCourseVideos,
  updateCourse,
} from "../controllers/course.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { courseUser } from "../middlewares/course.middleware.js";
import verifyCourseAdmin from "../middlewares/courseAdmin.middleware.js";
const router = Router();

router
  .route("/create-course")
  .post(verifyAdmin, upload.single("imageURL"), createCourse);

router
  .route("/get-course-videos/:courseId")
  .get(verifyAdmin, verifyCourseAdmin, getCourseVideos);
router
  .route("/update-course/:courseId")
  .patch(verifyAdmin, verifyCourseAdmin, updateCourse);
router
  .route("/delete-course/:courseId")
  .delete(verifyAdmin, verifyCourseAdmin, deleteCourse);

export default router;
