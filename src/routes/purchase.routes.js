import { Router } from "express";
import verifyUser from "../middlewares/auth.middleware.js";
import { purchaseCourse } from "../controllers/purchase.controllers.js";
const router = Router();

router.route("/purchase-course").post(verifyUser, purchaseCourse);

export default router;
