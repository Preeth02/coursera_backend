import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createVideo,
  deleteVideo,
  getVideo,
  updateVideo,
} from "../controllers/video.controllers.js";
import verifyAdmin from "../middlewares/admin.middleware.js";
import verifyVideo from "../middlewares/video.middleware.js";
import videoPurchasedOrAdmin from "../middlewares/videoPurchasedOrAdmin.middleware.js";

const router = Router();
router
  .route("/upload-video/:courseID/:folderID/")
  .post(verifyAdmin, upload.single("videoURL"), createVideo);
router
  .route("/getVideo/:courseID/:folderID/:videoID")
  .get(videoPurchasedOrAdmin, getVideo);
router
  .route("/updateVideo/:courseID/:folderID/:videoID")
  .patch(verifyAdmin, verifyVideo, updateVideo);
router
  .route("/deleteVideo/:courseID/:folderID/:videoID")
  .delete(verifyAdmin, verifyVideo, deleteVideo);

export default router;
