import { Router } from "express";
import verifyAdmin from "../middlewares/admin.middleware.js";
import {
  createFolder,
  getAllFoldersOfTheCourse,
  deleteFolder,
  updateFolder,
} from "../controllers/folder.controllers.js";
import verifyFolderAdmin from "../middlewares/folder.middleware.js";
const router = Router();

router
  .route("/course/:courseID/create-folder")
  .post(verifyAdmin, verifyFolderAdmin, createFolder);
router.route("/course/:courseID/get-all-folders").get(getAllFoldersOfTheCourse);
router
  .route("/course/:courseID/update-folder/:folderID")
  .patch(verifyAdmin, verifyFolderAdmin, updateFolder);
router
  .route("/course/:courseID/delete-folder/:folderID")
  .delete(verifyAdmin, verifyFolderAdmin, deleteFolder);
export default router;
