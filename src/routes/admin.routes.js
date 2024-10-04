import { Router } from "express";
import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
} from "../controllers/admin.controllers.js";
import verifyAdmin from "../middlewares/admin.middleware.js";
const router = Router();

router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);
router.route("/logout").post(verifyAdmin, logoutAdmin);
router.route("/get-admin").get(verifyAdmin, getCurrentAdmin);

export default router;
