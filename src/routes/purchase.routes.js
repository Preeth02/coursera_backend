import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";
import {
  getPurchasedCourses,
  purchaseCourse,
} from "../controllers/purchase.controllers.js";
import verifyPurchase from "../middlewares/purchase.middleware.js";
const router = Router();

router.route("/purchase-course/:courseId").post(verifyUser, purchaseCourse);
router
  .route("/getPurchasedCourses")
  .get(verifyUser, verifyPurchase, getPurchasedCourses);
export default router;
